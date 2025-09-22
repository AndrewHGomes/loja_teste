<?php

require_once 'session_init.php';

require_once 'Conexao.php';

class Produtos
{
  private $conexao;

  public function __construct()
  {
    try {
      $this->conexao = Conexao::instancia();
    } catch (Exception $e) {
      die("Não foi possível conectar ao banco de dados: " . $e->getMessage());
    }
  }

  //===============================================================================

  public function pegarTodosOsProdutos()
  {
    try {
      $sql = "SELECT grupo.Descricao AS Grupo,grupo.FecharCozinha,categorias.descricao
              AS categoria, categorias.pizza, mercadorias.* FROM mercadorias INNER JOIN grupo ON (mercadorias.idgrupo = grupo.Codigo)
              INNER JOIN categorias ON (grupo.idcategoria = categorias.id)
              WHERE complemento = 'N' AND mercadorias.ativo = 'S' AND mercadorias.delivery = 'S' ORDER BY categorias.Ordem ASC";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao listar produtos: " . $e->getMessage());
      return [];
    }
  }

  //===============================================================================

  public function pegarCategorias()
  {
    try {
      $sql = "SELECT id, descricao, pizza, excluido, ativo FROM categorias WHERE ativo = 'S' AND excluido = 'N'";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao listar produtos: " . $e->getMessage());
      return [];
    }
  }

  //===============================================================================

  public function pegarComplementos($codigos)
  {
    try {
      $codigosArray = explode(',', $codigos);

      $placeholders = [];
      for ($i = 0; $i < count($codigosArray); $i++) {
        $placeholders[] = "FIND_IN_SET(:codigo{$i}, mercadorias.ComplementoCod)";
      }
      $whereClause = implode(' OR ', $placeholders);

      $sql = "SELECT mercadorias.*, grupo.Descricao AS Grupo, grupocomp.id AS IDGrupoComp
                FROM mercadorias INNER JOIN grupo ON mercadorias.idgrupo = grupo.Codigo
                INNER JOIN grupocomp ON grupocomp.id = mercadorias.ComplementoCod
                WHERE {$whereClause}
                AND Complemento = 'S' AND Ativo = 'S' ORDER BY (mercadorias.Venda = 0)
                DESC, grupo.Ordem, mercadorias.Ordem";

      $stmt = $this->conexao->prepare($sql);

      foreach ($codigosArray as $index => $cod) {
        $stmt->bindParam(":codigo{$index}", $cod, PDO::PARAM_INT);
      }

      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao listar complementos: " . $e->getMessage());
      return [];
    }
  }

  //===============================================================================

  public function pegarDetalhesDosProdutos($codigo)
  {
    try {
      $sql = "SELECT
              grupo.Descricao AS Grupo, grupo.TextoAdicional, 
              grupo.AtivaTextoAdicional AS adicional, categorias.pizza, 
              categorias.descricao AS categoria, mercadorias.*
              FROM mercadorias INNER JOIN grupo ON (mercadorias.idgrupo = grupo.Codigo)
              INNER JOIN categorias ON (grupo.idcategoria = categorias.id)
              WHERE mercadorias.Codigo = :codigo AND mercadorias.ativo = 'S'";

      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':codigo', $codigo, PDO::PARAM_INT);
      $stmt->execute();

      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao buscar detalhes do produto: " . $e->getMessage());
      return [];
    }
  }

  //===============================================================================

  public function pegarTamanhosDosProdutos($codigo)
  {
    try {
      $sql = "SELECT * FROM tamanhos WHERE CodMerc = :codigo";

      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':codigo', $codigo, PDO::PARAM_INT);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao buscar tamanhos: " . $e->getMessage());
      return [];
    }
  }

  //===============================================================================

  public function pegarIngredientesDosProdutos($codigo)
  {
    try {
      $sql = "SELECT ingredientes FROM mercadorias WHERE Codigo = :codigo";

      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':codigo', $codigo, PDO::PARAM_INT);
      $stmt->execute();

      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
      return $resultado ? $resultado['ingredientes'] : '';
    } catch (PDOException $e) {
      error_log("Erro ao buscar ingredientes: " . $e->getMessage());
      return '';
    }
  }

  //===============================================================================

  public function pegarBordas()
  {
    try {
      $sql = "SELECT Codigo, Descricao, Venda
              FROM mercadorias WHERE ComplementoBorda = 'S' AND ativo = 'S'";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao buscar bordas: " . $e->getMessage());
      return [];
    }
  }

  //===============================================================================

  public function pegarPedidosAnteriores($fone)
  {
    try {
      $sql = "SELECT `Data`, Hora, totalpedido, Codigo 
              FROM vendas WHERE telefone = :fone ORDER BY Codigo DESC";

      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':fone', $fone, PDO::PARAM_STR);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao buscar pedidos antigos: " . $e->getMessage());
      return [];
    }
  }

  //===============================================================================

  public function pegarDetalhesPedidosAnteriores($cod)
  {
    try {
      $sqlItens = "SELECT * FROM vendasdet WHERE CodVenda = :cod";
      $stmtItens = $this->conexao->prepare($sqlItens);
      $stmtItens->bindParam(':cod', $cod, PDO::PARAM_INT);
      $stmtItens->execute();
      $itens = $stmtItens->fetchAll(PDO::FETCH_ASSOC);

      $itensAgrupados = [];
      foreach ($itens as $item) {
        $itensAgrupados[$item['Codigo']] = $item;
        $itensAgrupados[$item['Codigo']]['Complementos'] = [];
      }

      if (!empty($itensAgrupados)) {
        $idsItens = array_keys($itensAgrupados);
        $placeholders = implode(',', array_fill(0, count($idsItens), '?'));

        $sqlComplementos = "SELECT vendasdetcomp.*, mercadorias.Complemento, mercadorias.Descricao AS DescricaoComp
                            FROM vendasdetcomp JOIN mercadorias ON vendasdetcomp.idProdComp = mercadorias.Codigo
                            WHERE vendasdetcomp.idVendasDet IN ($placeholders)";

        $stmtComplementos = $this->conexao->prepare($sqlComplementos);
        foreach ($idsItens as $k => $id) {
          $stmtComplementos->bindValue(($k + 1), $id, PDO::PARAM_INT);
        }
        $stmtComplementos->execute();
        $complementos = $stmtComplementos->fetchAll(PDO::FETCH_ASSOC);

        foreach ($complementos as $comp) {
          $idItem = $comp['idVendasDet'];
          if (isset($itensAgrupados[$idItem])) {
            $itensAgrupados[$idItem]['Complementos'][] = $comp;
          }
        }
      }

      $sqlTaxa = "SELECT `Data`, Hora, TaxaTransp, totalpedido FROM vendas WHERE Codigo = :cod";
      $stmtTaxa = $this->conexao->prepare($sqlTaxa);
      $stmtTaxa->bindParam(':cod', $cod, PDO::PARAM_INT);
      $stmtTaxa->execute();
      $taxa = $stmtTaxa->fetch(PDO::FETCH_ASSOC);

      $arrayFinal = array_values($itensAgrupados);
      if ($taxa) {
        $arrayFinal[] = $taxa;
      }

      return $arrayFinal;
    } catch (PDOException $e) {
      error_log("Erro ao buscar detalhes de pedidos: " . $e->getMessage());
      return [];
    }
  }
}
