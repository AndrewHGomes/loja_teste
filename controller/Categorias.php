<?php

require_once 'session_init.php';

require_once 'Conexao.php';

class Categorias
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

  public function buscarCategorias()
  {
    try {
      $sql = "SELECT * FROM categorias WHERE ativo = 'S' AND excluido = 'N' ORDER BY Ordem ASC";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao listar produtos: " . $e->getMessage());
      return [];
    }
  }
}
