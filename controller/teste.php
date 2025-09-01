<?php

require_once 'session_init.php';
// Função de criptografia
function EncryptString($valor, $chave)
{
  $palavra = "";
  for ($i = 0; $i <= strlen($valor) - 1; $i++) {
    $palavra .= chr(~(ord($valor[$i]) + $chave));
  }
  return $palavra;
}

// Seu número de telefone a ser codificado
$telefone = "19989413147"; // Exemplo: "11987654321"
$chave = 10;

// Codificando o número
$telefone_codificado = EncryptString($telefone, $chave);

// Exibindo o resultado
echo "Número original: " . $telefone . "<br>";
echo "Número codificado: " . $telefone_codificado;
