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
    $snumber = $_POST['serial'];
    $date = $_POST['date'];
    $branch = $_POST['branch'];
    $pay = $_POST['pay'];
    $company_id = $_SESSION['companyid'];
    $perc = $_POST['perc'];

    $paysched = $_POST['paysched'];

    $sql = "UPDATE holidaysss SET approved = 1, pay = $pay, percentage = $perc WHERE company_id = '$company_id' AND serialnumber = '$snumber' AND date = '$date' AND branch = '$branch' AND paysched = '$paysched'";
    
    if ($conn->query($sql) === TRUE) {
      
    } 
}


$conn->close();

?>