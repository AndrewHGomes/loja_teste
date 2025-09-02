import { carregarEmpresa } from "./empresa.js";
import { carregarCategorias } from "./categorias.js";
import { carregarMercadorias } from "./mercadorias.js";
import { carregarStatus } from "./status.js";
import { carregarUtilidades } from "./utilitarios.js";

import { capturar } from "./capturar.js";

//========================================================================================//

async function gerenciarInfoEmpresa() {
  const empresa = await carregarEmpresa();

  const title = capturar("title");

  if (title) {
    title.textContent = empresa.Fantasia;
  }

  const tituloEmpresa = capturar("#titulo-empresa");

  if (tituloEmpresa) {
    tituloEmpresa.textContent = empresa.Fantasia;
  }

  const cidadeEmpresa = capturar("#cidade-empresa");

  if (cidadeEmpresa) {
    cidadeEmpresa.textContent = `${empresa.Cidade} - SP`;
  }

  const infoStatus = capturar(".status > span", true);

  if (infoStatus) {
    if (infoStatus[0]) {
      infoStatus[0].textContent = empresa.aberto === "S" ? "ABERTO" : "FECHADO";
      infoStatus[0].style.color = empresa.aberto === "S" ? "#080" : "#c00";
    }

    if (infoStatus[1]) {
      infoStatus[1].innerHTML =
        empresa.ativaentrega === "N"
          ? "RETIRAR | <del>ENTREGAR</del>"
          : "RETIRAR | ENTREGAR";
    }

    if (infoStatus[2]) {
      infoStatus[2].innerHTML = `<i class="fa-regular fa-clock"></i> ${empresa.tempoentrega}`;
    }
  }
}

//========================================================================================//

async function gerenciarCategoriasMercadorias() {
  const navCategorias = capturar(".nav-categorias");
  const sectionProdutos = capturar("#produtos");

  if (!navCategorias || !sectionProdutos) {
    return;
  }

  const categorias = await carregarCategorias();
  const mercadorias = await carregarMercadorias();

  categorias.forEach((categoria) => {
    const linkCategoria = document.createElement("a");
    linkCategoria.href = `#${categoria.descricao}`;
    linkCategoria.textContent = categoria.descricao;
    navCategorias.insertAdjacentElement("beforeend", linkCategoria);
  });

  categorias.forEach((categoria) => {
    const h3Categoria = document.createElement("h3");
    h3Categoria.id = categoria.descricao;
    h3Categoria.textContent = categoria.descricao;
    sectionProdutos.insertAdjacentElement("beforeend", h3Categoria);

    const mercadoriasDaCategoria = mercadorias.filter(
      (item) => item.categoria === categoria.descricao
    );

    mercadoriasDaCategoria.forEach((mercadoria) => {
      const preco =
        mercadoria.pizza === "S"
          ? ""
          : `R$ ${parseFloat(mercadoria.Venda).toFixed(2)}`;

      const formMercadoria = document.createElement("form");
      formMercadoria.classList.add("produto-item");
      formMercadoria.setAttribute("method", "post");
      formMercadoria.setAttribute("action", "selecionar.html");

      formMercadoria.innerHTML = `
        <label for="btn${mercadoria.Codigo}">
          <input type="hidden" name="categoria" value="${mercadoria.categoria}">
          <input type="hidden" name="produto" value="${mercadoria.Codigo}" readonly>
          <input type="hidden" name="descricao" value="${mercadoria.Descricao}" readonly>
          <span class="descricao">${mercadoria.Descricao}</span>
          <span class="price">${preco}</span>
        </label>
        <button class="invisible" id="btn${mercadoria.Codigo}"></button>
      `;

      sectionProdutos.insertAdjacentElement("beforeend", formMercadoria);
    });
  });
}

//========================================================================================//

async function gerenciarAside() {
  const [informacoes, statusEmpresa, utilidades] = await Promise.all([
    carregarEmpresa(),
    carregarStatus(),
    carregarUtilidades(),
  ]);

  const h3Aside = capturar("aside h3");
  if (h3Aside) {
    h3Aside.textContent = `${informacoes.Endereco}, ${informacoes.Numero}`;
  }

  const h4Aside = capturar("aside h4");
  if (h4Aside) {
    h4Aside.textContent = `${informacoes.Bairro}`;
  }

  const tdPreparo = capturar(".tabela1 td:nth-of-type(1)");
  if (tdPreparo) {
    tdPreparo.textContent = informacoes.TempoPreparo;
  }

  const tdRetirar = capturar(".tabela1 td:nth-of-type(2)");
  if (tdRetirar) {
    tdRetirar.textContent = "SIM";
  }

  const tdEntregar = capturar(".tabela1 td:nth-of-type(3)");
  if (tdEntregar) {
    tdEntregar.textContent = informacoes.aberto === "S" ? "SIM" : "NÃO";
  }

  const tabelaHorarios = capturar(".tabela2 tbody");

  if (tabelaHorarios && utilidades) {
    const diasDaSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

    utilidades.forEach((item, index) => {
      const tr = document.createElement("tr");

      const tdDia = document.createElement("td");
      tdDia.textContent = diasDaSemana[index];
      tr.appendChild(tdDia);

      const tdAbertura = document.createElement("td");
      tdAbertura.textContent = item.abertura;
      tr.appendChild(tdAbertura);

      const tdFechamento = document.createElement("td");
      tdFechamento.textContent = item.fechamento;
      tr.appendChild(tdFechamento);

      tabelaHorarios.appendChild(tr);
    });
  }

  const abertoFechado = capturar(".fechado-aberto");
  if (abertoFechado) {
    abertoFechado.textContent =
      statusEmpresa.aberto === "S"
        ? "ESTAMOS [ ABERTOS ]"
        : "ESTAMOS [ FECHADOS ]";

    abertoFechado.style.color = statusEmpresa.aberto === "S" ? "#080" : "#c00";
  }

  const contatoEmpresa = capturar(".contato-empresa");
  if (contatoEmpresa) {
    contatoEmpresa.textContent =
      informacoes.Telefone != null
        ? `ENTRE EM CONTATO ${informacoes.Telefone}`
        : "";

    contatoEmpresa.style.display =
      informacoes.Telefone != null ? "block" : "none";
  }

  const logoEmpresa = capturar("#logo-empresa");
  const fechar = capturar("aside i");
  const asideBox = capturar("aside");

  if (logoEmpresa && asideBox) {
    logoEmpresa.addEventListener("click", () => {
      // Adiciona a classe para fazê-lo aparecer
      asideBox.classList.add("aparecer");
    });
  }

  if (fechar && asideBox) {
    fechar.addEventListener("click", () => {
      // Remove a classe para fazê-lo sumir
      asideBox.classList.remove("aparecer");
    });
  }
}

//========================================================================================//

document.addEventListener("DOMContentLoaded", () => {
  gerenciarInfoEmpresa();
  gerenciarCategoriasMercadorias();
  gerenciarAside();
});
