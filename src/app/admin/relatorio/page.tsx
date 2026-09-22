import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { formatarDataCurta, hojeISO, rotuloStatus } from "@/lib/regras";
import { Card, PageShell } from "@/components/ui";

export default async function RelatorioPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  await exigirSessao("ADMIN");
  const hoje = hojeISO();
  const { de, ate } = await searchParams;
  const inicio = de || hoje;
  const fim = ate || hoje;

  const cardapios = await prisma.cardapio.findMany({
    where: { data: { gte: inicio, lte: fim } },
    include: {
      reservas: { include: { matricula: true } },
    },
    orderBy: { data: "asc" },
  });

  const linhas = cardapios.flatMap((cardapio) =>
    cardapio.reservas.map((reserva) => ({
      data: cardapio.data,
      nome: reserva.matricula.nome,
      matricula: reserva.matricula.matricula,
      status: rotuloStatus(reserva.status, cardapio.data),
      origem: reserva.origem === "MANUAL" ? "Manual" : "App",
    })),
  );

  const previstos = linhas.filter((l) => l.status !== "Cancelada").length;
  const consumidas = linhas.filter((l) => l.status === "Consumida").length;
  const faltas = linhas.filter((l) => l.status === "Não compareceu").length;
  const manuais = linhas.filter((l) => l.origem === "Manual").length;

  return (
    <PageShell titulo="Relatório" descricao="Reservas, consumo, faltas e inclusões manuais.">
      <form className="mb-6 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          De
          <input
            type="date"
            name="de"
            defaultValue={inicio}
            className="mt-1 block rounded-xl border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Até
          <input
            type="date"
            name="ate"
            defaultValue={fim}
            className="mt-1 block rounded-xl border border-zinc-300 px-3 py-2"
          />
        </label>
        <button className="rounded-xl bg-ifsc px-4 py-2.5 text-sm font-semibold text-white">
          Filtrar
        </button>
      </form>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Card>
          <p className="text-sm text-zinc-500">Previstas</p>
          <p className="text-2xl font-semibold text-ifsc">{previstos}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Consumidas</p>
          <p className="text-2xl font-semibold text-ifsc">{consumidas}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Faltas</p>
          <p className="text-2xl font-semibold text-ifsc">{faltas}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Manuais</p>
          <p className="text-2xl font-semibold text-ifsc">{manuais}</p>
        </Card>
      </div>

      <Card>
        {linhas.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum registro no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-zinc-500">
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Matrícula</th>
                  <th className="py-2 pr-3">Nome</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Origem</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha, i) => (
                  <tr key={`${linha.matricula}-${linha.data}-${i}`} className="border-b border-zinc-100">
                    <td className="py-2 pr-3">{formatarDataCurta(linha.data)}</td>
                    <td className="py-2 pr-3 font-mono">{linha.matricula}</td>
                    <td className="py-2 pr-3">{linha.nome}</td>
                    <td className="py-2 pr-3">{linha.status}</td>
                    <td className="py-2">{linha.origem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
