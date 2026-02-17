<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=vovinam_ugb', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Updating reminders table...\n";
    $pdo->exec("ALTER TABLE reminders MODIFY type ENUM('registration', 'monthly', 'welcome') NOT NULL");
    echo "SUCCESS!\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
