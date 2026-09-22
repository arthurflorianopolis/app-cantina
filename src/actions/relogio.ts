"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { amanhaISO, definirDataSimulada } from "@/lib/regras";

function destino(formData?: FormData) {
  const pagina = String(formData?.get("voltarPara") ?? "/cantina");
  if (pagina === "/admin" || pagina.startsWith("/cantina")) return pagina;
  return "/cantina";
}

export async function avancarDiaTesteAction(formData: FormData) {
  await exigirSessao("CANTINA", "ADMIN");
  definirDataSimulada(amanhaISO());
  redirect(destino(formData));
}

export async function voltarDiaRealAction(formData: FormData) {
  await exigirSessao("CANTINA", "ADMIN");
  definirDataSimulada(null);
  redirect(destino(formData));
}

export async function reiniciarTesteAction(formData: FormData) {
  await exigirSessao("CANTINA", "ADMIN");
  definirDataSimulada(null);
  await prisma.reserva.deleteMany();
  await prisma.cardapio.deleteMany();
  redirect(destino(formData));
}
