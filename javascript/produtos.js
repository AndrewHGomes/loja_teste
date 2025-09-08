import { apiGet } from "./api.js";

export async function carregarProdutos() {
  const produtos = await apiGet("produtos");

  if (produtos && produtos.length > 0) {
    return produtos;
  }

  return [];
}

export async function carregarCategorias() {
  const objCategorias = await apiGet("categorias");

  if (objCategorias && objCategorias.length > 0) {
    return objCategorias;
  }

  return [];
}

export async function carregarPedidosAnteriores() {
  const pedidosAnteriores = await apiGet("pedidos-anteriores");

  return pedidosAnteriores;
}
