import { redirect } from "next/navigation";
import { destinoAposLogin, lerSessao } from "@/lib/auth";

export default async function Home() {
  const sessao = await lerSessao();
  redirect(sessao ? destinoAposLogin(sessao) : "/login");
}
