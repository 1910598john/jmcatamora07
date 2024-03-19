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
    $rate = $_POST['rate'];
    $rate_type = $_POST['rate_type'];
    $ot_pay = $_POST['ot_pay'];
    $holi_pay = $_POST['holi_pay'];

    $company_id = $_SESSION['companyid'];


    $stmt = $conn->prepare("INSERT INTO employees_classification (company_id, class_name, hour_perday, clock_in_sched, rate, rate_type, ot_pay, holi_pay)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("isisisss", $company_id, $class, $hour, $clock_in, $rate, $rate_type, $ot_pay, $holi_pay);

    $data = array();

    if ($stmt->execute()) {
      $data["message"] = "success";

      echo json_encode($data);
    } 


}


$conn->close();
?>