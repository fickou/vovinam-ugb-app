<?php
require_once 'config.php';
require_once 'utils.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch all roles with profiles and emails
        $stmt = $pdo->query("
            SELECT ur.id, ur.user_id, ur.role, p.first_name, p.last_name, u.email
            FROM user_roles ur 
            LEFT JOIN profiles p ON ur.user_id = p.user_id
            LEFT JOIN users u ON ur.user_id = u.id
        ");
        $roles = $stmt->fetchAll();
        $users = [];
        foreach ($roles as $row) {
            $users[] = [
                'id' => $row['id'],
                'user_id' => $row['user_id'],
                'role' => $row['role'],
                'email' => $row['email'],
                'profile' => [
                    'first_name' => $row['first_name'],
                    'last_name' => $row['last_name']
                ]
            ];
        }
        sendResponse($users);
        break;

    case 'PUT':
        $input = getJsonInput();
        if (!isset($input['id']) || !isset($input['role']) || !isset($input['user_id'])) {
            sendResponse(['error' => 'ID, user_id and role required'], 400);
        }
        
        try {
            $pdo->beginTransaction();
            
            // Update role
            $stmt = $pdo->prepare("UPDATE user_roles SET role = ? WHERE id = ?");
            $stmt->execute([$input['role'], $input['id']]);
            
            // Update profile (first_name, last_name)
            if (isset($input['first_name']) && isset($input['last_name'])) {
                $stmt = $pdo->prepare("UPDATE profiles SET first_name = ?, last_name = ? WHERE user_id = ?");
                $stmt->execute([$input['first_name'], $input['last_name'], $input['user_id']]);
            }
            
            $pdo->commit();
            sendResponse(['message' => 'User updated successfully']);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            sendResponse(['error' => 'Update failed: ' . $e->getMessage()], 500);
        }
        break;

    case 'POST':
        $input = getJsonInput();
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        $firstName = $input['first_name'] ?? '';
        $lastName = $input['last_name'] ?? '';
        $role = $input['role'] ?? 'member';
        $memberId = $input['member_id'] ?? null;

        if (!$email || !$password || !$firstName || !$lastName) {
            sendResponse(['error' => 'All fields are required'], 400);
        }

        try {
            $pdo->beginTransaction();

            $userId = generateUUID();
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // 1. Create user
            $stmt = $pdo->prepare("INSERT INTO users (id, email, password) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $email, $hashedPassword]);

            // 2. Create profile
            $stmt = $pdo->prepare("INSERT INTO profiles (id, user_id, first_name, last_name) VALUES (?, ?, ?, ?)");
            $stmt->execute([generateUUID(), $userId, $firstName, $lastName]);

            // 3. Assign role
            $stmt = $pdo->prepare("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)");
            $stmt->execute([generateUUID(), $userId, $role]);

            // 4. Link member if provided
            if ($memberId) {
                $stmt = $pdo->prepare("UPDATE members SET user_id = ? WHERE id = ?");
                $stmt->execute([$userId, $memberId]);
            }

            $pdo->commit();
            sendResponse(['id' => $userId, 'message' => 'User created successfully']);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            sendResponse(['error' => 'Creation failed: ' . $e->getMessage()], 500);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'User ID required'], 400);
        }
        $userId = $_GET['id'];

        try {
            $pdo->beginTransaction();

            // Note: ON DELETE CASCADE handles user_roles and profiles
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);

            $pdo->commit();
            sendResponse(['message' => 'User deleted successfully']);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            sendResponse(['error' => 'Deletion failed: ' . $e->getMessage()], 500);
        }
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
?>
