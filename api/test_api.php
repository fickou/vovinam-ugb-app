<?php
// Mock config to ensure we don't need real DB creds if they weren't set (but they are)
// We need to fetch from the actual DB to check the logic
require_once 'api/config.php';
require_once 'api/notifications_service.php';
require_once 'api/utils.php';

// Mock $_GET
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['mode'] = 'delinquents';

// Capture output
ob_start();
require 'api/notifications.php';
$output = ob_get_clean();

echo "=== API RESPONSE (Delinquents) ===\n";
echo $output;
echo "\n================================\n";

// Decode to verify structure
$data = json_decode($output, true);
if (json_last_error() === JSON_ERROR_NONE) {
    echo "JSON Decode Success.\n";
    if (count($data) > 0) {
        $foundUnpaid = false;
        foreach ($data as $row) {
             if (!empty($row['unpaid_months'])) {
                 echo "Member {$row['first_name']} {$row['last_name']}: ";
                 echo json_encode($row['unpaid_months']) . "\n";
                 $foundUnpaid = true;
             }
        }
        if (!$foundUnpaid) echo "No members with unpaid months found.\n";
    } else {
        echo "No delinquents found.\n";
    }
} else {
    echo "JSON Decode Failed.\n";
}
?>
