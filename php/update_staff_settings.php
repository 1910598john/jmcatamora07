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
    $id = $_POST['id'];
    $snumber = $_POST['serialnumber'];
    $charges = $_POST['charges'];
    $adjustment = $_POST['adjustment'];
    $CA = $_POST['cash_advance'];
    $SSS_loan = $_POST['sss_loan'];
    $PBIG_loan = $_POST['pbig_loan'];
    $company_loan = $_POST['company_loan'];
    $company_id = $_SESSION['companyid'];

    $sql = "UPDATE staffs SET charges = '$charges', adjustment = '$adjustment', cash_advance = '$CA', sss_loan = '$SSS_loan', pag_ibig_loan = '$PBIG_loan', company_loan = '$company_loan' WHERE id = '$id' AND serialnumber = '" . $snumber . "' AND company_id = '$company_id'";
    
    if ($conn->query($sql) === TRUE) {
      echo "success";
    } 
}


$conn->close();

?>