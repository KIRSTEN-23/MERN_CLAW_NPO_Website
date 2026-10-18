#!/bin/bash
# Explicit first-time setup on the isolated AWS server. Never resets data.
set -euo pipefail
cd /opt/claw
if test -e .initialized; then
  echo 'Already initialized. Use an explicit, reviewed schema command for later changes.'
  exit 0
fi
# Environment values are random hexadecimal strings, generated locally on the server.
set -a
source .env
set +a
docker compose up -d mysql
for attempt in {1..90}; do
  if docker compose exec -T -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql mysql -uroot -e 'SELECT 1' >/dev/null 2>&1; then break; fi
  sleep 2
done
# Schema and fictional data are explicit setup actions, separate from normal startup.
docker compose exec -T -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql mysql -uroot claw < app/backend/sql/schema.sql
docker compose run --rm -T web node backend/src/seed-database.js
# Remove DDL privileges from the application's login after schema setup.
docker compose exec -T -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql mysql -uroot <<'SQL'
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'claw_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON claw.* TO 'claw_app'@'%';
SQL
docker compose up -d
 touch .initialized
chmod 600 .initialized
echo 'AWS application initialized without resetting existing data.'
