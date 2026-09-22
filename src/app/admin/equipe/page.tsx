import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { Card, PageShell } from "@/components/ui";
import { FormOperador } from "@/components/admin/forms";

export default async function EquipePage() {
  await exigirSessao("ADMIN");
  const equipe = await prisma.usuario.findMany({
    where: { papel: { in: ["CANTINA", "ADMIN"] } },
    orderBy: { nome: "asc" },
  });

  return (
    <PageShell titulo="Equipe" descricao="Logins da cantina e de administradores.">
      <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
        <Card>
          <FormOperador />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Usuários internos</h2>
          <ul className="space-y-2 text-sm">
            {equipe.map((item) => (
              <li key={item.id} className="flex items-center justify-between border-b border-zinc-100 py-2">
                <span>
                  {item.nome}
                  <span className="block text-zinc-500">{item.email}</span>
                </span>
                <span className="rounded-full bg-ifsc-soft px-2 py-0.5 text-xs font-medium text-ifsc">
                  {item.papel === "ADMIN" ? "Admin" : "Cantina"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
