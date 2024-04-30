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
if (isset($_POST['paysched'])) {
    $paysched = $_POST['paysched'];
    $company_id = $_SESSION['companyid'];

    if ($paysched == 'twice-monthly') {
        $sql = "SELECT DISTINCT from_date, to_date FROM payroll_files WHERE paysched = '$paysched' AND company_id = '$company_id' AND from_date IS NOT NULL 
        AND to_date IS NOT NULL ORDER BY id DESC";
        
    } else {
        if ($paysched == 'monthly') {
            $sql = "SELECT DISTINCT month, year FROM payroll_files WHERE paysched = '$paysched' AND company_id = '$company_id' AND month IS NOT NULL 
            AND year IS NOT NULL ORDER By id DESC";
        }
    }
    
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $data = array();

        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        echo json_encode($data);
    } 
}

$conn->close();
?>