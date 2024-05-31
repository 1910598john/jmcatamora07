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
  $branch = $_POST['branch'];
  $amount = $_POST['amount'];
  $name = $_POST['allname'];
  $allid = $_POST['allid'];
  $type = $_POST['type'];
  
  
  $company_id = $_SESSION['companyid'];

  $stmt = $conn->prepare("INSERT INTO employee_allowance (company_id, serialnumber, branch, allowance_id, allowance_name, amount, type)
  VALUES (?, ?, ?, ?, ?, ?, ?)");

  $stmt->bind_param("iisssss", $company_id, $serial, $branch, $allid, $name, $amount, $type);

  if ($stmt->execute()) {
    echo 'success';
  }
}

$conn->close();
?>