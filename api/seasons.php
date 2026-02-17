<?php
require_once 'config.php';
require_once 'utils.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM seasons WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            sendResponse($stmt->fetch());
        } else {
            $stmt = $pdo->query("SELECT * FROM seasons ORDER BY start_date DESC");
            sendResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $input = getJsonInput();
        $id = generateUUID();
        $stmt = $pdo->prepare("INSERT INTO seasons (id, name, start_date, end_date, registration_fee, monthly_fee, annual_total, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $input['name'],
            $input['start_date'],
            $input['end_date'],
            $input['registration_fee'] ?? 2000,
            $input['monthly_fee'] ?? 1000,
            $input['annual_total'] ?? 10000,
            $input['is_active'] ?? false
        ]);
        sendResponse(['id' => $id, 'message' => 'Season created']);
        break;

    case 'PUT':
        $input = getJsonInput();
        if (!isset($input['id'])) sendResponse(['error' => 'ID required'], 400);
        
        $stmt = $pdo->prepare("UPDATE seasons SET name = ?, start_date = ?, end_date = ?, registration_fee = ?, monthly_fee = ?, annual_total = ?, is_active = ? WHERE id = ?");
        $stmt->execute([
            $input['name'],
            $input['start_date'],
            $input['end_date'],
            $input['registration_fee'],
            $input['monthly_fee'],
            $input['annual_total'],
            $input['is_active'],
            $input['id']
        ]);
        sendResponse(['message' => 'Season updated']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) sendResponse(['error' => 'ID required'], 400);
        $stmt = $pdo->prepare("DELETE FROM seasons WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        sendResponse(['message' => 'Season deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
?>
