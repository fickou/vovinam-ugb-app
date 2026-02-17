<?php
require_once 'api/config.php';
require_once 'api/notifications_service.php';

echo "=== UNPAID MONTHS DEBUG ===\n";
echo "Current Date: " . date('Y-m-d H:i:s') . "\n";

// 1. Get Active Season
$stmt = $pdo->query("SELECT * FROM seasons WHERE is_active = 1 LIMIT 1");
$season = $stmt->fetch();
echo "Season: {$season['name']} (Start: {$season['start_date']})\n";

// 2. Get Members
$stmt = $pdo->query("SELECT * FROM members WHERE status = 'active' LIMIT 5"); // Limit to 5
$members = $stmt->fetchAll();

foreach ($members as $member) {
    echo "\n------------------------------------------------\n";
    echo "Member: {$member['first_name']} {$member['last_name']} (Joined: {$member['created_at']})\n";
    
    // TRACE logic from getUnpaidMonths inline
    $unpaidMonths = [];
    $memberId = $member['id'];
    $seasonId = $season['id'];
    
    $checkStart = new DateTime($season['start_date']);
    $memberJoin = new DateTime($member['created_at']);
    
    echo "  >> Season Start: " . $checkStart->format('Y-m-d') . "\n";
    echo "  >> Member Join: " . $memberJoin->format('Y-m-d') . "\n";

    if ($memberJoin > $checkStart) {
        $checkStart = clone $memberJoin;
        echo "  >> Using Member Join Date\n";
    } else {
        echo "  >> Using Season Start Date\n";
    }
    $checkStart->modify('first day of this month');
    echo "  >> Final Start Check: " . $checkStart->format('Y-m-d') . "\n";

    $checkEnd = new DateTime();
    $checkEnd->modify('first day of last month');
    echo "  >> Check End (Last Month): " . $checkEnd->format('Y-m-d') . "\n";

    if ($checkStart <= $checkEnd) {
        $currentCheck = clone $checkStart;
        while ($currentCheck <= $checkEnd) {
            $mNum = (int)$currentCheck->format('n');
            $debugDate = $currentCheck->format('Y-m-d');
            
            $stmtMonth = $pdo->prepare("SELECT COUNT(*) FROM payments WHERE member_id = ? AND season_id = ? AND payment_type = 'monthly' AND month_number = ? AND status = 'VALIDATED'");
            $stmtMonth->execute([$memberId, $seasonId, $mNum]);
            $count = $stmtMonth->fetchColumn();
            
            echo "  >> Checking Month $mNum ($debugDate): Found $count payments.\n";
            
            if ($count == 0) {
                $unpaidMonths[] = $mNum;
            }
            
            $currentCheck->modify('+1 month');
        }
    } else {
        echo "  >> Start Date is after End Date. No checks performed.\n";
    }
    
    echo "  >> Result Unpaid: " . implode(', ', $unpaidMonths) . "\n";
}
?>
