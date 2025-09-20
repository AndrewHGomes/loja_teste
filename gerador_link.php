<?php

function EncryptString($valor)
{
  $chave = 10;
  $tamanho = strlen($valor);
  $retorno = "";
  for ($i = 0; $i < $tamanho; $i++) {
    $retorno .= chr(ord($valor[$i]) + $chave);
  }
  return $retorno;
}

$telefone_teste = "5519989716177";

$telefone_criptografado = EncryptString($telefone_teste);

$dominio = "http://localhost/loja_teste";
$link_gerado = $dominio . "/validate.html?tel=" . urlencode($telefone_criptografado);

?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerador de Link</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }

    .box {
      background-color: #f4f4f4;
      padding: 15px;
      border: 1px solid #ddd;
      word-wrap: break-word;
    }

    .info {
      margin-top: 20px;
    }
  </style>
</head>

<body>
  <h1>Gerador de Link para Teste</h1>

  <p>O link criptografado que você pode usar para testar é:</p>
  <div class="box">
    <a href="<?php echo $link_gerado; ?>"><?php echo htmlspecialchars($link_gerado); ?></a>
  </div>

  <div class="info">
    <p><strong>Instruções:</strong></p>
    <p>1. Abra este arquivo (<code>gerador_link.php</code>) no seu navegador.</p>
    <p>2. Clique no link gerado acima para simular um acesso pelo WhatsApp.</p>
    <p>3. Verifique se o `validate.php` funciona corretamente e te redireciona para a página principal.</p>
  </div>

</body>

</html>