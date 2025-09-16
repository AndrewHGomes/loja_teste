<?php

ob_start();

require_once 'session_init.php';
require_once 'Conexao.php';
require_once 'Empresa.php';
require_once 'Produtos.php';

try {
  $metodo = $_SERVER['REQUEST_METHOD'];
  $recurso = isset($_GET['recurso']) ? $_GET['recurso'] : null;
  $dados = [];
  $response_code = 200;

  if ($metodo === 'GET') {

    switch ($recurso) {
      case 'empresa':
        $empresa = new Empresa();
        $dados = $empresa->pegarDadosDaEmpresa();
        break;
      case 'horarios':
        $empresa = new Empresa();
        $dados = $empresa->pegarHorariosDaEmpresa();
        break;
      case 'produtos':
        $produtos = new Produtos();
        $dados = $produtos->pegarTodosOsProdutos();
        break;
      case 'categorias':
        $produtos = new Produtos();
        $dados = $produtos->pegarCategorias();
        break;
      case 'detalhes-produtos':
        $cod = isset($_GET['cod']) ? $_GET['cod'] : null;
        if ($cod) {
          $produtos = new Produtos();
          $dados = $produtos->pegarDetalhesDosProdutos($cod);
        } else {
          $response_code = 400;
          $dados = ['message' => 'Código do produto não especificado.'];
        }
        break;
      case 'tamanhos':
        $cod = isset($_GET['cod']) ? $_GET['cod'] : null;
        if ($cod) {
          $produtos = new Produtos();
          $dados = $produtos->pegarTamanhosDosProdutos($cod);
        } else {
          $response_code = 400;
          $dados = ['message' => 'Código do produto não especificado.'];
        }
        break;
      case 'ingredientes':
        $cod = isset($_GET['cod']) ? $_GET['cod'] : null;
        if ($cod) {
          $produtos = new Produtos();
          $ingredientes = $produtos->pegarIngredientesDosProdutos($cod);
          $dados = ['ingredientes' => $ingredientes];
        } else {
          $response_code = 400;
          $dados = ['message' => 'Código do produto não especificado.'];
        }
        break;
      case 'bordas':
        $produtos = new Produtos();
        $dados = $produtos->pegarBordas();
        break;
      case 'pedidos-anteriores':
        $fone = isset($_GET['fone']) ? $_GET['fone'] : null;
        if ($fone) {
          $produtos = new Produtos();
          $dados = $produtos->pegarPedidosAnteriores($fone);
        } else {
          $response_code = 400;
          $dados = ['message' => 'Telefone não especificado.'];
        }
        break;
      case 'detalhes-pedidos-anteriores':
        $cod = isset($_GET['codigo']) ? $_GET['codigo'] : null;
        if ($cod) {
          $produtos = new Produtos();
          $dados = $produtos->pegarDetalhesPedidosAnteriores($cod);
        } else {
          $response_code = 400;
          $dados = ['message' => 'Código do pedido não especificado.'];
        }
        break;
      case 'produto-selecionado':
        if (isset($_SESSION['produto_selecionado'])) {
          $dados = ['status' => 'success', 'produto' => $_SESSION['produto_selecionado']];
        } else {
          $response_code = 404;
          $dados = ['status' => 'error', 'message' => 'Nenhum produto selecionado na sessão.'];
        }
        break;
      default:
        $response_code = 400;
        $dados = ['message' => 'Recurso GET não especificado.'];
    }
  } elseif ($metodo === 'POST') {

    switch ($recurso) {
      case 'selecionar-produto':
        $json_payload = file_get_contents('php://input');
        $payload = json_decode($json_payload, true);
        if (isset($payload['produto']) && isset($payload['descricao'])) {
          $_SESSION['produto_selecionado'] = $payload;
          $dados = ['status' => 'success', 'message' => 'Dados do produto armazenados na sessão.'];
        } else {
          $response_code = 400;
          $dados = ['status' => 'error', 'message' => 'Dados do produto inválidos.'];
        }
        break;
      default:
        $response_code = 400;
        $dados = ['message' => 'Recurso POST não especificado.'];
    }
  } else {
    $response_code = 405;
    $dados = ['message' => 'Método não permitido.'];
  }


  http_response_code($response_code);
  echo json_encode($dados);
} catch (Exception $e) {
  http_response_code(500);
  error_log("Erro na API: " . $e->getMessage());
  echo json_encode(['message' => 'Ocorreu um erro interno.']);
}

ob_end_flush();
exit;
