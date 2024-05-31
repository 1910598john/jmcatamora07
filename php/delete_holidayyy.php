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

if (isset($_POST['date'])) {
    $paysched = $_POST['paysched'];
    $company_id = $_SESSION['companyid'];
    $date = $_POST['date'];
    $branch = $_POST['branch'];

    $sql = "DELETE FROM holidaysss WHERE branch = '$branch' AND company_id = '$company_id' AND date = '$date' AND paysched = '$paysched'";

    if ($conn->query($sql) === TRUE) {
      echo "deleted";
    } 
}


$conn->close();

?>