<?php
define('SMS_PROVIDER', 'mock');
require_once 'api/config.php';
require_once 'api/notifications_service.php';
require_once 'api/utils.php';

header('Content-Type: text/plain');

echo "=== TEST REMINDERS LOGIC ===\n";

try {
    $pdo->beginTransaction();

    // 1. Setup Test Data
    $seasonId = generateUUID();
    $memberId = generateUUID();
    
    // Create a season starting 3 months ago
    $threeMonthsAgo = new DateTime();
    $threeMonthsAgo->modify('-3 months');
    $startDate = $threeMonthsAgo->format('Y-m-d');
    
    $oneMonthAgo = new DateTime();
    $oneMonthAgo->modify('-1 month');
    $endDate = $oneMonthAgo->format('Y-m-d'); // Ends last month just to be safe, or future

    // Actually, make season active and long
    $nextYear = new DateTime();
    $nextYear->modify('+1 year');
    $endDate = $nextYear->format('Y-m-d');

    echo "Creating Test Season ($startDate to $endDate)...\n";
    $pdo->prepare("INSERT INTO seasons (id, name, start_date, end_date, is_active, monthly_fee, registration_fee) VALUES (?, 'TEST SEASON', ?, ?, 1, 1000, 2000)")
        ->execute([$seasonId, $startDate, $endDate]);

    // Create a member who joined 2 months ago (so owes 2 months: 2 months ago and last month)
    $twoMonthsAgo = new DateTime();
    $twoMonthsAgo->modify('-2 months');
    $joinDate = $twoMonthsAgo->format('Y-m-d H:i:s');
    
    echo "Creating Test Member (Joined $joinDate)...\n";
    $pdo->prepare("INSERT INTO members (id, first_name, last_name, phone, status, created_at) VALUES (?, 'TestUser', 'Test', '+221770000000', 'active', ?)")
        ->execute([$memberId, $joinDate]);

    // No payments made.

    // 2. Run Process
    echo "Running processGlobalReminders...\n";
    $log = processGlobalReminders($pdo);
    
    echo "\n=== OUTPUT LOG ===\n";
    echo $log;
    echo "==================\n";

    // 3. Verify
    // Expect: 2 months unpaid (Month -2, Month -1).
    // Note: Month numbers are 1-12.
    // Example: If today is Feb (2), Last month is Jan (1).
    // Joined 2 months ago = Dec (12).
    // So unpaid: Dec, Jan.
    
    // Check if reminders were "sent" (inserted in DB)
    $stmt = $pdo->prepare("SELECT * FROM reminders WHERE member_id = ?");
    $stmt->execute([$memberId]);
    $reminders = $stmt->fetchAll();
    
    echo "\n=== INSERTED REMINDERS ===\n";
    foreach ($reminders as $r) {
        echo "Type: {$r['type']}, Month: {$r['month_number']}, Status: {$r['status']}\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
} finally {
    $pdo->rollBack();
    echo "\nRolled back changes.\n";
}
?>
