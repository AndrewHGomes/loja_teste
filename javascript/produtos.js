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

export async function carregarPedidosAnteriores(fone) {
  const pedidosAnteriores = await apiGet(`pedidos-anteriores&fone=${fone}`);
  return pedidosAnteriores;
}

export async function carregarDetalhesPedidosAnteriores(codigo) {
  const detalhesPedidosAnteriores = await apiGet(
    `detalhes-pedidos-anteriores&codigo=${codigo}`
  );

  return detalhesPedidosAnteriores;
}
