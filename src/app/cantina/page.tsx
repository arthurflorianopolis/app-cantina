import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { amanhaISO, dataSimuladaISO, formatarData, hojeISO } from "@/lib/regras";
import { Card, PageShell } from "@/components/ui";
import { RelogioTeste } from "@/components/cantina/relogio-teste";

export const dynamic = "force-dynamic";

export default async function CantinaPainel() {
  await exigirSessao("CANTINA", "ADMIN");
  const hoje = hojeISO();
  const amanha = amanhaISO();
  const includeReservas = {
    reservas: {
      include: { matricula: true },
      orderBy: { createdAt: "asc" as const },
    },
  };
  const [cardapioHoje, cardapioAmanha] = await Promise.all([
    prisma.cardapio.findUnique({
      where: { data: hoje },
      include: includeReservas,
    }),
    prisma.cardapio.findUnique({
      where: { data: amanha },
      include: includeReservas,
    }),
  ]);

  const reservasAmanha =
    cardapioAmanha?.reservas.filter((r) => r.status !== "CANCELADA") ?? [];
  const reservasHoje =
    cardapioHoje?.reservas.filter((r) => r.status !== "CANCELADA") ?? [];
  const previstosHoje = reservasHoje.length;
  const servidas = reservasHoje.filter((r) => r.status === "CONSUMIDA");
  const manuais = servidas.filter((r) => r.origem === "MANUAL");
  const faltamHoje = reservasHoje.filter((r) => r.status === "RESERVADA").length;

  return (
    <PageShell
      titulo="Painel da cantina"
      descricao={`${formatarData(hoje)}. Cardápio só nos dias em que a cantina publicar.`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-zinc-500">Previstos amanhã</p>
          <p className="mt-1 text-3xl font-semibold text-ifsc">{reservasAmanha.length}</p>
          <p className="text-xs text-zinc-500">para a cozinha se preparar</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Previstos hoje</p>
          <p className="mt-1 text-3xl font-semibold text-ifsc">{previstosHoje}</p>
          <p className="text-xs text-zinc-500">quem reservou esta refeição</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Já servidos hoje</p>
          <p className="mt-1 text-3xl font-semibold text-ifsc">{servidas.length}</p>
          {manuais.length > 0 ? (
            <p className="text-xs text-zinc-500">{manuais.length} inclusão(ões) manual(is)</p>
          ) : null}
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Faltam hoje</p>
          <p className="mt-1 text-3xl font-semibold text-ifsc">{faltamHoje}</p>
          <p className="text-xs text-zinc-500">ainda não passaram no QR</p>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/cantina/escanear"
          className="rounded-xl bg-ifsc px-4 py-2.5 text-sm font-semibold text-white"
        >
          Escanear QR
        </Link>
        <Link
          href="/cantina/buscar"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          Buscar matrícula
        </Link>
        <Link
          href="/cantina/cardapio"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          Cardápio de amanhã
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Sendo servido hoje</h2>
          <p className="text-sm capitalize text-zinc-500">{formatarData(hoje)}</p>
          {cardapioHoje ? (
            <p className="mt-2 text-sm text-zinc-700">{cardapioHoje.descricao}</p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">Hoje não há refeição.</p>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">Cardápio de amanhã</h2>
          <p className="text-sm capitalize text-zinc-500">{formatarData(amanha)}</p>
          {cardapioAmanha ? (
            <>
              <p className="mt-2 text-sm text-zinc-700">{cardapioAmanha.descricao}</p>
              <p className="mt-2 text-lg font-semibold text-ifsc">
                {reservasAmanha.length} reserva(s)
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              Sem refeição amanhã. Publique só se for servir.
            </p>
          )}
          <Link
            href="/cantina/cardapio"
            className="mt-4 inline-flex text-sm font-semibold text-ifsc"
          >
            {cardapioAmanha ? "Alterar o de amanhã" : "Publicar o de amanhã"}
          </Link>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Reservas de amanhã</h2>
          <p className="text-xs text-zinc-500">A cozinha usa esta lista para se preparar.</p>
          {reservasAmanha.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Ninguém reservou a refeição de amanhã.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 text-sm">
              {reservasAmanha.map((reserva) => (
                <li key={reserva.id} className="flex items-center justify-between gap-3 py-2">
                  <span>{reserva.matricula.nome}</span>
                  <span className="text-zinc-500">Reservada</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">Reservas de hoje</h2>
          <p className="text-xs text-zinc-500">Quem deve passar no QR hoje.</p>
          {reservasHoje.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Ninguém reservou esta refeição.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 text-sm">
              {reservasHoje.map((reserva) => (
                <li key={reserva.id} className="flex items-center justify-between gap-3 py-2">
                  <span>{reserva.matricula.nome}</span>
                  <span className="text-zinc-500">
                    {reserva.status === "CONSUMIDA" ? "Servido" : "Aguardando"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <RelogioTeste hoje={formatarData(hoje)} simulado={Boolean(dataSimuladaISO())} />
      </div>
    </PageShell>
  );
}
