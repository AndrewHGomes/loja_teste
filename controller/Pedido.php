<!-- Pedido.php -->
<?php

require_once 'session_init.php';
require_once 'Conexao.php';

class Pedido
{
  private $conexao;

  public function __construct()
  {
    try {
      $this->conexao = Conexao::instancia();
    } catch (Exception $e) {
      throw new Exception("Erro de conexão com o banco de dados.");
    }
  }

  // ===========================================================================

  public function concluirPedido(array $payload, array $sessionData)
  {

    if (!isset($sessionData['pedido_finalizacao']) || empty($sessionData['carrinho'])) {
      throw new Exception("Dados de finalização ou carrinho ausentes na sessão. O pedido foi abandonado.");
    }

    $carrinho    = $sessionData['carrinho'];

    $totalpedido = floatval(isset($sessionData['pedido_finalizacao']['total']) ? $sessionData['pedido_finalizacao']['total'] : 0.00);
    $telefone    = $sessionData['usuario']['telefone'];
    $origem      = $sessionData['usuario']['origem'];

    $hora = date('H:i:s');
    $data = date('Y-m-d');
    $chave = md5(uniqid(rand(), true));
    $fone_formatado = (substr($telefone, 0, 2) != 55) ? "55" . $telefone : $telefone;

    $enviado           = null;
    $dataagendamento   = null;
    $horaagendamento   = null;
    $visualizadopainel = 'N';
    $motoboy           = null;
    $status_pedido     = 'A';
    $status_entrega    = null;
    $gravado           = 'N';
    $uf                = "SP";

    $formapgto  = isset($payload['fpagamento']) ? $payload['fpagamento'] : 'D';
    $troco      = !empty($payload['troco']) ? floatval(str_replace(',', '.', $payload['troco'])) : 0.00;
    $mesa       = intval(isset($payload['mesa']) ? $payload['mesa'] : 0);
    $taxa       = floatval(isset($payload['taxatransporte']) ? $payload['taxatransporte'] : 0.00);
    $nome       = strtoupper(isset($payload['nome']) ? $payload['nome'] : 'CLIENTE');
    $obs        = isset($payload['observacao']) ? $payload['observacao'] : '';
    $forma_tipo = isset($payload['forma']) ? $payload['forma'] : ($mesa > 0 ? 'M' : 'E');

    if ($forma_tipo == 'M' || $mesa > 0) {
      $endereco    = "NA MESA";
      $numero      = "0";
      $complemento = "NA MESA";
      $bairro      = "NA MESA";
      $cidade      = "NA LOJA";
    } else {

      $endereco    = strtoupper(isset($payload['rua']) ? $payload['rua'] : '');
      $numero      = isset($payload['numero']) ? $payload['numero'] : '';
      $complemento = strtoupper(isset($payload['complemento']) ? $payload['complemento'] : '');
      $bairro      = strtoupper(isset($payload['bairro']) ? $payload['bairro'] : '');
      $cidade      = strtoupper(isset($payload['cidade']) ? $payload['cidade'] : 'CIDADE NAO INFORMADA');
    }

    try {
      $this->conexao->beginTransaction();

      $sqlVendas = "
                INSERT INTO vendas 
                (Codigo, `Data`, Hora, Obs, TaxaTransp, formapgto, troco, enviado, DataEntrega, HoraEntrega, nome, NumeroMesa, endereco, numero, complemento, bairro, cidade, UF, telefone, gravado, tipo, totalpedido, chave, visualizadopainel, motoboy, status_pedido, status_entrega, origem)
                VALUES 
                (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";

      $stmtVendas = $this->conexao->prepare($sqlVendas);
      $stmtVendas->execute([
        $data,
        $hora,
        $obs,
        $taxa,
        $formapgto,
        $troco,
        $enviado,
        $dataagendamento,
        $horaagendamento,
        $nome,
        $mesa,
        $endereco,
        $numero,
        $complemento,
        $bairro,
        $cidade,
        $uf,
        $fone_formatado,
        $gravado,
        $forma_tipo,
        $totalpedido,
        $chave,
        $visualizadopainel,
        $motoboy,
        $status_pedido,
        $status_entrega,
        $origem
      ]);

      $codVenda = $this->conexao->lastInsertId();

      if (!$codVenda) {
        throw new Exception("Falha ao criar o cabeçalho da venda (tabela vendas).");
      }

      foreach ($carrinho as $itemIndex => $produto) {

        $codprod        = isset($produto['codprod']) ? $produto['codprod'] : 0;
        $quantidade     = isset($produto['quantidade']) ? $produto['quantidade'] : 1;
        $valor_unitario = isset($produto['valor_unitario']) ? $produto['valor_unitario'] : 0.00;
        $descricao      = isset($produto['descricao']) ? $produto['descricao'] : 'Produto Desconhecido';
        $observacao     = isset($produto['observacao']) ? $produto['observacao'] : '';
        $tamanho        = isset($produto['tamanho']) ? $produto['tamanho'] : null;

        $keyprod = md5(uniqid(rand(), true));
        $vItem = floatval(isset($produto['total']) ? $produto['total'] : 0.00);

        $sqlVendasDet = "
                    INSERT INTO vendasdet
                    (Codigo, Item, CodMerc, CodVenda, Qtd, Valor, `Data`, Hora, Descricao, Fracao, VlrItem, Observacao, chave, Tamanho)
                    VALUES
                    (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ";

        $stmtVendasDet = $this->conexao->prepare($sqlVendasDet);
        $stmtVendasDet->execute([
          $itemIndex + 1,
          intval($codprod),
          $codVenda,
          floatval($quantidade),
          floatval($valor_unitario),
          $data,
          $hora,
          $descricao,
          null,
          $vItem,
          $observacao,
          $keyprod,
          $tamanho
        ]);

        $codvendasdet = $this->conexao->lastInsertId();

        if (!$codvendasdet) {
          throw new Exception("Falha ao inserir item na tabela vendasdet: " . $descricao);
        }

        if (isset($produto['complementos']) && is_array($produto['complementos'])) {
          foreach ($produto['complementos'] as $comp) {
            $chaveComp = md5(uniqid(rand(), true));

            $comp_codprod    = isset($comp['codprod']) ? $comp['codprod'] : 0;
            $comp_quantidade = isset($comp['quantidade']) ? $comp['quantidade'] : 1;
            $comp_valor      = isset($comp['valor']) ? $comp['valor'] : 0.00;
            $comp_borda      = isset($comp['borda']) ? $comp['borda'] : null;
            $comp_tipo       = isset($comp['tipo']) ? $comp['tipo'] : null;
            $comp_idsabor    = isset($comp['idsabor']) ? $comp['idsabor'] : null;

            $sqlVendasDetComp = "
                            INSERT INTO vendasdetcomp
                            (ID, idVendasDet, idProdComp, Qtd, Valor, chave, borda, Tipo, idSabor)
                            VALUES
                            (NULL, ?, ?, ?, ?, ?, ?, ?, ?)
                        ";

            $stmtVendasDetComp = $this->conexao->prepare($sqlVendasDetComp);
            $stmtVendasDetComp->execute([
              $codvendasdet,
              intval($comp_codprod),
              floatval($comp_quantidade),
              floatval($comp_valor),
              $chaveComp,
              $comp_borda,
              $comp_tipo,
              $comp_idsabor,
            ]);
          }
        }
      }

      $sqlFinalizar = "UPDATE vendas SET gravado = 'S' WHERE Codigo = ?";
      $stmtFinalizar = $this->conexao->prepare($sqlFinalizar);
      $stmtFinalizar->execute([$codVenda]);

      $this->conexao->commit();

      return ['status' => 'sucesso', 'cod_venda' => $codVenda, 'chave_venda' => $chave];
    } catch (Exception $e) {

      if ($this->conexao->inTransaction()) {
        $this->conexao->rollBack();
      }
      error_log("ERRO DE PEDIDO: " . $e->getMessage());
      throw new Exception("Falha ao salvar o pedido. Por favor, tente novamente ou contate o suporte.");
    }
  }
}
