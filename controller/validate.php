<?php

require_once 'session_init.php';
require_once 'Conexao.php';
require_once 'Empresa.php';
require_once 'Utilidades.php';

unset($_SESSION['carrinho']);

$resposta = ['status' => 'erro'];

if (isset($_GET['tel'])) {

  function DecryptString($valor)
  {
    $chave = 10;
    $retorno = "";

    $valor_decodificado = utf8_decode($valor);

    for ($i = 0; $i < strlen($valor_decodificado); $i++) {
      $retorno .= chr(~(ord($valor_decodificado[$i]) - $chave));
    }
    return $retorno;
  }

  $fone_criptografado = $_GET['tel'];
  $fone = DecryptString($fone_criptografado);

  if (strlen($fone) >= 11 && strlen($fone) <= 14) {
    $_SESSION['fone'] = $fone;
    $_SESSION['origem'] = 'W';
    $_SESSION['inicio'] = date("H:i:s");

    $resposta['status'] = 'ok';
  }
} elseif (isset($_GET['mesa'])) {
  $mesa = $_GET['mesa'];

  $_SESSION['origem'] = 'M';
  $_SESSION['fone'] = $mesa;
  $_SESSION['inicio'] = date("H:i:s");

  $resposta['status'] = 'ok';
}

header('Content-Type: application/json');
echo json_encode($resposta);
exit;
