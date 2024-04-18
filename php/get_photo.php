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
    $snumber = $_POST['serial'];
    
    $sql = "SELECT file FROM staffs WHERE company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$snumber'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if ($row['file'] === null) {
            echo 'none';
        } else {
            echo base64_encode($row['file']);
        }
        
        
    }
}


$conn->close();
?>