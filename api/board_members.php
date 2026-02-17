<?php
require_once 'config.php';
require_once 'utils.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $seasonId = $_GET['season_id'] ?? null;
        if (!$seasonId) {
            sendResponse(['error' => 'Season ID required'], 400);
        }

        $stmt = $pdo->prepare("
            SELECT bm.*, m.first_name, m.last_name, m.email, m.phone, m.member_number 
            FROM board_members bm
            JOIN members m ON bm.member_id = m.id
            WHERE bm.season_id = ?
            ORDER BY bm.created_at ASC
        ");
        $stmt->execute([$seasonId]);
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $input = getJsonInput();
        if (!isset($input['member_id']) || !isset($input['season_id']) || !isset($input['position'])) {
            sendResponse(['error' => 'Member ID, Season ID and position required'], 400);
        }

        try {
            $id = generateUUID();
            $stmt = $pdo->prepare("INSERT INTO board_members (id, member_id, season_id, position) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['member_id'],
                $input['season_id'],
                $input['position']
            ]);
            sendResponse(['id' => $id, 'message' => 'Board member added']);
        } catch (Exception $e) {
            sendResponse(['error' => 'Failed to add board member: ' . $e->getMessage()], 500);
        }
        break;

    case 'PUT':
        $input = getJsonInput();
        if (!isset($input['id']) || !isset($input['position'])) {
            sendResponse(['error' => 'ID and position required'], 400);
        }

        try {
            $stmt = $pdo->prepare("UPDATE board_members SET position = ? WHERE id = ?");
            $stmt->execute([$input['position'], $input['id']]);
            sendResponse(['message' => 'Board member updated']);
        } catch (Exception $e) {
            sendResponse(['error' => 'Update failed: ' . $e->getMessage()], 500);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            sendResponse(['error' => 'ID required'], 400);
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM board_members WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(['message' => 'Board member removed']);
        } catch (Exception $e) {
            sendResponse(['error' => 'Deletion failed: ' . $e->getMessage()], 500);
        }
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
?>
