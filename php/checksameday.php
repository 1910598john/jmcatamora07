<?php

date_default_timezone_set('Asia/Manila');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "payroll";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

session_start();

$sql = "SELECT date FROM attendance WHERE company_id = '". $_SESSION['companyid'] . "' ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    $date1 = $row['date'];
    $date2 = date('Y-m-d');

    $data = array();

    // Compare date portions
    if ($date1 == $date2) {
        $data['message'] = 'same';
        $data['date'] = $date1;
    } else {
        $data['message'] = 'not same';
        $data['date'] = $date1;
    }
    echo json_encode($data);
}
?>