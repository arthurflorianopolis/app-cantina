import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DateTime } from "luxon";
import {
  alunosComLogin,
  alunosPrimeiroAcesso,
  operadoresCantina,
  senhaAlunoPadrao,
  senhaCantinaPadrao,
} from "./demo";

const prisma = new PrismaClient();
const ZONA = "America/Sao_Paulo";

async function main() {
  const jaTemUsuario = await prisma.usuario.count();
  if (jaTemUsuario > 0 && process.env.FORCE_SEED !== "1") {
    console.log("Banco já populado; seed ignorado.");
    return;
  }

  const hoje = DateTime.now().setZone(ZONA).toISODate()!;
  const amanha = DateTime.now().setZone(ZONA).plus({ days: 1 }).toISODate()!;
  const senhaAluno = await bcrypt.hash(senhaAlunoPadrao, 10);
  const senhaAdmin = await bcrypt.hash("admin123", 10);
  const senhaCantina = await bcrypt.hash(senhaCantinaPadrao, 10);

  await prisma.reserva.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.cardapio.deleteMany();
  await prisma.matricula.deleteMany();

  for (const aluno of [...alunosComLogin, ...alunosPrimeiroAcesso]) {
    await prisma.matricula.create({ data: aluno });
  }

  await prisma.usuario.create({
    data: {
      email: "admin@ifsc.edu.br",
      senhaHash: senhaAdmin,
      nome: "Administrador",
      papel: "ADMIN",
    },
  });

  for (const operador of operadoresCantina) {
    await prisma.usuario.create({
      data: {
        email: operador.email,
        senhaHash: senhaCantina,
        nome: operador.nome,
        papel: "CANTINA",
      },
    });
  }

  for (const aluno of alunosComLogin) {
    const matricula = await prisma.matricula.findUniqueOrThrow({
      where: { matricula: aluno.matricula },
    });
    await prisma.usuario.create({
      data: {
        email: aluno.email,
        senhaHash: senhaAluno,
        nome: aluno.nome,
        papel: "ALUNO",
        matriculaId: matricula.id,
      },
    });
  }

  await prisma.cardapio.create({
    data: {
      data: hoje,
      descricao: "Arroz, feijão, frango grelhado, salada e suco",
    },
  });

  await prisma.cardapio.create({
    data: {
      data: amanha,
      descricao: "Arroz, feijão, carne moída, legumes e suco",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (erro) => {
    console.error(erro);
    await prisma.$disconnect();
    process.exit(1);
  });
