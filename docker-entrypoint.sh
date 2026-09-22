#!/bin/sh
set -e
npx prisma db push --skip-generate
npx prisma db seed

if [ ! -f /data/tls.crt ]; then
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout /data/tls.key -out /data/tls.crt -days 3650 \
    -subj "/CN=172.16.110.6" \
    -addext "subjectAltName=IP:172.16.110.6,DNS:cantina-ifsc"
fi

node /app/https-proxy.mjs &
exec npm start
