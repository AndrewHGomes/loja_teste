<?php

require_once 'session_init.php';

require_once 'Conexao.php';

class Mercadorias
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

  public function buscarMercadorias()
  {
    try {
      $sql = "SELECT grupo.Descricao AS Grupo,grupo.FecharCozinha,categorias.descricao 
              AS categoria, categorias.pizza,mercadorias.* FROM mercadorias
				      INNER JOIN grupo ON (mercadorias.idgrupo = grupo.Codigo)
				      INNER JOIN categorias ON (grupo.idcategoria = categorias.id)
				      WHERE complemento = 'N' AND mercadorias.ativo = 'S' AND mercadorias.delivery = 'S'
				      ORDER BY categorias.Ordem ASC";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao listar produtos: " . $e->getMessage());
      return [];
    }
  }
}
