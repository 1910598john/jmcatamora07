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
    $id = $_POST['id'];
    $class = $_POST['class'];

    $sql = "SELECT * FROM company_holidays WHERE id = '$id' AND company_id = '". $_SESSION['companyid'] . "' AND (class LIKE '% $class %' OR class LIKE '$class %' OR class LIKE '% $class' OR class = '$class')";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
    // output data of each row
        
        $row = $result->fetch_assoc();
        
        echo json_encode($row);
    }
}


$conn->close();
?>