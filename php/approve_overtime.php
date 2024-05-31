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
    $branch = $_POST['branch'];

    if (isset($_POST['dismissed'])) {
        $sql = "UPDATE staffs_trail SET ot_approval = 'dismissed' WHERE company_id = '$company_id' AND serialnumber = '$serial' AND id = '$sid' AND branch = '$branch'";
    } else {
        $sql = "UPDATE staffs_trail SET ot_approval = 'approved' WHERE company_id = '$company_id' AND serialnumber = '$serial' AND id = '$sid' AND branch = '$branch'";
    }
    
    
    if ($conn->query($sql) === TRUE) {
        delete_approval($conn, $serial, $company_id, $id, $branch);
    } 
    
}

function delete_approval($conn, $serial, $company_id, $id, $branch) {
    $sql = "DELETE FROM ot_approval WHERE serialnumber = '" . $serial . "' AND id = '$id' AND company_id = '$company_id'  AND branch = '$branch'";

    if ($conn->query($sql) === TRUE) {
        echo "approved";
    } 
}


$conn->close();

?>