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

if (isset($_POST['username'])) {
    $sql = "SELECT username FROM payroll_admin WHERE username = '" . $_POST['username'] ."'";
    $result = $conn->query($sql);

    $doesExist = false;
    
    if ($result->num_rows > 0) {
        // output data of each row
        $doesExist = true;
    } 

    if ($doesExist) {
        echo 'Username already taken.';
    } else {
        echo 'available';
    }
}



$conn->close();



?>