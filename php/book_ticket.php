<?php
require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON data');
    }
    
    $match_id = $data['match_id'];
    $quantity = (int)$data['quantity'];
    $holder_name = $data['holder_name'];
    $holder_email = $data['holder_email'];
    $holder_phone = $data['holder_phone'] ?? '';
    
    // Validate required fields
    if (empty($match_id) || empty($quantity) || empty($holder_name) || empty($holder_email)) {
        throw new Exception('Missing required fields');
    }
    
    // Get match details
    $match_query = "SELECT * FROM matches WHERE id = ? AND match_status = 'upcoming'";
    $match_stmt = $db->prepare($match_query);
    $match_stmt->execute([$match_id]);
    $match = $match_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$match) {
        throw new Exception('Match not found or not available for booking');
    }
    
    if ($match['available_seats'] < $quantity) {
        throw new Exception('Not enough seats available');
    }
    
    // Start transaction
    $db->beginTransaction();
    
    // Generate booking reference
    $booking_reference = 'CS' . date('Ymd') . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    
    // Calculate total amount
    $total_amount = $match['ticket_price'] * $quantity;
    
    // Generate match details string
    $match_details = $match['team1'] . ' vs ' . $match['team2'] . ' - ' . date('M d, Y', strtotime($match['match_date']));
    
    // Generate seat numbers
    $seat_numbers = [];
    for ($i = 1; $i <= $quantity; $i++) {
        $seat_numbers[] = 'S' . str_pad(rand(1, 500), 3, '0', STR_PAD_LEFT);
    }
    $seat_numbers_str = implode(', ', $seat_numbers);
    
    // Insert ticket booking
    $ticket_query = "INSERT INTO tickets (match_id, match_details, quantity, total_amount, booking_reference, seat_numbers, holder_name, holder_email, holder_phone, booking_status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')";
    $ticket_stmt = $db->prepare($ticket_query);
    $ticket_stmt->execute([
        $match_id, $match_details, $quantity, $total_amount, 
        $booking_reference, $seat_numbers_str, $holder_name, $holder_email, $holder_phone
    ]);
    
    // Update available seats
    $update_query = "UPDATE matches SET available_seats = available_seats - ? WHERE id = ?";
    $update_stmt = $db->prepare($update_query);
    $update_stmt->execute([$quantity, $match_id]);
    
    // Commit transaction
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'booking_reference' => $booking_reference,
        'total_amount' => $total_amount,
        'message' => 'Booking confirmed successfully!'
    ]);
    
} catch(Exception $exception) {
    // Rollback transaction if it was started
    if ($db->inTransaction()) {
        $db->rollback();
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $exception->getMessage()
    ]);
}
?>  