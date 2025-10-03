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
    
    $teamName = $data['team_name'];
    $action = $data['action'];
    $pointsValue = $data['points_value'] ?? 2;
    
    // Get current team stats
    $stmt = $conn->prepare("SELECT * FROM teams WHERE name = ?");
    $stmt->execute([$teamName]);
    $team = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$team) {
        echo json_encode(['success' => false, 'message' => 'Team not found']);
        exit;
    }
    
    // Update based on action
    $newMatchesPlayed = $team['matches_played'] + 1;
    $newWins = $team['matches_won'];
    $newLosses = $team['matches_lost'];
    $newPoints = $team['points'];
    
    if ($action === 'win') {
        $newWins += 1;
        $newPoints += $pointsValue;
    } elseif ($action === 'loss') {
        $newLosses += 1;
    } elseif ($action === 'points') {
        $newPoints = $pointsValue;
        $newMatchesPlayed = $team['matches_played']; // Don't increment for manual points update
    }
    
    $stmt = $conn->prepare("UPDATE teams SET matches_played = ?, matches_won = ?, matches_lost = ?, points = ? WHERE name = ?");
    $stmt->execute([$newMatchesPlayed, $newWins, $newLosses, $newPoints, $teamName]);
    
    echo json_encode(['success' => true, 'message' => 'Rankings updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>