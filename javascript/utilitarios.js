import { apiGet } from "./api.js";

export async function carregarUtilidades() {
  const objUtilidades = await apiGet("horarios");

  if (objUtilidades && objUtilidades.length > 0) {
    return objUtilidades;
  }

  return [];
}
