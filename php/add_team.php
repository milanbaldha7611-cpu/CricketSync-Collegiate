<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    $stmt = $conn->prepare("INSERT INTO teams (name, college, captain, coach, matches_played, matches_won, matches_lost, points, net_run_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $data['name'],
        $data['college'],
        $data['captain'] ?? null,
        $data['coach'] ?? null,
        $data['matches_played'] ?? 0,
        $data['matches_won'] ?? 0,
        $data['matches_lost'] ?? 0,
        $data['points'] ?? 0,
        $data['net_run_rate'] ?? 0.00
    ]);
    
    echo json_encode(['success' => true, 'message' => 'Team added successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
