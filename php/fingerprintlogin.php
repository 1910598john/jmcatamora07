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

if (isset($_POST['id'])) {

  $sql = "SELECT username, password FROM payroll_admin WHERE registered_id = '".$_POST['id']."'";
  $result = $conn->query($sql);

  $data = array();

  if ($result->num_rows > 0) {
    //output data of each row
    $row = $result->fetch_assoc();
    $ciphering = "AES-128-CTR";
    $option = 0;
    $decryption_iv = "1234567890123456";
    $decryption_key = "1910598";
    $decrypted_data = openssl_decrypt($row['password'], $ciphering, $decryption_key, $option, $decryption_iv);

    $row['password'] = $decrypted_data;
    $data[] = $row;

    $json = json_encode($data);

    echo $json;
  }
    
}

$conn->close();
?>