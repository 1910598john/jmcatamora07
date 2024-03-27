<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "payroll";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

session_start();

if (isset($_POST['id'])) {
    $id = $_POST['id'];
    $company_id = $_SESSION['companyid'];

    $sql = "UPDATE staffs_trail SET paid_status = 'paid' WHERE serialnumber = '$id' AND company_id = '$company_id'";
    
    if ($conn->query($sql) === TRUE) {
      echo "paid";
    } 
}


$conn->close();

?>