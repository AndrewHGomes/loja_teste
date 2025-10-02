<!-- Empresa.php -->
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
      throw new Exception("Erro de conexão com o banco de dados.");
    }
  }

  //===========================================================================================

  public function pegarDadosDaEmpresa()
  {
    try {
      $sqlEmpresa = "SELECT * FROM empresa";
      $stmtEmpresa = $this->conexao->prepare($sqlEmpresa);
      $stmtEmpresa->execute();

      $dadosEmpresa = $stmtEmpresa->fetch(PDO::FETCH_ASSOC);
      if (!$dadosEmpresa) {
        $dadosEmpresa = [];
      }

      $sqlParametros = "SELECT * FROM parametros WHERE id = 1";
      $stmtParametros = $this->conexao->prepare($sqlParametros);
      $stmtParametros->execute();

      $dadosParametros = $stmtParametros->fetch(PDO::FETCH_ASSOC);
      if (!$dadosParametros) {
        $dadosParametros = [];
      }

      $dadosCompletos = [
        'empresa' => $dadosEmpresa,
        'parametros' => $dadosParametros
      ];

      return $dadosCompletos;
    } catch (PDOException $e) {
      error_log("Erro ao buscar dados da empresa: " . $e->getMessage());
      return [];
    }
  }

  //===========================================================================================

  public function pegarHorariosDaEmpresa()
  {
    try {
      $sql = "SELECT * FROM horarios";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao buscar horários: " . $e->getMessage());
      return [];
    }
  }

  //===========================================================================================

  public function cidadesOndeEntrega()
  {
    try {
      $sql = "SELECT Codigo, Descricao FROM cidades WHERE excluido = 'N' ORDER BY Descricao ASC";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao buscar cidades de entrega: " . $e->getMessage());
      return [];
    }
  }

  //===========================================================================================

  public function pegarHorariosDeFuncionamento()
  {
    try {
      date_default_timezone_set('America/Fortaleza');
      $day = strtoupper(date('D'));

      $sql = "SELECT horarios.*, 
      parametros.aberto, parametros.txentrega, 
      parametros.tempoentrega, parametros.ativaentrega
      FROM horarios INNER JOIN parametros ON (horarios.idParam = parametros.id)
      WHERE horarios.dia = :day";

      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':day', $day);
      $stmt->execute();

      $dados = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$dados) {
        return ['status' => 'fechado', 'motivo' => 'Nenhum horário configurado para hoje.'];
      }

      $abertoManualmente = $dados['aberto'] == 'S';
      $horaAtual = date("H:i:s");

      $estaAberto = false;
      if ($dados['fechamento'] < $dados['abertura']) {
        if ($horaAtual >= $dados['abertura'] || $horaAtual <= $dados['fechamento']) {
          $estaAberto = true;
        }
      } else {
        if ($horaAtual >= $dados['abertura'] && $horaAtual <= $dados['fechamento']) {
          $estaAberto = true;
        }
      }

      $status = $estaAberto && $abertoManualmente ? 'aberto' : 'fechado';

      return [
        'status' => $status,
        'tempo_preparo' => $dados['tempoentrega'],
        'taxa_entrega' => $dados['txentrega'],
        'entrega_ativa' => $dados['ativaentrega']
      ];
    } catch (PDOException $e) {
      error_log("Erro ao verificar status da loja: " . $e->getMessage());
      return ['status' => 'erro', 'motivo' => 'Erro interno do servidor.'];
    }
  }

  //===========================================================================================

  public function mudarStatusDaLoja($novoStatus)
  {
    try {
      $sql = "UPDATE parametros SET aberto = :novoStatus WHERE id = 1";

      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':novoStatus', $novoStatus, PDO::PARAM_STR);

      return $stmt->execute();
    } catch (PDOException $e) {
      error_log("Erro ao mudar status da loja: " . $e->getMessage());
      return false;
    }
  }

  //===========================================================================================

  public function pegarTodosOsBairros()
  {
    try {
      $sql = "SELECT Bairro FROM bairros";

      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao pegar os bairros: " . $e->getMessage());
      return [];
    }
  }
}
