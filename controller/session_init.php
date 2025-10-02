<!-- sessio_init.php -->
<?php

session_set_cookie_params(0);

$telefoneLoja = "19987654321";
$nomeLoja = "NomeDaLoja_";

$telefoneHash = hash('sha256', $telefoneLoja);

$nomeSessao = $nomeLoja . $telefoneHash;

session_name($nomeSessao);

ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$dominios_permitidos = [
  'https://agapesi.ddns.com.br',
  'http://localhost'
];

$origem = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origem, $dominios_permitidos)) {
  header('Access-Control-Allow-Origin: ' . $origem);
}

header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

date_default_timezone_set('America/Fortaleza');
