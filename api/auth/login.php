<?php
require_once '../config.php';
require_once '../utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (!$email || !$password) {
    sendResponse(['error' => 'Email and password required'], 400);
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    // Return user info and a fake session/token (for now)
    unset($user['password']);
    
    // Get roles
    $stmt = $pdo->prepare("SELECT role FROM user_roles WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $user['roles'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    sendResponse(['user' => $user, 'session' => ['access_token' => bin2hex(random_bytes(16))]]);
} else {
    sendResponse(['error' => 'Invalid credentials'], 401);
}
