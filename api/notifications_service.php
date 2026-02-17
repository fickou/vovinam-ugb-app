<?php
require_once 'config.php';

/**
 * Main function to send notifications (SMS or WhatsApp)
 */
function sendNotification($phoneNumber, $message, $channel = 'sms') {
    // Standardize phone number format (ensure no spaces, starts with + for international)
    $phoneNumber = str_replace(' ', '', $phoneNumber);
    if (strpos($phoneNumber, '+') !== 0 && strlen($phoneNumber) >= 9) {
        // Assume +221 if no country code and length matches Senegal
        if (strlen($phoneNumber) === 9) $phoneNumber = '+221' . $phoneNumber;
    }

    if (SMS_PROVIDER === 'mock') {
        error_log("[MOCK] Sending $channel to $phoneNumber: $message");
        return true;
    }

    if (SMS_PROVIDER === 'traccar') {
        return sendTraccar($phoneNumber, $message);
    }

    if (SMS_PROVIDER === 'twilio') {
        return sendTwilio($phoneNumber, $message, $channel);
    }

    if (SMS_PROVIDER === 'logismarketing') {
        return sendLogisMarketing($phoneNumber, $message);
    }

    error_log("Unknown SMS provider: " . SMS_PROVIDER);
    return false;
}

/**
 * Traccar SMS Gateway Implementation
 * App: https://play.google.com/store/apps/details?id=org.traccar.gateway
 * API: POST / with JSON body {"to": "...", "message": "..."}
 */
function sendTraccar($to, $message) {
    $url = TRACCAR_URL;
    
    // Remove '+' - some local gateway apps prefer 221... or 7...
    $toClean = ltrim($to, '+');
    
    $data = [
        'to' => $toClean,
        'message' => $message
    ];

    // Only add SIM if explicitly set and not null
    if (defined('TRACCAR_SIM_SLOT') && TRACCAR_SIM_SLOT !== null && TRACCAR_SIM_SLOT !== '') {
        $data['sim'] = (int)TRACCAR_SIM_SLOT;
    }

    $headers = [
        'Content-Type: application/json'
    ];

    if (defined('TRACCAR_TOKEN') && TRACCAR_TOKEN !== '') {
        $headers[] = 'Authorization: ' . TRACCAR_TOKEN;
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15); // Longer timeout to prevent "failed" even if sent
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        return true;
    } else {
        error_log("Traccar SMS Gateway Error ($httpCode): " . $response);
        return false;
    }
}

/**
 * Twilio Implementation (SMS & WhatsApp)
 */
function sendTwilio($to, $message, $channel) {
    $sid = SMS_API_KEY;
    $token = SMS_API_SECRET;
    $from = TWILIO_FROM_NUMBER;

    if ($channel === 'whatsapp') {
        $from = 'whatsapp:' . $from;
        $to = 'whatsapp:' . $to;
    }

    $url = "https://api.twilio.com/2010-04-01/Accounts/$sid/Messages.json";
    
    $data = array(
        'From' => $from,
        'To' => $to,
        'Body' => $message
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($ch, CURLOPT_USERPWD, "$sid:$token");

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        return true;
    } else {
        error_log("Twilio Error ($httpCode): " . $response);
        return false;
    }
}

/**
 * LogisMarketing Implementation (Senegal)
 * Provider: https://logis.sn / http://www.logismarketing.com
 */
function sendLogisMarketing($to, $message) {
    // Remove '+' for LogisMarketing usually
    $to = ltrim($to, '+');
    
    $url = "http://sms.logismarketing.com/index.php?option=com_sms&task=send_sms" .
           "&username=" . urlencode(SMS_API_KEY) . 
           "&password=" . urlencode(SMS_API_SECRET) . 
           "&mobile=" . urlencode($to) . 
           "&message=" . urlencode($message) . 
           "&sender=" . urlencode(SMS_SENDER_ID);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // This provider often returns success text in body
    if (strpos($response, 'SUCCESS') !== false || $httpCode == 200) {
        return true;
    } else {
        error_log("LogisMarketing Error: " . $response);
        return false;
    }
}

/**
 * Helper to calculate unpaid past months for a member
 */
function getUnpaidMonths($pdo, $member, $season) {
    $unpaidMonths = [];
    $memberId = $member['id'];
    $seasonId = $season['id'];
    
    $checkStart = new DateTime($season['start_date']);
    $memberJoin = new DateTime($member['created_at']);
    
    // Start checking from whichever is later: Season Start or Member Join
    if ($memberJoin > $checkStart) {
        $checkStart = clone $memberJoin;
    }
    $checkStart->modify('first day of this month');
    $checkStart->setTime(0, 0, 0); // Reset time to start of day

    // Stop checking at Last Month (Target)
    $checkEnd = new DateTime();
    $checkEnd->modify('first day of last month');
    $checkEnd->setTime(0, 0, 0); // Reset time to start of day

    if ($checkStart <= $checkEnd) {
        $currentCheck = clone $checkStart;
        while ($currentCheck <= $checkEnd) {
            $mNum = (int)$currentCheck->format('n');
            
            $stmtMonth = $pdo->prepare("SELECT COUNT(*) FROM payments WHERE member_id = ? AND season_id = ? AND payment_type = 'monthly' AND month_number = ? AND status = 'VALIDATED'");
            $stmtMonth->execute([$memberId, $seasonId, $mNum]);
            
            if ($stmtMonth->fetchColumn() == 0) {
                $unpaidMonths[] = $mNum;
            }
            
            // Advance one month
            $currentCheck->modify('+1 month');
        }
    }
    return $unpaidMonths;
}

/**
 * Global Reminder Logic (Combined)
 * To be called by cron script AND by API
 */
function processGlobalReminders($pdo) {
    // 1. Identify active season
    $stmt = $pdo->query("SELECT * FROM seasons WHERE is_active = 1 LIMIT 1");
    $season = $stmt->fetch();

    if (!$season) {
        return "No active season found.";
    }

    $seasonId = $season['id'];
    $currentMonth = (int)date('n');
    $currentDay = (int)date('j');
    $outputLog = "";

    $targetDate = new DateTime();
    $targetDate->modify("first day of last month");
    $targetMonth = (int)$targetDate->format('n');
    $targetYearMonth = $targetDate->format('Y-m');

    $outputLog .= "Processing reminders. Target month: $targetMonth (Season: {$season['name']})\n";

    // 2. Fetch all active members
    $stmt = $pdo->query("SELECT id, first_name, last_name, phone, status, created_at FROM members WHERE status = 'active'");
    $members = $stmt->fetchAll();

    foreach ($members as $member) {
        $memberId = $member['id'];
        $owesRegistration = false;
        $owesMonthly = false;

        // Check Registration
        $stmtReg = $pdo->prepare("SELECT id, registration_fee_paid FROM registrations WHERE member_id = ? AND season_id = ?");
        $stmtReg->execute([$memberId, $seasonId]);
        $reg = $stmtReg->fetch();
        
        if (!$reg || $reg['registration_fee_paid'] == 0) {
            $owesRegistration = true;
        }

        // Check Monthly (Target Month)
        // New logic: Check ALL months from (Start of Season OR Joined Date) up to Last Month
        $unpaidMonths = getUnpaidMonths($pdo, $member, $season);

        // Logic: Trigger reminder if the TARGET month (last month) is unpaid.
        if (in_array($targetMonth, $unpaidMonths)) {
            $owesMonthly = true;
        }

        // Determine Message Type
        $msg = "";
        $typesToSend = [];

        // Safety check: Don't spam
        $alreadySentReg = false;
        if ($owesRegistration) {
            $check = $pdo->prepare("SELECT COUNT(*) FROM reminders WHERE member_id = ? AND type = 'registration' AND created_at > DATE_SUB(NOW(), INTERVAL 15 DAY)");
            $check->execute([$memberId]);
            if ($check->fetchColumn() > 0) $alreadySentReg = true;
        }

        $alreadySentMonth = false;
        if ($owesMonthly) {
            $check = $pdo->prepare("SELECT COUNT(*) FROM reminders WHERE member_id = ? AND type = 'monthly' AND month_number = ?");
            $check->execute([$memberId, $targetMonth]);
            if ($check->fetchColumn() > 0) $alreadySentMonth = true;
        }

        // Calculate Totals and Month Names
        $monthlyFee = $season['monthly_fee'] ?? 1000;
        $totalMonthlyDebt = count($unpaidMonths) * $monthlyFee;
        $totalDebt = $totalMonthlyDebt;
        if ($owesRegistration) $totalDebt += ($season['registration_fee'] ?? 2000);
        
        $monthsListStr = "";
        if (!empty($unpaidMonths)) {
            $monthNames = array_map('getMonthNameFr', $unpaidMonths);
            $monthsListStr = implode(', ', $monthNames);
        }

        // Construct Message
        if ($owesRegistration && !$alreadySentReg && $owesMonthly && !$alreadySentMonth) {
            // COMBINED CASE
            $msg = SMS_SENDER_ID . ": Bonjour {$member['first_name']}, rappel: Inscription (2000F) + Mensualites $monthsListStr ({$totalMonthlyDebt}F) non reglees. Total: {$totalDebt}F via Wave au 75 557 55 51. Envoyer capture au 78 282 96 73.";
            $typesToSend = ['registration', 'monthly'];

        } elseif ($owesRegistration && !$alreadySentReg) {
            // REGISTRATION ONLY
            $msg = SMS_SENDER_ID . ": Bonjour {$member['first_name']}, n'oubliez pas de regler vos frais d'inscription (2000 FCFA) pour la saison {$season['name']} via Wave au 75 557 55 51. Envoyer capture au 78 282 96 73.";
            $typesToSend = ['registration'];

        } elseif ($owesMonthly && !$alreadySentMonth) {
            // MONTHLY ONLY
            $msg = SMS_SENDER_ID . ": Bonjour {$member['first_name']}, rappel: mensualites de $monthsListStr ({$totalMonthlyDebt} FCFA) non reglees. Wave au 75 557 55 51. Envoyer capture au 78 282 96 73.";
            $typesToSend = ['monthly'];
        }

        // Send and Log
        if (!empty($msg) && !empty($typesToSend)) {
            if (sendNotification($member['phone'], $msg)) {
                $outputLog .= "Sent unified reminder to {$member['first_name']} ({$member['phone']}) - Types: " . implode(', ', $typesToSend) . "\n";
                
                // Log for each type
                foreach ($typesToSend as $type) {
                    $mNum = ($type === 'monthly') ? $targetMonth : null;
                    $ins = $pdo->prepare("INSERT INTO reminders (id, member_id, season_id, type, month_number, status, sent_at) VALUES (?, ?, ?, ?, ?, 'sent', NOW())");
                    $ins->execute([generateUUID(), $memberId, $seasonId, $type, $mNum]);
                }
            } else {
                $outputLog .= "Failed to send to {$member['first_name']}\n";
            }
        }
    }
    return $outputLog;
}
?>
