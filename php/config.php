<?php
class Database {
    private $host = "localhost";           // MySQL server
    private $db_name = "cricketsync_collegiate"; // your DB name
    private $username = "root";            // default in XAMPP
    private $password = "";                // default in XAMPP
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            die(json_encode([
                'success' => false,
                'message' => "Database connection error: " . $exception->getMessage()
            ]));
        }
        return $this->conn;
    }
}
?>
