<?php
require_once 'config.php';
require_once 'utils.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM members WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            sendResponse($stmt->fetch());
        } elseif (isset($_GET['user_id'])) {
            $stmt = $pdo->prepare("SELECT * FROM members WHERE user_id = ?");
            $stmt->execute([$_GET['user_id']]);
            sendResponse($stmt->fetch());
        } elseif (isset($_GET['unlinked']) && $_GET['unlinked'] === 'true') {
            $stmt = $pdo->query("SELECT * FROM members WHERE user_id IS NULL ORDER BY member_number ASC");
            sendResponse($stmt->fetchAll());
        } elseif (isset($_GET['status'])) {
            $stmt = $pdo->prepare("SELECT * FROM members WHERE status = ? ORDER BY member_number ASC");
            $stmt->execute([$_GET['status']]);
            sendResponse($stmt->fetchAll());
        } else {
            $stmt = $pdo->query("SELECT * FROM members ORDER BY member_number ASC");
            sendResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $input = getJsonInput();
        $id = generateUUID();
        $stmt = $pdo->prepare("INSERT INTO members (id, first_name, last_name, phone, email, photo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $input['first_name'],
            $input['last_name'],
            $input['phone'] ?? null,
            $input['email'] ?? null,
            $input['photo_url'] ?? null,
            $input['status'] ?? 'active'
        ]);
        sendResponse(['id' => $id, 'message' => 'Member created']);
        break;

    case 'PUT':
        $input = getJsonInput();
        if (!isset($input['id'])) sendResponse(['error' => 'ID required'], 400);
        
        $stmt = $pdo->prepare("UPDATE members SET first_name = ?, last_name = ?, phone = ?, email = ?, photo_url = ?, status = ? WHERE id = ?");
        $stmt->execute([
            $input['first_name'],
            $input['last_name'],
            $input['phone'] ?? null,
            $input['email'] ?? null,
            $input['photo_url'] ?? null,
            $input['status'] ?? 'active',
            $input['id']
        ]);
        sendResponse(['message' => 'Member updated']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) sendResponse(['error' => 'ID required'], 400);
        $stmt = $pdo->prepare("DELETE FROM members WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        sendResponse(['message' => 'Member deleted']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
?>
