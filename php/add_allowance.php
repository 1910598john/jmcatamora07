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

  if ($_POST['by'] == 'class') {
    $stmt = $conn->prepare("INSERT INTO company_allowance (company_id, allowance_name, amount, detail, all_type, class)
    VALUES (?, ?, ?, ?, ?, ?)");
  
    
    $stmt->bind_param("isisss", $company_id, $name, $amount, $type, $_POST['by'], $class);
  } else {
    $stmt = $conn->prepare("INSERT INTO company_allowance (company_id, allowance_name, amount, detail, all_type, serialnumber)
    VALUES (?, ?, ?, ?, ?, ?)");

    
    $stmt->bind_param("isisss", $company_id, $name, $amount, $type, $_POST['by'], $class);
  }
  

  $company_id = $_SESSION['companyid'];


  

  $data = array();

  if ($stmt->execute()) {
    $data["message"] = "success";

    echo json_encode($data);
  }
}


$conn->close();
?>