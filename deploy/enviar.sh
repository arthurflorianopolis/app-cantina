#!/usr/bin/env bash
# Envia o app para a VM 172.16.110.6 e sobe com Docker.
set -euo pipefail

HOST="${HOST:-debian@172.16.110.6}"
DEST="${DEST:-/opt/cantina}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Aguardando SSH em $HOST..."
for i in $(seq 1 60); do
  if ssh -o BatchMode=yes -o ConnectTimeout=3 -o StrictHostKeyChecking=accept-new "$HOST" "echo ok" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Sem SSH em $HOST. A VM já foi criada e o cloud-init terminou?"
    exit 1
  fi
  sleep 5
done

echo "Instalando Docker na VM..."
ssh "$HOST" 'bash -s' <<'EOF'
set -e
if ! command -v docker >/dev/null; then
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose rsync
  sudo systemctl enable --now docker
  echo '{"dns":["1.1.1.1","8.8.8.8"]}' | sudo tee /etc/docker/daemon.json
  sudo systemctl restart docker
fi
sudo mkdir -p /opt/cantina
sudo chown "$USER:$USER" /opt/cantina
EOF

echo "Enviando arquivos..."
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude 'prisma/*.db' \
  --exclude .env \
  "$ROOT/" "$HOST:$DEST/"

echo "Subindo aplicação..."
ssh "$HOST" "bash -s" <<EOF
set -e
cd "$DEST"
if [ ! -f .env ]; then
  echo "AUTH_SECRET=\$(openssl rand -hex 32)" > .env
fi
sudo docker-compose up -d --build --remove-orphans
EOF

echo
echo "Aplicação em http://172.16.110.6"
echo "Admin: admin@ifsc.edu.br / admin123  (troque a senha depois)"
