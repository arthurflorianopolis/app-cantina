import fs from "node:fs";
import path from "node:path";
import { DateTime } from "luxon";

export const ZONA = "America/Sao_Paulo";
export const HORA_LIMITE_RESERVA = 22;

function arquivoRelogio() {
  if (process.env.CANTINA_HOJE_ARQUIVO) return process.env.CANTINA_HOJE_ARQUIVO;
  if (fs.existsSync("/data")) return "/data/hoje-simulado";
  return path.join(process.cwd(), ".hoje-simulado");
}

export function dataSimuladaISO(): string | null {
  const env = process.env.CANTINA_HOJE?.trim();
  if (env && /^\d{4}-\d{2}-\d{2}$/.test(env)) return env;
  try {
    const valor = fs.readFileSync(/* turbopackIgnore: true */ arquivoRelogio(), "utf8").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  } catch {
    // relógio real
  }
  return null;
}

export function definirDataSimulada(iso: string | null) {
  const arquivo = arquivoRelogio();
  if (!iso) {
    try {
      fs.unlinkSync(arquivo);
    } catch {
      // já estava no dia real
    }
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new Error("Data simulada inválida.");
  }
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, `${iso}\n`);
}

export function agora() {
  const real = DateTime.now().setZone(ZONA);
  const simulado = dataSimuladaISO();
  if (!simulado) return real;
  return DateTime.fromISO(simulado, { zone: ZONA }).set({
    hour: real.hour,
    minute: real.minute,
    second: real.second,
    millisecond: real.millisecond,
  });
}

export function hojeISO() {
  return agora().toISODate()!;
}

export function amanhaISO() {
  return agora().plus({ days: 1 }).toISODate()!;
}

export function formatarData(iso: string) {
  return DateTime.fromISO(iso, { zone: ZONA })
    .setLocale("pt-BR")
    .toFormat("cccc, dd/LL/yyyy");
}

export function formatarDataCurta(iso: string) {
  return DateTime.fromISO(iso, { zone: ZONA })
    .setLocale("pt-BR")
    .toFormat("dd/LL");
}

export function limiteReserva(dataRefeicaoISO: string) {
  return DateTime.fromISO(dataRefeicaoISO, { zone: ZONA }).set({
    hour: HORA_LIMITE_RESERVA,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
}

export function janelaReservaAberta() {
  return agora() <= limiteReserva(hojeISO());
}

export function podeReservar(dataRefeicaoISO: string) {
  return dataRefeicaoISO === amanhaISO() && janelaReservaAberta();
}

export function emailInstitucional(email: string) {
  const e = email.toLowerCase();
  return e.endsWith("@aluno.ifsc.edu.br") || e.endsWith("@ifsc.edu.br");
}

export function novoQrToken() {
  return crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
}

export function rotuloStatus(status: "RESERVADA" | "CONSUMIDA" | "CANCELADA", dataISO: string) {
  if (status === "CONSUMIDA") return "Consumida";
  if (status === "CANCELADA") return "Cancelada";
  if (dataISO < hojeISO()) return "Não compareceu";
  return "Reservada";
}
