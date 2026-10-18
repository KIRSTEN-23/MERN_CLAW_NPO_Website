#!/bin/sh
# Base OS tools only. Application schema/seed are run explicitly after upload.
set -eu
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y docker.io docker-compose-v2 docker-buildx openssl unattended-upgrades
systemctl enable --now docker
install -d -m 700 /opt/claw
