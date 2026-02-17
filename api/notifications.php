<?php

require_once 'config.php';
require_once 'utils.php';
require_once 'notifications_service.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $mode = $_GET['mode'] ?? 'history';

        if ($mode === 'delinquents') {
            // Find active season
            $stmt = $pdo->query("SELECT * FROM seasons WHERE is_active = 1 LIMIT 1");
            $season = $stmt->fetch();
            if (!$season) sendResponse([]);

            $seasonId = $season['id'];
            $currentMonth = (int)date('n');
            
            $targetDate = new DateTime();
            $targetDate->modify("first day of last month");
            $targetMonth = (int)$targetDate->format('n');
            $targetYearMonth = $targetDate->format('Y-m');

            // Find members who owe registration OR target monthly fee
            // Logic updated: Only owe monthly if joined on or before the target month
            // Find members who owe registration OR target monthly fee
            // Logic updated: Use getUnpaidMonths helper
            
            // 1. Fetch all active members
            $stmt = $pdo->query("SELECT m.id, m.first_name, m.last_name, m.phone, m.member_number, m.created_at, m.status FROM members m WHERE m.status = 'active'");
            $members = $stmt->fetchAll();
            
            $delinquents = [];

            foreach ($members as $member) {
                // Check Registration
                $stmtReg = $pdo->prepare("SELECT id, registration_fee_paid FROM registrations WHERE member_id = ? AND season_id = ?");
                $stmtReg->execute([$member['id'], $seasonId]);
                $reg = $stmtReg->fetch();
                
                $owesRegistration = (!$reg || $reg['registration_fee_paid'] == 0);

                // Check Monthly
                $unpaidMonths = getUnpaidMonths($pdo, $member, $season);
                
                if ($owesRegistration || !empty($unpaidMonths)) {
                    $delinquents[] = [
                        'id' => $member['id'],
                        'first_name' => $member['first_name'],
                        'last_name' => $member['last_name'],
                        'phone' => $member['phone'],
                        'member_number' => $member['member_number'],
                        'owes_registration' => $owesRegistration ? 1 : 0,
                        'owes_monthly' => !empty($unpaidMonths) ? 1 : 0,
                        'unpaid_months' => $unpaidMonths // New field
                    ];
                }
            }
            
            sendResponse($delinquents);
        } elseif ($mode === 'process_cron') {
            // Trigger the global reminder logic via service function
            // Set time limit to avoid timeouts for large batches
            set_time_limit(300); 
            
            $output = processGlobalReminders($pdo);
            
            sendResponse(['message' => 'Cron executed', 'details' => $output]);
        } else {
            // Fetch history of reminders
            $stmt = $pdo->query("
                SELECT r.*, m.first_name, m.last_name, s.name as season_name
                FROM reminders r
                JOIN members m ON r.member_id = m.id
                JOIN seasons s ON r.season_id = s.id
                ORDER BY r.created_at DESC
                LIMIT 100
            ");
            sendResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        // Manual trigger for a specific member
        $input = getJsonInput();
        if (!isset($input['member_id']) || !isset($input['type'])) {
            sendResponse(['error' => 'Member ID and type required'], 400);
        }

        $memberId = $input['member_id'];
        $type = $input['type'];
        $monthNumber = $input['month_number'] ?? null;

        // Fetch member and active season
        $stmt = $pdo->prepare("SELECT * FROM members WHERE id = ?");
        $stmt->execute([$memberId]);
        $member = $stmt->fetch();

        $stmt = $pdo->query("SELECT * FROM seasons WHERE is_active = 1 LIMIT 1");
        $season = $stmt->fetch();

        if (!$member || !$season) {
            sendResponse(['error' => 'Member or active season not found'], 404);
        }

        // Check actual debts using shared logic
        $unpaidMonths = getUnpaidMonths($pdo, $member, $season);
        
        // If specific month requested but not in unpaid list, we might want to warn or just proceed.
        // But for "Combined" or "Monthly" from the UI, we want to show ALL debts because that's what the UI says.
        
        $monthlyFee = $season['monthly_fee'] ?? 1000;
        $totalMonthlyDebt = count($unpaidMonths) * $monthlyFee;
        
        $monthNamesStr = "";
        if (!empty($unpaidMonths)) {
            $monthNames = array_map('getMonthNameFr', $unpaidMonths);
            $monthNamesStr = implode(', ', $monthNames);
        } else {
             // Fallback if no unpaid months found (e.g. forced reminder)
             $monthNamesStr = $monthNumber ? getMonthNameFr($monthNumber) : date('F');
             $totalMonthlyDebt = $monthlyFee; 
             $unpaidMonths = $monthNumber ? [$monthNumber] : [];
        }

        $msg = "";
        $typesToLog = [];

        if ($type === 'registration') {
            $msg = SMS_SENDER_ID . ": Bonjour {$member['first_name']}, n'oubliez pas de regler vos frais d'inscription (2000 FCFA) pour la saison {$season['name']} via Wave au 75 557 55 51. Envoyer capture au 78 282 96 73.";
            $typesToLog[] = ['type' => 'registration', 'month_number' => null];
        } elseif ($type === 'monthly') {
            $msg = SMS_SENDER_ID . ": Bonjour {$member['first_name']}, rappel: mensualites de $monthNamesStr ({$totalMonthlyDebt} FCFA) non reglees. Wave au 75 557 55 51. Envoyer capture au 78 282 96 73.";
            
            foreach ($unpaidMonths as $m) {
                $typesToLog[] = ['type' => 'monthly', 'month_number' => $m];
            }
        } elseif ($type === 'combined') {
            $regFee = $season['registration_fee'] ?? 2000;
            $totalDebt = $totalMonthlyDebt + $regFee;
            
            $msg = SMS_SENDER_ID . ": Bonjour {$member['first_name']}, rappel: Inscription ({$regFee}F) + Mensualites $monthNamesStr ({$totalMonthlyDebt}F) non reglees. Total: {$totalDebt}F via Wave au 75 557 55 51. Envoyer capture au 78 282 96 73.";
            
            $typesToLog[] = ['type' => 'registration', 'month_number' => null];
            foreach ($unpaidMonths as $m) {
                $typesToLog[] = ['type' => 'monthly', 'month_number' => $m];
            }
        } elseif ($type === 'welcome') {
            $msg = SMS_SENDER_ID . ": Bonjour {$member['first_name']}, 👋 Bienvenue au VOVINAM VIET VO DAO UGB SPORTING CLUB ! 🥋 Nous sommes heureux de vous accueillir au sein du club. 💰 Frais au 75 557 55 51 : Inscription: {$season['registration_fee']}F, Mensualite: {$season['monthly_fee']}F. 🕒 Horaires d’entraînement : Lundi, Mercredi, Vendredi de 18h-20h. Le Bureau
VOVINAM VIET VO DAO UGB SPORTING CLUB
";
            $typesToLog[] = ['type' => 'welcome', 'month_number' => null];
        }

        $status = 'failed';
        if (sendNotification($member['phone'], $msg)) {
            $status = 'sent';
            
            // If it was a welcome message, update member status to active
            if ($type === 'welcome') {
                $upd = $pdo->prepare("UPDATE members SET status = 'active' WHERE id = ?");
                $upd->execute([$memberId]);
            }
        }

        $lastId = null;
        foreach ($typesToLog as $logItem) {
             $lastId = generateUUID();
             $stmt = $pdo->prepare("INSERT INTO reminders (id, member_id, season_id, type, month_number, status, sent_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
             $stmt->execute([
                 $lastId,
                 $memberId,
                 $season['id'],
                 $logItem['type'],
                 $logItem['month_number'],
                 $status
             ]);
        }

        sendResponse(['id' => $lastId, 'message' => 'Reminder sent successfully']);
        break;

    case 'DELETE':
        $mode = $_GET['mode'] ?? '';
        
        if ($mode === 'all') {
            $stmt = $pdo->prepare("DELETE FROM reminders");
            $stmt->execute();
            sendResponse(['message' => 'History cleared successfully']);
        } else {
            sendResponse(['error' => 'Invalid mode for deletion'], 400);
        }
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
?>
