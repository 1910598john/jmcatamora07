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

if (isset($_POST['id'])) {
  $id = $_POST['id'];
  $company_id = $_SESSION['companyid'];

  $sql = "DELETE FROM company_allowance WHERE id = '$id' AND company_id = '$company_id'";

  if ($conn->query($sql) === TRUE) {
    echo 'deleted';
  } 
}

// function deletePenalty($id, $conn, $company_id) {
//   $sql = "DELETE FROM allowance_penalty WHERE allowance = '$id' AND company_id = '$company_id'";

//   if ($conn->query($sql) === TRUE) {
//     echo 'deleted';
//   }

// }
$conn->close();

?>