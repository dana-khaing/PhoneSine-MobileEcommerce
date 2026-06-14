#!/bin/sh
set -eu

output="${1:-phone-sine-$(date +%F).sql.gz}"
export MYSQL_PWD="${DB_PASSWORD:-}"
mysqldump \
  --host="${DB_HOST:-localhost}" \
  --user="${DB_USERNAME:-root}" \
  --single-transaction \
  --routines \
  --triggers \
  "${DB_NAME:?DB_NAME is required}" | gzip > "$output"
test -s "$output"
echo "$output"
