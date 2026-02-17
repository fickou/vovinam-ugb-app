<?php
// Force clean output
while (ob_get_level()) ob_end_clean();

$ip = '192.168.1.7';
$port = 8082;

echo "=== DIAGNOSTICS FOR $ip:$port ===\n\n";

// TEST 1: RAW TCP SOCKET
echo "[1] Testing TCP Connection (fsockopen)...\n";
$fp = @fsockopen($ip, $port, $errno, $errstr, 5);
if (!$fp) {
    echo "FAILED! Error $errno: $errstr\n";
    echo "Possible causes: Firewall blocking PHP, or wrong IP.\n";
} else {
    echo "SUCCESS! PHP can reach the phone via TCP.\n";
    fclose($fp);
}
echo "\n";

// TEST 2: cURL (Standard)
echo "[2] Testing cURL (Standard)...\n";
$ch = curl_init("http://$ip:$port");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
// Try to get headers only
curl_setopt($ch, CURLOPT_NOBODY, true);
$res = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($http > 0) {
    echo "SUCCESS! HTTP Status: $http\n";
} else {
    echo "FAILED! Error: " . curl_error($ch) . "\n";
}
curl_close($ch);
echo "\n";

// TEST 3: cURL (IPv4 Forced)
echo "[3] Testing cURL (Forced IPv4)...\n";
$ch = curl_init("http://$ip:$port");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_NOBODY, true);
curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4); // Force IPv4
$res = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($http > 0) {
    echo "SUCCESS! HTTP Status: $http\n";
} else {
    echo "FAILED! Error: " . curl_error($ch) . "\n";
}
curl_close($ch);
?>
