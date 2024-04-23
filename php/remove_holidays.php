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



$company_id = $_SESSION['companyid'];

$sql = "DELETE FROM holidays WHERE company_id = '$company_id'";

if ($conn->query($sql) === TRUE) {
echo "success";
} 


$conn->close();

?>