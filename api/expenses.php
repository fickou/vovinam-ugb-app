<?php
require_once 'config.php';
require_once 'utils.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT e.*, s.name as season_name FROM expenses e JOIN seasons s ON e.season_id = s.id WHERE e.id = ?");
            $stmt->execute([$_GET['id']]);
            sendResponse($stmt->fetch());
        } elseif (isset($_GET['season_id'])) {
            $stmt = $pdo->prepare("SELECT e.*, s.name as season_name FROM expenses e JOIN seasons s ON e.season_id = s.id WHERE e.season_id = ? ORDER BY e.expense_date DESC");
            $stmt->execute([$_GET['season_id']]);
            sendResponse($stmt->fetchAll());
        } else {
            $stmt = $pdo->query("SELECT e.*, s.name as season_name FROM expenses e JOIN seasons s ON e.season_id = s.id ORDER BY e.expense_date DESC");
            sendResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $input = getJsonInput();
        if (!isset($input['season_id']) || !isset($input['amount']) || !isset($input['description'])) {
            sendResponse(['error' => 'Missing required fields'], 400);
        }
        
        $id = generateUUID();
        $stmt = $pdo->prepare("INSERT INTO expenses (id, season_id, amount, description, category, expense_date, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $input['season_id'],
            $input['amount'],
            $input['description'],
            $input['category'] ?? 'Divers',
            $input['expense_date'] ?? date('Y-m-d'),
            $input['recorded_by'] ?? null
        ]);
        sendResponse(['id' => $id, 'message' => 'Expense created']);
        break;

    case 'PUT':
        $input = getJsonInput();
        if (!isset($input['id'])) sendResponse(['error' => 'ID required'], 400);
        
        $stmt = $pdo->prepare("UPDATE expenses SET season_id = ?, amount = ?, description = ?, category = ?, expense_date = ? WHERE id = ?");
        $stmt->execute([
            $input['season_id'],
            $input['amount'],
            $input['description'],
            $input['category'],
            $input['expense_date'],
            $input['id']
        ]);
        sendResponse(['message' => 'Expense updated']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) sendResponse(['error' => 'ID required'], 400);
        $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        sendResponse(['message' => 'Expense deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
?>
