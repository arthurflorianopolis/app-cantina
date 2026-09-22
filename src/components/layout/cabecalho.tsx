import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import type { Papel } from "@prisma/client";

const links: Record<Papel, { href: string; label: string }[]> = {
  ALUNO: [{ href: "/aluno", label: "Início" }],
  CANTINA: [
    { href: "/cantina", label: "Painel" },
    { href: "/cantina/cardapio", label: "Cardápio" },
    { href: "/cantina/escanear", label: "Escanear" },
    { href: "/cantina/buscar", label: "Buscar" },
  ],
  ADMIN: [
    { href: "/admin", label: "Início" },
    { href: "/admin/matriculas", label: "Matrículas" },
    { href: "/admin/cardapio", label: "Cardápio" },
    { href: "/admin/equipe", label: "Equipe" },
    { href: "/admin/relatorio", label: "Relatório" },
  ],
};

export function Cabecalho({
  nome,
  papel,
}: {
  nome: string;
  papel: Papel;
}) {
  const itens = [
    ...links[papel],
    ...(papel === "ADMIN"
      ? [{ href: "/cantina", label: "Cantina" }]
      : []),
  ];

  return (
    <header className="border-b border-ifsc/10 bg-ifsc text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-semibold tracking-wide">Cantina IFSC</p>
          <p className="text-xs text-white/80">{nome}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {itens.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/90 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10"
            >
              Sair
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
