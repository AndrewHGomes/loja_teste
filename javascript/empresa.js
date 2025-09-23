import { apiGet } from "./api.js";

export async function carregarEmpresa() {
  try {
    const resposta = await apiGet("empresa");

    if (resposta && resposta.empresa && resposta.parametros) {
      return {
        empresa: resposta.empresa[0],
        parametros: resposta.parametros[0],
      };
    }

    return { empresa: null, parametros: null };
  } catch (erro) {
    return { empresa: null, parametros: null };
  }
}

export async function carregarHorarios() {
  try {
    const arrayHorarios = await apiGet("horarios");
    return arrayHorarios || [];
  } catch (erro) {
    return [];
  }
}
