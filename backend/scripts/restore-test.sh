#!/bin/sh
set -eu

backup="${1:?Backup file is required}"
case "${RESTORE_DB_NAME:-}" in
  *[!A-Za-z0-9_]*) echo "RESTORE_DB_NAME contains invalid characters" >&2; exit 1 ;;
  *_restore_test) ;;
  *) echo "RESTORE_DB_NAME must end in _restore_test" >&2; exit 1 ;;
esac

export MYSQL_PWD="${DB_PASSWORD:-}"
mysql_args="--host=${DB_HOST:-localhost} --user=${DB_USERNAME:-root}"
mysql $mysql_args -e "DROP DATABASE IF EXISTS \`${RESTORE_DB_NAME}\`; CREATE DATABASE \`${RESTORE_DB_NAME}\`;"
gunzip -c "$backup" | mysql $mysql_args "$RESTORE_DB_NAME"
table_count="$(mysql $mysql_args --batch --skip-column-names -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${RESTORE_DB_NAME}'")"
test "$table_count" -gt 0
echo "Restored $table_count tables into $RESTORE_DB_NAME"
