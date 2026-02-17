<?php
require_once 'api/config.php';
require_once 'api/notifications_service.php';

// Force immediate output
while (ob_get_level()) ob_end_clean();

echo "=== SMS DEBUGGER ===\n";
echo "Provider: " . SMS_PROVIDER . "\n";

if (SMS_PROVIDER === 'traccar') {
    echo "URL: " . TRACCAR_URL . "\n";
    echo "Attempting to connect to phone...\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, TRACCAR_URL);
    curl_setopt($ch, CURLOPT_POST, true);
    // Send a dummy JSON to see if it even accepts connection
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['to' => '0000', 'message' => 'test']));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Timeout usually 5s, but we want to see immediate error
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    // VERY IMPORTANT: VERBOSE MODE
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    
    $response = curl_exec($ch);
    $error = curl_error($ch);
    $errno = curl_errno($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if ($errno) {
        echo "CONNECTION FAILED!\n";
        echo "Error: $error (Code $errno)\n";
        
        if (strpos($error, 'timed out') !== false) {
            echo "DIAGNOSIS: TIMEOUT. The computer could not reach the phone.\n";
            echo "- Check validation: Are they on the SAME Wifi?\n";
            echo "- Check IP: Is $url correct?\n";
            echo "- Check Firewalls.\n";
        } elseif (strpos($error, 'refused') !== false) {
            echo "DIAGNOSIS: CONNECTION REFUSED. The IP is reachable, but the port is closed.\n";
            echo "- Check App: Is the service STARTED in the Traccar app?\n";
            echo "- Check Port: default is 8082, is the app using that?\n";
        } else {
            echo "DIAGNOSIS: Generic Error.\n";
        }
    } else {
        echo "\n[SUCCESS] HTTP Status: $httpCode\n";
        echo "Response: $response\n";
        if ($httpCode == 200) {
            echo "Connection SUCCESSFUL! The phone received the request.\n";
        } else {
            echo "Connected, but the app returned an error.\n";
        }
    }
    curl_close($ch);
} else {
    echo "Provider is not set to 'traccar'. Please check config.php\n";
}
?>
