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
  $amount = $_POST['amount'];
  $type = $_POST['type'];
  $name = $_POST['name'];
  

  $company_id = $_SESSION['companyid'];


  $stmt = $conn->prepare("INSERT INTO company_allowance (company_id, allowance_name, amount, detail, class)
  VALUES (?, ?, ?, ?, ?)");

  $stmt->bind_param("isiss", $company_id, $name, $amount, $type, $class);

  $data = array();

  if ($stmt->execute()) {
    $data["message"] = "success";

    echo json_encode($data);
  }
}


$conn->close();
?>