<?php
include 'api/config.php';
$stmt = $pdo->query("DESCRIBE payments");
while($row = $stmt->fetch()) {
    if($row['Field'] == 'payment_type') {
        echo $row['Type'];
    }
}
?>
