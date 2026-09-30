# Cantina IFSC

Aplicativo do câmpus São Carlos para organizar o almoço da cantina. A cantina publica o cardápio só nos dias em que há refeição. Quem vai almoçar reserva com antecedência e, na fila, apresenta um QR Code. A cantina confirma a refeição na hora e a administração acompanha quantas pessoas reservaram, quantas compareceram e quantas faltaram.

## Como funciona

1. A administração mantém a lista de matrículas, com matrícula, nome e e-mail institucional. Essa lista liga a conta Google à reserva.
2. A cantina publica o cardápio de amanhã. Se não houver almoço, o dia fica sem cardápio.
3. Estudantes e servidores entram com a conta Google `@ifsc.edu.br` ou `@aluno.ifsc.edu.br`. A senha é digitada na página do Google.
4. Com o e-mail igual ao de uma matrícula ativa, a pessoa vê o cardápio de amanhã e reserva até as 22h de hoje. Pode cancelar enquanto esse prazo estiver aberto. Sem matrícula correspondente, entra e vê o cardápio, mas não reserva.
5. A reserva gera um QR Code. No dia do almoço, a cantina lê o código, ou busca a matrícula, e marca a refeição como servida. Também é possível incluir alguém que não reservou, registrando o motivo.
6. A administração consulta o relatório do período: reservas feitas pelo aplicativo, inclusões manuais, refeições servidas e faltas.

Há três papéis. O estudante reserva e mostra o QR. A cantina publica o cardápio e confirma quem almoçou. A administração cuida das matrículas, da equipe e do relatório.

## Estrutura

```
app_cantina/
├── prisma/                 # schema e seed do banco
├── exemplos/               # CSV de matrículas de exemplo
├── deploy/                 # scripts da VM Proxmox
├── src/
│   ├── actions/            # regras de negócio no servidor
│   ├── app/                # rotas (aluno, cantina, admin)
│   ├── components/         # telas por papel
│   │   ├── aluno/
│   │   ├── cantina/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── layout/
│   │   └── ui.tsx
│   ├── lib/                # auth, QR, CSV, datas
│   └── middleware.ts       # proteção das rotas
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Como rodar (neste computador)

Node.js 22. Nesta máquina: `~/.local/node`.

```bash
export PATH="$HOME/.local/node/bin:$PATH"
cp .env.example .env
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

O arquivo `.env` não vai para o Git.

## VM Proxmox (`172.16.110.6`)

```bash
./deploy/enviar.sh
```

## Acesso

Alunos e servidores entram com a conta Google `@ifsc.edu.br` ou `@aluno.ifsc.edu.br`. Não é preciso cadastrar a pessoa antes. O e-mail e a senha são informados na página do Google.

A lista de matrículas continua no administrador. Se o e-mail da conta Google for o mesmo de uma matrícula ativa, a pessoa pode reservar. Sem esse vínculo, ela entra e vê o cardápio, mas a reserva fica bloqueada.

O botão do Google depende de `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e de um `APP_URL` com nome e HTTPS. O endereço de retorno é `APP_URL/api/auth/google/callback`.

CSV de exemplo: `exemplos/matriculas.csv`. Ana Costa `2025003`, Carlos Lima `2025012` e Beatriz Alves `2025013` estão só nessa lista.

Contas locais abaixo servem para testar administração e cantina sem o Google. Senha da cantina: `cantina123`.

| Papel   | E-mail                              | Senha      |
|---------|-------------------------------------|------------|
| Admin   | admin@ifsc.edu.br                   | admin123   |
| Cantina | cantina@ifsc.edu.br                 | cantina123 |
| Cantina | cantina2@ifsc.edu.br                | cantina123 |
