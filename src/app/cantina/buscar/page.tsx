import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { hojeISO } from "@/lib/regras";
import { Card, PageShell } from "@/components/ui";
import { BotaoConfirmar, FormInclusaoManual } from "@/components/cantina/forms";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await exigirSessao("CANTINA", "ADMIN");
  const { q } = await searchParams;
  const termo = (q ?? "").trim();

  const pessoa = termo
    ? await prisma.matricula.findFirst({
        where: {
          OR: [
            { matricula: { contains: termo } },
            { nome: { contains: termo } },
          ],
        },
      })
    : null;

  const cardapio = await prisma.cardapio.findUnique({ where: { data: hojeISO() } });
  const reserva =
    pessoa && cardapio
      ? await prisma.reserva.findUnique({
          where: {
            matriculaId_cardapioId: {
              matriculaId: pessoa.id,
              cardapioId: cardapio.id,
            },
          },
        })
      : null;

  return (
    <PageShell
      titulo="Buscar aluno"
      descricao="Use quando o QR não abrir. Inclusão manual exige motivo."
    >
      <form className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={termo}
          placeholder="Matrícula ou nome"
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm"
        />
        <button className="rounded-xl bg-ifsc px-4 py-2.5 text-sm font-semibold text-white">
          Buscar
        </button>
      </form>

      {termo && !pessoa ? (
        <p className="text-sm text-zinc-500">Ninguém encontrado para “{termo}”.</p>
      ) : null}

      {pessoa ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="font-semibold">{pessoa.nome}</h2>
            <p className="text-sm text-zinc-600">Matrícula {pessoa.matricula}</p>
            {reserva?.status === "CONSUMIDA" ? (
              <p className="mt-4 text-sm font-medium text-ifsc">Já confirmada hoje.</p>
            ) : reserva?.status === "RESERVADA" ? (
              <div className="mt-4">
                <BotaoConfirmar matricula={pessoa.matricula} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">
                Sem reserva ativa. Inclua manualmente se estiver autorizado.
              </p>
            )}
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold">Inclusão manual</h2>
            <FormInclusaoManual matriculaInicial={pessoa.matricula} />
          </Card>
        </div>
      ) : (
        <Card>
          <h2 className="mb-3 font-semibold">Inclusão manual</h2>
          <FormInclusaoManual />
        </Card>
      )}
    </PageShell>
  );
}
