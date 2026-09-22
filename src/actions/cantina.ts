"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { formatarData, hojeISO, novoQrToken } from "@/lib/regras";

export type EstadoCantina = {
  erro?: string;
  ok?: boolean;
  mensagem?: string;
  nome?: string;
  matricula?: string;
} | null;

async function cardapioDeHoje() {
  return prisma.cardapio.findUnique({ where: { data: hojeISO() } });
}

export async function confirmarPorQrAction(token: string): Promise<EstadoCantina> {
  const sessao = await exigirSessao("CANTINA", "ADMIN");
  const qrToken = token.trim();
  if (!qrToken) return { erro: "QR inválido." };

  const reserva = await prisma.reserva.findUnique({
    where: { qrToken },
    include: { matricula: true, cardapio: true },
  });

  if (!reserva) {
    return { erro: "QR não encontrado." };
  }
  if (reserva.cardapio.data !== hojeISO()) {
    return {
      erro: `Este QR é da refeição de ${formatarData(reserva.cardapio.data)}. Só vale no dia da refeição.`,
    };
  }
  if (reserva.status === "CANCELADA") {
    return { erro: "Esta reserva foi cancelada." };
  }
  if (reserva.status === "CONSUMIDA") {
    return { erro: "Esta reserva já foi utilizada." };
  }

  await prisma.reserva.update({
    where: { id: reserva.id },
    data: {
      status: "CONSUMIDA",
      confirmadoEm: new Date(),
      confirmadoPorId: sessao.sub,
    },
  });

  revalidatePath("/cantina");
  return {
    ok: true,
    mensagem: "Consumo confirmado.",
    nome: reserva.matricula.nome,
    matricula: reserva.matricula.matricula,
  };
}

export async function confirmarPorMatriculaAction(
  matricula: string,
): Promise<EstadoCantina> {
  const sessao = await exigirSessao("CANTINA", "ADMIN");
  const registro = await prisma.matricula.findUnique({
    where: { matricula: matricula.trim() },
  });
  if (!registro) return { erro: "Matrícula não encontrada." };

  const cardapio = await cardapioDeHoje();
  if (!cardapio) return { erro: "Não há cardápio para hoje." };

  const reserva = await prisma.reserva.findUnique({
    where: {
      matriculaId_cardapioId: {
        matriculaId: registro.id,
        cardapioId: cardapio.id,
      },
    },
  });

  if (!reserva || reserva.status === "CANCELADA") {
    return { erro: "Não há reserva ativa. Use a inclusão manual." };
  }
  if (reserva.status === "CONSUMIDA") {
    return { erro: "Esta pessoa já foi confirmada hoje." };
  }

  await prisma.reserva.update({
    where: { id: reserva.id },
    data: {
      status: "CONSUMIDA",
      confirmadoEm: new Date(),
      confirmadoPorId: sessao.sub,
    },
  });

  revalidatePath("/cantina");
  return {
    ok: true,
    mensagem: "Consumo confirmado.",
    nome: registro.nome,
    matricula: registro.matricula,
  };
}

export async function inclusaoManualAction(
  _prev: EstadoCantina,
  formData: FormData,
): Promise<EstadoCantina> {
  const sessao = await exigirSessao("CANTINA", "ADMIN");
  const matricula = String(formData.get("matricula") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "").trim();

  if (!matricula || !motivo) {
    return { erro: "Informe a matrícula e o motivo da inclusão." };
  }

  const registro = await prisma.matricula.findUnique({ where: { matricula } });
  if (!registro) return { erro: "Matrícula não encontrada na lista." };

  const cardapio = await cardapioDeHoje();
  if (!cardapio) return { erro: "Não há cardápio para hoje." };

  const existente = await prisma.reserva.findUnique({
    where: {
      matriculaId_cardapioId: {
        matriculaId: registro.id,
        cardapioId: cardapio.id,
      },
    },
  });

  if (existente?.status === "CONSUMIDA") {
    return { erro: "Esta pessoa já foi confirmada hoje." };
  }

  if (existente && existente.status === "RESERVADA") {
    await prisma.reserva.update({
      where: { id: existente.id },
      data: {
        status: "CONSUMIDA",
        confirmadoEm: new Date(),
        confirmadoPorId: sessao.sub,
      },
    });
  } else if (existente) {
    await prisma.reserva.update({
      where: { id: existente.id },
      data: {
        status: "CONSUMIDA",
        origem: "MANUAL",
        motivoManual: motivo,
        qrToken: novoQrToken(),
        confirmadoEm: new Date(),
        confirmadoPorId: sessao.sub,
      },
    });
  } else {
    await prisma.reserva.create({
      data: {
        matriculaId: registro.id,
        cardapioId: cardapio.id,
        qrToken: novoQrToken(),
        status: "CONSUMIDA",
        origem: "MANUAL",
        motivoManual: motivo,
        confirmadoEm: new Date(),
        confirmadoPorId: sessao.sub,
      },
    });
  }

  revalidatePath("/cantina");
  return {
    ok: true,
    mensagem: `${registro.nome} foi incluída(o) e confirmada(o).`,
    nome: registro.nome,
    matricula: registro.matricula,
  };
}
