<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "payroll";

session_start();

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

if (isset($_POST['username']) && isset($_POST['password']) && isset($_POST['name'])) {

    $user_name = $_POST['username'];
    $pass = $_POST['password'];
    $name = $_POST['name'];
    $serialnumber = $_POST['serialnumber'];
    $machine_id = $_POST['machine'];
    $registered_id = $_POST['id'];
   
    
    $companyid;
    if (isset($_SESSION['companyid'])) {
        $companyid = $_SESSION['companyid'];
    } else {
        $companyid = $_POST['companyid'];
    }
    
    $company_name = "NOT SET";
    $company_address = "NOT SET";


    //encrypt password
    $ciphering = "AES-128-CTR";
    $option = 0;
    $encryption_iv = "1234567890123456";
    $encryption_key = "12345";
    $encrypted_data = openssl_encrypt($pass, $ciphering, $encryption_key, $option, $encryption_iv);

    $sql = "INSERT INTO payroll_admin (name, username, password, registered_id, serialnumber, machine_id, company_id, company_name, company_add)
    VALUES ('$name', '$user_name', '$encrypted_data', '$registered_id', '$serialnumber', '$machine_id', '$companyid', '$company_name', '$company_address')";

    if ($conn->query($sql) === TRUE) {
        echo "success";
    } else {
        echo "An error occured!";
    }
}

$conn->close();

?>