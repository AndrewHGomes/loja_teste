<?php

require_once 'session_init.php';

require_once 'Conexao.php';

class Empresa
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

  public function objetoEmpresa()
  {
    try {
      $sql = "SELECT * FROM empresa INNER JOIN parametros ON (parametros.id = empresa.Codigo)
              LEFT JOIN cidades ON (cidades.Codigo = empresa.Codigo AND cidades.Codigo = 1)
              WHERE empresa.Codigo = 1";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {

      error_log("Erro ao listar empresa: " . $e->getMessage());
      return [];
    }
  }
}
