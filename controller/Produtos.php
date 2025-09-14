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

  public function pegarTodosOsProdutos()
  {
    try {
      $sql = "SELECT grupo.Descricao AS Grupo,grupo.FecharCozinha,categorias.descricao AS categoria, categorias.pizza,mercadorias.* FROM mercadorias
		  INNER JOIN grupo ON (mercadorias.idgrupo = grupo.Codigo)
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

  public function pegarDetalhesPedidosAnteriores($cod)
  {
    try {

      $sql = "SELECT vendasdet.*, vendasdetcomp.*
              FROM vendasdet LEFT JOIN
              vendasdetcomp ON vendasdet.Codigo = vendasdetcomp.idVendasDet
              WHERE vendasdet.CodVenda = :cod
        ";

      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':cod', $cod, PDO::PARAM_STR);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {

      error_log("Erro ao buscar detalhes de pedidos: " . $e->getMessage());
      return [];
    }
  }
}
