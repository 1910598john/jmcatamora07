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

if (isset($_POST['day'])) {
  $day = $_POST['day'];
  $serialnumber = $_POST['serial'];

  $company_id = $_SESSION['companyid'];

  
  $sql = "UPDATE staffs SET off_day = REPLACE(off_day, '$day','') WHERE company_id = '$company_id' AND serialnumber = '$serialnumber'";
  
  if ($conn->query($sql) === TRUE) {
    echo "success";
  } 
}

$conn->close();

?>