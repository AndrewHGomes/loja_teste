import { apiGet } from "./api.js";

export async function carregarStatus() {
  const objStatus = await apiGet("status");

  if (objStatus && objStatus.length > 0) {
    console.log(objStatus[0]);
    return objStatus[0];
  }

  return {};
}
