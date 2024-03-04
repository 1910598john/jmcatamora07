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
    $id = $_POST['id'];
    
    $sql = "SELECT * FROM staffs WHERE id = '$id' AND company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$serialnumber'";
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