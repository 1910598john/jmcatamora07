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
  $name = $_POST['type'];
  $worked = $_POST['worked'];
  $didnotwork = $_POST['didnotwork'];

  $company_id = $_SESSION['companyid'];


  $stmt = $conn->prepare("INSERT INTO off_rest (company_id, name, worked, didnotwork, class)
  VALUES (?, ?, ?, ?, ?)");

  $stmt->bind_param("issss", $company_id, $name, $worked, $didnotwork, $class);

  $data = array();

  if ($stmt->execute()) {
    $data["message"] = "success";

    echo json_encode($data);
  }
}


$conn->close();
?>