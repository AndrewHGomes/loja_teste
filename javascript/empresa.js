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

export async function carregarBairros() {
  try {
    const resposta = await apiGet("bairros");

    if (resposta) {
      return resposta;
    }
  } catch (erro) {
    throw erro;
  }
}

export async function carregarTaxaEntrega(bairro, taxaFixaEmpresa) {
  try {
    const resposta = await apiGet(
      `taxa-entrega&bairro=${encodeURIComponent(bairro)}`
    );

    if (resposta.taxa !== null && resposta.taxa > 0) {
      return resposta.taxa;
    }
    return taxaFixaEmpresa;
  } catch (erro) {
    throw erro;
  }
}
