#!/usr/bin/env bash
# Rodar NO hypervisor Proxmox (SSH root).
# Cria uma VM Ubuntu com IP estático 172.16.110.6.
set -euo pipefail

VMID="${VMID:-106}"
NOME="${NOME:-cantina-ifsc}"
STORAGE="${STORAGE:-local-lvm}"
BRIDGE="${BRIDGE:-vmbr0}"
IMAGEM_STORAGE="${IMAGEM_STORAGE:-local}"
IP="${IP:-172.16.110.6/24}"
GW="${GW:-172.16.110.1}"
MEM="${MEM:-4096}"
CORES="${CORES:-2}"
DISK="${DISK:-20G}"
SSH_KEY="${SSH_KEY:-ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICqgCy2Wg2l8Y/oag8t6Re6f3jxoA1SX95bPux37cPky arthur@arthur-Precision-Tower-5810}"

IMG_DIR="/var/lib/vz/template/iso"
IMG="${IMG_DIR}/ubuntu-24.04-server-cloudimg-amd64.img"

if ! command -v qm >/dev/null; then
  echo "Este script precisa ser executado no Proxmox (comando qm não encontrado)."
  exit 1
fi

if qm status "$VMID" >/dev/null 2>&1; then
  echo "Já existe VM $VMID. Abortando."
  exit 1
fi

mkdir -p "$IMG_DIR"
if [ ! -f "$IMG" ]; then
  echo "Baixando imagem cloud Ubuntu 24.04..."
  wget -O "$IMG" \
    "https://cloud-images.ubuntu.com/releases/24.04/release/ubuntu-24.04-server-cloudimg-amd64.img"
fi

echo "Criando VM $VMID ($NOME)..."
qm create "$VMID" \
  --name "$NOME" \
  --memory "$MEM" \
  --cores "$CORES" \
  --net0 "virtio,bridge=${BRIDGE}" \
  --scsihw virtio-scsi-pci \
  --ostype l26 \
  --agent 1

qm importdisk "$VMID" "$IMG" "$STORAGE"
qm set "$VMID" --scsi0 "${STORAGE}:vm-${VMID}-disk-0"
qm set "$VMID" --boot order=scsi0
qm set "$VMID" --ide2 "${IMAGEM_STORAGE}:cloudinit"
qm resize "$VMID" scsi0 "$DISK"
qm set "$VMID" --serial0 socket --vga serial0
qm set "$VMID" --ipconfig0 "ip=${IP},gw=${GW}"
qm set "$VMID" --nameserver 1.1.1.1
qm set "$VMID" --ciuser ubuntu
qm set "$VMID" --sshkeys /dev/stdin <<<"$SSH_KEY"
qm set "$VMID" --searchdomain ifsc.edu.br

echo "Ligando VM $VMID..."
qm start "$VMID"

echo
echo "VM criada. Quando o cloud-init terminar:"
echo "  ssh ubuntu@172.16.110.6"
echo "Depois, neste computador, rode:"
echo "  ./deploy/enviar.sh"
