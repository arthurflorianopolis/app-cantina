import Papa from "papaparse";

function normalizarCabecalho(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export type LinhaMatricula = {
  matricula: string;
  email: string;
  nome: string;
};

export function parseMatriculasCsv(texto: string): LinhaMatricula[] {
  const parsed = Papa.parse<Record<string, string>>(texto, {
    header: true,
    skipEmptyLines: true,
  });

  const linhas: LinhaMatricula[] = [];

  for (const row of parsed.data) {
    const mapa: Record<string, string> = {};
    for (const [chave, valor] of Object.entries(row)) {
      mapa[normalizarCabecalho(chave)] = String(valor ?? "").trim();
    }

    const matricula = mapa.matricula || mapa.prontuario || "";
    const email = (mapa.email || mapa.mail || "").toLowerCase();
    const nome = mapa.nome || mapa.nomecompleto || mapa.name || "";

    if (!matricula || !email || !nome) continue;
    linhas.push({ matricula, email, nome });
  }

  return linhas;
}
