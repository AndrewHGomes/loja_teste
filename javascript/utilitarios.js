import { repassarDados } from "./api.js";

export async function carregarUtilidades() {
  const objUtilidades = await repassarDados("horarios");

  if (objUtilidades && objUtilidades.length > 0) {
    return objUtilidades.map((item) => {
      const { dia, abertura, fechamento } = item;

      return { dia, abertura, fechamento };
    });
  }

  return [];
}
