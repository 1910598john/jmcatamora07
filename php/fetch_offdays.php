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

    $sql = "SELECT off_day FROM staffs WHERE company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$serial'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
    // output data of each row
       
        $row = $result->fetch_assoc();
       
        echo $row['off_day'];
        
    } else {
        echo "none";
    }
}
$conn->close();
?>