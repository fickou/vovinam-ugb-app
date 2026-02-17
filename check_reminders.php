<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=vovinam_ugb', 'root', '');
    $stmt = $pdo->query('DESCRIBE reminders');
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}
