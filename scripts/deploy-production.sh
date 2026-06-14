#!/bin/sh
set -eu

env_file="${PRODUCTION_ENV_FILE:-.env.production}"
compose="docker compose --env-file $env_file -f docker-compose.production.yml"

$compose config --quiet
$compose pull
$compose up -d --remove-orphans
$compose ps

attempt=0
until curl --fail --silent http://127.0.0.1:8080/health/ready >/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "Backend readiness check failed" >&2
    exit 1
  fi
  sleep 2
done
curl --fail --silent http://127.0.0.1:3000/ >/dev/null
echo "Production deployment is ready"
