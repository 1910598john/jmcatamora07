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

if (isset($_POST['holiday'])) {
  $name = $_POST['holiday'];
  $date = $_POST['date'];
  $class = $_POST['class'];
  
  $company_id = $_SESSION['companyid'];

  $stmt = $conn->prepare("INSERT INTO holidays (company_id, name, date, class)
  VALUES (?, ?, ?, ?)");

  $stmt->bind_param("isss", $company_id, $name, $date, $class);

  $data = array();

  if ($stmt->execute()) {
    echo 'success';
  }
}


$conn->close();
?>