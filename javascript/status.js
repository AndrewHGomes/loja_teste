import { repassarDados } from "./api.js";

export async function carregarStatus() {
  const objStatus = await repassarDados("status");

  if (objStatus && objStatus.length > 0) {
    return objStatus[0];
  }

  return {};
}
