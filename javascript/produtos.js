import { apiGet } from "./api.js";

export async function carregarProdutos() {
  const produtos = await apiGet("produtos");

  if (produtos && produtos.length > 0) {
    console.log(produtos);
    return produtos;
  }

  return [];
}
