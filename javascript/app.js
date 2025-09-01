import { carregarEmpresa } from "./empresa.js";
import { carregarCategorias } from "./categorias.js";
import { carregarMercadorias } from "./mercadorias.js";

import { capturar } from "./capturar.js";

//========================================================================================//

const empresa = await carregarEmpresa();

const title = capturar("title");

title.textContent = empresa.Fantasia;

const tituloEmpresa = capturar("#titulo-empresa");

tituloEmpresa.textContent = empresa.Fantasia;

const cidadeEmpresa = capturar("#cidade-empresa");

cidadeEmpresa.textContent = `${empresa.Cidade} - SP`;

const infoStatus = capturar(".status > span", true);

infoStatus[0].textContent = empresa.aberto === "S" ? "ABERTO" : "FECHADO";
infoStatus[0].style.color = empresa.aberto === "S" ? "#080" : "#c00";

infoStatus[1].innerHTML =
  empresa.ativaentrega === "N"
    ? "RETIRAR | <del>ENTREGAR</del>"
    : "RETIRAR | ENTREGAR";

infoStatus[2].innerHTML = `<i class="fa-regular fa-clock"></i> ${empresa.tempoentrega}`;

//========================================================================================//

const navCategorias = capturar(".nav-categorias");
const sectionProdutos = capturar("#produtos");

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
