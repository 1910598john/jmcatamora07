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

if (isset($_POST['branch'])) {
  $isbranchExists = checkBranch($conn, $_POST['branch'], $_POST['machine']);
  
  if (!$isbranchExists) {
    $branch = $_POST['branch'];
    $machine = $_POST['machine'];
    $company_id = $_SESSION['companyid'];
    $stmt = $conn->prepare("INSERT INTO machines (company_id, branch_name, machine_id)
    VALUES (?, ?, ?)");
  
    $stmt->bind_param("iss", $company_id, $branch, $machine);
  
    if ($stmt->execute()) {
      echo 'success';
    }

  } else {
    echo 'branch exists';
  }
}

function checkBranch($conn, $branch, $machine) {
    $sql = "SELECT branch_name, machine_id FROM machines WHERE company_id = '". $_SESSION['companyid'] . "' AND branch_name = '$branch' AND machine_id = '$machine'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        return true;
    } else {
        return false;
    }
}


$conn->close();
?>