import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import {
  amanhaISO,
  formatarData,
  hojeISO,
  HORA_LIMITE_RESERVA,
  janelaReservaAberta,
} from "@/lib/regras";
import { Card, PageShell } from "@/components/ui";
import { FormCancelar, FormReservar } from "@/components/aluno/forms";

export const dynamic = "force-dynamic";

async function reservaDoDia(matriculaId: string | undefined, cardapioId: string | undefined) {
  if (!matriculaId || !cardapioId) return null;
  return prisma.reserva.findFirst({
    where: {
      matriculaId,
      cardapioId,
      status: { in: ["RESERVADA", "CONSUMIDA"] },
    },
  });
}

export default async function AlunoInicio() {
  const sessao = await exigirSessao("ALUNO");
  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.sub },
    include: { matricula: true },
  });

  const hoje = hojeISO();
  const amanha = amanhaISO();
  const [cardapioHoje, cardapioAmanha] = await Promise.all([
    prisma.cardapio.findUnique({ where: { data: hoje } }),
    prisma.cardapio.findUnique({ where: { data: amanha } }),
  ]);

  const cardapio = cardapioAmanha ?? cardapioHoje ?? null;
  const data = cardapioAmanha ? amanha : hoje;
  const eAmanha = Boolean(cardapioAmanha);
  const podeReservarAgora = eAmanha && janelaReservaAberta();

  const [reservaVisivel, reservaHoje] = await Promise.all([
    reservaDoDia(usuario?.matricula?.id, cardapio?.id),
    reservaDoDia(usuario?.matricula?.id, cardapioHoje?.id),
  ]);

  return (
    <PageShell
      titulo={`Olá, ${sessao.nome.split(" ")[0]}`}
      descricao="Quando houver cardápio de amanhã, reserve até as 22h. Não há refeição todos os dias."
    >
      <Card className="mx-auto max-w-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-ifsc">
          {eAmanha ? "Cardápio de amanhã" : "Cardápio"}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-900">{formatarData(data)}</h2>
        {cardapio ? (
          <p className="mt-3 text-sm leading-relaxed text-zinc-700">{cardapio.descricao}</p>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">
            A cantina ainda não publicou cardápio de amanhã. Não há refeição todos os dias.
          </p>
        )}

        <div className="mt-5 space-y-3 border-t border-zinc-100 pt-4">
          {reservaVisivel?.status === "CONSUMIDA" ? (
            <p className="text-sm font-medium text-ifsc">Refeição já confirmada na cantina.</p>
          ) : reservaVisivel?.status === "RESERVADA" ? (
            <>
              <p className="text-sm text-zinc-700">Reserva confirmada. Apresente o QR na cantina.</p>
              <Link
                href={`/aluno/comprovante/${data}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-ifsc px-4 py-2.5 text-sm font-semibold text-white"
              >
                Ver QR Code
              </Link>
              {podeReservarAgora ? <FormCancelar data={data} /> : null}
            </>
          ) : podeReservarAgora && cardapio ? (
            <>
              <p className="text-sm text-zinc-600">
                Você pode só olhar o cardápio. Se for almoçar amanhã, reserve até às{" "}
                {HORA_LIMITE_RESERVA}h para gerar o QR.
              </p>
              <FormReservar data={amanha} />
            </>
          ) : eAmanha && !janelaReservaAberta() ? (
            <p className="text-sm text-zinc-500">
              Prazo de reserva encerrado às {HORA_LIMITE_RESERVA}h.
            </p>
          ) : !eAmanha && cardapio ? (
            <p className="text-sm text-zinc-500">
              Este é o cardápio de hoje (publicado ontem). A reserva já encerrou. Quando a cantina
              publicar o de amanhã, ele substitui esta tela.
            </p>
          ) : (
            <p className="text-sm text-zinc-500">Não há cardápio de amanhã publicado.</p>
          )}
        </div>
      </Card>

      {eAmanha && reservaHoje?.status === "RESERVADA" ? (
        <p className="mx-auto mt-4 max-w-md text-center text-sm">
          <Link href={`/aluno/comprovante/${hoje}`} className="font-semibold text-ifsc">
            Ver QR da refeição de hoje
          </Link>
        </p>
      ) : null}
    </PageShell>
  );
}
