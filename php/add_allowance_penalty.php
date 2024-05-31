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

if (isset($_POST['allname'])) {
  
  $type = $_POST['type'];
  $name = $_POST['allname'];
  $allid = $_POST['allid'];
  $deduction = $_POST['deduction'];
  $company_id = $_SESSION['companyid'];


  $stmt = $conn->prepare("INSERT INTO allowance_penalty (company_id, type, allowance_id, allowance_name, deduction)
  VALUES (?, ?, ?, ?, ?)");

  $stmt->bind_param("issss", $company_id, $type, $allid,  $name, $deduction);

  $data = array();

  if ($stmt->execute()) {
    echo 'success';
  }
}


$conn->close();
?>