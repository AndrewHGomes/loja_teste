const URL_BASE_API = "controller/api.php";

export async function apiGet(endpoint) {
  const url = `${URL_BASE_API}?recurso=${endpoint}`;
  try {
    const resposta = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!resposta.ok) {
      throw new Error(`Erro na rede: ${resposta.statusText}`);
    }
    return await resposta.json();
  } catch (erro) {
    console.error("Erro ao buscar dados (GET):", erro);
    return { status: "error", dados: [] };
  }
}

export async function apiPost(endpoint, payload = {}) {
  const url = `${URL_BASE_API}?recurso=${endpoint}`;
  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!resposta.ok) {
      throw new Error(`Erro na rede: ${resposta.statusText}`);
    }
    return await resposta.json();
  } catch (erro) {
    console.error("Erro ao enviar dados (POST):", erro);
    return { status: "error", dados: [] };
  }
}
