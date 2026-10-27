---
title: Trusted HTTPS in a k8s Homelab with cert-manager
date: 2026-10-28
summary: Running a private certificate authority with cert-manager, so every *.home.lab service gets a real HTTPS certificate your devices trust, renewed automatically.
tags: [homelab, kubernetes, cert-manager, tls, security]
---

Most homelab services end up behind HTTPS with a self-signed certificate. On k3s, that's the certificate Traefik ships with, and it's what Grafana used in [Back to On-Prem, Part 3](/blog/back-to-on-prem-part-3). It encrypts the traffic, but the browser can't tell your Grafana from anything else answering on that address, so it warns every time, and you learn to click through warnings. That's a bad habit to build on a network you're responsible for.

This post replaces it with a private **certificate authority** (CA) run by [cert-manager](https://cert-manager.io). Every `*.home.lab` service gets a proper certificate, renewed automatically, and your devices trust it after a one-time step. It's written for the k3s cluster from the [Back to On-Prem](/blog/back-to-on-prem-part-1) series, but works on any cluster running Traefik.

Everything is in [abeciaj/k8s-homelab](https://github.com/abeciaj/k8s-homelab), under `cert-manager/`.

## Why a private CA

Public certificates, like the free ones from Let's Encrypt, are only issued for domains you own on the public internet. `grafana.home.lab` isn't one, and nothing outside your house should be able to reach it anyway.

A private CA solves both. You create one certificate authority, tell your devices to trust it once, and from then on it signs certificates for any service on your network. cert-manager does the signing and renewing inside Kubernetes, so adding a service is two lines on its Ingress.

## Prerequisites

- A k3s cluster, such as the one from [Back to On-Prem, Part 2](/blog/back-to-on-prem-part-2), and `kubectl` and `helm` on your workstation
- The monitoring stack from [Part 3](/blog/back-to-on-prem-part-3), installed first if you want certificate alerts

## The repo

```
k8s-homelab/
├── cert-manager/
│   ├── values.yaml           # Helm overrides for cert-manager
│   ├── homelab-ca.yaml       # The CA and the issuers
│   ├── monitoring.yaml       # Extra values when monitoring is installed
│   └── alerts.yaml           # Prometheus alerts for certificates
└── scripts/
    └── install-cert-manager.sh
```

## How it fits together

```
selfsigned-bootstrap ──signs──▶ Homelab CA (10 years, home.lab names only)
                                    │
                         ClusterIssuer homelab-ca
                                    │ signs, renews at 30 days left
              ┌─────────────────────┼─────────────────────┐
         grafana-tls           forgejo-tls           <future>-tls
       (90-day certificates, stored as Secrets and served by Traefik)
```

1. A **self-signed issuer** exists only to sign the CA's own certificate, once.
2. The **Homelab CA** is a 10-year ECDSA certificate. Its private key stays in a Secret in the `cert-manager` namespace.
3. A **ClusterIssuer** named `homelab-ca` signs certificates for any namespace.
4. An Ingress asks for a certificate with an annotation. cert-manager issues it, stores it in a Secret, and Traefik serves it.

## The CA

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: homelab-ca
  namespace: cert-manager
spec:
  isCA: true
  commonName: Homelab CA
  secretName: homelab-ca
  duration: 87600h   # 10 years
  privateKey:
    algorithm: ECDSA
    size: 256
  nameConstraints:
    critical: true
    permitted:
      dnsDomains:
        - home.lab
  issuerRef:
    name: selfsigned-bootstrap
    kind: ClusterIssuer
```

Two choices are worth explaining.

**Ten years.** Every device trusts this exact certificate, so replacing it means re-trusting it everywhere. The certificates it signs are short-lived (90 days) and renew automatically, so the long-lived part is only the one you install once.

**The name constraint.** Trusting a CA normally means trusting it for *every* website. This one is restricted to `home.lab` names, a restriction written into the certificate itself and enforced by the browser. If its private key ever leaked, it still couldn't be used to impersonate your bank. It's one line, and it turns "trust this for everything" into "trust this for my homelab".

## Installing it

```bash
./scripts/install-cert-manager.sh
```

The script:

1. Installs cert-manager at a pinned chart version (`v1.21.3` at the time of writing).
2. If the monitoring stack is installed, turns on cert-manager's metrics and adds the certificate alerts (see Alerts).
3. Creates the CA and the issuers, and waits until they're ready.
4. Saves the **public** CA certificate to `~/homelab-ca.crt`. The private key never leaves the cluster.

Re-running it is safe. It never replaces an existing CA.

## Trusting the CA

Do this once on each device. On macOS:

```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain ~/homelab-ca.crt
```

Safari and Chrome use the macOS trust store straight away. Firefox keeps its own; if it still warns, set `security.enterprise_roots.enabled` to `true` in `about:config`, or import the file under **Settings → Privacy & Security → Certificates**.

Other devices:

| Device | How |
| --- | --- |
| Debian/Ubuntu | `sudo cp homelab-ca.crt /usr/local/share/ca-certificates/ && sudo update-ca-certificates` |
| Windows | In an admin terminal: `certutil -addstore -f Root homelab-ca.crt` |
| iPhone/iPad | AirDrop or email the file, install the profile in **Settings**, then turn it on under **General → About → Certificate Trust Settings** |

## Switching Grafana over

The Ingress from Back to On-Prem, Part 3 needs two additions: an annotation that asks cert-manager for a certificate, and a `secretName` for it to store the certificate in.

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: homelab-ca
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    traefik.ingress.kubernetes.io/router.tls: "true"
spec:
  tls:
    - secretName: grafana-tls
      hosts:
        - grafana.home.lab
```

```bash
kubectl apply -f monitoring/grafana-ingress.yaml
kubectl wait --for=condition=Ready certificate/grafana-tls -n monitoring --timeout=60s
```

Fully quit the browser (Cmd+Q on macOS) and reopen **https://grafana.home.lab**: the warning is gone. A plain reload isn't enough, because browsers remember certificate decisions for sites you've already visited. Grafana itself doesn't change. Traefik handles HTTPS in front of it, and only the certificate it presents is different.

Any future service works the same way: the annotation, a `tls` block with a `secretName`, and a name ending in `.home.lab`. A name outside `home.lab` gets a certificate the browser rejects, because of the name constraint.

## Checking it

```bash
kubectl get certificate -A
openssl s_client -connect grafana.home.lab:443 -servername grafana.home.lab \
  -CAfile ~/homelab-ca.crt </dev/null 2>/dev/null | grep 'Verify return code'
```

Every certificate should show `READY True`, and `Verify return code: 0 (ok)` means the whole chain checks out against your CA. If the browser still warns after that, the server side is fine; quit and reopen the browser.

## Keep an offline copy of the CA

The CA lives in one Secret. If it's lost, say in a cluster rebuild, the script creates a new one, and every device you set up has to trust the new one. Copy it once, right after the first install:

```bash
kubectl get secret -n cert-manager homelab-ca -o yaml |
  grep -vE '^\s+(resourceVersion|uid|creationTimestamp):' | pbcopy
```

Paste it into a password manager as a secure note, not a plain file: it contains the CA's private key. To restore, apply it before running the install script, and cert-manager reuses it instead of creating a new CA:

```bash
kubectl create namespace cert-manager
pbpaste | kubectl apply -f -
```

The `grep` strips fields Kubernetes sets on its own. Applying them to a fresh cluster fails, because Kubernetes won't create an object that already claims a version.

## Alerts

Renewal is automatic, which is exactly why it can fail without anyone noticing: you'd find out when a browser starts warning again. With the monitoring stack installed, the script has Prometheus scrape cert-manager and adds three alerts:

| Alert | Fires when |
| --- | --- |
| CertificateNotReady | A certificate has been failing for 15 minutes |
| CertificateExpiringSoon | Under 14 days left. Renewal happens at 30, so this means renewal is failing |
| CertManagerDown | Prometheus can't scrape cert-manager |

If you install monitoring after cert-manager, re-run the script to add them. Until Alertmanager has somewhere to send them, they show in Grafana under **Alerting → Alert rules**.

## Good to know

- **Devices you haven't set up still warn.** A phone or laptop without the CA sees the certificate as untrusted, just as before.
- **`.home.lab` isn't officially reserved.** The name reserved for home networks is `home.arpa`. `.lab` isn't a public top-level domain today, so `home.lab` works, but if you're starting fresh, `home.arpa` is the safe choice. The CA's name constraint would need to match.
- **Upgrading cert-manager** goes one minor version at a time (1.21 to 1.22, not 1.21 to 1.23). Bump `CHART_VERSION` in the script and re-run it.

## What's next

Grafana now has a certificate your devices trust, and anything added from here gets one with two lines of YAML.

[Self-Hosted Git & CI/CD on k8s with Forgejo](/blog/k8s-forgejo) puts that to use with a Git server and CI runner, where trusted certificates matter well beyond the browser.
