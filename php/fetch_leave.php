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

    $sql = "SELECT leave_start, leave_end FROM staffs WHERE company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$serial'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
    // output data of each row
       
        $row = $result->fetch_assoc();
       
        $data = array();
        $data[] = $row;

        echo json_encode($data);
        
    } else {
        echo "none";
    }
}
$conn->close();
?>