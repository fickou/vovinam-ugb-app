<?php
require_once 'config.php';
require_once 'utils.php';

$season_id = $_GET['season_id'] ?? 'all';

try {
    // Basic stats
    $totalMembers = $pdo->query("SELECT COUNT(*) FROM members")->fetchColumn();
    $activeMembers = $pdo->query("SELECT COUNT(*) FROM members WHERE status = 'active'")->fetchColumn();

    // Payments stats
    $sql = "SELECT amount, payment_type, payment_method FROM payments";
    $params = [];
    if ($season_id !== 'all') {
        $sql .= " WHERE season_id = ?";
        $params[] = $season_id;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $payments = $stmt->fetchAll();

    $totalPayments = 0;
    $registrationPayments = 0;
    $monthlyPayments = 0;
    $otherPayments = 0;
    $paymentsByMethod = [];

    foreach ($payments as $p) {
        $totalPayments += $p['amount'];
        if ($p['payment_type'] === 'registration') $registrationPayments += $p['amount'];
        elseif ($p['payment_type'] === 'monthly') $monthlyPayments += $p['amount'];
        else $otherPayments += $p['amount'];
        
        $method = $p['payment_method'];
        $paymentsByMethod[$method] = ($paymentsByMethod[$method] ?? 0) + $p['amount'];
    }

    // Expenses stats
    $sqlExp = "SELECT amount FROM expenses";
    $paramsExp = [];
    if ($season_id !== 'all') {
        $sqlExp .= " WHERE season_id = ?";
        $paramsExp[] = $season_id;
    }
    
    $stmtExp = $pdo->prepare($sqlExp);
    $stmtExp->execute($paramsExp);
    $expenses = $stmtExp->fetchAll();
    
    $totalExpenses = 0;
    foreach ($expenses as $e) {
        $totalExpenses += $e['amount'];
    }

    sendResponse([
        'totalMembers' => (int)$totalMembers,
        'activeMembers' => (int)$activeMembers,
        'totalPayments' => (int)$totalPayments,
        'registrationPayments' => (int)$registrationPayments,
        'monthlyPayments' => (int)$monthlyPayments,
        'otherPayments' => (int)$otherPayments,
        'totalExpenses' => (int)$totalExpenses,
        'netBalance' => (int)($totalPayments - $totalExpenses),
        'paymentsByMethod' => $paymentsByMethod
    ]);

} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}
?>
