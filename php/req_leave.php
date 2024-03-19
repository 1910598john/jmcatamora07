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
    $start = $_POST['start'];
    $paid_leave = $_POST['paid_leave'];
    $end = $_POST['end'];

    $company_id = $_SESSION['companyid'];

    if ($paid_leave === 'paid') {
        $paid_leave = 1;
    } else {
        $paid_leave = 0;
    }

    
    $sql = "UPDATE staffs SET leave_start = '$start', leave_end = '$end', paid_leave = '$paid_leave' WHERE company_id = '$company_id' AND serialnumber = '$serial'";
    
    if ($conn->query($sql) === TRUE) {
        echo "success";
    } 
    
}



$conn->close();

?>