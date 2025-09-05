import { apiGet } from "./api.js";

export async function carregarEmpresa() {
  const objEmpresa = await apiGet("empresa");

  if (objEmpresa && objEmpresa.length > 0) {
    console.log(objEmpresa[0]);
    return objEmpresa[0];
  }

  return [];
}
