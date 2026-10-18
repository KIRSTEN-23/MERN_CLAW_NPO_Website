#!/bin/bash
# Run as root on this dedicated AWS host after uploading the application.
set -euo pipefail
cd /opt/claw
SITE_ADDRESS=${1:?Provide the attached public static IP}
if [[ ! "$SITE_ADDRESS" =~ ^[0-9.]+$ ]]; then echo 'Expected the AWS static IPv4 address.' >&2; exit 1; fi
umask 077
if ! test -f .env; then
  {
    printf 'SITE_ADDRESS=%s\nAPP_ORIGIN=https://%s\n' "$SITE_ADDRESS" "$SITE_ADDRESS"
    printf 'MYSQL_ROOT_PASSWORD=%s\n' "$(openssl rand -hex 32)"
    printf 'MYSQL_PASSWORD=%s\n' "$(openssl rand -hex 32)"
  } > .env
fi
install -d -m 755 tls
if ! test -f tls/ca.pem; then
  # Private CA is trusted only by this deployment. The server identity is mysql,
  # matching the private Compose DNS name used by mysql2.
  openssl req -x509 -newkey rsa:3072 -sha256 -nodes -days 3650 -subj '/CN=CLAW AWS MySQL CA' -keyout tls/ca-key.pem -out tls/ca.pem 2>/dev/null
  openssl req -newkey rsa:3072 -nodes -subj '/CN=mysql' -keyout tls/server-key.pem -out tls/server.csr 2>/dev/null
  printf 'subjectAltName=DNS:mysql\nextendedKeyUsage=serverAuth\nbasicConstraints=CA:FALSE\nkeyUsage=digitalSignature,keyEncipherment\n' > tls/server.ext
  openssl x509 -req -in tls/server.csr -CA tls/ca.pem -CAkey tls/ca-key.pem -CAcreateserial -days 365 -sha256 -extfile tls/server.ext -out tls/server.pem 2>/dev/null
  chmod 644 tls/ca.pem tls/server.pem
  chown 999:999 tls/server-key.pem
  chmod 400 tls/server-key.pem
fi
# The AWS assessment copy shouldn't compete with the primary campaign in search.
# Applied by the proxy, leaving the public site's existing SEO unchanged.
if ! grep -q X-Robots-Tag Caddyfile; then
  sed -i '/encode zstd gzip/a\  header X-Robots-Tag "noindex, nofollow"' Caddyfile
fi
docker compose build web
bash initialize.sh
