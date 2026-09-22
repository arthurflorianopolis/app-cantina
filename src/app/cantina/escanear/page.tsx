import { exigirSessao } from "@/lib/auth";
import { PageShell } from "@/components/ui";
import { LeitorQr } from "@/components/cantina/leitor-qr";

export default async function EscanearPage() {
  await exigirSessao("CANTINA", "ADMIN");
  return (
    <PageShell
      titulo="Escanear QR"
      descricao="Aponte a câmera para o QR. A leitura é automática. Se a câmera não abrir, use HTTPS ou tire uma foto só do código."
    >
      <div className="mx-auto max-w-lg">
        <LeitorQr />
      </div>
    </PageShell>
  );
}
