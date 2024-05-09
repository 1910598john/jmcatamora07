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
    $serial = $_POST['serial'];
    $company_id = $_SESSION['companyid'];
    $sql = "SELECT * FROM employee_allowance WHERE company_id = '$company_id' AND serialnumber = '$serial'";
       
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $data = array();
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
    } 
}


$conn->close();
?>