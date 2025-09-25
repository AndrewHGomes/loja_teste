import { apiGet } from "./api.js";

export async function carregarProdutos() {
  try {
    const produtos = await apiGet("produtos");
    return produtos || [];
  } catch (erro) {
    return [];
  }
}

export async function carregarCategorias() {
  try {
    const objCategorias = await apiGet("categorias");
    return objCategorias || [];
  } catch (erro) {
    return [];
  }
}

export async function carregarTamanhos(codigo) {
  if (!codigo) {
    return [];
  }

  try {
    const tamanhos = await apiGet(`tamanhos&cod=${codigo}`);
    return tamanhos || [];
  } catch (erro) {
    return [];
  }
}

export async function carregarComplementos(produtoPrincipal) {
  if (
    !produtoPrincipal.RequerComplementoCod ||
    produtoPrincipal.RequerComplemento !== "S"
  ) {
    return [];
  }

  try {
    const complementos = await apiGet(
      `complementos&codigos=${produtoPrincipal.RequerComplementoCod}`
    );
    return complementos || [];
  } catch (erro) {
    return [];
  }
}

export async function carregarPedidosAnteriores(fone) {
  if (!fone) {
    return [];
  }

  try {
    const pedidosAnteriores = await apiGet(`pedidos-anteriores&fone=${fone}`);
    return pedidosAnteriores || [];
  } catch (erro) {
    return [];
  }
}

export async function carregarDetalhesPedidosAnteriores(codigo) {
  if (!codigo) {
    return [];
  }

  try {
    const detalhesPedidosAnteriores = await apiGet(
      `detalhes-pedidos-anteriores&codigo=${codigo}`
    );
    return detalhesPedidosAnteriores || [];
  } catch (erro) {
    return [];
  }
}

export async function carregarProdutoSelecionado() {
  try {
    const produtoSelecionado = await apiGet("produto-selecionado");
    return produtoSelecionado || null;
  } catch (erro) {
    return null;
  }
}

export async function carregarCarrinho() {
  try {
    const carrinho = await apiGet("pegar-carrinho");
    return carrinho || [];
  } catch (erro) {
    return [];
  }
}
