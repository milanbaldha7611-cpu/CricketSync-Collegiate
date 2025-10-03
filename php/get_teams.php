<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT * FROM teams ORDER BY points DESC, net_run_rate DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($teams);
    
} catch(PDOException $exception) {
    echo json_encode(['error' => $exception->getMessage()]);
}
?>