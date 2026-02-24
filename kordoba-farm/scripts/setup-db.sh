#!/usr/bin/env bash
# Run this once: install MySQL/MariaDB if needed, start it, then create the Kordoba Farm database.
# You may need to enter your sudo password.

set -e
echo "=== Kordoba Farm – MySQL setup ==="

start_db() {
  if systemctl is-active mysql &>/dev/null || systemctl is-active mariadb &>/dev/null; then
    return 0
  fi
  sudo systemctl start mysql 2>/dev/null || sudo systemctl start mariadb 2>/dev/null
}

# Try to start the database
if ! start_db; then
  echo "Database service not running. Installing MariaDB (MySQL-compatible)..."
  if command -v apt-get &>/dev/null; then
    sudo apt-get update -qq
    sudo apt-get install -y mariadb-server
    echo "Starting MariaDB..."
    sudo systemctl start mariadb
    sleep 2
  else
    echo "This script supports Debian/Ubuntu (apt-get). Install MariaDB or MySQL manually, then run this script again."
    exit 1
  fi
fi

if systemctl is-active mysql &>/dev/null || systemctl is-active mariadb &>/dev/null; then
  echo "MySQL/MariaDB is running."
else
  echo "Failed to start database after install. Try: sudo systemctl start mariadb"
  exit 1
fi

# Create database and user (sudo mysql = root via socket)
# App user 'kordoba' has password 1234
echo "Creating database and user..."
sudo mysql -e "
  CREATE DATABASE IF NOT EXISTS kordoba_farm;
  CREATE USER IF NOT EXISTS 'kordoba'@'localhost' IDENTIFIED BY '1234';
  GRANT ALL PRIVILEGES ON kordoba_farm.* TO 'kordoba'@'localhost';
  FLUSH PRIVILEGES;
" 2>/dev/null || {
  echo "If the above failed, run these SQL commands manually as MySQL root:"
  echo "  sudo mysql -e \"CREATE DATABASE IF NOT EXISTS kordoba_farm;\""
  echo "  sudo mysql -e \"CREATE USER IF NOT EXISTS 'kordoba'@'localhost' IDENTIFIED BY '1234';\""
  echo "  sudo mysql -e \"GRANT ALL PRIVILEGES ON kordoba_farm.* TO 'kordoba'@'localhost'; FLUSH PRIVILEGES;\""
  exit 1
}

echo ""
echo "Database created. Your .env should have:"
echo ""
echo "  DATABASE_URL=\"mysql://kordoba:1234@localhost:3306/kordoba_farm\""
echo ""
echo "Then run:  npx prisma db push   and   npx tsx prisma/seed.ts"
echo ""
