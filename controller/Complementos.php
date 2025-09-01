<?php

require_once 'session_init.php';

require_once 'Conexao.php';

class Complementos
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

  public function listarComplementos($codigo)
  {
    try {
      $sql = "SELECT * FROM mercadorias WHERE FIND_IN_SET(" . $codigo . ", ComplementoCod) ORDER BY Descricao ASC";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {

      error_log("Erro ao listar produtos: " . $e->getMessage());
      return [];
    }
  }
}
