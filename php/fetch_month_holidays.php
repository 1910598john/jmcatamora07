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

if (isset($_POST['month'])) {
    $month = $_POST['month'];
    $year = $_POST['year'];
    $sql = "SELECT DISTINCT holiday_name, date, month, year FROM holidaysss WHERE company_id = '$company_id' AND month = '$month' AND year = '$year'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
    // output data of each row
        $data = array();
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        echo json_encode($data);
        
    } else {
        echo 'No item';
    }
}




$conn->close();
?>