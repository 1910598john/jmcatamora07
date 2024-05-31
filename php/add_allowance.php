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
 
  $amount = $_POST['amount'];
  $type = $_POST['type'];
  $name = $_POST['name'];
  $company_id = $_SESSION['companyid'];

  
  $stmt = $conn->prepare("INSERT INTO company_allowance (company_id, name, amount, type)
  VALUES (?, ?, ?, ?)");
  
  $stmt->bind_param("isss", $company_id, $name, $amount, $type);

  if ($stmt->execute()) {
    echo "success";
  }
}


$conn->close();
?>