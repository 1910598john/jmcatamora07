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

if (isset($_POST['data'])) {
    $json = $_POST['data'];
    $datas = json_decode($json, true);

    $stmt = $conn->prepare("INSERT INTO notice (company_id, name, serialnumber, position, department, contact_number, notice_message, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    $message = "MISSED TIME OUT.";

    $success = false;

    for ($i = 0; $i < count($datas); $i++) {
        $stmt->bind_param("isisssss", $_SESSION['companyid'], $datas[$i]["name"], $datas[$i]["serialnumber"], $datas[$i]["position"], $datas[$i]["department"], $datas[$i]["contact_number"], $message, $datas[$i]["date"]);

        if ($stmt->execute()) {
            $success = true;
        }
    }
    if ($success) {
        echo 'success';
    }

}


$conn->close();
?>