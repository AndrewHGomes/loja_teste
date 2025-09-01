<?php

require_once 'session_init.php';
require_once 'Conexao.php';
require_once 'Empresa.php';
require_once 'Categorias.php';
require_once 'Mercadorias.php';
require_once 'Utilitarios.php';
require_once 'Status.php';

try {
  $recurso = isset($_GET['recurso']) ? $_GET['recurso'] : null;
  $dados = [];

  switch ($recurso) {
    case 'empresa':
      $empresa = new Empresa;
      $dados = $empresa->objetoEmpresa();
      break;
    case 'categorias':
      $categorias = new Categorias;
      $dados = $categorias->buscarCategorias();
      break;
    case 'mercadorias':
      $mercadorias = new Mercadorias;
      $dados = $mercadorias->buscarMercadorias();
      break;
    case 'parametros':
      $utilitarios = new Utilitarios;
      $dados = $utilitarios->pegarParametros();
      break;
    case 'horarios':
      $utilitarios = new Utilitarios;
      $dados = $utilitarios->pegarHorarios();
      break;
    case 'status':
      $status = new Status;
      $dados = $status->statusDoDia();
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

exit;
