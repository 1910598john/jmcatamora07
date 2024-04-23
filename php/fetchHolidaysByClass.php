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
if (isset($_POST['class'])) {
    $id = $_POST['class'];
    
    $sql = "SELECT name, date FROM holidays WHERE company_id = '". $_SESSION['companyid'] . "' AND (class LIKE '% $id %' OR class LIKE '$id %' OR class LIKE '% $id' OR class = '$id')";
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