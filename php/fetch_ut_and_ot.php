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
if (isset($_POST['serialnumber'])) {
    $serialnumber = $_POST['serialnumber'];
    
    $sql = "SELECT ot_total, ut_total FROM staffs_trail WHERE company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$serialnumber' AND MONTH(date) = MONTH(CURDATE())
    AND YEAR(date) = YEAR(CURDATE())";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
    // output data of each row
        $data = array();
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        $json = json_encode($data);
        echo $json;
    } 
}

$conn->close();
?>