<?php

// Start and end timestamps
date_default_timezone_set('Asia/Manila');

$startTimestamp = strtotime("2024-03-01 09:10:01");
$endTimestamp = strtotime("2024-03-01 00:45:34");

// Convert timestamps to DateTime objects
$startTime = new DateTime("@$startTimestamp");
$endTime = new DateTime("@$endTimestamp");

// Calculate the difference between the two timestamps
$interval = $startTime->diff($endTime);

// Calculate the total hours worked
$totalHoursWorked = $interval->h;

// Add minutes to the total hours worked
$totalHoursWorked += $interval->i / 60;

$totalMinutesWorked = round($totalHoursWorked * 60);

echo $totalMinutesWorked - 480;
?>