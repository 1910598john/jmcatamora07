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

if (isset($_POST['serialnumber'])) {
    $status = $_POST['status'];
    $serialnumber = $_POST['serialnumber'];
    $company_id = $_SESSION['companyid'];
    $sql = "UPDATE staffs SET status = '". $status ."' WHERE serialnumber = '" . $serialnumber . "' AND company_id = '$company_id'";

    if ($conn->query($sql) === TRUE) {
      $_SESSION['time_logged'] = $status;
      echo "success";
    } 
}


$conn->close();

?>