import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  alunosComLogin,
  alunosPrimeiroAcesso,
  operadoresCantina,
  senhaAlunoPadrao,
  senhaCantinaPadrao,
} from "./demo";

const prisma = new PrismaClient();

async function main() {
  const senhaAluno = await bcrypt.hash(senhaAlunoPadrao, 10);
  const senhaCantina = await bcrypt.hash(senhaCantinaPadrao, 10);

  for (const aluno of [...alunosComLogin, ...alunosPrimeiroAcesso]) {
    await prisma.matricula.upsert({
      where: { matricula: aluno.matricula },
      create: aluno,
      update: { email: aluno.email, nome: aluno.nome, ativa: true },
    });
  }

  for (const operador of operadoresCantina) {
    await prisma.usuario.upsert({
      where: { email: operador.email },
      create: {
        email: operador.email,
        senhaHash: senhaCantina,
        nome: operador.nome,
        papel: "CANTINA",
      },
      update: { nome: operador.nome, senhaHash: senhaCantina, papel: "CANTINA" },
    });
  }

  for (const aluno of alunosComLogin) {
    const matricula = await prisma.matricula.findUniqueOrThrow({
      where: { matricula: aluno.matricula },
    });
    await prisma.usuario.upsert({
      where: { email: aluno.email },
      create: {
        email: aluno.email,
        senhaHash: senhaAluno,
        nome: aluno.nome,
        papel: "ALUNO",
        matriculaId: matricula.id,
      },
      update: {
        senhaHash: senhaAluno,
        nome: aluno.nome,
        papel: "ALUNO",
        matriculaId: matricula.id,
      },
    });
  }

  console.log(
    `Pronto: ${alunosComLogin.length} alunos com login, ${alunosPrimeiroAcesso.length} só na lista, ${operadoresCantina.length} cantina.`,
  );
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
