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
    $snumber = $_POST['snumber'];
    
    $sql = "SELECT date FROM staffs_trail WHERE company_id = '". $_SESSION['companyid'] . "' AND date = '$date' AND serialnumber = '$snumber'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
    // output data of each row
        echo 'worked';
    }
}


$conn->close();
?>