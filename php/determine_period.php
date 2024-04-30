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

if (isset($_POST['id'])) {
    $id = $_POST['id'];
    $from = $_POST['from'];

    $month = date('m', strtotime($from));
    $year = date('Y', strtotime($from));

    $sql = "SELECT earnings, sss, phil, pbig FROM payroll_files WHERE month = '$month' AND year = '$year' AND period = 'first-half' AND company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$id'";

    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode($row);
    }
} 


$conn->close();
?>