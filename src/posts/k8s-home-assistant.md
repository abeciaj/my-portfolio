---
title: Running Home Assistant on a k8s Homelab
date: 2026-11-20
summary: Home Assistant on the k3s cluster, LAN only and locked down, plus the 400 Bad Request that recent releases give you behind a reverse proxy, and how to fix it for good.
tags: [homelab, kubernetes, home-assistant, traefik, security]
---

[Home Assistant](https://www.home-assistant.io) is the usual answer to "how do I control my smart home without five vendor apps?" It's normally installed as its own operating system on a Raspberry Pi or a VM. This post runs it on the k3s cluster from the [Back to On-Prem](/blog/back-to-on-prem-part-1) series instead, behind Traefik, with a certificate from the [Homelab CA](/blog/k8s-cert-manager).

Home Assistant ends up holding the keys to your house: cameras, locks, presence. So, as with [Forgejo](/blog/k8s-forgejo), this post spends as much time on locking it down as on installing it. It also covers a reverse-proxy problem that recent releases bring, which shows up as a bare `400: Bad Request` and takes some digging to explain.

Everything is in [abeciaj/k8s-homelab](https://github.com/abeciaj/k8s-homelab), under `homeassistant/`.

## Container, not Home Assistant OS

Home Assistant comes in a few forms. **Home Assistant OS** is the full appliance, with an add-on store and one-click backups, but it wants a whole machine or VM to itself. The **container** install is just the application. That's the one that runs on Kubernetes.

The trade-off is the add-on store, which only exists in Home Assistant OS. Anything you'd install as an add-on, like Mosquitto or Zigbee2MQTT, runs as its own Deployment instead. On a cluster, that's how you'd want it anyway.

## Prerequisites

- A k3s cluster, such as the one from [Back to On-Prem, Part 2](/blog/back-to-on-prem-part-2), with `kubectl` on your workstation
- cert-manager and the Homelab CA from [Trusted HTTPS in a k8s Homelab with cert-manager](/blog/k8s-cert-manager), with the CA trusted on your workstation

## The repo

```
k8s-homelab/
├── homeassistant/
│   ├── namespace.yaml         # Pod Security "baseline"
│   ├── homeassistant.yaml     # Deployment, config volume, Service, Ingress
│   └── network-policies.yaml  # Only Traefik in; LAN and internet out
└── scripts/
    └── install-homeassistant.sh
```

## Install

```bash
./scripts/install-homeassistant.sh
```

The script checks for the `local-path` storage class and the Homelab CA, then applies the namespace, network policies and Home Assistant itself. The first start takes a few minutes while Home Assistant installs the Python packages for its default integrations, so the pod gets a generous startup probe before Kubernetes starts checking that it's alive.

Point the hostname at any node, then open **https://ha.home.lab** and create the owner account:

```bash
NODE_IP=192.168.0.151
echo "$NODE_IP ha.home.lab" | sudo tee -a /etc/hosts
```

Everything Home Assistant keeps, from configuration and automations to history, lives in one 5Gi `local-path` volume mounted at `/config`. Because that volume can only be attached to one pod at a time, the Deployment uses the `Recreate` strategy: the old pod stops before the new one starts, instead of both fighting over the volume during an upgrade.

## The 400 Bad Request

The first time I opened the page, Home Assistant answered with this and nothing else:

```
400: Bad Request
```

The log explains the cause:

```
A request from a reverse proxy was received from 10.42.1.89, but your HTTP
integration is not set-up for reverse proxies
```

Traefik adds an `X-Forwarded-For` header to every request it forwards, saying which client the request came from. Home Assistant refuses any request with that header unless it comes from a proxy you've told it to trust. Otherwise anyone could set the header and pretend to be a different client, which matters because Home Assistant's login protection bans clients by IP. On k3s, Traefik reaches the pod from the pod network, `10.42.0.0/16`.

The fix for years has been a few lines in `configuration.yaml`:

```yaml
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 10.42.0.0/16
```

My config had exactly that, it passed Home Assistant's own config check, and restarting the pod didn't help. Asking the running process directly confirmed it had proxy support off:

```bash
kubectl exec -n homeassistant deploy/homeassistant -c homeassistant -- \
  curl -s -o /dev/null -w '%{http_code}\n' -H 'X-Forwarded-For: 1.2.3.4' http://127.0.0.1:8123/
```

The answer was in `/config/.storage/http`. Recent releases keep the http settings there rather than in YAML. On the first start, Home Assistant had copied my `http:` block into a **pending** slot, as a trial that you confirm in the UI. Nobody confirmed it, so it lapsed and Home Assistant went back to the **stable** slot, which had no proxy settings:

```json
"pending": {
  "use_x_forwarded_for": true,
  "trusted_proxies": ["10.42.0.0/16"],
  "error": "not_promoted"
},
"yaml_migration_done": true
```

Confirming a new http config before it sticks makes sense: a bad one can lock you out of your own instance. But here it's a trap. The UI where you'd confirm the trial is only reachable through Traefik, and Traefik only works once the trial is confirmed. And `yaml_migration_done` means the YAML is never read again, so no restart fixes it.

### Seeding the setting before the first start

The fix is to skip the trial: write the proxy settings straight into the stable slot, before Home Assistant first starts. The ConfigMap carries the file:

```json
{
  "version": 3,
  "minor_version": 1,
  "key": "http",
  "data": {
    "stable": {
      "server_port": 8123,
      "use_x_forwarded_for": true,
      "trusted_proxies": ["10.42.0.0/16"],
      ...
    },
    "pending": null,
    "yaml_migration_done": true
  }
}
```

An init container copies it to `/config/.storage/http`, but only if the file doesn't exist yet. The same init container writes the initial `configuration.yaml`, now without an `http:` block. Both files are yours after that: re-running the install script never overwrites them, so changes you make in the UI stick.

On an install that's already stuck, delete `/config/.storage/http` and the `http:` block, then re-run the script. The init container seeds the file on the next start. To check it worked, run the same `curl` as above. Now the log should say `Received X-Forwarded-For header from an untrusted proxy 127.0.0.1`: proxy support is on, and only Traefik's range is trusted, not localhost.

## Locking it down

**Only Traefik gets in.** A network policy lets Traefik reach port 8123 and blocks everything else in the cluster from connecting. Nothing is exposed to the internet: the hostname only resolves on the LAN.

**It can't pivot into the cluster.** Home Assistant needs to reach devices on the LAN and cloud services on the internet, so it can't be cut off completely. The egress policy allows DNS, the LAN and the internet, but excludes the cluster nodes, the pod and service networks, and the Kubernetes API. Integrations are third-party code, and a compromised one shouldn't be a way into everything else the cluster runs.

```yaml
- to:
    - ipBlock:
        cidr: 192.168.0.0/16    # your LAN and its devices
        except:
          - 192.168.0.151/32    # the cluster nodes
          - 192.168.0.152/32
          - 192.168.0.153/32
```

**No Kubernetes API access.** Home Assistant never calls the API, so its ServiceAccount has no token mounted.

**Pod Security "baseline", not "restricted".** The image runs as root, because its init system (s6-overlay) needs it, so it can't meet "restricted". The namespace enforces "baseline" instead: no privileged containers, host namespaces or host paths. The container also can't escalate privileges and uses the runtime's default seccomp profile. Applying the manifests prints "restricted" warnings; they're expected.

**The image is pinned by digest.** A tag like `2026.11.1` can be repointed; a digest can't. The [vulnerability scanner](/blog/k8s-vulnerability-scanning) picks the image up automatically, so it shows on the Homelab Security dashboard with everything else.

**Accounts.** Use a strong password for the owner account and turn on multi-factor authentication under **Profile → Security**.

## What works on the pod network

The pod sits on the cluster's pod network, not directly on the LAN. That covers most of what you'd want:

| Works | Doesn't work yet |
| --- | --- |
| Cloud integrations (weather, Google, vendor clouds) | Automatic discovery (mDNS, SSDP, HomeKit) |
| Local devices added by IP (Hue bridge, Shelly, ESPHome) | Broadcast-only devices like Chromecast |
| The mobile app on your home Wi-Fi | USB Bluetooth, Zigbee and Z-Wave dongles |

Discovery needs `hostNetwork: true`, which shares the node's network stack with the pod. That breaks the "baseline" level and most of the isolation above, so I've left it off. For Zigbee or Z-Wave, a network-attached coordinator, or Zigbee2MQTT on a small separate device, keeps the USB dongle out of Kubernetes entirely.

## Good to know

- **Don't put an `http:` block in `configuration.yaml`.** It's ignored once Home Assistant has migrated the settings, and support for it is on its way out. Change http settings in the UI, or in `.storage/http` with the pod stopped.
- **One node.** `local-path` pins the volume to the node that created it. If that node is down, so is Home Assistant, until Longhorn replaces `local-path`.
- **Back up before upgrading.** Home Assistant migrates its database on start. **Settings → System → Backups** creates a backup in the config volume that you can download.
- **Upgrade both images together.** The init container and the main container use the same pinned tag and digest. Pick a release that's at least a week old, and read its release notes first.

## What's next

Home Assistant is running on the cluster, reachable only from the LAN, and fenced off from the rest of the cluster. Next is getting devices into it without giving up that isolation: an MQTT broker as its own Deployment, and Zigbee2MQTT on a separate device for the Zigbee side.
