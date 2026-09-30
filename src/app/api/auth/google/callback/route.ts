import { NextRequest } from "next/server";
import { concluirLoginGoogle } from "@/lib/google";

export async function GET(req: NextRequest) {
  return concluirLoginGoogle(req);
}
