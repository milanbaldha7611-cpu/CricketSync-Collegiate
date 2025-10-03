<?php
session_start();
header('Content-Type: application/json');

// Check admin authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    $stmt = $conn->prepare("INSERT INTO matches (team1, team2, match_date, match_time, venue, ticket_price, available_seats, total_seats, match_status, team1_score, team2_score, winner, man_of_match, match_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $data['team1'],
        $data['team2'],
        $data['match_date'],
        $data['match_time'],
        $data['venue'],
        $data['ticket_price'],
        $data['available_seats'],
        $data['total_seats'],
        $data['match_status'] ?? 'upcoming',
        $data['team1_score'] ?? null,
        $data['team2_score'] ?? null,
        $data['winner'] ?? null,
        $data['man_of_match'] ?? null,
        $data['match_summary'] ?? null
    ]);
    
    echo json_encode(['success' => true, 'message' => 'Match added successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>