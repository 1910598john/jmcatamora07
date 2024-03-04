<?php
// Your PHP code to handle the request goes here
$request_url = $_SERVER['REQUEST_URI'];

// Process the request based on different conditions
if ($request_url == '/biometric_attendance/') {
    include('index.php');
}

?>