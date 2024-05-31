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
    $id = $_POST['id'];
    $company_id = $_SESSION['companyid'];
    $branch = $_POST['branch'];
    
    $sql = "UPDATE early_in_approval SET approved = 1 WHERE company_id = '$company_id' AND serialnumber = '$serial' AND id = '$id' AND branch = '$branch'";
    
    if ($conn->query($sql) === TRUE) {
        echo 'approved';
    } 
}



$conn->close();

?>