"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { amanhaISO, novoQrToken, podeReservar } from "@/lib/regras";

export type EstadoReserva = { erro: string } | { ok: true } | null;

export async function reservarHojeAction(dataRefeicao?: string): Promise<EstadoReserva> {
  const sessao = await exigirSessao("ALUNO");
  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.sub },
    include: { matricula: true },
  });
  if (!usuario?.matricula) {
    return { erro: "Sua conta não está ligada a uma matrícula." };
  }

  const data = amanhaISO();
  if (dataRefeicao && dataRefeicao !== data) {
    return { erro: "Só é possível reservar o cardápio de amanhã." };
  }
  if (!podeReservar(data)) {
    return { erro: "O prazo de reserva encerrou às 22h." };
  }

  const cardapio = await prisma.cardapio.findUnique({ where: { data } });
  if (!cardapio) {
    return { erro: "O cardápio ainda não foi publicado." };
  }

  const existente = await prisma.reserva.findUnique({
    where: {
      matriculaId_cardapioId: {
        matriculaId: usuario.matricula.id,
        cardapioId: cardapio.id,
      },
    },
  });

  if (existente?.status === "RESERVADA" || existente?.status === "CONSUMIDA") {
    return { erro: "Você já tem reserva para este dia." };
  }

  if (existente) {
    await prisma.reserva.update({
      where: { id: existente.id },
      data: {
        status: "RESERVADA",
        origem: "APP",
        qrToken: novoQrToken(),
        motivoManual: null,
        confirmadoEm: null,
        confirmadoPorId: null,
      },
    });
  } else {
    await prisma.reserva.create({
      data: {
        matriculaId: usuario.matricula.id,
        cardapioId: cardapio.id,
        qrToken: novoQrToken(),
        status: "RESERVADA",
        origem: "APP",
      },
    });
  }

  revalidatePath("/aluno");
  revalidatePath("/cantina");
  redirect(`/aluno/comprovante/${data}`);
}

export async function cancelarReservaAction(data: string): Promise<EstadoReserva> {
  const sessao = await exigirSessao("ALUNO");
  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.sub },
    include: { matricula: true },
  });
  if (!usuario?.matricula) {
    return { erro: "Sua conta não está ligada a uma matrícula." };
  }
  if (!podeReservar(data)) {
    return { erro: "Não é mais possível cancelar esta reserva." };
  }

  const cardapio = await prisma.cardapio.findUnique({ where: { data } });
  if (!cardapio) return { erro: "Reserva não encontrada." };

  const reserva = await prisma.reserva.findUnique({
    where: {
      matriculaId_cardapioId: {
        matriculaId: usuario.matricula.id,
        cardapioId: cardapio.id,
      },
    },
  });

  if (!reserva || reserva.status !== "RESERVADA") {
    return { erro: "Não há reserva ativa para cancelar." };
  }

  await prisma.reserva.update({
    where: { id: reserva.id },
    data: { status: "CANCELADA" },
  });

  revalidatePath("/aluno");
  redirect("/aluno");
}
