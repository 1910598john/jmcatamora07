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

if (isset($_POST['date'])) {
    $date = $_POST['date'];
    $serialnumber = $_POST['serial'];

    $sql = "SELECT time_logs FROM attendance WHERE company_id = '". $_SESSION['companyid'] ."' AND serialnumber = '$serialnumber' AND status = 'IN' AND date = '$date' ORDER BY id DESC LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo $row['time_logs'];
    } 
}


$conn->close();
?>