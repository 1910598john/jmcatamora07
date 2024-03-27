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
  

  $company_id = $_SESSION['companyid'];


  $stmt = $conn->prepare("INSERT INTO holidays (company_id, name, date)
  VALUES (?, ?, ?)");

  $stmt->bind_param("iss", $company_id, $name, $date);

  $data = array();

  if ($stmt->execute()) {

    echo 'success';
  }
}


$conn->close();
?>