import { exigirSessao } from "@/lib/auth";
import { Cabecalho } from "@/components/layout/cabecalho";

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await exigirSessao("ALUNO");
  return (
    <div className="min-h-full">
      <Cabecalho nome={sessao.nome} papel={sessao.papel} />
      {children}
    </div>
  );
}
