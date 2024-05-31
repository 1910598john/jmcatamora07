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

if (isset($_POST['branch'])) {
    $serial = $_POST['serial'];
    $branch = $_POST['branch'];
    $company_id = $_SESSION['companyid'];
    $paysched = $_POST['paysched'];

    if ($paysched == 'twice-monthly') {
        $from = $_POST['from'];
        $to = $_POST['to'];
        $sql = "SELECT pay FROM holidaysss WHERE company_id = '$company_id' AND branch = '$branch' AND serialnumber = '$serial' AND date BETWEEN '$from' AND '$to'";
        $result = $conn->query($sql);
    } else {
        $month = $_POST['month'];
        $year = $_POST['year'];
        $sql = "SELECT pay FROM holidaysss WHERE company_id = '$company_id' AND branch = '$branch' AND serialnumber = '$serial' AND month = '$month' AND year = '$year'";
        $result = $conn->query($sql);
    }

    if ($result->num_rows > 0) {
    
        $pay = 0;
        while ($row = $result->fetch_assoc()) {
            $pay += intval($row['pay']);
        }
        
        echo $pay;
    } else {
        echo 0;
    }
}


$conn->close();
?>