<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=vovinam_ugb', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sql = "CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(36) PRIMARY KEY,
        season_id VARCHAR(36) NOT NULL,
        amount INT NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        expense_date DATE NOT NULL,
        recorded_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
    )";
    
    echo "Creating expenses table...\n";
    $pdo->exec($sql);
    echo "SUCCESS!\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
