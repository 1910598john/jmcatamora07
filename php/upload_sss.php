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

$company_id = $_SESSION['companyid'];
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
  $excelFileName = $_FILES['file']['name'];
  $excelTmpName = $_FILES['file']['tmp_name'];

  // Read Excel file contents
  $excelData = file_get_contents($excelTmpName);
  $status = "current";

  // Prepare INSERT query
  $insertQuery = "INSERT INTO sss (sss_name, sss, company_id, status) VALUES (?, ?, ?, ?)";
  $statement = $conn->prepare($insertQuery);

  // Bind parameters and execute the query
  $statement->bind_param('sbis', $excelFileName, $excelData, $company_id, $status);
  $statement->send_long_data(1, $excelData); // Send binary data
  $statement->execute();

  if ($statement->affected_rows > 0) {
    update_status($conn, $company_id, $conn->insert_id);
  } 
}


function update_status($conn, $company_id, $id) {
  $sql = "UPDATE sss SET status = '' WHERE company_id = '$company_id' AND NOT id = '$id'";
    
  if ($conn->query($sql) === TRUE) {
    echo 'uploaded';
  }
  
}

$conn->close();
?>