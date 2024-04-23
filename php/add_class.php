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

if (isset($_POST['class'])) {
    $class = $_POST['class'];
    $hour = $_POST['hour'];
    $clock_in = $_POST['clock_in'];
    $clock_out = $_POST['clock_out'];
    $rate = $_POST['rate'];
    $rate_type = $_POST['rate_type'];
    $deductions = $_POST['deductions'];
    $company_id = $_SESSION['companyid'];


    $stmt = $conn->prepare("INSERT INTO employees_classification (company_id, class_name, hour_perday, clock_in_sched, clock_out_sched, rate, rate_type, deductions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("isississ", $company_id, $class, $hour, $clock_in, $clock_out, $rate, $rate_type, $deductions);

    $data = array();

    if ($stmt->execute()) {
      $data["message"] = "success";

      echo json_encode($data);
    } 


}


$conn->close();
?>