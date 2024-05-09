<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "payroll";

session_start();

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

if (isset($_POST['serial'])) {
    $serial = $_POST['serial'];
    $amount = $_POST['amount'];
    $type = $_POST['type'];
    $name = $_POST['name'];
    $company_id = $_SESSION['companyid'];
 
    $stmt = $conn->prepare("INSERT INTO employee_allowance (company_id, serialnumber, type, amount_name, amount)
    VALUES (?, ?, ?, ?, ?)");

    $stmt->bind_param("iisss", $company_id, $serial, $type, $name, $amount);

    if ($stmt->execute()) {
        echo 'success';
    }
}

$conn->close();
?>