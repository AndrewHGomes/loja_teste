<?php

require_once 'session_init.php';

require_once 'Conexao.php';

class Status
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

  public function statusLoja($dia)
  {
    try {
      $sql = "SELECT * FROM horarios
              INNER JOIN parametros ON (horarios.idParam = parametros.id)
              WHERE dia = ?";

      $stmt = $this->conexao->prepare($sql);
      $stmt->bindValue(1, $dia, PDO::PARAM_STR);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao listar produtos: " . $e->getMessage());
      return [];
    }
  }
}

$diasDaSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
$dia = $diasDaSemana[date('w')];

$status = new Status;
$dados = $status->statusLoja($dia);

echo json_encode($dados);
