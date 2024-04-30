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

if (isset($_POST['paysched'])) {
    $company_id = $_SESSION['companyid'];
    $paysched = $_POST['paysched'];
    $col1 = $_POST['col1'];
    $col2 = $_POST['col2'];
    if ($paysched == 'twice-monthly') {
        $sql = "DELETE FROM payroll_files WHERE from_date = '$col1' AND to_date = '$col2' AND company_id = '$company_id'";
    } else {
        if ($paysched == 'monthly') {
            $sql = "DELETE FROM payroll_files WHERE month = '$col1' AND year = '$col2' AND company_id = '$company_id'";
        }
    }
    
    if ($conn->query($sql) === TRUE) {
        echo "deleted";
    } 
}

$conn->close();

?>