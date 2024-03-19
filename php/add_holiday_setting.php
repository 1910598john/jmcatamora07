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
  $name = $_POST['holiday'];
  $worked = $_POST['worked'];
  $didnotwork = $_POST['didnotwork'];
  $policy = $_POST['policy'];
  

  $company_id = $_SESSION['companyid'];


  $stmt = $conn->prepare("INSERT INTO company_holidays (company_id, holiday_name, worked, didnotwork, class, exclusion)
  VALUES (?, ?, ?, ?, ?, ?)");

  $stmt->bind_param("isssss", $company_id, $name, $worked, $didnotwork, $class, $policy);

  $data = array();

  if ($stmt->execute()) {
    $data["message"] = "success";

    echo json_encode($data);
  }
}


$conn->close();
?>