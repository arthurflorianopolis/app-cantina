"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  criarSessao,
  destinoDoPapel,
  encerrarSessao,
} from "@/lib/auth";
import { emailInstitucional } from "@/lib/regras";

export type EstadoForm = { erro: string } | null;

export async function loginAction(
  _prev: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Informe e-mail e senha." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    return { erro: "E-mail ou senha inválidos." };
  }

  await criarSessao({
    sub: usuario.id,
    papel: usuario.papel,
    nome: usuario.nome,
    email: usuario.email,
  });

  redirect(destinoDoPapel(usuario.papel));
}

export async function primeiroAcessoAction(
  _prev: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const matricula = String(formData.get("matricula") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (!matricula || !email || !senha) {
    return { erro: "Preencha matrícula, e-mail e senha." };
  }
  if (!emailInstitucional(email)) {
    return { erro: "Use o e-mail institucional do IFSC." };
  }
  if (senha.length < 6) {
    return { erro: "A senha deve ter pelo menos 6 caracteres." };
  }
  if (senha !== confirmar) {
    return { erro: "As senhas não coincidem." };
  }

  const registro = await prisma.matricula.findFirst({
    where: { matricula, email, ativa: true },
  });
  if (!registro) {
    return {
      erro: "Matrícula e e-mail não conferem com a lista da instituição.",
    };
  }

  const jaExiste = await prisma.usuario.findFirst({
    where: { OR: [{ email }, { matriculaId: registro.id }] },
  });
  if (jaExiste) {
    return { erro: "Esta matrícula já possui cadastro. Faça login." };
  }

  const usuario = await prisma.usuario.create({
    data: {
      email,
      senhaHash: await bcrypt.hash(senha, 10),
      nome: registro.nome,
      papel: "ALUNO",
      matriculaId: registro.id,
    },
  });

  await criarSessao({
    sub: usuario.id,
    papel: usuario.papel,
    nome: usuario.nome,
    email: usuario.email,
  });

  redirect("/aluno");
}

export async function logoutAction() {
  await encerrarSessao();
  redirect("/login");
}
