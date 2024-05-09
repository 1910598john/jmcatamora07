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

if (isset($_POST['name'])) {
  
  $type = $_POST['type'];
  $allowance = $_POST['name'];
  $deduction = $_POST['deduction'];

  $company_id = $_SESSION['companyid'];


  $stmt = $conn->prepare("INSERT INTO allowance_penalty (company_id, type, allowance_name, deduction)
  VALUES (?, ?, ?, ?)");

  $stmt->bind_param("isss", $company_id, $type,  $allowance, $deduction);

  $data = array();

  if ($stmt->execute()) {
    echo 'success';
  }
}


$conn->close();
?>