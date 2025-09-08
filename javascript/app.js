import { carregarEmpresa, carregarHorarios } from "./empresa.js";
import {
  carregarProdutos,
  carregarCategorias,
  carregarPedidosAnteriores,
} from "./produtos.js";

import { capturar, criarElemento } from "./capturar.js";

//========================================================================================//

async function gerenciarInfoEmpresa() {
  const empresa = await carregarEmpresa();

  const title = capturar("title");

  if (title) {
    title.textContent = empresa.empresa.Fantasia;
  }

  const tituloEmpresa = capturar("#titulo-empresa");

  if (tituloEmpresa) {
    tituloEmpresa.textContent = empresa.empresa.Fantasia;
  }

  const cidadeEmpresa = capturar("#cidade-empresa");

  if (cidadeEmpresa) {
    cidadeEmpresa.textContent = `${empresa.empresa.Cidade} - SP`;
  }

  const infoStatus = capturar(".status > span", true);

  if (infoStatus) {
    if (infoStatus[0]) {
      infoStatus[0].textContent =
        empresa.parametros.aberto === "S" ? "ABERTO" : "FECHADO";
      infoStatus[0].style.color =
        empresa.parametros.aberto === "S" ? "#080" : "#c00";
    }

    if (infoStatus[1]) {
      infoStatus[1].innerHTML =
        empresa.parametros.ativaentrega === "N"
          ? "RETIRAR | <del>ENTREGAR</del>"
          : "RETIRAR | ENTREGAR";
    }

    if (infoStatus[2]) {
      infoStatus[2].innerHTML = `<i class="fa-regular fa-clock"></i> ${empresa.parametros.tempoentrega}`;
    }
  }
}

//========================================================================================//

async function gerenciarCategoriasMercadorias() {
  const produtos = await carregarProdutos();
  const categorias = await carregarCategorias();

  const navCategorias = capturar(".nav-categorias");
  const sectionProdutos = capturar("#produtos");

  if (!navCategorias || !sectionProdutos) {
    return;
  }

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

    const produtosDaCategoria = produtos.filter(
      (item) => item.categoria === categoria.descricao
    );

    produtosDaCategoria.forEach((mercadoria) => {
      const preco =
        mercadoria.pizza === "S"
          ? ""
          : `R$ ${parseFloat(mercadoria.Venda).toFixed(2)}`;

      const formProdutos = document.createElement("form");
      formProdutos.classList.add("produto-item");
      formProdutos.setAttribute("method", "post");
      formProdutos.setAttribute("action", "selecionar.html");

      formProdutos.innerHTML = `
        <label for="btn${mercadoria.Codigo}">
          <input type="hidden" name="categoria" value="${mercadoria.categoria}">
          <input type="hidden" name="produto" value="${mercadoria.Codigo}" readonly>
          <input type="hidden" name="descricao" value="${mercadoria.Descricao}" readonly>
          <span class="descricao">${mercadoria.Descricao}</span>
          <span class="price">${preco}</span>
        </label>
        <button class="invisible" id="btn${mercadoria.Codigo}"></button>
      `;

      sectionProdutos.insertAdjacentElement("beforeend", formProdutos);
    });
  });
}

//========================================================================================//

async function gerenciarAside() {
  const empresa = await carregarEmpresa();

  const horarios = await carregarHorarios();

  const h3Aside = capturar("aside h3");
  if (h3Aside) {
    h3Aside.textContent = `${empresa.empresa.Endereco}, ${empresa.empresa.Numero}`;
  }

  const h4Aside = capturar("aside h4");
  if (h4Aside) {
    h4Aside.textContent = `${empresa.empresa.Bairro}`;
  }

  const tdPreparo = capturar(".tabela1 td:nth-of-type(1)");
  if (tdPreparo) {
    tdPreparo.textContent = empresa.parametros.tempoentrega;
  }

  const tdRetirar = capturar(".tabela1 td:nth-of-type(2)");
  if (tdRetirar) {
    tdRetirar.textContent = "SIM";
  }

  const tdEntregar = capturar(".tabela1 td:nth-of-type(3)");
  if (tdEntregar) {
    tdEntregar.textContent =
      empresa.parametros.ativaentrega === "S" ? "SIM" : "NÃO";
  }

  const tabelaHorarios = capturar(".tabela2 tbody");

  if (tabelaHorarios) {
    const diasDaSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

    horarios.forEach((item, index) => {
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
    abertoFechado.innerHTML =
      empresa.parametros.aberto === "S"
        ? "<i class='fa-solid fa-door-open'></i> ESTAMOS [ ABERTOS ]"
        : "<i class='fa-solid fa-door-closed'></i> ESTAMOS [ FECHADOS ]";

    abertoFechado.style.color =
      empresa.parametros.aberto === "S" ? "#080" : "#c00";
  }

  const contatoEmpresa = capturar(".contato-empresa");
  if (contatoEmpresa) {
    contatoEmpresa.textContent =
      empresa.empresa.Telefone != null
        ? `ENTRE EM CONTATO ${empresa.empresa.Telefone}`
        : "";

    contatoEmpresa.style.display =
      empresa.empresa.Telefone != null ? "block" : "none";
  }

  const logoEmpresa = capturar("#logo-empresa");
  const fechar = capturar("aside > i");
  const asideBox = capturar("aside");

  if (logoEmpresa && asideBox) {
    logoEmpresa.addEventListener("click", () => {
      asideBox.classList.add("aparecer");
    });
  }

  if (fechar && asideBox) {
    fechar.addEventListener("click", () => {
      asideBox.classList.remove("aparecer");
    });
  }
}

async function gerenciarPedidosAnteriores() {
  const pedidosAnteriores = await carregarPedidosAnteriores();
  console.log(pedidosAnteriores);

  const footer = capturar("footer");

  const abrirFooter = capturar("footer > p");
  abrirFooter.addEventListener("click", () => {
    footer.classList.add("footer-aberto");
  });

  const fecharFooter = capturar("footer .fa-x");
  fecharFooter.addEventListener("click", () => {
    footer.classList.remove("footer-aberto");
  });

  const sectionPedidosAnteriores = capturar(".pedidos-anteriores");

  pedidosAnteriores.forEach((pedido) => {
    console.log(pedido);

    const divPedido = criarElemento("div");

    const dataHoraPedido = criarElemento("p");
    dataHoraPedido.textContent = `${pedido.Data} - ${pedido.Hora}`;

    const detalhesPedido = criarElemento("button");
    detalhesPedido.innerHTML =
      "Detalhes <i class='fa-solid fa-chevron-right'><i>";

    divPedido.append(dataHoraPedido, detalhesPedido);

    sectionPedidosAnteriores.appendChild(divPedido);
  });
}

//========================================================================================//

document.addEventListener("DOMContentLoaded", () => {
  gerenciarInfoEmpresa();
  gerenciarCategoriasMercadorias();
  gerenciarAside();
  gerenciarPedidosAnteriores();
});
