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

if (isset($_POST['serial'])) {
    $serial = $_POST['serial'];
    $company_id = $_SESSION['companyid'];

    $sql = "DELETE FROM employee_allowance WHERE serialnumber = '$serial' AND company_id = '$company_id'";

    if ($conn->query($sql) === TRUE) {
      echo "deleted";
    } 
}


$conn->close();

?>