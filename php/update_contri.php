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



$company_id = $_SESSION['companyid'];
$sql = "SELECT company_id FROM contributions WHERE company_id = '$company_id'";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    update($conn);
} else {
    insert($conn);
}

function update($conn) {
    $sss_fh = $_POST['sss_fh'];
    $phil = $_POST['phil'];
    $phil_fh = $_POST['phil_fh'];
    $pbig = $_POST['pbig'];
    $pbig_fh = $_POST['pbig_fh'];

    $company_id = $_SESSION['companyid'];
    $sql = "UPDATE contributions SET sss_first_half = '$sss_fh', phil = '$phil', phil_first_half = '$phil_fh', pbig = '$pbig', pbig_first_half = '$pbig_fh' WHERE company_id = '$company_id'";
    if ($conn->query($sql) === TRUE) {
        echo 'updated';
    }
}

function insert($conn) {
    $sss_fh = $_POST['sss_fh'];
    $phil = $_POST['phil'];
    $phil_fh = $_POST['phil_fh'];
    $pbig = $_POST['pbig'];
    $pbig_fh = $_POST['pbig_fh'];

    $company_id = $_SESSION['companyid'];

    $stmt = $conn->prepare("INSERT INTO contributions (company_id, sss_first_half, phil, phil_first_half, pbig, pbig_first_half)
    VALUES (?, ?, ?, ?, ?, ?)");
  
    $stmt->bind_param("isssss", $company_id, $sss_fh, $phil, $phil_fh, $pbig, $pbig_fh);
  
    if ($stmt->execute()) {
        echo 'updated';
    }

}



$conn->close();

?>