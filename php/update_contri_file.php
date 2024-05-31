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

    $paysched = $_POST['paysched'];
    $col1 = $_POST['col1'];
    $col2 = $_POST['col2'];
    $snumber = $_POST['serial'];
    $sss = $_POST['sss'];
    $phil = $_POST['phil'];
    $pbig = $_POST['pbig'];
    $td = $_POST['td'];
    $net = $_POST['net'];
    $branch = $_POST['branch'];

    $company_id = $_SESSION['companyid'];

    if ($paysched == 'twice-monthly') {
        $sql = "UPDATE payroll_files SET sss = '$sss', phil = '$phil', pbig = '$pbig', total_deductions = '$td', net = '$net' WHERE company_id = '$company_id' AND serialnumber = '$snumber' AND from_date = '$col1' AND to_date = '$col2' AND branch = '$branch'";
    } else {
        $selectedMonth = date('m', strtotime($_POST['col1']));
        $selectedYear = date('Y', strtotime($_POST['col1']));
        if ($paysched == 'monthly') {
            $sql = "UPDATE payroll_files SET sss = '$sss', phil = '$phil', pbig = '$pbig', total_deductions = '$td', net = '$net' WHERE company_id = '$company_id' AND serialnumber = '$snumber' AND month = '$col1' AND year = '$col2' AND branch = '$branch'";
        }
    }
    
    if ($conn->query($sql) === TRUE) {
      echo "success";
    } 
}


$conn->close();

?>