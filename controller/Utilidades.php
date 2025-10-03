<?php

require_once 'Conexao.php';

class Utilidades
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

  //===========================================================================

  public function estaLogado()
  {
    return isset($_SESSION['usuario']['telefone']) && !empty($_SESSION['usuario']['telefone']);
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


  public function pegarTaxaPorBairro($bairroSelecionado)
  {
    try {
      $sql = "SELECT Valor FROM bairros WHERE Bairro = :bairro LIMIT 1";
      $stmt = $this->conexao->prepare($sql);
      $stmt->bindParam(':bairro', $bairroSelecionado, PDO::PARAM_STR);
      $stmt->execute();
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado && isset($resultado['Valor'])) {
        return floatval($resultado['Valor']);
      } else {
        return null;
      }
    } catch (PDOException $e) {
      error_log("Erro ao verificar taxa do bairro: " . $e->getMessage());
      return null;
    }
  }
}
