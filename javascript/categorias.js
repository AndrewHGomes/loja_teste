import { apiGet } from "./api.js";

export async function carregarCategorias() {
  const objCategorias = await apiGet("categorias");

  if (objCategorias && objCategorias.length > 0) {
    console.log(objCategorias);
    return objCategorias;
  }

  return [];
}
