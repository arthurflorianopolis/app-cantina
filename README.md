# Cantina IFSC

Sistema de reserva de almoço (até 22h no mesmo dia) e confirmação por QR na cantina.

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

## Logins de exemplo (seed)

Senha dos alunos: `aluno123`. Senha da cantina: `cantina123`.

| Papel   | E-mail                              | Senha      |
|---------|-------------------------------------|------------|
| Admin   | admin@ifsc.edu.br                   | admin123   |
| Cantina | cantina@ifsc.edu.br                 | cantina123 |
| Cantina | cantina2@ifsc.edu.br                | cantina123 |
| Aluna   | maria.silva@aluno.ifsc.edu.br       | aluno123   |
| Aluno   | joao.souza@aluno.ifsc.edu.br        | aluno123   |
| Aluno   | pedro.oliveira@aluno.ifsc.edu.br    | aluno123   |
| Aluna   | lucia.ferreira@aluno.ifsc.edu.br    | aluno123   |
| Aluno   | rafael.souza@aluno.ifsc.edu.br      | aluno123   |
| Aluna   | camila.rocha@aluno.ifsc.edu.br      | aluno123   |
| Aluno   | bruno.martins@aluno.ifsc.edu.br     | aluno123   |
| Aluna   | fernanda.dias@aluno.ifsc.edu.br     | aluno123   |
| Aluno   | gustavo.nunes@aluno.ifsc.edu.br     | aluno123   |
| Aluna   | juliana.pinto@aluno.ifsc.edu.br     | aluno123   |

Só na lista (use **Primeiro acesso** com a matrícula; o app pede a senha em seguida): Ana Costa `2025003`, Carlos Lima `2025012`, Beatriz Alves `2025013`.

CSV de exemplo: `exemplos/matriculas.csv`.

**Esqueci a senha:** a pessoa informa matrícula e e-mail; o sistema envia uma senha temporária. Isso só funciona com `SMTP_HOST` e `SMTP_FROM` no `.env` (na VM: `/opt/cantina/.env`).
