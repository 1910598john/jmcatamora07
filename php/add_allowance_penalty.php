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

if (isset($_POST['class'])) {
  $class = $_POST['class'];
  $type = $_POST['type'];
  $allowance_id = $_POST['allowance_id'];
  $allowance_name = $_POST['allowance_name'];
  $deduction = $_POST['deduction'];
  

  $company_id = $_SESSION['companyid'];


  $stmt = $conn->prepare("INSERT INTO allowance_penalty (company_id, type, allowance, allowance_name, deduction, class)
  VALUES (?, ?, ?, ?, ?, ?)");

  $stmt->bind_param("isssss", $company_id, $type, $allowance_id, $allowance_name, $deduction, $class);

  $data = array();

  if ($stmt->execute()) {
    $data["message"] = "success";

    echo json_encode($data);
  }
}


$conn->close();
?>