import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { Card, PageShell } from "@/components/ui";
import { FormImportarCsv, FormMatriculaManual } from "@/components/admin/forms";

export default async function MatriculasPage() {
  await exigirSessao("ADMIN");
  const matriculas = await prisma.matricula.findMany({
    orderBy: { nome: "asc" },
    take: 200,
  });

  return (
    <PageShell
      titulo="Matrículas"
      descricao="Cadastre ou importe a lista. Quem entra usa a conta Google. A matrícula libera a reserva quando o e-mail é o mesmo."
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
        <div className="space-y-6">
          <Card>
            <FormMatriculaManual />
          </Card>
          <Card>
            <FormImportarCsv />
          </Card>
        </div>
        <Card>
          <h2 className="mb-3 font-semibold">{matriculas.length} na lista</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-zinc-500">
                  <th className="py-2 pr-3">Matrícula</th>
                  <th className="py-2 pr-3">Nome</th>
                  <th className="py-2">E-mail</th>
                </tr>
              </thead>
              <tbody>
                {matriculas.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100">
                    <td className="py-2 pr-3 font-mono">{item.matricula}</td>
                    <td className="py-2 pr-3">{item.nome}</td>
                    <td className="py-2 text-zinc-600">{item.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
