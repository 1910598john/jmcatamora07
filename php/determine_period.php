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

if (isset($_POST['id'])) {
    $id = $_POST['id'];
    $sql = "SELECT period FROM reports WHERE company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$id' ORDER BY id DESC LIMIT 1";

    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if ($row['period'] == 'first-half') {
            echo 'second-half';
        } 
        if ($row['period'] == 'second-half') {
            echo 'first-half';
        }
    } else {
        echo 'first-half';
    }
}


$conn->close();
?>