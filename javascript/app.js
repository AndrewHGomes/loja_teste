const AppData = {
  empresa: null,
  parametros: null,
  horarios: null,
  categorias: null,
  produtos: null,
  sessao: null,
};

import { apiPost } from "./api.js";
import {
  carregarEmpresa,
  carregarHorarios,
  carregarBairros,
  carregarTaxaEntrega,
} from "./empresa.js";
import {
  carregarProdutos,
  carregarCategorias,
  carregarTamanhos,
  carregarPedidosAnteriores,
  carregarDetalhesPedidosAnteriores,
  carregarProdutoSelecionado,
  carregarCarrinho,
  carregarComplementos,
  carregarSabores,
  carregarBordas,
  carregarPedidoFinalizacao,
} from "./produtos.js";
import { verificarSessao } from "./verificarSessao.js";
import { capturar, criarElemento } from "./capturar.js";

//========================================================================================//

async function verificacaoDaSessao() {
  const sessao = await verificarSessao();
  console.log(sessao);
  return sessao;
}

//========================================================================================//

function gerenciarInfoEmpresa(empresa, parametros) {
  try {
    const dadosEmpresa = empresa;
    const dadosParametros = parametros;

    if (!dadosEmpresa || !dadosParametros) {
      console.error("Dados da empresa não encontrados ou a requisição falhou.");
      return;
    }

    const title = capturar("title");
    if (title) {
      title.textContent = dadosEmpresa.Fantasia;
    }

    const tituloEmpresa = capturar("#titulo-empresa");
    if (tituloEmpresa) {
      tituloEmpresa.textContent = dadosEmpresa.Fantasia;
    }

    const cidadeEmpresa = capturar("#cidade-empresa");
    if (cidadeEmpresa) {
      cidadeEmpresa.textContent = `${dadosEmpresa.Cidade} - SP`;
    }

    const infoStatus = capturar(".status > span", true);

    if (infoStatus) {
      if (infoStatus[0]) {
        infoStatus[0].textContent =
          dadosParametros.aberto === "S" ? "ABERTO" : "FECHADO";
        infoStatus[0].style.color =
          dadosParametros.aberto === "S" ? "#080" : "#c00";

        infoStatus[0].addEventListener("click", () => {
          Swal.fire({
            text: `ESTAMOS ${
              dadosParametros.aberto === "S" ? "ABERTOS" : "FECHADOS"
            }`,
            icon: dadosParametros.aberto === "S" ? "success" : "error",
            backdrop: "rgba(0,0,0,0.7)",
            confirmButtonColor:
              dadosParametros.aberto === "S" ? "#080" : "#c00",
          });
        });
      }

      if (infoStatus[1]) {
        infoStatus[1].innerHTML =
          dadosParametros.ativaentrega === "N"
            ? "RETIRAR | <del>ENTREGAR</del>"
            : "RETIRAR | ENTREGAR";

        infoStatus[1].addEventListener("click", () => {
          Swal.fire({
            text: `ENTREGA ESTÁ ${
              dadosParametros.ativaentrega === "N" ? "DESATIVADA" : "ATIVA"
            }`,
            icon: dadosParametros.ativaentrega === "S" ? "success" : "error",
            backdrop: "rgba(0,0,0,0.7)",
            confirmButtonColor:
              dadosParametros.ativaentrega === "S" ? "#080" : "#c00",
          });
        });
      }

      if (infoStatus[2]) {
        infoStatus[2].innerHTML = `<i class="fa-regular fa-clock"></i> ${dadosParametros.tempoentrega}`;

        infoStatus[2].addEventListener("click", () => {
          Swal.fire({
            text: ` TEMPO DE ENTREGA É DE ${dadosParametros.tempoentrega}`,
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

function gerenciarCategoriasMercadorias(categorias, produtos) {
  try {
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
          const preco = Number(mercadoria.Venda).toFixed(2);

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
            const tamanhos = await carregarTamanhos(mercadoria.Codigo);
            const sabores = await carregarSabores(mercadoria.Codigo);
            const bordas = await carregarBordas();
            console.log(tamanhos);
            console.log(sabores);
            console.log(bordas);

            let tamanhoFinal = null;
            let precoFinal = Number(mercadoria.Venda).toFixed(2);
            let saboresPermitidosFinal = "";
            let permiteBordaFinal = "";

            if (tamanhos && tamanhos.length > 0) {
              let htmlSwal = `
                                <style>
                                    .tamanho-button-group input[type="radio"] { display: none; }
                                    .tamanho-button-group label {
                                        display: inline-block; padding: 8px 15px; margin: 5px;
                                        border: 1px solid #ccc; border-radius: 20px; cursor: pointer;
                                        font-weight: bold; transition: all 0.1s; width: 200px; text-align: center;
                                    }
                                    .tamanho-button-group input[type="radio"]:checked + label {
                                        background-color: #080; color: white; border-color: #080;
                                        box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.2);
                                    }
                                </style>
                                <div style="text-align: center; margin-top: 10px;">
                              `;

              tamanhos.forEach((tamanho) => {
                htmlSwal += `
                                    <div class="tamanho-button-group" style="display: inline-block;">
                                        <input 
                                            type="radio" 
                                            id="${tamanho.Tamanho}" 
                                            name="tamanho-produto" 
                                            value="${tamanho.Tamanho}|${Number(
                  tamanho.Valor
                ).toFixed(2)}|${tamanho.Sabores}|${tamanho.PermiteBorda}" 
                                        />
                                        <label for="${tamanho.Tamanho}">
                                            ${tamanho.Tamanho} R$ ${Number(
                  tamanho.Valor
                ).toFixed(2)}
                                        </label>
                                    </div>
                                `;
              });

              htmlSwal += `</div>`;

              const result = await Swal.fire({
                title: `SELECIONE O TAMANHO:`,
                html: htmlSwal,
                icon: "question",
                backdrop: "rgba(0,0,0,0.7)",
                showCancelButton: true,
                confirmButtonColor: "#080",
                cancelButtonText: "Cancelar",
                cancelButtonColor: "#c00",
                focusConfirm: false,
                preConfirm: () => {
                  const radioSelecionado = document.querySelector(
                    'input[name="tamanho-produto"]:checked'
                  );
                  if (!radioSelecionado) {
                    Swal.showValidationMessage(
                      "Por favor, selecione um tamanho."
                    );
                    return false;
                  }
                  return radioSelecionado.value;
                },
              });

              if (result.isConfirmed) {
                const [tamanho, preco, sabores, permiteBorda] =
                  result.value.split("|");
                tamanhoFinal = tamanho;
                precoFinal = preco;
                saboresPermitidosFinal = sabores;
                permiteBordaFinal = permiteBorda;
              } else {
                return;
              }
            }

            const payload = {
              categoria: mercadoria.categoria,
              produto: mercadoria.Codigo,
              descricao: mercadoria.Descricao,
              observacaoProduto: observacaoProduto,
              preco: precoFinal,
              imgProduto: urlImagemProduto,
              RequerComplemento: mercadoria.RequerComplemento,
              RequerComplementoCod: mercadoria.RequerComplementoCod,
              tamanho: tamanhoFinal,
              saboresPermitidos: saboresPermitidosFinal,
              PermiteBorda: permiteBordaFinal,
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

function gerenciarAside(empresa, horarios, parametros) {
  try {
    const dadosEmpresa = empresa;
    const dadosHorarios = horarios;
    const dadosParametros = parametros;

    if (!dadosEmpresa || !dadosParametros || !dadosHorarios) {
      console.error("Dados de empresa ou horários não encontrados.");
      return;
    }

    const h3Aside = capturar("aside h3");
    if (h3Aside) {
      h3Aside.textContent = `${dadosEmpresa.Endereco}, ${dadosEmpresa.Numero}`;
    }

    const h4Aside = capturar("aside h4");
    if (h4Aside) {
      h4Aside.textContent = `${dadosEmpresa.Bairro}`;
    }

    const tdPreparo = capturar(".tabela1 td:nth-of-type(1)");
    if (tdPreparo) {
      tdPreparo.textContent = dadosParametros.tempoentrega;
    }

    const tdRetirar = capturar(".tabela1 td:nth-of-type(2)");
    if (tdRetirar) {
      tdRetirar.textContent = "SIM";
    }

    const tdEntregar = capturar(".tabela1 td:nth-of-type(3)");
    if (tdEntregar) {
      tdEntregar.textContent =
        dadosParametros.ativaentrega === "S" ? "SIM" : "NÃO";
    }

    const tabelaHorarios = capturar(".tabela2 tbody");

    if (tabelaHorarios && dadosHorarios.length > 0) {
      const mapaDias = {
        DOM: "Domingo",
        SEG: "Segunda",
        TER: "Terça",
        QUA: "Quarta",
        QUI: "Quinta",
        SEX: "Sexta",
        SAB: "Sábado",
      };

      dadosHorarios.forEach((item) => {
        const tr = document.createElement("tr");

        const tdDia = document.createElement("td");
        if (tdDia) {
          tdDia.textContent = mapaDias[item.dia] || item.dia;
          tr.appendChild(tdDia);
        }

        const tdAbertura = document.createElement("td");
        if (tdAbertura) {
          tdAbertura.textContent = item.abertura.substring(0, 5);
          tr.appendChild(tdAbertura);
        }

        const tdFechamento = document.createElement("td");
        if (tdFechamento) {
          tdFechamento.textContent = item.fechamento.substring(0, 5);
          tr.appendChild(tdFechamento);
        }

        tabelaHorarios.appendChild(tr);
      });
    }

    const abertoFechado = capturar(".fechado-aberto");
    if (abertoFechado) {
      abertoFechado.innerHTML =
        dadosParametros.aberto === "S"
          ? "<i class='fa-solid fa-door-open'></i> ESTAMOS [ ABERTOS ]"
          : "<i class='fa-solid fa-door-closed'></i> ESTAMOS [ FECHADOS ]";

      abertoFechado.style.color =
        dadosParametros.aberto === "S" ? "#080" : "#c00";
    }

    const contatoEmpresa = capturar(".contato-empresa");
    if (contatoEmpresa) {
      contatoEmpresa.textContent =
        dadosEmpresa.Telefone != null
          ? `ENTRE EM CONTATO ${dadosEmpresa.Telefone}`
          : "";

      contatoEmpresa.style.display =
        dadosEmpresa.Telefone != null ? "block" : "none";
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

async function gerenciarPedidosAnteriores(foneDoUsuario) {
  try {
    if (!foneDoUsuario) {
      console.log("Usuário não logado. Não irá carregar pedidos anteriores.");
      return;
    }

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
    const empresa = await carregarEmpresa();

    const title = capturar("title");

    if (empresa) {
      title.textContent = empresa.empresa.Fantasia;
    }

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
        const quantidadePrincipal = Number(inputQtdPrincipal.value);
        const observacaoCliente = areaObservacaoCliente.value;
        const precoUnitarioPrincipal = Number(produtoSelecionado.preco);

        const complementosSelecionados = obterComplementosSelecionados();

        const custoTotalComplementos = complementosSelecionados.reduce(
          (total, comp) => {
            return total + comp.totalComplemento;
          },
          0
        );

        const montandoCarrinho = {
          ...produtoSelecionado,
          preco: precoUnitarioPrincipal.toFixed(2),
          quantidade: quantidadePrincipal,
          observacaoCliente: observacaoCliente,
          complementos: complementosSelecionados,
          custoComplementos: custoTotalComplementos.toFixed(2),
        };

        if (produtoSelecionado.editarIndex !== undefined) {
          montandoCarrinho.editarIndex = produtoSelecionado.editarIndex;
        }

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
        Venda: valorUnitario,
        quantidade: qtd,
        totalComplemento: valorUnitario * qtd,
      });
    }
  });

  return complementos;
}

//========================================================================================//

async function gerenciarCarrinho() {
  try {
    const empresa = await carregarEmpresa();
    const carrinho = await carregarCarrinho();
    const iconeLixeira = capturar("#nav-voltar .fa-trash");
    const sectionProdutoBox = capturar("#produto-box-carrinho");
    const btnConfirmar = capturar(".btn-confirmar");
    let subtotalCarrinho = 0;

    const title = capturar("title");
    if (title) {
      title.textContent = empresa.empresa.Fantasia;
    }

    function renderizarProdutos(produtos) {
      if (!sectionProdutoBox) {
        return;
      }

      sectionProdutoBox.innerHTML = "";

      if (produtos.length > 0) {
        produtos.forEach((produto, index) => {
          const divCadaProduto = criarElemento("div");
          divCadaProduto.classList.add("div-cada-produto");

          const divCabecalhoProduto = criarElemento("div");
          divCabecalhoProduto.classList.add("produto-cabecalho");

          const precoPrincipal = Number(produto.preco);
          const custoComp = Number(produto.custoComplementos || 0);
          const precoUnitarioComTudo = precoPrincipal + custoComp;
          const precoTotalDoItem = precoUnitarioComTudo * produto.quantidade;
          subtotalCarrinho += precoTotalDoItem;
          const precoTotalPrincipal = (
            precoPrincipal * produto.quantidade
          ).toFixed(2);

          divCabecalhoProduto.innerHTML = `
            <span>${produto.quantidade}x ${produto.descricao}</span>
            <span>R$ ${precoTotalPrincipal}<i class="fa-solid fa-ellipsis-vertical"></i></span>
          `;

          divCadaProduto.appendChild(divCabecalhoProduto);

          if (
            produto.complementos &&
            Array.isArray(produto.complementos) &&
            produto.complementos.length > 0
          ) {
            const divComplementosContainer = criarElemento("div");
            divComplementosContainer.classList.add("complementos-container");

            produto.complementos.forEach((comp) => {
              const divComplementoItem = criarElemento("div");
              divComplementoItem.classList.add("complemento-item");

              const precoUnitarioComplemento = Number(comp.Venda).toFixed(2);

              divComplementoItem.innerHTML = `
                <span class="comp-desc">${comp.quantidade}x ${comp.Descricao}</span>
                <span class="comp-preco">R$ ${precoUnitarioComplemento}</span>
              `;

              divComplementosContainer.appendChild(divComplementoItem);
            });

            divCadaProduto.appendChild(divComplementosContainer);
          }

          sectionProdutoBox.append(divCadaProduto);

          const elipse = divCabecalhoProduto.querySelector(
            ".fa-ellipsis-vertical"
          );

          if (elipse) {
            elipse.addEventListener("click", async () => {
              const resultado = await Swal.fire({
                title: "O que deseja fazer?",
                icon: "question",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Editar",
                denyButtonText: "Excluir",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#080",
                denyButtonColor: "#c00",
                cancelButtonColor: "#aaa",
                backdrop: "rgba(0,0,0,0.7)",
              });

              if (resultado.isConfirmed) {
                try {
                  await apiPost("selecionar-produto", {
                    ...produtos[index],
                    editarIndex: index,
                  });
                  window.location.href = "selecionar.html";
                } catch (erro) {
                  Swal.fire("Erro", "Não foi possível editar o item.", "error");
                }
              } else if (resultado.isDenied) {
                const respostaApi = await apiPost("remover-item-carrinho", {
                  index: index,
                });
                if (respostaApi.message) {
                  Swal.fire(
                    "Item Removido!",
                    respostaApi.message,
                    "success"
                  ).then(() => {
                    renderizarProdutos(produtos.filter((_, i) => i !== index));
                    if (produtos.length === 1) {
                      setTimeout(() => {
                        window.location.href = "./index.html";
                      }, 500);
                    }
                  });
                } else {
                  Swal.fire("Erro", "Índice do produto inválido.", "error");
                }
              } else if (resultado.isDismissed) {
                Swal.fire("Ação cancelada", "O item não foi alterado.", "info");
              }
            });
          }
        });

        const subtotalFormatado = subtotalCarrinho.toFixed(2);

        if (btnConfirmar) {
          const spans = capturar("#section-botoes button span", true);
          spans[1].textContent = `R$ ${subtotalFormatado}`;
        }
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
          const respostaApi = await apiPost("limpar-pedido");
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

    btnConfirmar?.addEventListener("click", async () => {
      const dadosPedido = {
        carrinho: carrinho,
        subtotal: subtotalCarrinho.toFixed(2),
      };

      try {
        const respostaApi = await apiPost("salvar-pedido-sessao", dadosPedido);

        if (respostaApi.sucesso) {
          window.location.href = "./finalizar.html";
        } else {
          Swal.fire(
            "Erro",
            respostaApi.message ||
              "Falha ao preparar o pedido. Tente novamente.",
            "error"
          );
        }
      } catch (erro) {
        Swal.fire(
          "Erro",
          erro.message || "Erro de comunicação com o servidor.",
          "error"
        );
      }
    });
  } catch (error) {
    console.error("Falha ao gerenciar o carrinho:", error);
  }
}

//========================================================================================//

async function gerenciarFinalizacao(sessaoCarregada) {
  try {
    let formaEntrega = null;
    let carrinho, subtotal;

    const dadosPedido = await carregarPedidoFinalizacao();
    const dadosEmpresaObj = await carregarEmpresa();
    const dadosSessao = sessaoCarregada;
    const bairros = await carregarBairros();

    if (
      !dadosPedido ||
      !Array.isArray(dadosPedido.carrinho) ||
      dadosPedido.carrinho.length === 0
    ) {
      Swal.fire(
        "Ops!",
        "Seu carrinho está vazio ou expirou. Por favor, volte ao carrinho.",
        "warning"
      ).then(() => {
        window.location.href = "./carrinho.html";
      });
      return;
    }

    carrinho = dadosPedido.carrinho;
    subtotal = dadosPedido.subtotal;

    const empresa = dadosEmpresaObj;

    const taxaPadraoEmpresa = Number(empresa.parametros.taxaentrega || 0);

    const title = capturar("title");
    title.textContent = empresa.empresa.Fantasia;

    const entregaLiberada = empresa.parametros.ativaentrega === "S";
    const entregaDisabled = !entregaLiberada ? "disabled" : "";

    const textoEntrega = entregaLiberada
      ? "Entregar <br> <small>Taxa será calculada</small>"
      : "Entrega indisponível";

    const result = await Swal.fire({
      title: "COMO DESEJA RECEBER?",
      icon: "question",
      backdrop: "rgba(0,0,0,0.7)",

      html: `
            <style>
              .entrega-button-group input[type="radio"] { display: none; }
              .entrega-button-group label {
                display: inline-block; padding: 8px 16px; margin: 5px;
                border: 1px solid #ccc; border-radius: 25px; cursor: pointer;
                font-weight: bold; transition: all 0.1s; width: 200px; text-align: center;
              }
              .entrega-button-group input[type="radio"]:checked + label {
                background-color: #080; color: white; border-color: #080;
                box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.2);
              }
              .entrega-button-group .disabled { opacity: 0.6; cursor: not-allowed; }
            </style>

            <div style="text-align: center;">
              <div class="entrega-button-group" style="display: inline-block;">
                <input type="radio" id="retirada" name="forma-entrega" value="R" />
                <label for="retirada">
                <i class="fas fa-walking"></i> Retirar <br> <small>Sem taxa de entrega</small>
                </label>
              </div>

              <div class="entrega-button-group" style="display: inline-block;">
                <input type="radio" id="entrega" name="forma-entrega" value="E" ${entregaDisabled} />
                <label for="entrega" class="${entregaDisabled}">
                <i class="fas fa-motorcycle"></i> ${textoEntrega}
                </label>
              </div>
            </div>
            `,
      confirmButtonText: "Confirmar",
      confirmButtonColor: "#080",
      allowOutsideClick: false,
      allowEscapeKey: false,
      focusConfirm: false,

      preConfirm: () => {
        const radioSelecionado = document.querySelector(
          'input[name="forma-entrega"]:checked'
        );

        if (!radioSelecionado) {
          Swal.showValidationMessage("Por favor, selecione uma opção válida.");
          return false;
        }
        return radioSelecionado.value;
      },
    });

    if (result.isConfirmed) {
      formaEntrega = result.value;
    }

    if (formaEntrega) {
      const divTipoEntrega = capturar(".tipo #info-entrega-atual");
      const blocoTaxa = capturar(".taxa#bloco-taxa");
      const elementoTaxa = capturar(".taxa #total-taxa");
      const blocoRetirada = capturar("#bloco-retirada");
      const btnAlterarTipo = capturar(".tipo button");
      const textoValorProduto = capturar(".row #total-produtos");
      const precoTotalPedido = capturar(".row #total-geral");
      const inputNomeF = capturar(".nomef #input-nome");
      const inputFoneF = capturar(".fonef #input-fone");
      const blocoPagamento = capturar("#forma-pagamento");
      const btnFinalizar = capturar("#btn-finalizar");

      btnAlterarTipo?.addEventListener("click", () =>
        gerenciarFinalizacao(dadosSessao)
      );

      if (textoValorProduto) {
        textoValorProduto.textContent = `R$ ${Number(subtotal).toFixed(2)}`;
      }

      if (dadosSessao && dadosSessao.usuario && inputFoneF) {
        inputFoneF.value = dadosSessao.usuario.telefone;
      }

      let totalGeral = Number(subtotal);
      let enderecoParaEnvio = null;

      if (formaEntrega === "E") {
        const bairrosOptions = bairros.length
          ? bairros
              .map((b) => `<option value="${b.Bairro}">${b.Bairro}</option>`)
              .join("")
          : "<option value=''>Nenhum bairro cadastrado</option>";

        const { value: enderecoEntrega } = await Swal.fire({
          title: "Informe seu Endereço",
          html: `
                <style>
                    .swal2-title {
                        font-size: 1.1em !important; 
                    }
                    .swal2-html-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center; 
                        padding: 0 10px;
                        margin: 0;
                        overflow: hidden;
                    }
                    .swal2-input, .swal2-select {
                        max-width: 300px; 
                        width: 100%;
                        margin: 5px 0 !important; 
                        padding: .5em; 
                        box-sizing: border-box;
                        text-align: left;
                        font-size: 0.9em; 
                    }
                    .swal2-popup {
                        max-width: 350px !important;
                        width: 90%;
                        overflow-y: auto;
                        overflow-x: hidden !important;
                    }
                    .swal2-actions button {
                        font-size: 0.95em !important;
                    }
                </style>
                <select id="swal-bairro" class="swal2-input swal2-select">
                    <option value="">Selecione o bairro</option>
                    ${bairrosOptions}
                </select>
                <input id="swal-rua" class="swal2-input" placeholder="Rua, Av.:" autocomplete="street-address">
                <input id="swal-numero" class="swal2-input" placeholder="Número:" autocomplete="address-line2">
                <input id="swal-complemento" class="swal2-input" placeholder="Complemento (opcional)">
                <input id="swal-referencia" class="swal2-input" placeholder="Referência (opcional)">
                `,
          focusConfirm: false,
          confirmButtonText: "Confirmar",
          confirmButtonColor: "#080",
          preConfirm: async () => {
            const bairroNome = capturar("#swal-bairro").value;
            const rua = capturar("#swal-rua").value;
            const numero = capturar("#swal-numero").value;
            const complemento = capturar("#swal-complemento").value;
            const referencia = capturar("#swal-referencia").value;

            if (!bairroNome || !rua || !numero) {
              Swal.showValidationMessage("Preencha bairro, rua e número!");
              return false;
            }

            let taxaCalculada = 0;
            try {
              taxaCalculada = await carregarTaxaEntrega(
                bairroNome,
                taxaPadraoEmpresa
              );
            } catch (error) {
              console.error("Erro ao carregar taxa:", error);
              Swal.showValidationMessage(
                "Falha ao calcular a taxa de entrega."
              );
              return false;
            }

            return {
              bairro: bairroNome,
              rua,
              numero,
              complemento,
              referencia,
              taxa: taxaCalculada,
            };
          },
        });

        if (!enderecoEntrega) {
          return;
        }

        enderecoParaEnvio = enderecoEntrega;
        const taxa = enderecoEntrega.taxa || 0;
        totalGeral = Number(subtotal) + Number(taxa);

        const dadosParaSessao = {
          forma_entrega: "E",
          endereco: enderecoParaEnvio,
          taxa_entrega: taxa.toFixed(2),
          total_geral: totalGeral.toFixed(2),
        };

        await apiPost("atualizar-sessao-entrega", dadosParaSessao);

        divTipoEntrega.innerHTML = `<i class="fas fa-motorcycle"></i> Entregar`;

        if (blocoRetirada) {
          blocoRetirada.style.display = "none";
        }
        if (blocoTaxa) {
          blocoTaxa.style.display = "flex";
          elementoTaxa.textContent = `R$ ${taxa.toFixed(2)}`;
        }
      } else {
        const enderecoLoja = capturar("#endereco-loja");
        const cidadeLoja = capturar("#cidade-loja");

        totalGeral = Number(subtotal);

        divTipoEntrega.innerHTML = `<i class="fas fa-walking"></i> Retirar`;

        if (blocoRetirada) {
          blocoRetirada.style.display = "block";
        }
        if (blocoTaxa) {
          blocoTaxa.style.display = "none";
        }

        if (enderecoLoja) {
          enderecoLoja.textContent = `${empresa.empresa.Endereco}, ${empresa.empresa.Numero} - ${empresa.empresa.Bairro}`;
        }

        if (cidadeLoja) {
          cidadeLoja.textContent = `${empresa.empresa.Cidade}`;
        }
      }

      if (blocoPagamento) {
        blocoPagamento.style.display = "none";
      }

      if (precoTotalPedido) {
        precoTotalPedido.textContent = `R$ ${totalGeral.toFixed(2)}`;
      }

      if (btnFinalizar) {
        btnFinalizar.removeEventListener("click", btnFinalizar.currentHandler);

        const finalizacaoHandler = async () => {
          const nomeCliente = inputNomeF.value.trim();

          if (!nomeCliente || nomeCliente.length < 3) {
            Swal.fire(
              "Atenção",
              "Por favor, preencha seu nome corretamente.",
              "warning"
            );
            return;
          }

          if (formaEntrega === "E") {
            await showModalPagamentoEntrega(totalGeral);
          } else {
            await Swal.fire(
              "Pedido Finalizado!",
              "Simulação: Retirada no local.",
              "success"
            );
          }
        };

        btnFinalizar.addEventListener("click", finalizacaoHandler);
        btnFinalizar.currentHandler = finalizacaoHandler;
      }
    }
  } catch (error) {
    console.error("Erro na inicialização da finalização:", error);

    Swal.fire(
      "Erro",
      "Falha ao carregar dados essenciais para o pedido. Você será redirecionado.",
      "error"
    ).then(() => {
      window.location.href = "./carrinho.html";
    });
  }
}

//========================================================================================//

function ocultarComplementosPagamento(container) {
  const inputTroco = container.querySelector("#input-troco-modal");
  const infoPixBox = container.querySelector("#info-pix-box-modal");

  if (inputTroco) {
    inputTroco.style.display = "none";
    inputTroco.value = "0";
  }
  if (infoPixBox) {
    infoPixBox.style.display = "none";
  }
}

function exibirTroco(container) {
  ocultarComplementosPagamento(container);

  const inputTroco = container.querySelector("#input-troco-modal");
  if (inputTroco) {
    inputTroco.style.display = "block";
    inputTroco.focus();
  }
}

function exibirPix(container) {
  ocultarComplementosPagamento(container);

  const infoPixBox = container.querySelector("#info-pix-box-modal");
  if (infoPixBox) {
    infoPixBox.style.display = "block";
  }
}

function copiarChavePix(chave) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(chave)
      .then(() => {
        Swal.fire(
          "Copiado! ✅",
          "A chave PIX foi copiada para a área de transferência.",
          "success"
        );
      })
      .catch((err) => {
        console.error("Erro ao copiar:", err);
        Swal.fire(
          "Erro ❌",
          "Não foi possível copiar a chave automaticamente.",
          "error"
        );
      });
  } else {
    Swal.fire(
      "Atenção",
      "Seu navegador não suporta cópia automática. Copie a chave manualmente: " +
        chave,
      "warning"
    );
  }
}

async function showModalPagamentoEntrega(totalGeral) {
  const totalFormatado = totalGeral.toFixed(2);
  const CHAVE_PIX = "(35) 98888-7777";
  const NOME_EMPRESA = "Restaurante Simulado LTDA";

  const result = await Swal.fire({
    title: "ESCOLHA O PAGAMENTO",
    icon: "question",
    backdrop: "rgba(0,0,0,0.7)",
    html: `
            <style>
                /* Estilos reintroduzidos para os botões de rádio */
                #forma-pagamento-modal {
                    gap: 0.3em !important; /* REDUZIDO: Espaçamento menor entre os blocos principais */
                }
                #forma-pagamento-modal .radio {
                    display: block;
                    cursor: pointer;
                    margin: 0.3em 0; /* REDUZIDO: Margem vertical menor entre os botões */
                }
                #forma-pagamento-modal .radio input[type="radio"] {
                    display: none;
                }
                #forma-pagamento-modal .radio span {
                    display: block;
                    padding: 0.5em;
                    border: 1px solid #ccc;
                    border-radius: 2px;
                    transition: background-color 0.2s, border-color 0.2s, color 0.2s;
                    text-align: center;
                    font-weight: bold;
                    color: #333;
                }
                #forma-pagamento-modal .radio:hover span {
                    background-color: #f0f0f0;
                    border-color: #080;
                }
                #forma-pagamento-modal .radio input[type="radio"]:checked + span {
                    background-color: #cfffc1;
                    border-color: #080;
                    box-shadow: 0 0 5px rgba(0, 128, 0, 0.5); /* Sombra verde */
                    color: #000;
                }
                /* Estilo do input de Troco */
                #input-troco-modal {
                    margin-top: 5px; /* ESPAÇAMENTO AJUSTADO */
                    margin-bottom: 5px; /* ESPAÇAMENTO AJUSTADO */
                }
                /* Estilo da caixa de Info PIX */
                #info-pix-box-modal {
                    margin-top: 8px; /* ESPAÇAMENTO AJUSTADO */
                    padding: 8px; /* REDUZIDO: Padding interno da caixa */
                    background-color: #f7f7f7;
                    border: 1px dashed #080;
                    border-radius: 4px;
                }
                #info-pix-box-modal p {
                    margin: 1px 0; /* REDUZIDO: Margem entre as linhas de texto */
                    font-size: 0.9em;
                }
                #info-pix-box-modal #btn-copiar-pix-modal {
                    margin-top: 4px; /* ESPAÇAMENTO AJUSTADO */
                    padding: 6px 10px; /* REDUZIDO: Padding do botão */
                }
            </style>

            <div id="forma-pagamento-modal" style="display: flex; flex-direction: column; gap: 0.3em; text-align: left; width: 100%;">
                <p style="text-align: center; margin-bottom: 5px;">Total a pagar: <b>R$ ${totalFormatado}</b></p>
                <hr style="border-top: 1px solid #cfffc1; margin: 2px 0;" /> <label class="radio dinheiro">
                    <input type="radio" required class="pagamento-dinheiro" name="forma-pagamento-modal" value="D" checked />
                    <span><i class="fa-solid fa-money-bill-wave"></i> Dinheiro</span>
                </label>
                <input type="number" id="input-troco-modal" placeholder="Levar Troco Para R$ ?" value="0" 
                       style="display: none; padding: 0.5em; border: 1px solid #080; outline: none; text-align: center; width: 100%; box-sizing: border-box;" />

                <label class="radio cartao">
                    <input type="radio" required class="pagamento-cartao" name="forma-pagamento-modal" value="C" />
                    <span><i class="fa-solid fa-credit-card"></i> Cartão</span>
                </label>

                <label class="radio pix">
                    <input type="radio" required class="pagamento-pix" name="forma-pagamento-modal" value="P" />
                    <span><i class="fa-brands fa-pix"></i> Pix</span>
                </label>
                
                <div id="info-pix-box-modal" style="display: none; text-align: center;">
                    <p style="font-weight: bold; color: #080;">Chave PIX (Telefone):</p>
                    <p id="chave-pix-info-modal" style="font-size: 1em; font-weight: bold; color: #333;">${CHAVE_PIX}</p>
                    <p>Empresa: ${NOME_EMPRESA}</p>
                    <button id="btn-copiar-pix-modal" style="background-color: #080; color: white; border: none; padding: 6px 10px; border-radius: 50px; cursor: pointer; font-weight: bold; font-size: 0.85em; margin-top: 4px;">
                        Copiar Chave
                    </button>
                </div>
            </div>
        `,
    confirmButtonText: "Confirmar Pedido",
    confirmButtonColor: "#080",
    showCancelButton: true,
    cancelButtonText: "Voltar",
    allowOutsideClick: false,
    allowEscapeKey: false,
    focusConfirm: false,

    didOpen: (modalElement) => {
      const container = modalElement.querySelector("#forma-pagamento-modal");
      const radioDinheiro = container.querySelector(".pagamento-dinheiro");
      const radioCartao = container.querySelector(".pagamento-cartao");
      const radioPix = container.querySelector(".pagamento-pix");
      const btnCopiar = container.querySelector("#btn-copiar-pix-modal");

      exibirTroco(container);

      radioDinheiro?.addEventListener("change", () => exibirTroco(container));
      radioCartao?.addEventListener("change", () =>
        ocultarComplementosPagamento(container)
      );
      radioPix?.addEventListener("change", () => exibirPix(container));

      if (btnCopiar) {
        const copyHandler = () => copiarChavePix(CHAVE_PIX);
        btnCopiar.addEventListener("click", copyHandler);

        btnCopiar.currentHandler = copyHandler;
      }
    },

    preConfirm: () => {
      const radioSelecionado = document.querySelector(
        'input[name="forma-pagamento-modal"]:checked'
      );

      if (!radioSelecionado) {
        Swal.showValidationMessage("Selecione uma forma de pagamento.");
        return false;
      }

      if (radioSelecionado.value === "D") {
        const inputTroco = document.querySelector("#input-troco-modal");

        if (inputTroco.style.display !== "none") {
          const troco = Number(inputTroco.value) || 0;

          if (troco > 0 && troco < totalGeral) {
            Swal.showValidationMessage(
              `O valor do troco (R$ ${troco.toFixed(
                2
              )}) deve ser igual ou maior que o total do pedido (R$ ${totalGeral.toFixed(
                2
              )}).`
            );
            return false;
          }
        }
      }

      return true;
    },
  });

  if (result.isConfirmed) {
    await Swal.fire(
      "Pedido Finalizado!",
      "Simulação: Pagamento escolhido. Próxima etapa seria a submissão.",
      "success"
    );
  }
}

//========================================================================================//

async function carregarDadosIniciais() {
  try {
    const [empresaData, horarios, categorias, produtos] = await Promise.all([
      carregarEmpresa(),
      carregarHorarios(),
      carregarCategorias(),
      carregarProdutos(),
    ]);

    AppData.empresa = empresaData?.empresa || {};
    AppData.parametros = empresaData?.parametros || {};
    AppData.horarios = horarios || [];
    AppData.categorias = categorias || [];
    AppData.produtos = produtos || [];
  } catch (error) {
    console.error(
      "ERRO GRAVE: Falha ao carregar dados estáticos iniciais. O servidor pode estar fora do ar.",
      error
    );

    AppData.empresa = {};
    AppData.parametros = {};
    AppData.horarios = [];
    AppData.categorias = [];
    AppData.produtos = [];
  }
}

//========================================================================================//

document.addEventListener("DOMContentLoaded", async () => {
  const dadosSessaoCompleta = await verificacaoDaSessao();

  AppData.sessao = dadosSessaoCompleta;

  if (window.location.pathname.endsWith("/index.html")) {
    await carregarDadosIniciais();

    const foneDoUsuario = AppData.sessao?.usuario?.telefone ?? null;

    gerenciarInfoEmpresa(AppData.empresa, AppData.parametros);
    gerenciarCategoriasMercadorias(AppData.categorias, AppData.produtos);
    gerenciarAside(AppData.empresa, AppData.horarios, AppData.parametros);

    gerenciarPedidosAnteriores(foneDoUsuario);
  }

  if (window.location.pathname.endsWith("/selecionar.html")) {
    gerenciarProdutoSelecionado();
  }

  if (window.location.pathname.endsWith("/carrinho.html")) {
    gerenciarCarrinho();
  }

  if (window.location.pathname.endsWith("/finalizar.html")) {
    gerenciarFinalizacao(dadosSessaoCompleta);
  }
});
