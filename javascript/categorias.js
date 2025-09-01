import { repassarDados } from "./api.js";

export async function carregarCategorias() {
  const objCategorias = await repassarDados("categorias");

  if (objCategorias && objCategorias.length > 0) {
    const categorias = objCategorias.map((categoria) => {
      const { id, descricao, pizza } = categoria;

      return { id, descricao, pizza };
    });

    return categorias;
  }

  return null;
}
