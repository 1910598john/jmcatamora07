<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "payroll";

session_start();

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

if (isset($_POST['branch'])) {
 
    $branch = $_POST['branch'];
    $name = $_POST['user'];
    $log = $_POST['log'];
    $company_id = $_SESSION['companyid'];
    $stmt = $conn->prepare("INSERT INTO logs (company_id, user, log, time_log, branch)
    VALUES (?, ?, ?, NOW(), ?)");

    $stmt->bind_param("isss", $company_id,  $name, $log, $branch);

    if ($stmt->execute()) {
        echo 'logged';
    }
  
}

$conn->close();
?>