<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT * FROM players ORDER BY runs_scored DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($players);
    
} catch(PDOException $exception) {
    echo json_encode(['error' => $exception->getMessage()]);
}
?>