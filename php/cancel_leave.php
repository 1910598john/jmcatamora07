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

    
    $sql = "UPDATE staffs SET leave_start = NULL, leave_end = NULL WHERE company_id = '$company_id' AND serialnumber = '$serial'";
    
    if ($conn->query($sql) === TRUE) {
        echo "success";
    } 
    
}



$conn->close();

?>