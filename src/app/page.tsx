import { redirect } from "next/navigation";
import { destinoDoPapel, lerSessao } from "@/lib/auth";

export default async function Home() {
  const sessao = await lerSessao();
  redirect(sessao ? destinoDoPapel(sessao.papel) : "/login");
}
