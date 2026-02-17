<?php
require_once 'config.php';
require_once 'utils.php';

try {
    // Total members
    $totalMembers = $pdo->query("SELECT COUNT(*) FROM members")->fetchColumn();

    // Active members
    $activeMembers = $pdo->query("SELECT COUNT(*) FROM members WHERE status = 'active'")->fetchColumn();

    // Total payments
    $totalPayments = $pdo->query("SELECT SUM(amount) FROM payments")->fetchColumn() ?: 0;

    // Active season
    $activeSeason = $pdo->query("SELECT name FROM seasons WHERE is_active = 1 LIMIT 1")->fetchColumn();

    sendResponse([
        'totalMembers' => (int)$totalMembers,
        'activeMembers' => (int)$activeMembers,
        'totalPayments' => (int)$totalPayments,
        'activeSeason' => $activeSeason ?: null,
        'unpaidAmount' => 0 // Simplified for now
    ]);
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}
?>
