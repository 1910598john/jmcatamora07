<?php

// Start and end timestamps
date_default_timezone_set('Asia/Manila');

$currentWeekday = strtolower(date('l'));
echo $currentWeekday;

// $startTimestamp = strtotime("2024-03-01 07:30:00");
// $endTimestamp = strtotime("2024-03-01 07:35:34");

// // Check if end timestamp is before start timestamp
// if ($endTimestamp < $startTimestamp) {
//     echo "End timestamp is before start timestamp. Difference is negative.";
// } else {
//     // Convert timestamps to DateTime objects
//     $startTime = new DateTime("@$startTimestamp");
//     $endTime = new DateTime("@$endTimestamp");

//     // Calculate the difference between the two timestamps
//     $interval = $startTime->diff($endTime);

//     // Calculate the total hours worked
//     $totalHoursWorked = $interval->h;

//     // Add minutes to the total hours worked
//     $totalHoursWorked += $interval->i / 60;

//     $totalMinutesWorked = round($totalHoursWorked * 60);

//     echo "Total minutes worked: $totalMinutesWorked";
// }

?>