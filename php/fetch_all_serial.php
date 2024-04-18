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

$sql = "SELECT serialnumber, name, class FROM staffs WHERE company_id = '". $_SESSION['companyid'] . "'";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
// output data of each row
    $data = array();
    while($row = $result->fetch_assoc()) {
        $item = [];
        $item["serial"] = $row['serialnumber'];
        $item["name"] = $row['name'];
        $item["class"] = $row['class'];
        $data[] = $item;
    }

    echo json_encode($data);
}

$conn->close();
?>