<?php

require_once 'session_init.php';

require 'config.php';
require 'utilitarios.php';


function DecryptString($valor, $chave)
{
  $palavra = "";
  for ($i = 0; $i <= strlen($valor) - 1; $i++) {
    $palavra .= chr(~(ord($valor[$i]) - $chave));
  }
  return $palavra;
}

if (isset($_GET['tel']) || isset($_GET['mesa'])) {


  if ($_GET['tel']) {
    $fone = DecryptString(utf8_decode($_GET['tel']), 10);
  } else {
    $fone = $_GET['mesa'];
  }


  $_SESSION['chave'] = md5(microtime() . $fone);
  $_SESSION['fone'] = $fone;
  $_SESSION['origem'] = 'W';
  unset($_SESSION['carrinho']);


  $uteis = new Utilitarios();

  if ($uteis->agenda() == 'S') {
    header("Location: agenda.php");
  } else {
    $atual = date("H:i:s");
    $_SESSION['inicio'] = $atual;


    header("Location: ../validate.html");
  }
} else {

  header("Location: https://agapesi.ddns.com.br");
}

exit();
