<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=vovinam_ugb', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if 'other' is already in the enum to avoid unnecessary alter
    $stmt = $pdo->query("DESCRIBE payments 'payment_type'");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && strpos($row['Type'], "'other'") === false) {
        $sql = "ALTER TABLE payments MODIFY COLUMN payment_type ENUM('registration', 'monthly', 'annual', 'other') NOT NULL";
        echo "Updating payment_type enum...\n";
        $pdo->exec($sql);
        echo "SUCCESS!\n";
    } else {
        echo "Enum already updated or column not found.\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
