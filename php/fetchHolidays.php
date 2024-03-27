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

    
$sql = "SELECT id, holiday_name FROM company_holidays WHERE company_id = '". $_SESSION['companyid'] . "'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
// output data of each row
    $data = array();
    while($row = $result->fetch_assoc()){
        $data[] = $row;
    }
    
    echo json_encode($data);
}

$conn->close();
?>