import { apiGet } from "./api.js";

export async function carregarEmpresa() {
  try {
    const resposta = await apiGet("empresa");

    if (resposta && resposta.empresa && resposta.parametros) {
      return resposta;
    }

    return { empresa: {}, parametros: {} };
  } catch (erro) {
    throw erro;
  }
}

export async function carregarHorarios() {
  return await apiGet("horarios");
}
