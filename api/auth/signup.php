<?php
require_once '../config.php';
require_once '../utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';
$firstName = $input['first_name'] ?? '';
$lastName = $input['last_name'] ?? '';

if (!$email || !$password || !$firstName || !$lastName) {
    sendResponse(['error' => 'All fields are required'], 400);
}

$userId = generateUUID();
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Check if email already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    sendResponse(['error' => 'Cet email est déjà utilisé'], 400);
}

try {
    $pdo->beginTransaction();
    
    // Create user
    $stmt = $pdo->prepare("INSERT INTO users (id, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$userId, $email, $hashedPassword]);
    
    // Create profile
    $stmt = $pdo->prepare("INSERT INTO profiles (id, user_id, first_name, last_name) VALUES (?, ?, ?, ?)");
    $stmt->execute([generateUUID(), $userId, $firstName, $lastName]);
    
    // Assign default role
    $stmt = $pdo->prepare("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, 'member')");
    $stmt->execute([generateUUID(), $userId]);
    
    $pdo->commit();
    
    sendResponse(['message' => 'User created successfully', 'id' => $userId]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendResponse(['error' => 'Signup failed: ' . $e->getMessage()], 500);
}
