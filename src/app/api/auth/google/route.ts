import { NextRequest } from "next/server";
import { iniciarLoginGoogle } from "@/lib/google";

export async function GET(req: NextRequest) {
  return iniciarLoginGoogle(req);
}
