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

if (isset($_POST['paysched'])) {
    $paysched = $_POST['paysched'];
    $col1 = $_POST['col1'];
    $col2 = $_POST['col2'];
    $branch = $_POST['branch'];
    if ($paysched == 'twice-monthly') {
        $sql = "SELECT * FROM payroll_files WHERE paysched = 'twice-monthly' AND company_id = '". $_SESSION['companyid'] . "' AND from_date = '$col1' AND to_date = '$col2' AND branch = '$branch'";
    } else {
        if ($paysched == 'monthly') {
            $sql = "SELECT * FROM payroll_files WHERE paysched = 'monthly' AND company_id = '". $_SESSION['companyid'] . "' AND month = '$col1' AND year = '$col2' AND branch = '$branch'";
        }
    }
  
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