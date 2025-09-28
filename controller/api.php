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
      case 'tamanhos':
        $cod = isset($_GET['cod']) ? $_GET['cod'] : null;
        if ($cod) {
          $produtos = new Produtos();
          $dados = $produtos->pegarTamanhosDosProdutos($cod);
        }
        break;
      case 'complementos':
        $codigos = isset($_GET['codigos']) ? $_GET['codigos'] : null;
        if ($codigos) {
          $produtos = new Produtos();
          $dados = $produtos->pegarComplementos($codigos);
        } else {
          $response_code = 400;
          $dados = ['message' => 'Códigos de complemento não especificados.'];
        }
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
      case 'sabores':
        $cod = isset($_GET['cod']) ? $_GET['cod'] : null;
        if ($cod) {
          $produtos = new Produtos();
          $dados = $produtos->pegarSaboresDosProdutos($cod);
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
        $dados = isset($_SESSION['produto_selecionado']) ? $_SESSION['produto_selecionado'] : null;
        break;
      case 'pegar-carrinho':
        $dados = isset($_SESSION['carrinho']) ? $_SESSION['carrinho'] : [];
        break;
      case 'usuario-logado':
        $dados = (isset($_SESSION['usuario']['telefone']) && !empty($_SESSION['usuario']['telefone'])) ? $_SESSION['usuario'] : null;
        break;
      case 'dados-sessao':
        $dados = [
          'usuario' => isset($_SESSION['usuario']) ? $_SESSION['usuario'] : null,
          'carrinho' => isset($_SESSION['carrinho']) ? $_SESSION['carrinho'] : [],
        ];
        break;
      case 'pegar-pedido-finalizacao':
        $dados = isset($_SESSION['pedido_finalizacao']) ? $_SESSION['pedido_finalizacao'] : null;
        if (!$dados) {
          $response_code = 404;
          $dados = ['message' => 'Nenhum pedido encontrado na sessão.'];
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
          $dados = ['message' => 'Dados do produto armazenados na sessão.'];
        } else {
          $response_code = 400;
          $dados = ['message' => 'Dados do produto inválidos.'];
        }
        break;
      case 'adicionar-ao-carrinho':
        $json_payload = file_get_contents('php://input');
        $payload = json_decode($json_payload, true);
        if (isset($payload) && !empty($payload)) {
          $_SESSION['carrinho'][] = $payload;
          $dados = ['message' => 'Produto adicionado ao carrinho.'];
        } else {
          $response_code = 400;
          $dados = ['message' => 'Dados do produto inválidos para o carrinho.'];
        }
        break;
      case 'limpar-carrinho':
        $_SESSION['carrinho'] = [];
        $dados = ['message' => 'Carrinho limpo com sucesso.'];
        break;
      case 'remover-item-carrinho':
        $json_payload = file_get_contents('php://input');
        $payload = json_decode($json_payload, true);
        if (isset($payload['index'])) {
          $index = $payload['index'];
          if (isset($_SESSION['carrinho'][$index])) {
            array_splice($_SESSION['carrinho'], $index, 1);
            $dados = ['message' => 'Produto removido do carrinho.'];
          } else {
            $dados = ['message' => 'Índice do produto inválido.'];
          }
        } else {
          $response_code = 400;
          $dados = ['message' => 'Índice do produto não especificado.'];
        }
        break;
      case 'salvar-pedido-sessao':
        $json_payload = file_get_contents('php://input');
        $payload = json_decode($json_payload, true);
        if (isset($payload['carrinho']) && isset($payload['subtotal'])) {
          $_SESSION['pedido_finalizacao'] = [
            'carrinho' => $payload['carrinho'],
            'subtotal' => $payload['subtotal']
          ];
          $dados = ['message' => 'Pedido salvo na sessão para finalização.', 'sucesso' => true];
        } else {
          $response_code = 400;
          $dados = ['message' => 'Dados de carrinho ou subtotal ausentes.', 'sucesso' => false];
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
