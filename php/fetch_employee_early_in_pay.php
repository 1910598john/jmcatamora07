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
    $branch = $_POST['branch'];
    $paysched = $_POST['paysched'];
    if ($paysched == 'twice-monthly') {
        $from = $_POST['from'];
        $to = $_POST['to'];
        $sql = "SELECT pay FROM early_in_approval WHERE approved = 1 AND company_id = '". $_SESSION['companyid'] . "' AND branch = '$branch' AND serialnumber = '$serial' AND date BETWEEN DATE('$from') AND DATE('$to')";
    } else {
        $month = $_POST['month'];
        $sql = "SELECT pay FROM early_in_approval WHERE approved = 1 AND company_id = '". $_SESSION['companyid'] . "' AND branch = '$branch' AND serialnumber = '$serial' AND MONTH(date) = $month";
    }
    
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $pay = 0;
        while($row = $result->fetch_assoc()) {
            $pay = $pay + intval($row['pay']);
        }
        echo $pay;
    } else {
        echo 0;
    }
}


$conn->close();
?>
