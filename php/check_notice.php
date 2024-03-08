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

if (isset($_SESSION['companyid'])) {
    $comid = $_SESSION['companyid'];
    $sql = "SELECT COUNT(*) as count FROM notice WHERE company_id = '$comid'";
    $result = $conn->query($sql);

    if ($result) {
        // Fetch the row count
        $row = $result->fetch_assoc();
        $count = $row['count'];

        echo $count;
    }
}

?>