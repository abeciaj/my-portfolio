---
title: Self-Hosted Git & CI/CD on k8s with Forgejo
date: 2026-10-28
summary: A self-hosted Git server and CI/CD runner on the k3s cluster, locked down from the start: 2FA, Pod Security, network policies and a runner that keeps jobs away from the node.
tags: [homelab, kubernetes, forgejo, ci-cd, security]
---

This post puts a self-hosted Git server with CI/CD on a k3s homelab, using [Forgejo](https://forgejo.org) and Forgejo Actions. It builds on the cluster from the [Back to On-Prem](/blog/back-to-on-prem-part-1) series, and on the trusted certificates from [Trusted HTTPS in a k8s Homelab with cert-manager](/blog/k8s-cert-manager).

Forgejo is a community-run Git forge, with repos, issues, pull requests and a wiki. Forgejo Actions runs CI jobs written in the same YAML syntax as GitHub Actions. A Git server holds your code, and a CI runner executes code on your hardware, so this post spends as much time on locking both down as on installing them.

Everything is in [abeciaj/k8s-homelab](https://github.com/abeciaj/k8s-homelab), under `forgejo/`.

## Prerequisites

- A k3s cluster, such as the one from [Back to On-Prem, Part 2](/blog/back-to-on-prem-part-2), with `kubectl` and `helm` on your workstation
- cert-manager and the Homelab CA from the [cert-manager post](/blog/k8s-cert-manager), with the CA trusted on your workstation
- `openssl` and `xxd`, both included with macOS and most Linux distributions

## The repo

```
k8s-homelab/
├── forgejo/
│   ├── values.yaml            # Helm overrides for the Forgejo chart
│   ├── namespaces.yaml        # Two namespaces, with different Pod Security levels
│   ├── runner.yaml            # The Actions runner and its Docker-in-Docker sidecar
│   ├── network-policies.yaml  # Who can reach Forgejo; what CI jobs can reach
│   └── coredns-custom.yaml    # Lets CI jobs resolve forgejo.home.lab
└── scripts/
    └── install-forgejo.sh
```

## Three decisions up front

**The official chart for Forgejo, a plain manifest for the runner.** Forgejo has an official Helm chart. The runner doesn't, and the community chart most guides point to has stopped being maintained: its last release refuses to install until you acknowledge that. It also applies one security setting to both of its containers, which means the runner itself runs privileged. The runner here is a small Deployment based on the runner project's own Kubernetes example, with the runner pinned to a current release.

**SQLite, not PostgreSQL.** The Forgejo chart no longer bundles a database. For a single-user homelab, SQLite on Forgejo's own volume is one less thing to run, update and secure. Forgejo can migrate to PostgreSQL later if it ever needs to.

**Two namespaces.** CI needs one privileged container (more on that below), and Kubernetes Pod Security settings apply per namespace. Forgejo gets a namespace enforcing `restricted`, the strictest level; the runner gets its own namespace, and it's the only place privileged pods are allowed.

## Installing it

```bash
./scripts/install-forgejo.sh
```

On the first run, it asks for two accounts:

1. **An admin account**, for administration only. Leave the password empty to have one generated. `admin` itself is a reserved name in Forgejo.
2. **An everyday account**, a normal user for your own repos. Forgejo prints a one-time password for it and asks for a new one at first login.

The passwords are typed at a hidden prompt and stored straight into Kubernetes Secrets, so they never land in a file, your shell history or Helm's release history.

Then the script:

1. Checks the cluster is ready and that the Homelab CA exists.
2. Installs Forgejo at a pinned chart version (`17.3.2` at the time of writing).
3. Registers the runner for the everyday account's repos.
4. Applies the CoreDNS entry, the runner and the network policies.

Re-running it upgrades in place and leaves both accounts and the runner registration alone.

Point the hostname at any node, as with Grafana. Set `NODE_IP` to one of your nodes' IPs:

```bash
NODE_IP=192.168.0.151
echo "$NODE_IP forgejo.home.lab" | sudo tee -a /etc/hosts
```

Open **https://forgejo.home.lab**. With the Homelab CA trusted, there's no certificate warning.

If Firefox says "Unable to connect" while Chrome works, macOS hasn't given Firefox access to your network yet. Turn it on under **System Settings → Privacy & Security → Local Network**. Firefox also keeps its own certificate list; see the [cert-manager post](/blog/k8s-cert-manager).

## First login: 2FA for everyone

Forgejo makes every account set up two-factor authentication at first login: scan a QR code with an authenticator app and save the recovery codes it shows. This is one setting in `values.yaml`:

```yaml
security:
  GLOBAL_TWO_FACTOR_REQUIREMENT: all
```

After that, your password alone isn't enough to sign in, and Git and the API need access tokens instead. Log in once with each account to set it up, then use the everyday account from there on and keep the admin account for administration. If a session or token from daily use ever leaks, it can't change instance settings.

If you lose your 2FA device and the recovery codes, an admin can clear it from the command line:

```bash
kubectl exec -n forgejo deploy/forgejo -c forgejo -- \
  forgejo admin user reset-mfa --username <user>
```

## What else values.yaml locks down

| Setting | Effect |
| --- | --- |
| Rootless image, read-only filesystem, no capabilities | Forgejo runs as an ordinary user and can't modify its own image |
| No Kubernetes API token | Forgejo never talks to the cluster, so it doesn't get credentials for it |
| `DISABLE_REGISTRATION` | Nobody can create their own account |
| `REQUIRE_SIGNIN_VIEW` | Nothing is visible without logging in |
| `DEFAULT_PRIVATE: private` | New repos are private |
| `MIN_PASSWORD_LENGTH: 12` + complexity | Passwords need mixed case and digits |
| `DISABLE_SSH` | Git over HTTPS only, so no extra port to expose |
| Secure, `SameSite=strict` cookies | Session cookies only travel over HTTPS, and only from Forgejo's own pages |
| `passwordMode: initialOnlyNoReset` | Changing the admin password in the UI sticks across upgrades |

A network policy also means only Traefik (for the browser) and the runner can reach Forgejo at all.

## Using Git

SSH is off, so clone and push over HTTPS, with an access token from **Settings → Applications** as the password. Git on macOS keeps its own certificate list, so point it at the CA for this one host:

```bash
git config --global http.https://forgejo.home.lab/.sslCAInfo ~/homelab-ca.crt
```

## The runner

A CI runner needs a container engine to run each job in. There are two common ways to give it one:

- **Mount the node's own container socket.** Simple, but every job then controls the node's container engine, which is the same as root on the node.
- **Docker-in-Docker (DinD).** The runner pod gets its own Docker engine as a sidecar container. The catch is that the sidecar has to be **privileged**, which is still root-equivalent on the node if something breaks out of it.

This setup uses DinD, and keeps the privileged part as small as possible:

- **Only the sidecar is privileged.** The runner container itself is unprivileged, non-root and read-only.
- **Jobs can't reach the Docker engine.** The runner's own Kubernetes example passes the engine's credentials into every job. That lets any job start a privileged container and take over the node, so it's turned off here: `docker_host: "-"`. The cost is that jobs can't run `docker build`.
- **Jobs can't reach your network.** A network policy lets jobs reach Forgejo, DNS and the internet, but not your LAN, the nodes, the Kubernetes API or other pods.
- **Only your repos can use it.** The runner is registered for the everyday account, not the whole instance, so an account added later can't run code on your hardware.

For your own repos on a single-user homelab, that's a reasonable trade-off. Don't run untrusted code through it, such as pull requests from strangers. That needs stronger isolation, like gVisor, Kata Containers or a separate VM.

### Registration without copy-pasting tokens

The usual way to register a runner is to copy a token from the web UI. The script uses Forgejo's *offline registration* instead: it generates a random secret, registers it with Forgejo through `forgejo-cli actions register`, and stores it in a Kubernetes Secret for the runner. The secret is passed on standard input, so it never appears in a process listing, and the runner reads it from a file, so it's never in a ConfigMap.

### Making actions/checkout work

Most workflows start with `actions/checkout`, which clones from Forgejo's public address, `https://forgejo.home.lab`. From inside a CI job, that's three problems:

1. **The name doesn't resolve.** `/etc/hosts` on your laptop doesn't help a pod. `coredns-custom.yaml` adds a rule to the cluster's DNS that answers `forgejo.home.lab` with Traefik's address.
2. **The network policy blocks your LAN.** Traefik runs inside the cluster, so a specific rule allows jobs to reach it, without opening the LAN.
3. **The job doesn't trust the certificate.** The CA certificate is mounted into every job, and trusted only where it's needed: Git uses it for `forgejo.home.lab` alone, and Node adds it to its built-in list rather than replacing it.

The result is that jobs reach Forgejo by the same name, with the same certificate, as your browser.

## Testing it

As the everyday user, **Settings → Actions → Runners** should list `k3s-runner` as online. Add `.forgejo/workflows/test.yml` to one of that account's repos:

```yaml
on: [push]
jobs:
  hello:
    runs-on: docker
    steps:
      - uses: actions/checkout@v4
      - run: echo "CI is running on my own hardware"
```

Push a commit, and the job shows up under the repo's **Actions** tab.

## Good to know

- **No `docker build` in jobs.** That's the cost of keeping jobs away from the privileged engine. Builders that don't need a Docker engine, like rootless BuildKit or Buildah, are the way around it, and can push to Forgejo's built-in container registry.
- **The `local-path` catch from [Back to On-Prem, Part 3](/blog/back-to-on-prem-part-3) applies.** Forgejo's repos and database live on one node's disk. Losing that node loses them, until Longhorn or backups are in place.
- **Changing the admin password** is done in the UI. The Secret is only read on the first install.
- **Upgrading.** The chart version is pinned in the script, and the runner and Docker images in `runner.yaml`. Read the release notes, back up Forgejo's volume, bump the version and re-run the script. Forgejo migrates its database on start.

## What's next

The cluster now hosts its own code and runs its own CI, with 2FA, private-by-default repos and a runner that can't touch your network.

The gaps worth closing next: **backups** for Forgejo's volume and the CA, **alert delivery** so Alertmanager actually notifies someone, and **Renovate**, which runs on this same runner and opens a pull request whenever a pinned chart or image has a new release.
