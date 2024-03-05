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

if (isset($_POST['sss'])) {
    $exists = checkIfExists($conn);
    $SSS = $_POST['sss'];
    $PBIG = $_POST['pbig'];
    $Phil = $_POST['phil'];
    $allowance = $_POST['allowance'];
    $company_id = $_SESSION['companyid'];

    if ($exists) {
        $sql = "UPDATE company_settings SET sss_deduction = '$SSS', philhealth_deduction = '$Phil', pag_ibig_deduction = '$PBIG', allowance = '$allowance' WHERE company_id = '$company_id'";
        
        if ($conn->query($sql) === TRUE) {
            echo "success";
        } 
    } else {
        $stmt = $conn->prepare("INSERT INTO company_settings (company_id, allowance, sss_deduction, philhealth_deduction, pag_ibig_deduction)
        VALUES (?, ?, ?, ?, ?)");

        $stmt->bind_param("iisss", $company_id, $allowance, $SSS, $Phil, $PBIG);

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