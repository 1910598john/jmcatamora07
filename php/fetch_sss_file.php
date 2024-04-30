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


$sql = "SELECT sss_name, sss, status FROM sss WHERE company_id = '". $_SESSION['companyid'] . "' ORDER BY id DESC";
$result = $conn->query($sql);

if ($result->num_rows > 0) {

    $data = array();
    while($row = $result->fetch_assoc()) {
        $arr = array();
        $arr['name'] = $row['sss_name'];
        $arr['file'] = base64_encode($row['sss']);
        $arr['status'] = $row['status'];
        $data[] = $arr;
    }

    echo json_encode($data);
} 


$conn->close();
?>