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



if (isset($_POST['serial'])) {
    $serial = $_POST['serial'];

    if (isset($_POST['from']) && isset($_POST['to'])) {
        $from = $_POST['from'];
        $to = $_POST['to'];
    
        $sql = "SELECT * FROM staffs_trail WHERE company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$serial' AND date BETWEEN DATE('$from') AND DATE('$to') ORDER BY id DESC";
    } else {
        if (isset($_POST['mon'])) {
            $selectedMonth = date('m', strtotime($_POST['mon']));
            $selectedYear = date('Y', strtotime($_POST['mon']));
            $sql = "SELECT * FROM staffs_trail WHERE company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$serial' AND MONTH(date) = $selectedMonth
            AND YEAR(date) = $selectedYear ORDER BY id DESC";
        }
    }
    
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        // output data of each row
        $data = array();
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        echo json_encode($data);
    }
}

$conn->close();
?>