<?php

$my_config = [
    'host' => 'localhost',
    'port' => '3306',
    'dbname' => 'vovinam_ugb',
    'user' => 'root',
    'pass' => ''
];

try {
    echo "Connecting to MySQL...\n";
    $my = new PDO("mysql:host={$my_config['host']};port={$my_config['port']};dbname={$my_config['dbname']}", $my_config['user'], $my_config['pass']);
    $my->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Migration started...\n";

    // 1. Seasons
    echo "Migrating seasons...\n";
    $stmt = $my->query("SELECT * FROM seasons");
    $seasons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($seasons as $s) {
        $insert = $my->prepare("INSERT IGNORE INTO seasons (id, name, start_date, end_date, registration_fee, monthly_fee, annual_total, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insert->execute([$s['id'], $s['name'], $s['start_date'], $s['end_date'], $s['registration_fee'], $s['monthly_fee'], $s['annual_total'], $s['is_active'] ? 1 : 0, $s['created_at'], $s['updated_at']]);
    }

    // 2. Members
    echo "Migrating members...\n";
    $stmt = $my->query("SELECT * FROM members");
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($members as $m) {
        $insert = $my->prepare("INSERT IGNORE INTO members (id, first_name, last_name, phone, email, status, member_number, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insert->execute([$m['id'], $m['first_name'], $m['last_name'], $m['phone'], $m['email'], $m['status'], $m['member_number'], $m['created_at'], $m['updated_at']]);
    }

    // 3. Payments
    echo "Migrating payments...\n";
    $stmt = $my->query("SELECT * FROM payments");
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($payments as $p) {
        $insert = $my->prepare("INSERT IGNORE INTO payments (id, member_id, season_id, amount, payment_type, payment_method, payment_date, month_number, proof_url, notes, recorded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insert->execute([$p['id'], $p['member_id'], $p['season_id'], $p['amount'], $p['payment_type'], $p['payment_method'], $p['payment_date'], $p['month_number'], $p['proof_url'], $p['notes'], $p['recorded_by'], $p['created_at']]);
    }

    // 4. Profiles
    echo "Migrating profiles...\n";
    $stmt = $my->query("SELECT * FROM profiles");
    $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($profiles as $pr) {
        $insert = $my->prepare("INSERT IGNORE INTO profiles (id, user_id, first_name, last_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
        $insert->execute([$pr['id'], $pr['user_id'], $pr['first_name'], $pr['last_name'], $pr['created_at'], $pr['updated_at']]);
    }

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
