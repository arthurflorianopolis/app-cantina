import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { dataSimuladaISO, formatarData, hojeISO } from "@/lib/regras";
import { Card, PageShell } from "@/components/ui";
import { RelogioTeste } from "@/components/cantina/relogio-teste";

export const dynamic = "force-dynamic";

export default async function AdminInicio() {
  await exigirSessao("ADMIN");
  const hoje = hojeISO();

  const [matriculas, cardapioHoje, operadores] = await Promise.all([
    prisma.matricula.count(),
    prisma.cardapio.findUnique({
      where: { data: hoje },
      include: { reservas: true },
    }),
    prisma.usuario.count({ where: { papel: { in: ["CANTINA", "ADMIN"] } } }),
  ]);

  const reservadasHoje =
    cardapioHoje?.reservas.filter((r) => r.status !== "CANCELADA").length ?? 0;
  const servidasHoje =
    cardapioHoje?.reservas.filter((r) => r.status === "CONSUMIDA").length ?? 0;

  return (
    <PageShell titulo="Administração" descricao="Lista de matrículas, cardápio e relatórios.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-500">Matrículas</p>
          <p className="mt-1 text-3xl font-semibold text-ifsc">{matriculas}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Operadores</p>
          <p className="mt-1 text-3xl font-semibold text-ifsc">{operadores}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Hoje</p>
          <p className="mt-1 text-3xl font-semibold text-ifsc">
            {servidasHoje}/{reservadasHoje}
          </p>
          <p className="text-xs text-zinc-500">servidos / previstos</p>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-semibold">Cardápio de hoje</h2>
        <p className="text-sm capitalize text-zinc-500">{formatarData(hoje)}</p>
        <p className="mt-2 text-sm text-zinc-700">
          {cardapioHoje?.descricao ?? "Hoje não há refeição publicada."}
        </p>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/matriculas" className="rounded-xl bg-ifsc px-4 py-2.5 text-sm font-semibold text-white">
          Importar CSV
        </Link>
        <Link href="/admin/cardapio" className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold">
          Publicar cardápio
        </Link>
        <Link href="/admin/relatorio" className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold">
          Ver relatório
        </Link>
      </div>

      <div className="mt-6">
        <RelogioTeste hoje={formatarData(hoje)} simulado={Boolean(dataSimuladaISO())} />
      </div>
    </PageShell>
  );
}
