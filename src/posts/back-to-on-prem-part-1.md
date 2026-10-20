---
title: Back to On-Prem, Part 1: Hardware & Debian Install
date: 2026-10-20
summary: Picking the hardware, wiring it up and installing Debian 13 on three Dell OptiPlex nodes for a home Kubernetes cluster.
tags: [homelab, debian, kubernetes]
---

This is Part 1 of **Back to On-Prem** — a series documenting a move away from relying on cloud/SaaS tooling for everything, back to running real infrastructure at home: a 3-node Kubernetes cluster with proper monitoring, built on hardware I own outright.

This post covers the physical layer: picking the hardware, wiring it up, and getting Debian 13 installed on all three nodes. Part 2 covers automating the rest with Ansible (dependencies, k3s). Part 3 covers the tools running on top, including monitoring.

By the end of this post, you'll have three Debian machines on the network, reachable over SSH, ready to be handed off to Ansible.

## Hardware

Three identical nodes plus the networking to tie them together:

| Item | Spec | Role |
| --- | --- | --- |
| 3x Dell OptiPlex 7070 Micro | Intel 9th/10th-gen i5, Q470 chipset, 16GB RAM, M.2 NVMe SSD | 1 control-plane + 2 worker nodes |
| 5-port network switch | Gigabit | Wires all 3 nodes (and the router) together |
| USB flash drive (8GB+) | Debian 13 installer | One-time use, to install the OS on each node |

All three nodes are wired to the switch with Ethernet — Wi-Fi is intentionally not used for any cluster node. Kubernetes and etcd are sensitive to network flakiness, and a wired connection removes an entire class of "why did the node go NotReady" problems before they start.

## Why this hardware

Three identical nodes rather than a mix of brands or a "big box + small box" setup, for one reason: etcd (Kubernetes' cluster database) needs an odd number of members to maintain quorum, and three same-spec nodes give a cluster that can lose any single node and keep running — real fault tolerance, not just more horsepower in fewer places.

The OptiPlex 7070 Micro specifically, over older Micro-format options, for:

- **Newer platform** — Q470 chipset, two full CPU generations ahead of the older 7040/7050 Micro units commonly recommended for homelabs
- **16GB RAM per node** — comfortable headroom for k3s, the monitoring stack, and real workloads without hitting swap
- **Low power draw** — the Micro form factor runs on a T-series or low-wattage CPU, which matters running 3 machines 24/7
- **Tiny footprint** — all three fit on a shelf next to the switch, no rack required

## Physical network setup

1. Connect the 5-port switch to the home router with one Ethernet cable (this gives the switch, and everything on it, access to the internet and the rest of the home network).
2. Connect each of the 3 OptiPlex nodes to the switch with its own Ethernet cable — that uses 3 of the remaining 4 ports, leaving one spare.
3. Power on the switch first, then the three nodes.

No VLANs or managed-switch configuration at this stage — a flat, unmanaged 5-port switch is enough for 3 nodes. Static IPs for each node are assigned later, either via DHCP reservations on the router or configured directly on each node (covered in the installation steps below).

## Building the Debian 13 USB installer

The OptiPlex 7070 Micro has no optical drive, so a bootable USB stick is the only practical way to install an OS on it — short of PXE network booting, which is overkill for 3 machines. An 8GB+ USB drive is all that's needed.

**1. Download the installer image**

Grab the Debian 13 ("Trixie") netinst image from the official source:

```
https://www.debian.org/distrib/netinst
```

The netinst image is small and pulls the rest of the packages over the network during install — fine here since all 3 nodes will be wired to the switch anyway.

**2. Write it to the USB drive**

On Linux or macOS, find the USB device first (be certain of the device name — this overwrites it):

```bash
lsblk        # Linux: identify the USB device, e.g. /dev/sdb
diskutil list  # macOS
```

Then write the image:

```bash
sudo dd if=debian-13.x.x-amd64-netinst.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

On Windows, use [Rufus](https://rufus.ie) instead — point it at the downloaded `.iso` and the USB drive, and let it write in "DD Image" mode.

**3. Reuse the same USB for all 3 nodes**

One USB drive is enough — install on node 1, then reuse the same stick for node 2 and node 3. No need to re-flash between installs.

## BIOS setup

On each OptiPlex 7070 Micro, before installing:

1. Plug in the USB installer, power on, and press **F2** repeatedly during boot to enter BIOS setup (F12 instead brings up a one-time boot menu, which also works if you'd rather skip changing the default boot order permanently).
2. Under **Boot Sequence**, move the USB drive to the top, or use the one-time boot menu (F12) to boot the USB directly without changing the permanent order.
3. If the installer doesn't boot, check **Secure Boot** under the Security tab — Debian's installer supports Secure Boot, but if you hit issues, disabling it temporarily rules that out as a cause.
4. Save and exit (**F10**) to boot from the USB drive.

Repeat this on all 3 nodes before moving to the install itself.

## Installing Debian 13

Run through these steps on each of the 3 nodes. The netinst installer is menu-driven and the same on every machine — only the hostname and static IP differ per node.

1. **Choose install method.** At the boot menu, select **Install** (the plain text-mode installer — the graphical one works too, but text mode is lighter and plenty for a headless server).
2. **Language, location, keyboard.** Pick your locale and keyboard layout.
3. **Hostname.** Give each node a distinct name, e.g. `node1`, `node2`, `node3` — this matters later for Ansible and for telling nodes apart in `kubectl get nodes`.
4. **Domain name.** Can be left blank for a homelab.
5. **Root password.** Set one, or leave blank to disable the root account and rely on sudo via your user account (recommended — matches typical server hardening practice).
6. **Create a user account.** This is the account you'll SSH in as and that Ansible will use later.
7. **Partition disks.** Choose **Guided — use entire disk**, then **All files in one partition** (simplest option; a homelab node doesn't need separate `/home`, `/var` partitions). Confirm and write changes to disk.
8. **Package manager mirror.** Choose a Debian mirror close to you (Melbourne/Australia if offered) and skip or set an HTTP proxy only if your network needs one.
9. **Popularity contest.** Answer either way — doesn't affect the install.
10. **Software selection.** On the tasksel screen, **uncheck "Debian desktop environment"** and anything GUI-related — you want a minimal, headless server. Leave **SSH server** and **standard system utilities** checked.
11. **GRUB bootloader.** Install it to the primary disk when prompted.
12. **Finish installation.** Remove the USB drive when prompted and reboot.

After reboot, log in with the user account you created and confirm you have network access:

```bash
ip a
ping -c 3 debian.org
```

## Post-install checklist

Before handing off to Ansible in Part 2, confirm on all 3 nodes:

- [ ] Each node boots and logs in with the user account created during install
- [ ] Each node has network connectivity (`ping -c 3 debian.org` succeeds)
- [ ] SSH is reachable from your workstation: `ssh youruser@<node-ip>`
- [ ] Each node has a distinct hostname (`hostname` returns `node1`, `node2`, `node3` respectively)
- [ ] You've noted each node's current IP (`ip a`) — these get turned into static reservations before Part 2

Static IPs aren't configured in this post on purpose — Part 2 sets them (along with everything else) through Ansible, so the whole fleet is configured the same way, in one place, rather than by hand on each machine.

## What's next

At this point, three bare Debian 13 machines are wired, booted, and reachable over SSH — but they're still three separate boxes, each needing the same setup repeated by hand.

**Part 2** replaces that repetition with Ansible: one playbook that updates all 3 nodes, installs common tools, sets static IPs and `/etc/hosts` entries, configures fail2ban and the firewall, and installs k3s — a 1-command control-plane join followed by 2-command worker joins, run automatically across all 3 machines from a single command on your workstation.
