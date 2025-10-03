<?php

require_once 'Conexao.php';

class Pedido
{
  private $conexao;

  public function __construct()
  {
    try {
      $this->conexao = Conexao::instancia();
    } catch (Exception $e) {
      error_log("Erro de conexão no Pedido: " . $e->getMessage());
      throw new Exception("Erro de conexão com o banco de dados.");
    }
  }

  // ===========================================================================

  public function concluirPedido(array $sessionData)
  {
    if (!isset($sessionData['pedido_finalizacao']) || empty($sessionData['carrinho'])) {
      throw new Exception("Dados de finalização ou carrinho ausentes na sessão.");
    }

    $carrinho       = $sessionData['carrinho'];
    $finalizacao    = $sessionData['pedido_finalizacao'];
    $usuarioData    = isset($sessionData['usuario']) ? $sessionData['usuario'] : [];
    $empresaData    = isset($sessionData['empresa']['empresa']) ? $sessionData['empresa']['empresa'] : [];

    $subtotal       = floatval(isset($finalizacao['subtotal']) ? $finalizacao['subtotal'] : 0.00);
    $taxa           = floatval(isset($finalizacao['taxa_entrega']) ? $finalizacao['taxa_entrega'] : 0.00);
    $totalpedido    = $subtotal + $taxa;
    $telefone       = isset($usuarioData['telefone']) ? $usuarioData['telefone'] : '';

    $hora = date('H:i:s');
    $data = date('Y-m-d');
    $chave = md5(uniqid(rand(), true));
    $fone_formatado = (!empty($telefone) && substr($telefone, 0, 2) != '55') ? "55" . $telefone : $telefone;
    $origem         = isset($usuarioData['origem']) ? $usuarioData['origem'] : 'W';

    $enviado             = null;
    $dataagendamento     = null;
    $horaagendamento     = null;
    $motoboy             = null;
    $status_pedido       = 'A';
    $status_entrega      = null;
    $gravado             = 'N';
    $uf                  = isset($empresaData['UF']) ? $empresaData['UF'] : "SP";

    $troco = !empty($finalizacao['troco']) ? floatval($finalizacao['troco']) : 0.00;
    $mesa = (int) (isset($finalizacao['mesa']) ? $finalizacao['mesa'] : 0);
    $nome = strtoupper(isset($finalizacao['nome']) && !empty($finalizacao['nome']) ? $finalizacao['nome'] : 'CLIENTE');
    $obs = isset($finalizacao['observacao']) ? $finalizacao['observacao'] : '';
    $formapgto = isset($finalizacao['formapgto']) ? $finalizacao['formapgto'] : 'D';
    $forma_tipo = isset($finalizacao['forma_entrega']) ? $finalizacao['forma_entrega'] : ($mesa > 0 ? 'M' : 'E');

    $endereco = $numero = $complemento = $bairro = $cidade = '';

    if ($forma_tipo == 'R' || $forma_tipo == 'M' || $mesa > 0) {
      $endereco    = "NA LOJA";
      $numero      = "0";
      $complemento = "";
      $bairro      = "NA LOJA / RETIRADA";
      $cidade      = isset($empresaData['Cidade']) ? strtoupper($empresaData['Cidade']) : "CIDADE DESCONHECIDA";
    } elseif (isset($finalizacao['endereco'])) {
      $endData     = $finalizacao['endereco'];
      $endereco    = strtoupper(isset($endData['rua']) ? $endData['rua'] : 'NAO INFORMADO');
      $numero      = isset($endData['numero']) ? $endData['numero'] : 'S/N';
      $complemento = strtoupper(isset($endData['complemento']) ? $endData['complemento'] : '');
      $bairro      = strtoupper(isset($endData['bairro']) ? $endData['bairro'] : 'NAO INFORMADO');
      $cidade      = strtoupper(isset($empresaData['Cidade']) ? $empresaData['Cidade'] : 'CIDADE NAO INFORMADA');
    } else {
      $endereco = $numero = $complemento = $bairro = $cidade = "ERRO DE ENDERECO";
    }

    try {
      $this->conexao->beginTransaction();

      $sqlVendas = "INSERT INTO vendas
                (`Data`, Hora, Obs, TaxaTransp, formapgto, troco, enviado, DataEntrega, HoraEntrega, nome, NumeroMesa, endereco, numero, complemento, bairro, cidade, UF, telefone, gravado, tipo, totalpedido, chave, motoboy, status_pedido, status_entrega, origem)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
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

        $codprod        = (int) (isset($produto['codprod']) ? $produto['codprod'] : 0);
        $quantidade     = floatval(isset($produto['quantidade']) ? $produto['quantidade'] : 1);
        $valor_unitario = floatval(isset($produto['preco']) ? $produto['preco'] : 0.00);
        $descricao      = isset($produto['descricao']) ? $produto['descricao'] : 'Produto Desconhecido';
        $observacao     = isset($produto['observacao']) ? $produto['observacao'] : '';
        $tamanho        = isset($produto['tamanho']) ? $produto['tamanho'] : '';
        $vItem          = floatval(isset($produto['total']) ? $produto['total'] : 0.00);
        $fracao         = null;

        $keyprod = md5(uniqid(rand(), true));

        $sqlVendasDet = "INSERT INTO vendasdet
                    (Item, CodMerc, CodVenda, Qtd, Valor, `Data`, Hora, Descricao, Fracao, VlrItem, Observacao, chave, Tamanho)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ";

        $stmtVendasDet = $this->conexao->prepare($sqlVendasDet);
        $stmtVendasDet->execute([
          $itemIndex + 1,
          $codprod,
          $codVenda,
          $quantidade,
          $valor_unitario,
          $data,
          $hora,
          $descricao,
          $fracao,
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

            $comp_codprod    = (int) (isset($comp['codprod']) ? $comp['codprod'] : 0);
            $comp_quantidade = floatval(isset($comp['quantidade']) ? $comp['quantidade'] : 1.0);
            $comp_valor      = floatval(isset($comp['Venda']) ? $comp['Venda'] : 0.00);
            $comp_borda      = isset($comp['borda']) ? $comp['borda'] : '';
            $comp_tipo       = isset($comp['tipo']) ? $comp['tipo'] : '';
            $comp_idsabor    = isset($comp['idsabor']) ? $comp['idsabor'] : '';

            $sqlVendasDetComp = "INSERT INTO vendasdetcomp
                            (idVendasDet, idProdComp, Qtd, Valor, chave, borda, Tipo, idSabor)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            ";

            $stmtVendasDetComp = $this->conexao->prepare($sqlVendasDetComp);
            $stmtVendasDetComp->execute([
              $codvendasdet,
              $comp_codprod,
              $comp_quantidade,
              $comp_valor,
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

      error_log("ERRO FATAL AO CONCLUIR PEDIDO: " . $e->getMessage());

      // AQUI ESTÁ A CHAVE: MENSAGEM DO ERRO REAL DO BD PARA DEBUG
      throw new Exception("ERRO REAL DO BD: " . $e->getMessage());

      // Lembre-se de mudar a linha acima para a mensagem genérica
      // ("Falha ao salvar o pedido. Por favor, tente novamente...") 
      // antes de colocar em produção.
    }
  }
}
