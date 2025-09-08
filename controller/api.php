<?php

ob_start();

require_once 'session_init.php';
require_once 'Conexao.php';
require_once 'Empresa.php';
require_once 'Produtos.php';

try {
  $recurso = isset($_GET['recurso']) ? $_GET['recurso'] : null;
  $dados = [];

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
    case 'detalhes-produtos':
      $cod = isset($_GET['cod']) ? (int)$_GET['cod'] : null;
      if ($cod) {
        $produtos = new Produtos();
        $dados = $produtos->pegarDetalhesDosProdutos($cod);
      } else {
        http_response_code(400);
        echo json_encode(['message' => 'Código do produto não especificado.']);
        exit;
      }
      break;
    case 'tamanhos':
      $cod = isset($_GET['cod']) ? (int)$_GET['cod'] : null;
      if ($cod) {
        $produtos = new Produtos();
        $dados = $produtos->pegarTamanhosDosProdutos($cod);
      } else {
        http_response_code(400);
        echo json_encode(['message' => 'Código do produto não especificado.']);
        exit;
      }
      break;
    case 'ingredientes':
      $cod = isset($_GET['cod']) ? (int)$_GET['cod'] : null;
      if ($cod) {
        $produtos = new Produtos();
        $ingredientes = $produtos->pegarIngredientesDosProdutos($cod);
        $dados = ['ingredientes' => $ingredientes];
      } else {
        http_response_code(400);
        echo json_encode(['message' => 'Código do produto não especificado.']);
        exit;
      }
      break;
    case 'bordas':
      $produtos = new Produtos();
      $dados = $produtos->pegarBordas();
      break;
    default:
      http_response_code(400);
      echo json_encode(['message' => 'Recurso não especificado.']);
      exit;
  }

  if ($dados) {
    http_response_code(200);
    echo json_encode($dados);
  } else {
    http_response_code(404);
    echo json_encode([]);
  }
} catch (Exception $e) {
  http_response_code(500);
  error_log("Erro na API: " . $e->getMessage());
  echo json_encode(['message' => 'Ocorreu um erro interno.']);
}

ob_end_flush();
exit;
