import { apiGet } from "./api.js";

export async function verificarSessao() {
  try {
    const sessao = await apiGet("dados-sessao");

    if (sessao && sessao.usuario && sessao.carrinho) {
      return sessao;
    }

    return { usuario: null, carrinho: [] };
  } catch (erro) {
    return { usuario: null, carrinho: [] };
  }
}
