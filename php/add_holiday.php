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

if (isset($_POST['date'])) {
    $date = $_POST['date'];
    $percentage = $_POST['percentage'];
    $company_id = $_SESSION['companyid'];


    $stmt = $conn->prepare("INSERT INTO company_holidays (company_id, holiday_date, percentage)
    VALUES (?, ?, ?)");

    $stmt->bind_param("iss",$company_id, $date, $percentage);

    $data = array();

    if ($stmt->execute()) {
        $data["message"] = "success";
        $data["id"] = $conn->insert_id;
    } 

    echo json_encode($data);
}


$conn->close();
?>