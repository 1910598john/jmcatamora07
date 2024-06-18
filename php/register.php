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

    $usernameNotUsed = checkUsername($conn);

    if (!$usernameNotUsed) {
        $user_name = $_POST['username'];
        $pass = $_POST['password'];
        $name = $_POST['name'];
        // $serialnumber = $_POST['serialnumber'];
        // $machine_id = $_POST['machine'];
        // $registered_id = $_POST['id'];
        
        function checkCompanyid($conn) {
            $companyid = $_POST['companyid'];
            while (checkIfExists($conn, $companyid)) {
                $companyid = intval($companyid) + 1;
            }
            return $companyid;
        }
    
        $companyid = checkCompanyid($conn);
    
        //encrypt password
        $ciphering = "AES-128-CTR";
        $option = 0;
        $encryption_iv = "1234567890123456";
        $encryption_key = "1910598";
        $encrypted_data = openssl_encrypt($pass, $ciphering, $encryption_key, $option, $encryption_iv);
    
        $sql = "INSERT INTO payroll_admin (name, username, password, company_id)
        VALUES ('$name', '$user_name', '$encrypted_data', '$companyid')";
    
        if ($conn->query($sql) === TRUE) {
            echo "success";
        } else {
            echo "An error occured!";
        }
    } else {
        echo 'username exists';
    }
    
}

function checkIfExists($conn, $companyid) {
    $sql = "SELECT company_id FROM payroll_admin WHERE company_id = '$companyid'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        return true;
    } else {
        return false;
    }
}

function checkUsername($conn) {
    $uname = $_POST['username'];
    $sql = "SELECT username FROM payroll_admin WHERE username = '$uname'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        return true;
    } else {
        return false;
    }
}

$conn->close();

?>