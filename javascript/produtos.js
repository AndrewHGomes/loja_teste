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

  if (pedidosAnteriores) {
    return pedidosAnteriores;
  }

  return [];
}

export async function carregarDetalhesPedidosAnteriores(codigo) {
  const detalhesPedidosAnteriores = await apiGet(
    `detalhes-pedidos-anteriores&codigo=${codigo}`
  );

  if (detalhesPedidosAnteriores) {
    return detalhesPedidosAnteriores;
  }

  return [];
}

export async function carregarProdutoSelecionado() {
  const produtoSelecionado = await apiGet("produto-selecionado");

  if (produtoSelecionado) {
    return produtoSelecionado;
  }

  return {};
}
