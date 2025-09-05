import { apiGet } from "./api.js";

export async function carregarMercadorias() {
  const objMercadorias = await apiGet("mercadorias");

  if (objMercadorias && objMercadorias.length > 0) {
    return objMercadorias;
  }

  return [];
}
