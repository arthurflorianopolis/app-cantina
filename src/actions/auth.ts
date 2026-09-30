"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  criarSessao,
  destinoAposLogin,
  encerrarSessao,
  exigirSessao,
} from "@/lib/auth";
import { emailConfigurado, enviarSenhaTemporaria } from "@/lib/email";

export type EstadoForm = { erro?: string; ok?: boolean; mensagem?: string } | null;

function dadosSessao(usuario: {
  id: string;
  papel: "ADMIN" | "CANTINA" | "ALUNO";
  nome: string;
  email: string;
  precisaTrocarSenha: boolean;
}) {
  return {
    sub: usuario.id,
    papel: usuario.papel,
    nome: usuario.nome,
    email: usuario.email,
    precisaTrocarSenha: usuario.precisaTrocarSenha,
  };
}

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

  const sessao = dadosSessao(usuario);
  await criarSessao(sessao);
  redirect(destinoAposLogin(sessao));
}

export async function primeiroAcessoAction(
  _prev: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const matricula = String(formData.get("matricula") ?? "").trim();
  if (!matricula) {
    return { erro: "Informe a matrícula." };
  }

  const registro = await prisma.matricula.findFirst({
    where: { matricula, ativa: true },
  });
  if (!registro) {
    return { erro: "Matrícula não encontrada na lista da instituição." };
  }

  let usuario = await prisma.usuario.findFirst({
    where: { matriculaId: registro.id },
  });

  if (usuario && !usuario.precisaTrocarSenha) {
    return { erro: "Esta matrícula já possui senha. Faça login." };
  }

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        email: registro.email,
        senhaHash: await bcrypt.hash(crypto.randomUUID(), 10),
        nome: registro.nome,
        papel: "ALUNO",
        matriculaId: registro.id,
        precisaTrocarSenha: true,
      },
    });
  }

  const sessao = dadosSessao({ ...usuario, precisaTrocarSenha: true });
  await criarSessao(sessao);
  redirect("/alterar-senha");
}

function senhaTemporaria() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
}

export async function esqueciSenhaAction(
  _prev: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const matricula = String(formData.get("matricula") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!matricula || !email) {
    return { erro: "Informe matrícula e e-mail." };
  }

  if (!emailConfigurado()) {
    return {
      erro: "O envio de e-mail ainda não está configurado. Fale com a administração.",
    };
  }

  const registro = await prisma.matricula.findFirst({
    where: { matricula, email, ativa: true },
  });
  const usuario = registro
    ? await prisma.usuario.findFirst({ where: { matriculaId: registro.id } })
    : null;

  if (!registro || !usuario) {
    return {
      erro: "Matrícula e e-mail não conferem, ou ainda não há senha nesta matrícula. Use o primeiro acesso.",
    };
  }

  const senha = senhaTemporaria();
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senhaHash: await bcrypt.hash(senha, 10),
      precisaTrocarSenha: true,
    },
  });

  try {
    await enviarSenhaTemporaria(usuario.email, usuario.nome, senha);
  } catch {
    return {
      erro: "Não foi possível enviar o e-mail. Tente de novo em alguns minutos.",
    };
  }

  return {
    ok: true,
    mensagem: `Enviamos uma senha temporária para ${usuario.email}. Entre com ela e crie uma senha nova.`,
  };
}

export async function alterarSenhaAction(
  _prev: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirSessao();
  const senha = String(formData.get("senha") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (senha.length < 6) {
    return { erro: "A senha deve ter pelo menos 6 caracteres." };
  }
  if (senha !== confirmar) {
    return { erro: "As senhas não coincidem." };
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.sub },
    include: { matricula: true },
  });
  if (!usuario) {
    return { erro: "Usuário não encontrado." };
  }
  if (usuario.matricula && senha === usuario.matricula.matricula) {
    return { erro: "Escolha uma senha diferente do número da matrícula." };
  }

  const atualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senhaHash: await bcrypt.hash(senha, 10),
      precisaTrocarSenha: false,
    },
  });

  const novaSessao = dadosSessao(atualizado);
  await criarSessao(novaSessao);
  redirect(destinoAposLogin(novaSessao));
}

export async function logoutAction() {
  await encerrarSessao();
  redirect("/login");
}
