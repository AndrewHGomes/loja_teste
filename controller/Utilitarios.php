<?php

require_once 'session_init.php';

require_once 'Conexao.php';

class Utilitarios
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

  public function pegarParametros()
  {
    try {
      $sql = "SELECT * FROM parametros";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {

      error_log("Erro ao listar parametros: " . $e->getMessage());
      return [];
    }
  }

  public function pegarHorarios()
  {
    try {
      $sql = "SELECT * FROM horarios";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {

      error_log("Erro ao listar horarios: " . $e->getMessage());
      return [];
    }
  }
}

$utilitarios = new Utilitarios;

if (isset($_GET['pegarParametros'])) {
  $parametros = $utilitarios->pegarParametros();
  echo json_encode($parametros);
  exit;
}

if (isset($_GET['pegarHorarios'])) {
  $horarios = $utilitarios->pegarHorarios();
  echo json_encode($horarios);
  exit;
}

echo json_encode(['erro' => 'Nenhum dado solicitado.']);
