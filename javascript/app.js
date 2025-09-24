import { apiPost } from "./api.js";

import { carregarEmpresa, carregarHorarios } from "./empresa.js";
import {
  carregarProdutos,
  carregarCategorias,
  carregarPedidosAnteriores,
  carregarDetalhesPedidosAnteriores,
  carregarProdutoSelecionado,
  carregarCarrinho,
  carregarComplementos,
} from "./produtos.js";

import { verificarSessao } from "./verificarSessao.js";

import { capturar, criarElemento } from "./capturar.js";

//========================================================================================//

async function verificacaoDaSessao() {
  const sessao = await verificarSessao();
  console.log(sessao);
}

//========================================================================================//

async function gerenciarInfoEmpresa() {
  try {
    const empresa = await carregarEmpresa();

    if (!empresa.empresa || !empresa.parametros) {
      console.error("Dados da empresa não encontrados ou a requisição falhou.");
      return;
    }

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

        infoStatus[0].addEventListener("click", () => {
          Swal.fire({
            text: `ESTAMOS ${
              empresa.parametros.aberto === "S" ? "ABERTOS" : "FECHADOS"
            }`,
            icon: empresa.parametros.aberto === "S" ? "success" : "error",
            backdrop: "rgba(0,0,0,0.7)",
            confirmButtonColor:
              empresa.parametros.aberto === "S" ? "#080" : "#c00",
          });
        });
      }

      if (infoStatus[1]) {
        infoStatus[1].innerHTML =
          empresa.parametros.ativaentrega === "N"
            ? "RETIRAR | <del>ENTREGAR</del>"
            : "RETIRAR | ENTREGAR";

        infoStatus[1].addEventListener("click", () => {
          Swal.fire({
            text: `ENTREGA ESTÁ ${
              empresa.parametros.ativaentrega === "N" ? "DESATIVADA" : "ATIVA"
            }`,
            icon: empresa.parametros.ativaentrega === "S" ? "success" : "error",
            backdrop: "rgba(0,0,0,0.7)",
            confirmButtonColor:
              empresa.parametros.ativaentrega === "S" ? "#080" : "#c00",
          });
        });
      }

      if (infoStatus[2]) {
        infoStatus[2].innerHTML = `<i class="fa-regular fa-clock"></i> ${empresa.parametros.tempoentrega}`;

        infoStatus[2].addEventListener("click", () => {
          Swal.fire({
            text: ` TEMPO DE ENTREGA É DE ${empresa.parametros.tempoentrega}`,
            icon: "info",
            backdrop: "rgba(0,0,0,0.7)",
            confirmButtonColor: "#080",
          });
        });
      }
    }
  } catch (error) {
    console.error("Falha ao gerenciar informações da empresa:", error);
  }
}

//========================================================================================//

async function gerenciarCategoriasMercadorias() {
  try {
    const produtos = await carregarProdutos();
    const categorias = await carregarCategorias();

    const navCategorias = capturar(".nav-categorias");
    const sectionProdutos = capturar("#produtos");

    if (!navCategorias || !sectionProdutos) {
      return;
    }

    if (categorias.length > 0) {
      categorias.forEach((categoria) => {
        const linkCategoria = document.createElement("a");
        linkCategoria.href = `#${categoria.descricao}`;
        linkCategoria.textContent = categoria.descricao;
        navCategorias.insertAdjacentElement("beforeend", linkCategoria);
      });
    }

    if (produtos.length > 0 && categorias.length > 0) {
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
              : `${Number(mercadoria.Venda).toFixed(2)}`;

          const observacaoProduto = mercadoria.Observacao
            ? mercadoria.Observacao
            : "";

          const boxDoProduto = criarElemento("div");
          boxDoProduto.classList.add("box-produto");

          const imagemItem = criarElemento("div");
          imagemItem.classList.add("imagem-item");

          const urlImagemProduto = "./images/empresa.jpg";

          imagemItem.innerHTML = `<img src="${urlImagemProduto}" alt="produto" />`;

          const produtoItem = criarElemento("div");
          produtoItem.classList.add("produto-item");

          produtoItem.innerHTML = `
          <span class="descricao">${mercadoria.Descricao}</span>
          <span class="observacao-produto">${observacaoProduto}</span>
          <span class="preco">R$ ${preco}</span>
          `;

          boxDoProduto?.addEventListener("click", async () => {
            const payload = {
              categoria: mercadoria.categoria,
              produto: mercadoria.Codigo,
              descricao: mercadoria.Descricao,
              observacaoProduto: observacaoProduto,
              preco: Number(mercadoria.Venda).toFixed(2),
              imgProduto: urlImagemProduto,
              RequerComplemento: mercadoria.RequerComplemento,
              RequerComplementoCod: mercadoria.RequerComplementoCod,
            };

            try {
              await apiPost("selecionar-produto", payload);
              window.location.href = "selecionar.html";
            } catch (erro) {
              console.error("Erro ao enviar dados para a API:", erro.message);

              Swal.fire({
                text: "Ocorreu um erro ao selecionar o produto. Tente novamente.",
                icon: "error",
                backdrop: "rgba(0,0,0,0.7)",
                confirmButtonColor: "#c00",
              });
            }
          });

          boxDoProduto?.append(produtoItem, imagemItem);
          sectionProdutos?.appendChild(boxDoProduto);
        });
      });
    }
  } catch (error) {
    console.error("Falha ao gerenciar categorias e mercadorias:", error);
  }
}

//========================================================================================//

async function gerenciarAside() {
  try {
    const empresa = await carregarEmpresa();
    const horarios = await carregarHorarios();

    if (!empresa.empresa || !empresa.parametros || !horarios) {
      console.error("Dados de empresa ou horários não encontrados.");
      return;
    }

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

    if (tabelaHorarios && horarios.length > 0) {
      const diasDaSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

      horarios.forEach((item, index) => {
        const tr = document.createElement("tr");

        const tdDia = document.createElement("td");
        if (tdDia) {
          tdDia.textContent = diasDaSemana[index];
          tr.appendChild(tdDia);
        }

        const tdAbertura = document.createElement("td");
        if (tdAbertura) {
          tdAbertura.textContent = item.abertura;
          tr.appendChild(tdAbertura);
        }

        const tdFechamento = document.createElement("td");
        if (tdFechamento) {
          tdFechamento.textContent = item.fechamento;
          tr.appendChild(tdFechamento);
        }

        if (tabelaHorarios) {
          tabelaHorarios.appendChild(tr);
        }
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
  } catch (error) {
    console.error("Falha ao gerenciar o aside:", error);
  }
}

//========================================================================================//

async function gerenciarPedidosAnteriores() {
  try {
    const foneDoUsuario = "5519989716177";
    const pedidosAnteriores = await carregarPedidosAnteriores(foneDoUsuario);

    const footer = capturar("footer");
    const abrirFooter = capturar("footer > .footer-inicial");
    const fecharFooter = capturar("footer .fa-x");
    const sectionPedidosAnteriores = capturar(".pedidos-anteriores");

    if (abrirFooter && footer) {
      abrirFooter.addEventListener("click", () => {
        footer.classList.add("footer-aberto");
        document.body.classList.add("no-scroll");
      });
    }

    if (fecharFooter && footer) {
      fecharFooter.addEventListener("click", () => {
        footer.classList.remove("footer-aberto");
        document.body.classList.remove("no-scroll");
      });
    }

    if (Array.isArray(pedidosAnteriores) && pedidosAnteriores.length > 0) {
      pedidosAnteriores.forEach((pedido) => {
        const divPedido = criarElemento("div");
        divPedido.classList.add("pedido-item");

        const dataCompleta = new Date(`${pedido.Data}T${pedido.Hora}`);

        const opcoesDeFormato = {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };

        const dataFormatada = new Intl.DateTimeFormat(
          "pt-BR",
          opcoesDeFormato
        ).format(dataCompleta);

        const dataHoraPedido = criarElemento("p");
        dataHoraPedido.innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${dataFormatada} - ${pedido.Hora.substring(
          0,
          5
        )}`;

        const botaoDetalhes = criarElemento("button");
        botaoDetalhes.classList.add("detalhes-pedido-btn");
        botaoDetalhes.innerHTML = `<i class='fa-solid fa-circle-info'></i> Detalhes <i class='fa-solid fa-arrow-pointer'></i>`;

        const valorPedido = criarElemento("p");
        valorPedido.innerHTML = `<i class='fa-solid fa-money-bill-wave'></i> ${pedido.totalpedido}`;

        divPedido.append(dataHoraPedido, botaoDetalhes, valorPedido);

        if (sectionPedidosAnteriores) {
          sectionPedidosAnteriores.appendChild(divPedido);
        }

        botaoDetalhes.addEventListener("click", () => {
          mostrarDetalhesPedidosAnteriores(pedido.Codigo);
        });
      });
    } else {
      console.log(
        "Nenhum pedido anterior encontrado ou a resposta da API não foi um array.",
        pedidosAnteriores
      );
    }
  } catch (error) {
    console.error("Falha ao gerenciar pedidos anteriores:", error);
  }
}

//========================================================================================//

async function mostrarDetalhesPedidosAnteriores(codigo) {
  try {
    const detalhesPedidosAnteriores = await carregarDetalhesPedidosAnteriores(
      codigo
    );

    let dataHora = "";
    let totalPedido = "";

    if (detalhesPedidosAnteriores && detalhesPedidosAnteriores.length > 0) {
      const obj = detalhesPedidosAnteriores[0];
      const dataCompleta = new Date(`${obj.Data}T${obj.Hora}`);
      const opcoesDeFormato = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };

      const dataFormatada = new Intl.DateTimeFormat(
        "pt-BR",
        opcoesDeFormato
      ).format(dataCompleta);
      const horaSimplificada = obj.Hora.substring(0, 5);
      dataHora = `${dataFormatada} - ${horaSimplificada}`;
    }

    let conteudoHtml = "<ul>";

    if (detalhesPedidosAnteriores) {
      detalhesPedidosAnteriores.forEach((obj) => {
        totalPedido = obj.totalpedido;

        if (obj.Complementos && Array.isArray(obj.Complementos)) {
          conteudoHtml += `<li><b>${obj.Descricao}</b> <b>${Number(
            obj.Valor
          ).toFixed(2)}</b></li>`;

          if (obj.Complementos.length > 0) {
            conteudoHtml += "<ul>";
            obj.Complementos.forEach((comp) => {
              conteudoHtml += `<li><span>${
                comp.DescricaoComp
              }</span> <span>${Number(comp.Valor).toFixed(2)}</span></li>`;
            });
            conteudoHtml += "</ul>";
          }
        } else if (obj.TaxaTransp) {
          conteudoHtml += `<li style="color: #080;"><span>Taxa de Transporte:</span> <span>${Number(
            obj.TaxaTransp
          ).toFixed(2)}</span></li>`;
        }
      });
    }

    conteudoHtml += "</ul>";

    conteudoHtml += `<p style="color: #c00;"><span>Total do Pedido:</span> <span>${Number(
      totalPedido
    ).toFixed(2)}</span></p>`;

    Swal.fire({
      title: dataHora,
      html: conteudoHtml,
      backdrop: "rgba(0,0,0,0.7)",
      confirmButtonColor: "#080",
    });
  } catch (error) {
    console.error("Falha ao carregar detalhes do pedido:", error);
  }
}

//========================================================================================//

async function gerenciarProdutoSelecionado() {
  try {
    const produtoSelecionado = await carregarProdutoSelecionado();

    const imgProdutoHeader = capturar("header img");
    const iconeLupa = capturar(".fa-magnifying-glass-plus");
    const tituloProduto = capturar(".box-produto h3");
    const descricaoProduto = capturar(".box-produto small");
    const precoProduto = capturar(".box-produto .agrupar span");
    const btnMinusPrincipal = capturar(
      ".box-produto .agrupar .fa-minus-circle"
    );
    const btnPlusPrincipal = capturar(".box-produto .agrupar .fa-plus-circle");
    const inputQtdPrincipal = capturar(".box-produto .agrupar input");
    const areaObservacaoCliente = capturar("#observacao-cliente");
    const btnAdicionar = capturar("#btn-adicionar");

    if (imgProdutoHeader && produtoSelecionado?.imgProduto) {
      imgProdutoHeader.src = produtoSelecionado.imgProduto;

      iconeLupa?.addEventListener("click", () => {
        Swal.fire({
          title: produtoSelecionado.descricao,
          html: `<img src="${produtoSelecionado.imgProduto}" />`,
          backdrop: "rgba(0,0,0,0.7)",
          confirmButtonColor: "#080",
        });
      });
    }

    if (tituloProduto && produtoSelecionado) {
      tituloProduto.textContent = produtoSelecionado.descricao;
    }

    if (descricaoProduto && produtoSelecionado) {
      descricaoProduto.textContent = produtoSelecionado.observacaoProduto;
    }

    if (precoProduto && produtoSelecionado) {
      precoProduto.textContent = `R$ ${produtoSelecionado.preco}`;
    }

    if (btnMinusPrincipal && btnPlusPrincipal && inputQtdPrincipal) {
      btnMinusPrincipal.addEventListener("click", () => {
        const valorAtual = Number(inputQtdPrincipal.value);
        if (valorAtual > 1) {
          inputQtdPrincipal.value = valorAtual - 1;
        }
      });

      btnPlusPrincipal.addEventListener("click", () => {
        const valorAtual = Number(inputQtdPrincipal.value);
        inputQtdPrincipal.value = valorAtual + 1;
      });
    }

    if (
      produtoSelecionado?.RequerComplemento === "S" &&
      produtoSelecionado?.RequerComplementoCod
    ) {
      const complementos = await carregarComplementos(produtoSelecionado);
      const mainSelecionar = capturar(".main-selecionar");
      const sectionComplementos = criarElemento("section");
      sectionComplementos.id = "section-complementos";

      if (complementos.length > 0) {
        complementos.forEach((complemento) => {
          const divComplemento = criarElemento("div");
          divComplemento.classList.add("div-complemento");

          const conteudoComplemento = `
            <div class="complemento-descricao-valor">
              <p>${complemento.Descricao}</p>
              <small>R$ ${Number(complemento.Venda).toFixed(2)}</small>
            </div>
            <div class="qtd-complemento">
              <i class="comp fa-solid fa-minus-circle"></i>
              <input
                  type="number"
                  name="qtd-complemento"
                  value="0"
                  min="1"
                  readonly
                />
              <i class="comp fa-solid fa-plus-circle"></i>
            </div>
          `;

          divComplemento.innerHTML = conteudoComplemento;
          sectionComplementos?.appendChild(divComplemento);
        });
        mainSelecionar?.appendChild(sectionComplementos);
      }

      const btnMinusComplemento = capturar(".comp.fa-minus-circle", true);
      const btnPlusComplemento = capturar(".comp.fa-plus-circle", true);

      if (btnMinusComplemento) {
        btnMinusComplemento.forEach((btn) => {
          btn.addEventListener("click", () => {
            const inputQtdComplemento = btn
              .closest(".div-complemento")
              .querySelector("[name='qtd-complemento']");

            if (inputQtdComplemento) {
              const valorAtualComplemento = Number(inputQtdComplemento.value);
              if (valorAtualComplemento > 0) {
                inputQtdComplemento.value = valorAtualComplemento - 1;
              }
            }
          });
        });
      }

      if (btnPlusComplemento) {
        btnPlusComplemento.forEach((btn) => {
          btn.addEventListener("click", () => {
            const inputQtdComplemento = btn
              .closest(".div-complemento")
              .querySelector("[name='qtd-complemento']");

            if (inputQtdComplemento) {
              const valorAtualComplemento = Number(inputQtdComplemento.value);
              inputQtdComplemento.value = valorAtualComplemento + 1;
            }
          });
        });
      }
    }

    btnAdicionar?.addEventListener("click", async () => {
      if (inputQtdPrincipal && areaObservacaoCliente && produtoSelecionado) {
        const quantidade = Number(inputQtdPrincipal.value);
        const observacaoCliente = areaObservacaoCliente.value;
        const precoUnitario = Number(produtoSelecionado.preco);
        const precoTotal = (precoUnitario * quantidade).toFixed(2);

        const montandoCarrinho = {
          ...produtoSelecionado,
          preco: precoTotal,
          quantidade: quantidade,
          observacaoCliente: observacaoCliente,
        };

        try {
          const resposta = await apiPost(
            "adicionar-ao-carrinho",
            montandoCarrinho
          );
          if (resposta.message) {
            console.log(resposta.message);
            window.location.href = "./carrinho.html";
            areaObservacaoCliente.value = "";
          }
        } catch (erro) {
          console.error("Falha ao adicionar ao carrinho:", erro.message);
          Swal.fire({
            text: "Ocorreu um erro ao adicionar o produto. Tente novamente.",
            icon: "error",
            backdrop: "rgba(0,0,0,0.7)",
            confirmButtonColor: "#c00",
          });
        }
      }
    });
  } catch (error) {
    console.error("Falha ao gerenciar produto selecionado:", error);
    window.location.href = "./index.html";
  }
}

//========================================================================================//

function obterComplementosSelecionados() {
  const complementos = [];

  const divsComplemento = capturar(".div-complemento", true);

  if (!divsComplemento) {
    return complementos;
  }

  divsComplemento.forEach((div) => {
    const inputQtd = div.querySelector("[name='qtd-complemento']");
    const qtd = Number(inputQtd.value);

    if (qtd > 0) {
      const descricaoElement = div.querySelector(
        ".complemento-descricao-valor p"
      );
      const valorElement = div.querySelector(
        ".complemento-descricao-valor small"
      );

      const valorTexto = valorElement.textContent.replace("R$ ", "").trim();
      const valorUnitario = Number(valorTexto);

      complementos.push({
        Descricao: descricaoElement.textContent.trim(),
        Venda: valorUnitario.toFixed(2),
        quantidade: qtd,
        totalComplemento: (valorUnitario * qtd).toFixed(2),
      });
    }
  });

  return complementos;
}

//========================================================================================//

async function gerenciarCarrinho() {
  try {
    const carrinho = await carregarCarrinho();
    console.log(carrinho);
    const iconeLixeira = capturar("#nav-voltar .fa-trash");
    const sectionProdutoBox = capturar("#produto-box-carrinho");
    const btnConfirmar = capturar(".btn-confirmar");

    function renderizarProdutos(produtos) {
      if (!sectionProdutoBox) {
        return;
      }

      sectionProdutoBox.innerHTML = "";

      if (produtos.length > 0) {
        produtos.forEach((produto, index) => {
          const divCadaProduto = criarElemento("div");
          divCadaProduto.classList.add("div-cada-produto");
          const conteudoDiv = `
            <span>${produto.quantidade}x ${produto.descricao}</span>
            <span>R$ ${produto.preco}  <i class="fa-solid fa-ellipsis-vertical"></i></span>
          `;
          divCadaProduto.innerHTML = conteudoDiv;
          sectionProdutoBox.append(divCadaProduto);

          const elipse = divCadaProduto.querySelector(".fa-ellipsis-vertical");
          if (elipse) {
            elipse.addEventListener("click", async () => {
              const resultadoLimparItem = await Swal.fire({
                title: "Excluir este item?",
                text: "Você não poderá reverter esta ação depois!",
                icon: "question",
                backdrop: "rgba(0,0,0,0.7)",
                showCancelButton: true,
                confirmButtonText: "Sim, excluir",
                confirmButtonColor: "#080",
                cancelButtonText: "Não, cancelar",
                cancelButtonColor: "#c00",
              });

              if (resultadoLimparItem.isConfirmed) {
                try {
                  const respostaApi = await apiPost("remover-item-carrinho", {
                    index: index,
                  });
                  if (respostaApi.message) {
                    Swal.fire(
                      "Item Removido!",
                      respostaApi.message,
                      "success"
                    ).then(() => {
                      renderizarProdutos(
                        produtos.filter((_, i) => i !== index)
                      );
                      if (produtos.length === 1) {
                        setTimeout(() => {
                          window.location.href = "./index.html";
                        }, 500);
                      }
                    });
                  } else {
                    Swal.fire("Erro", "Índice do produto inválido.", "error");
                  }
                } catch (erro) {
                  Swal.fire("Erro", erro.message, "error");
                }
              } else if (resultadoLimparItem.isDismissed) {
                Swal.fire(
                  "Ação cancelada",
                  "O item não foi alterado.",
                  "error"
                );
              }
            });
          }
        });
      } else {
        sectionProdutoBox.innerHTML =
          "<p class='carrinho-vazio'>O carrinho está vazio.</p>";
      }
    }

    renderizarProdutos(carrinho);

    iconeLixeira?.addEventListener("click", async () => {
      const resultadoLimparCarrinho = await Swal.fire({
        title: "Limpar Carrinho?",
        text: "Você não poderá reverter esta ação depois!",
        icon: "question",
        backdrop: "rgba(0,0,0,0.7)",
        showCancelButton: true,
        confirmButtonText: "Sim, limpar",
        confirmButtonColor: "#080",
        cancelButtonText: "Não, cancelar",
        cancelButtonColor: "#c00",
      });

      if (resultadoLimparCarrinho.isConfirmed) {
        try {
          const respostaApi = await apiPost("limpar-carrinho");
          if (respostaApi.message) {
            Swal.fire("Carrinho Limpo!", respostaApi.message, "success").then(
              () => {
                renderizarProdutos([]);
                setTimeout(() => {
                  window.location.href = "./index.html";
                }, 500);
              }
            );
          }
        } catch (erro) {
          Swal.fire("Erro", erro.message, "error");
        }
      } else if (resultadoLimparCarrinho.isDismissed) {
        Swal.fire("Ação cancelada", "O carrinho não foi alterado.", "error");
      }
    });

    btnConfirmar?.addEventListener("click", () => {
      // Lógica de finalização do pedido.
    });
  } catch (error) {
    console.error("Falha ao gerenciar o carrinho:", error);
    // Exibe uma mensagem de erro ou redireciona.
  }
}

//========================================================================================//

document.addEventListener("DOMContentLoaded", () => {
  verificacaoDaSessao();
  gerenciarInfoEmpresa();
  gerenciarCategoriasMercadorias();
  gerenciarAside();
  gerenciarPedidosAnteriores();
  gerenciarProdutoSelecionado();
  gerenciarCarrinho();
});
