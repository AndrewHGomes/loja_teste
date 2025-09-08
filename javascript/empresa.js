import { apiGet } from "./api.js";

export async function carregarEmpresa() {
  const resposta = await apiGet("empresa");

  const dadosDaEmpresa = resposta.empresa;

  const parametrosDaEmpresa = resposta.parametros;

  if (dadosDaEmpresa && parametrosDaEmpresa) {
    return {
      empresa: dadosDaEmpresa[0],
      parametros: parametrosDaEmpresa[0],
    };
  }

  return [];
}

export async function carregarHorarios() {
  const arrayHorarios = await apiGet("horarios");

  if (arrayHorarios && arrayHorarios.length > 0) {
    return arrayHorarios;
  }

  return [];
}
