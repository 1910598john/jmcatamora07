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



if (isset($_POST['username']) && isset($_POST['password'])) {
    $user_name = $_POST['username'];
    $pass = $_POST['password'];

    $sql = "SELECT username, password, company_id FROM payroll_admin";
    $result = $conn->query($sql);

    $isRegistered = false;
    $company_id;

    if ($result->num_rows > 0) {
      //output data of each row
      while($row = $result->fetch_assoc()) {
        $entered_password = $row['password'];
        $ciphering = "AES-128-CTR";
        $option = 0;
        $decryption_iv = "1234567890123456";
        $decryption_key = "12345";
        $decrypted_data = openssl_decrypt($entered_password, $ciphering, $decryption_key, $option, $decryption_iv);

        if ($row['username'] == $user_name && $decrypted_data == $pass) {
          $company_id = $row['company_id'];
          $isRegistered = true;
        }

      }
    }

    if ($isRegistered) {
      session_start();
      $_SESSION['companyid'] = $company_id;
      $_SESSION['username'] = $user_name;
      
      echo 'success';
    }

   
}

$conn->close();
?>