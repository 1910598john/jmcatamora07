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
if (isset($_POST['date'])) {
    $date = $_POST['date'];
    $company_id = $_SESSION['companyid'];
    $branch = $_POST['branch'];
    $paysched = $_POST['paysched'];
    $sql = "SELECT * FROM holidaysss WHERE date = '$date' AND company_id = '$company_id' AND branch = '$branch' AND paysched = '$paysched'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // output data of each row
        $data = array();
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        echo json_encode($data);
    }
}

$conn->close();
?>