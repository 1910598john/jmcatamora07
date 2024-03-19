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
  $detail = $_POST['detail'];
  $mins = $_POST['mins'];
  $days = $_POST['days'];
  $deduction = $_POST['deduction'];
  

  $company_id = $_SESSION['companyid'];


  $stmt = $conn->prepare("INSERT INTO allowance_penalty (company_id, type, detail, time, days, deduction, class)
  VALUES (?, ?, ?, ?, ?, ?, ?)");

  $stmt->bind_param("issssss", $company_id, $type, $detail, $mins, $days, $deduction, $class);

  $data = array();

  if ($stmt->execute()) {
    $data["message"] = "success";

    echo json_encode($data);
  }
}


$conn->close();
?>