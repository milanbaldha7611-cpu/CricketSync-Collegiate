<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT * FROM matches ORDER BY match_date ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($matches);
    
} catch(PDOException $exception) {
    echo json_encode(['error' => $exception->getMessage()]);
}
?>