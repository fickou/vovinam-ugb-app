<?php
// Debug Date Logic
date_default_timezone_set('UTC'); // Or whatever the server uses, let's check default
echo "Current PHP Date: " . date('Y-m-d H:i:s') . "\n";

$targetDate = new DateTime();
$targetDate->modify("first day of last month");
echo "Target Date (Last Month): " . $targetDate->format('Y-m-d') . "\n";

$checkEnd = new DateTime();
$checkEnd->modify("first day of last month");
echo "Check End Date: " . $checkEnd->format('Y-m-d') . "\n";

// Simulate the loop
$checkStart = new DateTime('2025-12-01'); // Assume joined in Dec
echo "Check Start (Joined): " . $checkStart->format('Y-m-d') . "\n";

echo "Looping:\n";
if ($checkStart <= $checkEnd) {
    $currentCheck = clone $checkStart;
    while ($currentCheck <= $checkEnd) {
        echo " - Checking Month: " . $currentCheck->format('Y-m') . " (Month Num: " . $currentCheck->format('n') . ")\n";
        $currentCheck->modify('+1 month');
    }
} else {
    echo "CheckStart > CheckEnd, no loop.\n";
}
?>
