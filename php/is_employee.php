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
    $id = $_POST['id'];

    $sql = "SELECT name, position, department, status FROM staffs WHERE serialnumber = '". $id . "' AND company_id = '". $_SESSION['companyid'] . "'";
    $result = $conn->query($sql);
    
    $data = array();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        //output data of each row
        $data[] = $row;

        echo json_encode($data);
    } 

}

$conn->close();
?>