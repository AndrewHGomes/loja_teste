import { repassarDados } from "./api.js";

export async function carregarEmpresa() {
  const objEmpresa = await repassarDados("empresa");

  if (objEmpresa && objEmpresa.length > 0) {
    const { Fantasia, Telefone, Cidade, aberto, tempoentrega, ativaentrega } =
      objEmpresa[0];

    return {
      Fantasia,
      Telefone,
      Cidade,
      aberto,
      tempoentrega,
      ativaentrega,
    };
  }

  return null;
}
