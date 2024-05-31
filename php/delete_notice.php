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

    $serialnumber = $_POST['serial'];
    $company_id = $_SESSION['companyid'];
    $branch = $_POST['branch'];

    $sql = "DELETE FROM notice WHERE serialnumber = '" . $serialnumber . "' AND branch = '$branch' AND company_id = '$company_id'";

    if ($conn->query($sql) === TRUE) {
      echo "success";
    } 
}


$conn->close();

?>