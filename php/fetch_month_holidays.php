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

if (isset($_POST['branch'])) {
    $branch = $_POST['branch'];
    $month = $_POST['month'];
    $year = $_POST['year'];
    $paysched = $_POST['paysched'];

    $sql = "SELECT DISTINCT date, holiday_name FROM holidaysss WHERE company_id = '$company_id' AND branch = '$branch'  AND paysched = '$paysched'";
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