<?php
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

$sql = "SELECT pay_sched, name, address FROM company_settings WHERE company_id = '". $_SESSION['companyid'] . "'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
// output data of each row
    $row = $result->fetch_assoc();

    echo json_encode($row);
}

$conn->close();
?>