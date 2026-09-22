import { exigirSessao } from "@/lib/auth";
import { Cabecalho } from "@/components/layout/cabecalho";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await exigirSessao("ADMIN");
  return (
    <div className="min-h-full">
      <Cabecalho nome={sessao.nome} papel={sessao.papel} />
      {children}
    </div>
  );
}
