<?php
ini_set('display_errors', 1);
require_once 'api/config.php';

try {
    $stmt = $pdo->query("SHOW COLUMNS FROM payments");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . "\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
