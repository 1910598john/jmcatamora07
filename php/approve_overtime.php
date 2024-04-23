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
    $sid = $_POST['sid'];
    $id = $_POST['id'];
    $company_id = $_SESSION['companyid'];

    $sql = "UPDATE staffs_trail SET ot_approval = 'approved' WHERE company_id = '$company_id' AND serialnumber = '$serial' AND id = '$sid'";
    
    if ($conn->query($sql) === TRUE) {
        delete_approval($conn, $serial, $company_id, $id);
    } 
    
}

function delete_approval($conn, $serial, $company_id, $id) {
    $sql = "DELETE FROM ot_approval WHERE serialnumber = '" . $serial . "' AND id = '$id' AND company_id = '$company_id'";

    if ($conn->query($sql) === TRUE) {
        echo "approved";
    } 
}


$conn->close();

?>