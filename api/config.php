<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'vovinam_ugb');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    header('Content-Type: application/json', true, 500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Notification Configuration
// Notification Configuration
// Choose provider: 'traccar', 'twilio', 'logismarketing', or 'mock'
if (!defined('SMS_PROVIDER')) {
    define('SMS_PROVIDER', 'traccar'); 
} 

// TRACCAR SMS GATEWAY CONFIG (App: "Traccar SMS Gateway")
// Google Play: https://play.google.com/store/apps/details?id=org.traccar.gateway
// Default Port is usually 8082
define('TRACCAR_URL', 'http://192.168.1.53:8082'); 
define('TRACCAR_TOKEN', 'd9062c79-5ec1-426d-b02e-4b9d83842d45'); // Optional: Set in app settings if needed
define('TRACCAR_SIM_SLOT', null); // 0 pour SIM 1, 1 pour SIM 2

// TWILIO CONFIG (Optional)
define('SMS_API_KEY', 'YOUR_API_KEY');
define('SMS_API_SECRET', 'YOUR_API_SECRET');
define('SMS_SENDER_ID', 'VOVINAM UGB SC'); 
define('TWILIO_FROM_NUMBER', '+221704639508');
