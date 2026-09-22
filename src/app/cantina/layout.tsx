import { exigirSessao } from "@/lib/auth";
import { Cabecalho } from "@/components/layout/cabecalho";

export default async function CantinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await exigirSessao("CANTINA", "ADMIN");
  return (
    <div className="min-h-full">
      <Cabecalho nome={sessao.nome} papel={sessao.papel} />
      {children}
    </div>
  );
}
