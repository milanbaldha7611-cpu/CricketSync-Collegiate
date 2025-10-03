<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT t.*, m.match_status 
              FROM tickets t 
              LEFT JOIN matches m ON t.match_id = m.id 
              ORDER BY t.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($tickets);
    
} catch(PDOException $exception) {
    echo json_encode(['error' => $exception->getMessage()]);
}
?>