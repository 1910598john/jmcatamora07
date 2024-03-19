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

if (isset($_POST['name'])) {
    $name = $_POST['name'];
    $age = $_POST['age'];
    $position = $_POST['position'];
    $dept = $_POST['department'];
    $company_id = $_SESSION['companyid'];
    $serialnumber = $_POST['serialnumber'];
    $phone = $_POST['phone'];
    $class = $_POST['class'];
    $str = "Not set";
    $str2 = "None";

    $stmt = $conn->prepare("INSERT INTO staffs (name, class, age, position, department, company_id, serialnumber, status, contact_number, off_day, rest_day)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("sssssiissss", $name, $class, $age, $position,$dept, $company_id, $serialnumber, $str, $phone, $str2, $str2);

    if ($stmt->execute()) {
        echo "success";
   
        
    } else {
        echo "An error occured!";
    }
}


$conn->close();
?>