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
    $name = $_POST['name'];
    $age = $_POST['age'];
    $position = $_POST['position'];
    $dept = $_POST['department'];
    $company_id = $_SESSION['companyid'];
    $serialnumber = $_POST['serialnumber'];
    $phone = $_POST['phone'];
    $class = $_POST['class'];
    $date_employed = $_POST['date_employed'];
    $str = "Not set";

    $branch = $_POST['branch'];
    
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        // Prepare and execute the statement with file upload
        $file_tmp = $_FILES['file']['tmp_name'];
        $file_content = file_get_contents($file_tmp); // Read file content
    
        $stmt = $conn->prepare("INSERT INTO staffs (name, class, age, position, department, company_id, serialnumber, status, contact_number, date_employed, file, branch)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssiisssss", $name, $class, $age, $position, $dept, $company_id, $serialnumber, $str, $phone, $date_employed, $file_content, $branch);
    } else {
        // Prepare and execute the statement without file upload
        $stmt = $conn->prepare("INSERT INTO staffs (name, class, age, position, department, company_id, serialnumber, status, contact_number, date_employed, branch)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssiissss", $name, $class, $age, $position, $dept, $company_id, $serialnumber, $str, $phone, $date_employed, $branch);
    }

    if ($stmt->execute()) {
        echo "success";
   
    } else {
        echo "An error occured!";
    }
}


$conn->close();
?>