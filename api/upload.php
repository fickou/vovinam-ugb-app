<?php
require_once 'config.php';
require_once 'utils.php';

// Define the uploads directory at the project root
$uploadDir = __DIR__ . '/../uploads/proofs/';

// Create directory if it doesn't exist
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        // Fallback or error log if mkdir fails
        error_log("Failed to create directory: " . $uploadDir);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file'])) {
        sendResponse(['error' => 'No file uploaded'], 400);
    }

    $file = $_FILES['file'];
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = generateUUID() . '.' . $extension;
    $targetFile = $uploadDir . $fileName;

    $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    if (!in_array(strtolower($extension), $allowedExtensions)) {
        sendResponse(['error' => 'Invalid file type'], 400);
    }

    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        // Return the relative path for the public access
        sendResponse(['url' => '/uploads/proofs/' . $fileName]);
    } else {
        sendResponse(['error' => 'Failed to move uploaded file'], 500);
    }
} else {
    sendResponse(['error' => 'Method not allowed'], 405);
}
?>
