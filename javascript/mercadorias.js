import { repassarDados } from "./api.js";

export async function carregarMercadorias() {
  const objMercadorias = await repassarDados("mercadorias");

  if (objMercadorias && objMercadorias.length > 0) {
    const mercadorias = objMercadorias.map((mercadoria) => {
      const {
        Codigo,
        Complemento,
        Descricao,
        Grupo,
        RequerComplemento,
        categoria,
        idgrupo,
        Venda,
        pizza,
      } = mercadoria;

      return {
        Codigo,
        Complemento,
        Descricao,
        Grupo,
        RequerComplemento,
        categoria,
        idgrupo,
        Venda,
        pizza,
      };
    });

    return mercadorias;
  }

  return null;
}
