<?php
require_once 'api/config.php';

try {
    $pdo = new PDO('mysql:host=localhost;dbname=vovinam_ugb', 'root', '');
    $tables = ['reminders', 'payments', 'seasons'];
    
    foreach ($tables as $table) {
        echo "DESCRIBE $table:\n";
        $stmt = $pdo->query("DESCRIBE $table");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            echo "{$col['Field']} ({$col['Type']})\n";
        }
        echo "\n";
    }

    echo "Sample Seasons:\n";
    $stmt = $pdo->query("SELECT * FROM seasons LIMIT 2");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    echo $e->getMessage();
}
?>
