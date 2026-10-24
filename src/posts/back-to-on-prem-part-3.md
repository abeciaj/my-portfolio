---
title: Back to On-Prem, Part 3: Monitoring & Tools
date: 2026-10-24
summary: Installing kube-prometheus-stack on a 3-node k3s cluster with persistent storage, a locked-down Grafana and network policies, from one script.
tags: [homelab, kubernetes, prometheus, grafana]
---

This is Part 3 of **Back to On-Prem**. [Part 1](/blog/back-to-on-prem-part-1) covered the hardware and Debian install; [Part 2](/blog/back-to-on-prem-part-2) automated the rest with Ansible, ending with a working 3-node k3s cluster. This post covers the payoff: installing a monitoring stack on top so you can actually see what the cluster is doing, plus a few other tools worth adding once the basics are in place.

Everything in this post is in [abeciaj/k8s-homelab](https://github.com/abeciaj/k8s-homelab): a Helm values file, an Ingress, network policies and a few scripts. By the end, you'll have Prometheus scraping metrics across all 3 nodes, Grafana dashboards reachable from your browser, and a short list of what to add next.

## Prerequisites

Helm and `kubectl` run on your workstation, not on the nodes. Both are clients: they talk to the k3s API server on port 6443, and the cluster schedules the pods onto the nodes.

- A working k3s cluster (Part 2) with all 3 nodes showing `Ready`
- `kubectl` and `helm` installed on your workstation
- A kubeconfig for the cluster (the `~/.kube/homelab.yaml` file from the end of Part 2)

```bash
brew install kubectl helm      # macOS
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash   # Helm on Linux
```

On Linux, install `kubectl` from the [Kubernetes install docs](https://kubernetes.io/docs/tasks/tools/).

Confirm both can already see your cluster before going further:

```bash
export KUBECONFIG=~/.kube/homelab.yaml
kubectl get nodes   # all 3 nodes, STATUS Ready
helm version
```

All 3 nodes should show `Ready`. If not, stop here and go back to Part 2 — the monitoring stack won't help diagnose a cluster that isn't up yet.

## The repo

```
k8s-homelab/
├── monitoring/
│   ├── values.yaml               # Helm overrides for kube-prometheus-stack
│   ├── grafana-ingress.yaml      # Ingress for grafana.home.lab (Traefik)
│   └── network-policies.yaml     # Limits who can reach Prometheus, Alertmanager, Grafana
└── scripts/
    ├── install-monitoring.sh     # Checks the cluster, installs/upgrades the chart
    ├── grafana-password.sh       # Prints the Grafana admin password
    └── grafana-port-forward.sh   # Forwards Grafana to localhost:3000
```

## Installing kube-prometheus-stack

[kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) is the standard, all-in-one Helm chart that bundles Prometheus, Grafana, Alertmanager, node-exporter, and kube-state-metrics — the de facto default for Kubernetes monitoring.

```bash
git clone https://github.com/abeciaj/k8s-homelab.git
cd k8s-homelab
./scripts/install-monitoring.sh
```

The script:

1. Stops if any node isn't `Ready`, or if k3s's `local-path` storage class is missing.
2. Adds the `prometheus-community` Helm repo.
3. On the first run, asks for a Grafana admin password (leave it empty to generate one) and stores it in a `grafana-admin` Secret. Because it's prompted for, the password never lands in your shell history, the process list or Helm's release history.
4. Runs `helm upgrade --install` with `monitoring/values.yaml`, at a pinned chart version (`92.13.1` at the time of writing), so a re-run never jumps to a new major version by accident.
5. Applies the network policies.

It's safe to re-run: the second time, it leaves the existing password alone and upgrades the release in place.

This takes a couple of minutes to pull images and start pods across all 3 nodes. Watch it come up:

```bash
kubectl get pods -n monitoring -w
```

Once everything shows `Running`, press Ctrl+C and move on.

### What you just installed

| Component | What it does |
| --- | --- |
| Prometheus | Scrapes and stores metrics (CPU, memory, network, pod status) on a timer |
| Grafana | Dashboards and visualization on top of Prometheus's data |
| Alertmanager | Routes alerts (e.g. "node disk > 90% full") to notification channels |
| node-exporter | Runs as a DaemonSet — one pod per node, exposing OS-level metrics (CPU, RAM, disk, network) |
| kube-state-metrics | Exposes Kubernetes object state itself (pod counts, deployment status, resource requests/limits) |

### What `values.yaml` changes

The chart's defaults are close, but four things needed changing for this cluster:

- **Persistent storage.** By default, Prometheus and Grafana keep their data inside the pod, so metrics history and anything changed in the Grafana UI disappear whenever the pod restarts or moves. That happens on every rolling upgrade from Part 2. The values file gives Prometheus a 10Gi volume and Grafana a 2Gi volume on `local-path`, the storage class bundled with k3s. Grafana uses the `Recreate` deployment strategy, because its old and new pods can't share a `ReadWriteOnce` volume during a rolling update.
- **Retention.** Prometheus keeps metrics for 15 days or 8GB, whichever limit is hit first (the chart's default is 10 days, with no size limit). The 8GB cap stays below the 10Gi volume, so the disk never fills.
- **Resource limits.** Prometheus requests 512Mi of memory with a 2Gi limit; Grafana requests 128Mi with a 512Mi limit. The limits stop a runaway query or scrape from starving everything else on the node. Prometheus has no CPU limit, so it isn't throttled while it compacts data.
- **k3s fixes.** k3s runs the scheduler, controller-manager, kube-proxy and etcd inside its single binary, so there are no separate endpoints for Prometheus to scrape. Left on, their targets show as permanently down and alerts like `KubeSchedulerDown` fire from the first minute. The values file turns those scrapes off.

`local-path` has one catch: each volume lives on a single node. While Part 2's playbook drains that node for an upgrade, Prometheus or Grafana stays down until the node is back, and losing the node outright loses its data. Longhorn (below) fixes that by replicating volumes across nodes.

### The node-exporter firewall rule

node-exporter listens on port 9100 on each node's own IP. When Prometheus scrapes a node it isn't running on, the request arrives from another node's LAN address. Part 2's playbook already allows 9100 from the three nodes, and only from them. node-exporter has no login, so the rest of the LAN can't read your hosts' metrics.

If you ran Part 2's playbook before that rule was added, node-exporter shows as down for the two nodes Prometheus isn't running on. Pull the latest [ansible-homelab](https://github.com/abeciaj/ansible-homelab) and apply the firewall changes:

```bash
ansible-playbook site.yml --tags security
```

You can check every scrape target in Prometheus under **Status → Targets**. All three `node-exporter` targets should show **UP**.

## Accessing Grafana

k3s ships with the Traefik ingress controller by default, so the simplest path to reach Grafana without port-forwarding every time is through an Ingress. For a first look, though, port-forwarding is the fastest way to confirm it works:

```bash
./scripts/grafana-port-forward.sh     # then open http://localhost:3000
./scripts/grafana-password.sh         # prints the password; the username is admin
```

### Exposing Grafana properly (optional, beyond port-forward)

Once you're past the initial check, the repo's Ingress gives Grafana a stable address on your LAN instead of a manual port-forward every session:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana
  namespace: monitoring
spec:
  rules:
    - host: grafana.home.lab   # add this to your router's DNS or /etc/hosts
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: monitoring-grafana
                port:
                  number: 80
```

```bash
kubectl apply -f monitoring/grafana-ingress.yaml
echo "<node-ip> grafana.home.lab" | sudo tee -a /etc/hosts
```

Any node's IP works, since k3s's built-in load balancer listens on 80 and 443 on every node, and Part 2's firewall already allows both from the LAN. This is plain HTTP, so your Grafana login crosses the LAN unencrypted until TLS is added.

### Changing the Grafana password

Grafana only reads the `grafana-admin` Secret the first time it starts, and because its data now persists, editing the Secret later doesn't change the login. Reset it inside Grafana instead:

```bash
kubectl exec -n monitoring deploy/monitoring-grafana -c grafana -- \
  grafana cli admin reset-admin-password '<new-password>'
```

Then update the Secret to the same value, so `grafana-password.sh` keeps printing the right one. The password on that command line does land in your shell history; in zsh, `setopt HIST_IGNORE_SPACE` and a leading space keep it out.

## Locking it down

Prometheus and Alertmanager have no login at all, so anything that can reach them can read every metric or silence every alert.

**Network policies.** k3s enforces Kubernetes NetworkPolicies out of the box, through its embedded kube-router. `network-policies.yaml` lets only pods in the `monitoring` namespace reach Prometheus and Alertmanager. Grafana only accepts traffic from Traefik, for the Ingress, and from Prometheus, which scrapes Grafana's own metrics. `kubectl port-forward` still works, because it doesn't go through the pod network.

**Grafana settings.** Sign-up, anonymous access, Gravatar, external snapshot publishing and usage reporting are explicitly off in `values.yaml`. Most of those are Grafana's defaults already; stating them means a future chart release can't quietly change them.

**The kubeconfig.** `~/.kube/homelab.yaml` holds a cluster-admin certificate: anyone with the file controls the cluster. Keep it `chmod 600`, keep the disk encrypted, and never commit it. Kubernetes can't revoke a client certificate, so if the file leaks, the only fix is rotating the cluster's certificate authority with `k3s certificate rotate-ca`, which re-issues every certificate in the cluster.

**Firewall and Secrets.** Part 2's playbook already put every node behind a default-deny firewall and turned on Secrets encryption at rest, so the `grafana-admin` Secret is encrypted in etcd. If you built your cluster another way, the repo's README has the manual steps for both.

## First dashboards worth checking

`kube-prometheus-stack` comes with several pre-built Grafana dashboards out of the box — under Grafana's **Dashboards** panel, these are the most useful starting points:

- **Node Exporter / Nodes** — per-node CPU, memory, disk, and network, the first place to look if a node feels slow
- **Kubernetes / Compute Resources / Cluster** — overall cluster resource usage at a glance
- **Kubernetes / Compute Resources / Namespace (Pods)** — drill into which pods are using what

Spend a few minutes clicking through these before building anything custom — they cover most of what you'd want to know day-to-day.

## Upgrading the chart

The chart version is pinned as `CHART_VERSION` in `scripts/install-monitoring.sh`. To upgrade, read the chart's upgrade notes first: `helm upgrade` doesn't update the chart's CRDs, and major versions sometimes need them updated by hand. Then bump the version and re-run the script.

## Other tools worth adding next

Monitoring answers "is it healthy." These answer other gaps that show up once the cluster is actually in use:

- **MetalLB** — k3s ships with a basic built-in load balancer (Klipper), but MetalLB gives real LoadBalancer IPs on bare metal and is worth it once you're exposing more than one or two services.
- **Longhorn** — distributed persistent storage across your 3 nodes, useful once you run stateful workloads (databases, etc.) that need to survive a pod moving between nodes. It's also the fix for the `local-path` catch above: move Prometheus and Grafana onto it, and their data survives losing a node.
- **Pi-hole** — DNS + ad-blocking for your whole home network, and can run as a pod inside this same cluster. Also solves the "proper DNS instead of /etc/hosts" problem mentioned back in Part 2.

Each of these is enough for its own post — this one stops at "the cluster is monitored and dashboards work," which is the actual milestone this series set out to reach.

## Wrapping up the series

Three posts, three nodes: picked and justified the hardware, installed Debian by hand once to understand the steps, automated the repeat with Ansible, and now have visibility into what's actually running. That's a complete, working homelab — not a toy cluster, something you can keep building on.

---

*This post is part of the **Back to On-Prem** series:*

1. *[Hardware & Debian Install](/blog/back-to-on-prem-part-1)*
2. *[Ansible Automation](/blog/back-to-on-prem-part-2)*
3. *Monitoring & Tools* (this post)
