import { apiGet } from "./api.js";

export async function verificarSessao() {
  try {
    const sessao = await apiGet("dados-sessao");
    return sessao;
  } catch (erro) {
    console.error("Erro ao buscar dados da sessão:", erro);
    return {};
  }
}
