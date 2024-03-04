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

if (isset($_POST['machine'])) {
    $sql = "SELECT machine_id, company_id FROM payroll_admin WHERE machine_id = '".$_POST['machine']."'";
    $result = $conn->query($sql);
    
    $doesExist = false;
        
    if ($result->num_rows > 0) {
    // output data of each row
        $row = $result->fetch_assoc();
        
        session_start();
        $_SESSION['companyid'] = $row['company_id'];        
        $doesExist = true;    
    } 

    if ($doesExist) {
        echo 'does exists';
    } else {
        echo 'test';
    }

}

$conn->close();
?>