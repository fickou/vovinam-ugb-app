<?php
require_once 'config.php';
require_once 'utils.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT p.*, m.first_name, m.last_name, m.member_number, s.name as season_name FROM payments p JOIN members m ON p.member_id = m.id JOIN seasons s ON p.season_id = s.id WHERE p.id = ?");
            $stmt->execute([$_GET['id']]);
            $payment = $stmt->fetch();
            if ($payment) {
                $payment['member'] = [
                    'first_name' => $payment['first_name'],
                    'last_name' => $payment['last_name'],
                    'member_number' => $payment['member_number']
                ];
                $payment['season'] = ['name' => $payment['season_name']];
            }
            sendResponse($payment);
        } elseif (isset($_GET['member_id'])) {
             $stmt = $pdo->prepare("SELECT p.*, s.name as season_name FROM payments p JOIN seasons s ON p.season_id = s.id WHERE p.member_id = ? ORDER BY p.payment_date DESC");
             $stmt->execute([$_GET['member_id']]);
             $payments = $stmt->fetchAll();
             foreach ($payments as &$p) {
                 $p['season'] = ['name' => $p['season_name']];
             }
             sendResponse($payments);
        } else {
            $stmt = $pdo->query("SELECT p.*, m.first_name, m.last_name, m.member_number, s.name as season_name FROM payments p JOIN members m ON p.member_id = m.id JOIN seasons s ON p.season_id = s.id ORDER BY p.payment_date DESC");
            $payments = $stmt->fetchAll();
            foreach ($payments as &$p) {
                $p['member'] = [
                    'first_name' => $p['first_name'],
                    'last_name' => $p['last_name'],
                    'member_number' => $p['member_number']
                ];
                $p['season'] = ['name' => $p['season_name']];
            }
            sendResponse($payments);
        }
        break;

    case 'POST':
        try {
            $input = getJsonInput();
            $id = generateUUID();
            $stmt = $pdo->prepare("INSERT INTO payments (id, member_id, season_id, amount, payment_type, payment_method, payment_date, month_number, proof_url, notes, recorded_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['member_id'],
                $input['season_id'],
                $input['amount'],
                $input['payment_type'],
                $input['payment_method'],
                $input['payment_date'] ?? date('Y-m-d'),
                (!empty($input['month_number'])) ? $input['month_number'] : null,
                $input['proof_url'] ?? null,
                $input['notes'] ?? null,
                $input['recorded_by'] ?? null,
                $input['status'] ?? 'VALIDATED'
            ]);
            
            // If it's a registration payment and it's validated, update the registrations table
            if ($input['payment_type'] === 'registration' && ($input['status'] ?? 'VALIDATED') === 'VALIDATED') {
                $upd = $pdo->prepare("INSERT INTO registrations (id, member_id, season_id, registration_date, registration_fee_paid, is_validated) 
                                      VALUES (?, ?, ?, ?, 1, 1) 
                                      ON DUPLICATE KEY UPDATE registration_fee_paid = 1, is_validated = 1");
                $upd->execute([generateUUID(), $input['member_id'], $input['season_id'], $input['payment_date'] ?? date('Y-m-d')]);
            }
            
            sendResponse(['id' => $id, 'message' => 'Payment recorded']);
        } catch (PDOException $e) {
            sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
        break;

    case 'PUT':
        $input = getJsonInput();
        if (!isset($input['id'])) sendResponse(['error' => 'ID required'], 400);
        
        $fields = [];
        $params = [];
        
        $allowedFields = ['amount', 'payment_type', 'payment_method', 'payment_date', 'month_number', 'notes', 'status', 'proof_url'];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        
        if (empty($fields)) sendResponse(['error' => 'No fields to update'], 400);
        
        $params[] = $input['id'];
        $sql = "UPDATE payments SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        // If we just validated a registration payment, update the registrations table
        if (isset($input['status']) && $input['status'] === 'VALIDATED') {
             $stmtP = $pdo->prepare("SELECT member_id, season_id, payment_type, payment_date FROM payments WHERE id = ?");
             $stmtP->execute([$input['id']]);
             $paymentInfo = $stmtP->fetch();
             if ($paymentInfo && $paymentInfo['payment_type'] === 'registration') {
                 $upd = $pdo->prepare("INSERT INTO registrations (id, member_id, season_id, registration_date, registration_fee_paid, is_validated) 
                                       VALUES (?, ?, ?, ?, 1, 1) 
                                       ON DUPLICATE KEY UPDATE registration_fee_paid = 1, is_validated = 1");
                 $upd->execute([generateUUID(), $paymentInfo['member_id'], $paymentInfo['season_id'], $paymentInfo['payment_date']]);
             }
        }
        
        sendResponse(['message' => 'Payment updated']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) sendResponse(['error' => 'ID required'], 400);
        $stmt = $pdo->prepare("DELETE FROM payments WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        sendResponse(['message' => 'Payment deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
?>
