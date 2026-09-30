"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { Papel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { parseMatriculasCsv } from "@/lib/csv";
import { amanhaISO, emailInstitucional } from "@/lib/regras";

export type EstadoAdmin = { erro?: string; ok?: boolean; mensagem?: string } | null;

export async function importarMatriculasAction(
  _prev: EstadoAdmin,
  formData: FormData,
): Promise<EstadoAdmin> {
  await exigirSessao("ADMIN");
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Selecione um arquivo CSV." };
  }

  const texto = await arquivo.text();
  const linhas = parseMatriculasCsv(texto);
  if (linhas.length === 0) {
    return { erro: "Nenhuma linha válida. Use as colunas matricula, email e nome." };
  }

  let importadas = 0;
  for (const linha of linhas) {
    await prisma.matricula.upsert({
      where: { matricula: linha.matricula },
      create: linha,
      update: { email: linha.email, nome: linha.nome, ativa: true },
    });
    importadas += 1;
  }

  revalidatePath("/admin/matriculas");
  return { ok: true, mensagem: `${importadas} matrícula(s) importada(s).` };
}

export async function criarMatriculaAction(
  _prev: EstadoAdmin,
  formData: FormData,
): Promise<EstadoAdmin> {
  await exigirSessao("ADMIN");
  const matricula = String(formData.get("matricula") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const nome = String(formData.get("nome") ?? "").trim();

  if (!matricula || !email || !nome) {
    return { erro: "Preencha matrícula, e-mail e nome." };
  }
  if (!emailInstitucional(email)) {
    return { erro: "Use um e-mail institucional (@aluno.ifsc.edu.br ou @ifsc.edu.br)." };
  }

  await prisma.matricula.upsert({
    where: { matricula },
    create: { matricula, email, nome },
    update: { email, nome, ativa: true },
  });

  revalidatePath("/admin/matriculas");
  return { ok: true, mensagem: `Matrícula ${matricula} salva.` };
}

export async function salvarCardapioAction(
  _prev: EstadoAdmin,
  formData: FormData,
): Promise<EstadoAdmin> {
  const sessao = await exigirSessao("ADMIN", "CANTINA");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const retirar = String(formData.get("retirar") ?? "") === "1";
  const data =
    sessao.papel === "CANTINA"
      ? amanhaISO()
      : String(formData.get("data") ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return { erro: "Informe a data do cardápio." };
  }

  if (retirar || !descricao) {
    const existente = await prisma.cardapio.findUnique({ where: { data } });
    if (existente) {
      await prisma.$transaction([
        prisma.reserva.deleteMany({ where: { cardapioId: existente.id } }),
        prisma.cardapio.delete({ where: { id: existente.id } }),
      ]);
    }
    revalidatePath("/admin/cardapio");
    revalidatePath("/cantina");
    revalidatePath("/cantina/cardapio");
    revalidatePath("/aluno");
    revalidatePath("/aluno", "layout");
    return { ok: true, mensagem: "Sem cardápio nesse dia. Não haverá refeição." };
  }

  await prisma.cardapio.upsert({
    where: { data },
    create: { data, descricao },
    update: { descricao },
  });

  revalidatePath("/admin/cardapio");
  revalidatePath("/cantina");
  revalidatePath("/cantina/cardapio");
  revalidatePath("/aluno");
  revalidatePath("/aluno", "layout");
  return { ok: true, mensagem: "Cardápio salvo." };
}

export async function criarOperadorAction(
  _prev: EstadoAdmin,
  formData: FormData,
): Promise<EstadoAdmin> {
  await exigirSessao("ADMIN");
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const papel = String(formData.get("papel") ?? "CANTINA") as Papel;

  if (!nome || !email || !senha) {
    return { erro: "Preencha nome, e-mail e senha." };
  }
  if (!emailInstitucional(email)) {
    return { erro: "Use um e-mail institucional do IFSC." };
  }
  if (papel !== "CANTINA" && papel !== "ADMIN") {
    return { erro: "Papel inválido." };
  }

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) return { erro: "Já existe um usuário com este e-mail." };

  await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash: await bcrypt.hash(senha, 10),
      papel,
    },
  });

  revalidatePath("/admin/equipe");
  return { ok: true, mensagem: "Operador criado." };
}
