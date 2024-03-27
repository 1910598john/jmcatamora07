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

if (isset($_POST['pay_sched'])) {
    $exists = checkIfExists($conn);
    
    $pay_sched = $_POST['pay_sched'];
    $day1 = $_POST['day1'];
    $day2 = $_POST['day2'];
    $name = $_POST['name'];
    $address = $_POST['address'];

    $company_id = $_SESSION['companyid'];

    if ($exists) {
        $sql = "UPDATE company_settings SET pay_sched = '$pay_sched', day1 = '$day1', day2 = '$day2', name = '$name', address = '$address' WHERE company_id = '$company_id'";
        
        if ($conn->query($sql) === TRUE) {
            echo "success";
        } 
    } else {
        $stmt = $conn->prepare("INSERT INTO company_settings (company_id, pay_sched, day1, day2)
        VALUES (?, ?, ?, ?)");

        $stmt->bind_param("ssii", $company_id, $pay_sched, $day1, $day2);

        if ($stmt->execute()) {
            echo "success";
        } 
    }
}

function checkIfExists($conn){
    $tableCount = checkTable($conn);
    $tableCount = intval($tableCount);
    if ($tableCount == 0) {
        return false;
    } else if ($tableCount > 0) {
        $sql = "SELECT company_id FROM company_settings WHERE company_id = '". $_SESSION['companyid'] . "'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            return true;
        } else {
            return false;
        }
    }
}

function checkTable($conn){
    $sql = "SELECT COUNT(*) as total FROM company_settings";
    $result = $conn->query($sql);

    if ($result) {
        $row = $result->fetch_assoc();
        return $row['total'];
    }
}

$conn->close();

?>