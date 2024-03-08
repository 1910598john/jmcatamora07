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
    $rate = $_POST['rate'];
    $serialnumber = $_POST['serialnumber'];
    $phone = $_POST['phone'];
    $str = "Not set";

    $stmt = $conn->prepare("INSERT INTO staffs (name, age, position, department, company_id, rate, serialnumber, status, contact_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("sissiiiss", $name,$age, $position,$dept, $company_id, $rate, $serialnumber, $str, $phone);

    if ($stmt->execute()) {
        echo "success";
   
        
    } else {
        echo "An error occured!";
    }
}


$conn->close();
?>