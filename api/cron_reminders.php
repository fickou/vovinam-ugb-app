<?php
require_once 'config.php';
require_once 'utils.php';
require_once 'notifications_service.php';

echo processGlobalReminders($pdo);
?>
