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
    
    $stmt = $conn->prepare("INSERT INTO players (name, team, college, role, matches_played, runs_scored, wickets_taken, batting_average, bowling_average, highest_score, best_bowling) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $data['name'],
        $data['team'],
        $data['college'],
        $data['role'],
        $data['matches_played'] ?? 0,
        $data['runs_scored'] ?? 0,
        $data['wickets_taken'] ?? 0,
        $data['batting_average'] ?? 0.00,
        $data['bowling_average'] ?? 0.00,
        $data['highest_score'] ?? 0,
        $data['best_bowling'] ?? null
    ]);
    
    echo json_encode(['success' => true, 'message' => 'Player added successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>