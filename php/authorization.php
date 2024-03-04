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

if (isset($_POST['password'])) {
 
    $pass = $_POST['password'];
    $username = $_SESSION['username'];
    $company_id = $_SESSION['companyid'];

    $ciphering = "AES-128-CTR";
    $option = 0;
    $encryption_iv = "1234567890123456";
    $encryption_key = "12345";
    $encrypted_data = openssl_encrypt($pass, $ciphering, $encryption_key, $option, $encryption_iv);

    $sql = "SELECT username, password, company_id FROM payroll_admin WHERE username = '". $username . "' AND password = '". $encrypted_data . "' AND company_id = '". $company_id . "'";
    $result = $conn->query($sql);

    $authorized = false;

    if ($result->num_rows > 0) {
      //output data of each row
      $row = $result->fetch_assoc();
      
      if ($row['username'] == $username && $row['password'] == $encrypted_data && $row['company_id'] == $company_id) {
        $authorized = true;
      }
    } 

    if ($authorized) {
      $_SESSION['authorized'] = "authorized";
      echo 'authorized';
    } else {
      echo 'not authorized';
    }
}

$conn->close();
?>