---
title: Back to On-Prem, Part 2: Ansible Automation
date: 2026-10-24
summary: One Ansible playbook that updates and hardens three Debian 13 nodes and brings up a 3-node k3s cluster from a single command.
tags: [homelab, ansible, kubernetes, k3s]
---

This is Part 2 of **Back to On-Prem**. [Part 1](/blog/back-to-on-prem-part-1) left off with three Dell OptiPlex 7070 Micro nodes running bare Debian 13, each reachable over SSH — but still three separate machines, each needing the same setup repeated by hand.

This post replaces that repetition with [Ansible](https://github.com/abeciaj/ansible-homelab): one playbook that updates all 3 nodes, locks down SSH and the firewall, installs k3s, and brings up a working 3-node Kubernetes cluster from a single command run on your workstation.

By the end, `kubectl get nodes` run from node1 shows all 3 nodes Ready, and the whole setup is re-runnable any time you need to change something, upgrade k3s or add a 4th node later.

## Why Ansible

The manual path for 3 nodes looks like this: SSH into node1, run a dozen commands, repeat on node2, repeat on node3, then manually copy a join token between machines for k3s. Every step done by hand is a step that can be done slightly differently on one node without you noticing — until something breaks in a way that only affects one of the three.

Ansible flips that: describe the desired end state once, in a playbook, and run it against all 3 nodes at once over SSH. It's **agentless** (nothing to install on the nodes themselves beyond Python) and **idempotent** — running the same playbook twice doesn't redo work that's already done, it just confirms the state matches. That means the playbook doubles as both the install process and the documentation of exactly what's on each node, and it's safe to re-run any time you want to push a change to all 3 machines at once.

## Requirements

**On your workstation (the Ansible control node)** — Ansible runs here, not on the servers:

- Linux or macOS (Windows needs WSL2 — Ansible doesn't run natively on Windows)
- `ansible-core` ≥ 2.14
- The `community.general` collection (for the `ufw` module), pinned in the repo's `requirements.yml`
- SSH client (already present on Linux/macOS)

```bash
brew install ansible                 # macOS
sudo apt install -y ansible          # Debian/Ubuntu workstation
ansible --version                    # confirm it installed
```

The collection is installed from inside the repo, once you've cloned it (see Setup).

**On each of the 3 target nodes:**

Ansible can't install the things it uses to connect, so these have to be in place by hand first. Most of them come from the Debian installer in Part 1 (ticking **SSH server** and **standard system utilities**, and leaving the root password blank so your user gets sudo).

- Debian 13, already installed from Part 1
- Python 3 — Ansible needs this to run its modules on the remote end. Debian's standard install normally includes it, but worth confirming:

  ```bash
  python3 --version
  ```
- SSH server running and reachable (set up in Part 1)
- A user account with **passwordless sudo**, or run the playbook with `-K` to be prompted for the sudo password
- **A static IP.** The playbook doesn't assign IPs, so give each node a DHCP reservation on your router (matched to its MAC address) before you start. If a node's address changes later, the inventory and `/etc/hosts` go stale without any error.
- **Key-based SSH access** from your workstation (no password prompts) — covered in the setup steps below.

## The repo

The full playbook is on GitHub: [abeciaj/ansible-homelab](https://github.com/abeciaj/ansible-homelab).

```
ansible-homelab/
├── ansible.cfg                       # Points Ansible at inventory.ini
├── inventory.example.ini             # Template for inventory.ini: nodes and every setting
├── requirements.yml                  # Ansible collections (community.general)
├── site.yml                          # The playbook: everything runs from here
├── templates/
│   ├── hosts.j2                      # Builds /etc/hosts from the inventory
│   ├── jail.local.j2                 # fail2ban sshd jail
│   ├── k3s_server_config.yaml.j2     # k3s server config: etcd, Secrets encryption
│   └── sshd_hardening.conf.j2        # Key-only SSH, no root login
├── .ansible-lint                     # Lint settings, shared by CI and local runs
└── .github/workflows/lint.yml        # Syntax check + ansible-lint on every push
```

Every setting lives in one file, `inventory.ini`: node IPs, SSH user, LAN subnet, k3s version and fail2ban thresholds. It's git-ignored, so your real IPs and username never end up in the repo. The logic in `site.yml` doesn't need touching for a standard 3-node setup.

## Setup

**1. Clone the repo onto your workstation** (not the servers) and install the collection:

```bash
git clone https://github.com/abeciaj/ansible-homelab.git
cd ansible-homelab
ansible-galaxy collection install -r requirements.yml
```

**2. Set up passwordless SSH key access to all 3 nodes:**

```bash
ssh-keygen -t ed25519          # skip if you already have a key
ssh-copy-id youruser@<node1-ip>
ssh-copy-id youruser@<node2-ip>
ssh-copy-id youruser@<node3-ip>
```

**3. Create your inventory:**

```bash
cp inventory.example.ini inventory.ini
```

Then edit `inventory.ini`:

- Replace the example IPs (`192.168.1.101` to `103`) with your nodes' real static IPs.
- Set `ansible_user` to the username you SSH in as. It becomes the only user allowed to log in over SSH.
- Set `lan_subnet` to the subnet the nodes are on (for example `192.168.1.0/24`). SSH, the k3s ports and HTTP(S) are only opened to this range.
- If you manage the nodes from somewhere else (a VPN, for example), uncomment `ssh_allowed_cidr` and set it to that range.

The node names in the inventory (`node1`, `node2`, `node3`) matter: the playbook sets each node's hostname from them, and k3s registers nodes by hostname.

**4. Test connectivity before running anything:**

```bash
ansible k3s_cluster -m ping
```

All 3 nodes should return `SUCCESS`. If any fail, fix SSH/inventory first — don't move on until this passes clean.

This has to pass using your SSH **key**, not a password. The playbook turns off password logins, so if you're still getting in with a password, you'll be locked out after the first run.

## What the playbook does

`site.yml` runs six plays in order:

**Preflight checks.** Before touching anything, the playbook stops if `inventory.ini` still has placeholders, or if the machine running Ansible is outside the SSH allow range. The firewall would otherwise lock you out halfway through the run.

**Base system setup, one node at a time.** Updates the apt cache and checks for pending upgrades. If there are any and the node is already in the cluster, it drains the node first, upgrades, reboots if needed, waits for the node to come back Ready and uncordons it. Then it installs common tools (curl, git, htop, vim, ufw, fail2ban, unattended-upgrades), sets the hostname from the inventory, disables swap (required by Kubernetes) and writes `/etc/hosts` from the inventory so nodes can resolve each other by name. Running with `serial: 1` means OS updates never take down more than one node at once.

**Security hardening.** Turns on daily unattended security updates, hardens SSH (key-only logins, no root, only your `ansible_user`), configures fail2ban for SSH and enables `ufw` with a default-deny policy (see the firewall section below). The SSH config is checked with `sshd -t` before it's written, so a typo can't leave a node with a broken SSH daemon.

**k3s server, node1 only.** Writes `/etc/rancher/k3s/config.yaml` *before* k3s first starts, so the cluster comes up with:

- **embedded etcd** instead of the default SQLite (`cluster-init`), which is what lets more servers join later
- **Secrets encrypted at rest** (`secrets-encryption`)

Both are set before the first install on purpose: turning either on later means a datastore migration or a key rotation. It then installs k3s in server mode at the version pinned in `k3s_version` and reads the auto-generated join token straight off disk for the agents to use — no manual copy-pasting between terminals.

**k3s agents, node2 & node3, one at a time.** Installs k3s in agent mode at the same version, joining each one to node1 with the token the server play captured. The install command carries the token, so the task runs with `no_log` to keep it out of the output. On an upgrade, each agent is drained first, then upgraded, checked for Ready on the new version and uncordoned.

**Verify cluster.** Polls `kubectl get nodes` on node1 until all 3 nodes report Ready (up to 5 minutes, since agents take a moment to register), then prints the node list. If a node never becomes Ready, the play fails instead of quietly printing a half-joined cluster.

## The firewall

ufw denies all incoming traffic except:

| Port | From | Used for |
| --- | --- | --- |
| 22/tcp | `lan_subnet` or `ssh_allowed_cidr` | SSH |
| 6443/tcp | `lan_subnet` | Kubernetes API server (agents → server) |
| 8472/udp | `lan_subnet` | Flannel VXLAN overlay network (all nodes → all nodes) |
| 10250/tcp | `lan_subnet` | Kubelet (server ↔ agents) |
| 80, 443/tcp | `lan_subnet` | HTTP(S) to Traefik, k3s's built-in ingress |
| Any | `10.42.0.0/16`, `10.43.0.0/16` | k3s pod and service networks |

The k3s rules are easy to miss. Without 6443, 8472 and 10250 open between the nodes, the agent install script still finishes without an error, but node2 and node3 never join and pod networking breaks.

HTTP(S) needs two rules per port. k3s's built-in load balancer (ServiceLB) forwards ports 80 and 443 on each node to the Traefik pod, so the traffic is *routed* through the node rather than delivered to it, and ufw needs a `route` rule as well as the normal one.

The playbook adds every allow rule before it turns ufw on. If you later expose another service directly on a node, add a rule for it in `site.yml`.

## Running it

```bash
ansible-playbook site.yml        # add -K if your user needs a sudo password
```

This takes a few minutes — the apt upgrade and k3s downloads are the slow parts. Watch for `failed=0` on every play's recap at the end. The last play prints the cluster's node list directly in the Ansible output, so success looks like 3 nodes listed with `STATUS Ready`.

Once the nodes have been through one full run, each part can also be run on its own with tags:

```bash
ansible-playbook site.yml --tags base       # OS updates, packages, hostnames, swap, /etc/hosts
ansible-playbook site.yml --tags security   # SSH hardening, fail2ban, ufw, auto-updates
ansible-playbook site.yml --tags k3s        # install/upgrade k3s, then verify
ansible-playbook site.yml --tags verify     # check all nodes are Ready
```

To use `kubectl` from your workstation, fetch the kubeconfig from node1. It's only readable by root, so read it with `sudo` over SSH rather than `scp`, and write it to its own file so it doesn't overwrite an existing `~/.kube/config`:

```bash
mkdir -p ~/.kube
ssh youruser@<node1-ip> sudo cat /etc/rancher/k3s/k3s.yaml > ~/.kube/homelab.yaml
sed -i.bak 's/127.0.0.1/<node1-ip>/' ~/.kube/homelab.yaml   # works on Linux and macOS
export KUBECONFIG=~/.kube/homelab.yaml
kubectl get nodes
```

**Re-running is safe.** The playbook is idempotent — running it again won't reinstall k3s or redo finished steps, it just confirms everything's still in the desired state. That makes it the right way to push any future config change (edit `inventory.ini`, re-run, done on all 3 nodes at once).

## Upgrading k3s

k3s is pinned by `k3s_version` in `inventory.ini` (`v1.36.5+k3s1` at the time of writing), so every node, including any you add later, runs the same release. To upgrade, set a newer version from the [k3s releases](https://github.com/k3s-io/k3s/releases) and run:

```bash
ansible-playbook site.yml --tags k3s
```

node1 is upgraded first. With a single control-plane there's nowhere to move its workloads to, so it isn't drained: running pods keep running, and the API is unavailable for a moment. Then each agent is drained, upgraded and uncordoned in turn. Upgrade one minor version at a time: 1.36 to 1.37, not 1.36 to 1.38.

## Good to know

- **Reboots are rolling.** Security updates install automatically every day but never reboot a node. To apply updates that need a reboot, run `--tags base`: it drains, reboots and uncordons one node at a time.
- **Draining needs spare room.** The other nodes have to fit a drained node's pods. If a drain doesn't finish within 5 minutes, the run stops and leaves the node cordoned; run `sudo k3s kubectl uncordon <node>` on node1 to put it back.
- **No backups yet.** Scheduled etcd snapshots are turned off until there's storage that isn't on node1 itself. Until then, take one by hand with `sudo k3s etcd-snapshot save`.
- **Host key checking is on.** If you reinstall a node, Ansible refuses to connect until you remove the old key with `ssh-keygen -R <node-ip>` and SSH in once to accept the new one.
- **No Docker.** k3s bundles containerd, so the cluster doesn't need a separate container runtime.
- **Linted on every push.** GitHub Actions runs `ansible-playbook --syntax-check` and `ansible-lint` (production profile) on the repo. Run `ansible-lint` locally to get the same checks.

## What's next

Running `ansible-playbook site.yml` once takes three bare Debian boxes to a working, hardened 3-node k3s cluster, repeatably, from one command. Upgrades and reboots go through the same playbook, one node at a time.

**Part 3** moves on to the question that actually matters once something is running unattended: how do you know it's healthy? That's where Prometheus, Grafana, and the rest of the monitoring stack come in — installed via Helm onto the cluster this post just stood up.
