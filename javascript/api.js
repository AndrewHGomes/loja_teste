const URL_BASE_API = "controller/api.php";

async function pegarDados(endpoint) {
  const url = `${URL_BASE_API}?recurso=${endpoint}`;
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`Erro na rede: ${resposta.statusText}`);
    }
    return await resposta.json();
  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
    return { status: "error", data: [] };
  }
}

export async function repassarDados(endpoint) {
  const dados = await pegarDados(endpoint);
  if (dados) {
    return dados;
  }
  return [];
}
