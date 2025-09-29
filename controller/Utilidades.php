<?php

require_once 'session_init.php';
require_once 'Conexao.php';

class Utilidades
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

  //===========================================================================

  public function estaLogado()
  {
    return isset($_SESSION['fone']);
  }

  //===========================================================================

  public function pegarMeusEnderecos($fone)
  {
    try {
      $sql = "SELECT DISTINCT endereco, numero, bairro FROM vendas WHERE telefone = :fone";

      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':fone', $fone, PDO::PARAM_STR);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Erro ao buscar endereços: " . $e->getMessage());
      return [];
    }
  }

  //===========================================================================

  public function fecharMesaSeNecessario($mesa)
  {
    try {
      $sql = "SELECT Fechado FROM mesas WHERE Mesa = :mesa";
      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':mesa', $mesa, PDO::PARAM_INT);
      $stmt->execute();
      $dados = $stmt->fetch(PDO::FETCH_ASSOC);

      if (isset($dados['Fechado']) && $dados['Fechado'] == 'S') {
        $upt = $this->conexao->prepare("UPDATE mesas SET Fechado = 'N' WHERE mesa = :mesa");
        $upt->bindParam(':mesa', $mesa, PDO::PARAM_INT);
        return $upt->execute();
      }
      return false;
    } catch (PDOException $e) {
      error_log("Erro ao fechar mesa: " . $e->getMessage());
      return false;
    }
  }

  //===========================================================================

  public function exigeNomeQRCode()
  {
    try {
      $sql = "SELECT qrcodecomnome FROM parametros";
      $stmt = $this->conexao->prepare($sql);
      $stmt->execute();
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      return isset($resultado['qrcodecomnome']) && $resultado['qrcodecomnome'] == 'S';
    } catch (PDOException $e) {
      error_log("Erro ao verificar exigência de nome: " . $e->getMessage());
      return false;
    }
  }

  //===========================================================================

  public function recuperarNomeImagem($produto)
  {
    try {
      $sql = "SELECT imagem FROM mercadorias WHERE Codigo = :produto";
      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':produto', $produto, PDO::PARAM_INT);
      $stmt->execute();

      $dados = $stmt->fetch(PDO::FETCH_ASSOC);

      if (isset($dados['imagem'])) {
        return $dados['imagem'];
      }

      return null;
    } catch (PDOException $e) {
      error_log("Erro ao buscar imagem: " . $e->getMessage());
      return null;
    }
  }


  public function pegarTaxaPorBairro($bairroSelecionado, $taxaFixaEmpresa)
  {
    try {
      $sql = "SELECT taxa FROM bairros WHERE nome = :bairro LIMIT 1";
      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':bairro', $bairroSelecionado, PDO::PARAM_STR);
      $stmt->execute();
      $result = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($result && isset($result['taxa']) && floatval($result['taxa']) > 0) {
        return floatval($result['taxa']);
      } else {
        return floatval($taxaFixaEmpresa);
      }
    } catch (PDOException $e) {
      error_log("Erro ao verificar taxa do bairro: " . $e->getMessage());
      return floatval($taxaFixaEmpresa);
    }
  }
}
