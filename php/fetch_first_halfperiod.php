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
    $serial = $_POST['id'];
    

    $sql = "SELECT salary_rate, sss, phil, pbig FROM reports WHERE company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$serial' AND period = 'first-half' ORDER BY id DESC LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // output data of each row
        $row = $result->fetch_assoc();

        echo json_encode($row);
        
    } else {
        echo "none";
    }
}

$conn->close();
?>