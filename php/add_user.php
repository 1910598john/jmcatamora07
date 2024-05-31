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

if (isset($_POST['name'])) {
  $usernameNotUsed = checkUsername($conn);

  if (!$usernameNotUsed) {
    $name = $_POST['name'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    $permission = $_POST['permission'];

    $ciphering = "AES-128-CTR";
    $option = 0;
    $encryption_iv = "1234567890123456";
    $encryption_key = "1910598";
    $encrypted_data = openssl_encrypt($password, $ciphering, $encryption_key, $option, $encryption_iv);

    $company_id = $_SESSION['companyid'];

    $stmt = $conn->prepare("INSERT INTO users (company_id, name, username, password, permission)
    VALUES (?, ?, ?, ?, ?)");

    $stmt->bind_param("issss", $company_id, $name, $username, $encrypted_data, $permission);

    $data = array();

    if ($stmt->execute()) {
        echo "success";
    }
  } else {
    echo 'username exists';
  }
}

function checkUsername($conn) {
  $uname = $_POST['username'];
  $sql = "SELECT username FROM users WHERE username = '$uname'";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
      return true;
  } else {
      return false;
  }
}


$conn->close();
?>