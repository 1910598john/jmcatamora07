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

if (isset($_POST['username']) && isset($_POST['password'])) {
  $user_name = $_POST['username'];
  $pass = $_POST['password'];

  $sql = "SELECT name, username, password, company_id FROM payroll_admin";
  $result = $conn->query($sql);

  $isRegistered = false;
  $company_id;
  $name = '';

  if ($result->num_rows > 0) {
    //output data of each row
    while($row = $result->fetch_assoc()) {
      $entered_password = $row['password'];
      $ciphering = "AES-128-CTR";
      $option = 0;
      $decryption_iv = "1234567890123456";
      $decryption_key = "1910598";
      $decrypted_data = openssl_decrypt($entered_password, $ciphering, $decryption_key, $option, $decryption_iv);

      if ($row['username'] == $user_name && $decrypted_data == $pass) {
        $company_id = $row['company_id'];
        $isRegistered = true;
        $name = $row['name'] . " (admin)";
      }
    }
  }

  if ($isRegistered) {
    
    $_SESSION['companyid'] = $company_id;
    $_SESSION['username'] = $user_name;
    $_SESSION['admin'] = "admin";
    $_SESSION['nameofuser'] = $name;
    
    echo 'success';
  } else {
    isUser($conn);
  }
}

function isUser($conn) {
  $user_name = $_POST['username'];
  $pass = $_POST['password'];

  $isRegistered = false;
  
  $sql = "SELECT name, username, password, company_id, permission FROM users";
  $result = $conn->query($sql);

  $permissions = '';
  $company_id = '';
  $name = '';
  if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
      $entered_password = $row['password'];
      $ciphering = "AES-128-CTR";
      $option = 0;
      $decryption_iv = "1234567890123456";
      $decryption_key = "1910598";
      $decrypted_data = openssl_decrypt($entered_password, $ciphering, $decryption_key, $option, $decryption_iv);

      if ($row['username'] == $user_name && $decrypted_data == $pass) {
        $company_id = $row['company_id'];
        $permissions = $row['permission'];
        $name = $row['name'];
        $isRegistered = true;
      }
    }
  }

  if ($isRegistered) {

    $_SESSION['companyid'] = $company_id;
    $_SESSION['username'] = $user_name;
    $_SESSION['permissions'] = $permissions;
    $_SESSION['nameofuser'] = $name;

    echo 'success';
  }
}

$conn->close();
?>