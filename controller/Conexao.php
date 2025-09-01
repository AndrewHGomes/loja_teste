<?php

require_once 'session_init.php';

class Conexao
{
  private static $instancia;
  private static $host = '127.0.0.1';
  private static $dbName = 'delivery_horadolanche';
  private static $charset = 'utf8';
  private static $root = 'root';
  private static $senha = '';

  private function __construct() {}

  public static function instancia()
  {
    if (!isset(self::$instancia)) {
      try {
        self::$instancia = new PDO(
          "mysql:host=" . self::$host . ";dbname=" . self::$dbName . ";charset=" . self::$charset,
          self::$root,
          self::$senha
        );

        self::$instancia->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        self::$instancia->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
      } catch (PDOException $e) {
        throw new Exception("Erro na conexão com o banco de dados: " . $e->getMessage());
      }
    }
    return self::$instancia;
  }
}

try {
  $conexao = Conexao::instancia();
} catch (Exception $e) {
  die($e->getMessage());
}
