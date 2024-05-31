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

if (isset($_POST['date'])) {
    
    $date = $_POST['date'];
    $branch = $_POST['branch'];
    $month = $_POST['month'];
    $year = $_POST['year'];
    $name = $_POST['name'];
    $employee = $_POST['employee'];
    $serial = $_POST['serial'];
    $date_before = $_POST['date_before'];
    $date_after = $_POST['date_after'];
    $present = $_POST['present'];
    $company_id = $_SESSION['companyid'];
    $class = $_POST['class'];
    $paysched = $_POST['paysched'];

    $exists = checkHolidays($conn, $month, $year, $date, $branch, $company_id, $serial, $paysched);

    if ($paysched == 'twice-monthly') {
        $from = $_POST['from'];
        $to = $_POST['to'];

        if (!$exists) {
            $stmt = $conn->prepare("INSERT INTO holidaysss (company_id, branch, month, year, date, holiday_name, employee, serialnumber, class, isvalid_date_before, present, isvalid_date_after, from_date, to_date, paysched)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
            $stmt->bind_param("isssssssssissss", $company_id, $branch, $month, $year, $date, $name, $employee, $serial, $class, $date_before, $present, $date_after, $from, $to, $paysched);
        
            if ($stmt->execute()) {
             
            } 
        }
        
    } else {

        if (!$exists) {
            $stmt = $conn->prepare("INSERT INTO holidaysss (company_id, branch, month, year, date, holiday_name, employee, serialnumber, class, isvalid_date_before, present, isvalid_date_after, paysched)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
            $stmt->bind_param("isssssssssiss", $company_id, $branch, $month, $year, $date, $name, $employee, $serial, $class, $date_before, $present, $date_after, $paysched);
        
            if ($stmt->execute()) {
             
            } 
        }
    }

    
}

function checkHolidays($conn, $month, $year, $date, $branch, $company_id, $serial, $paysched) {
    $sql = "SELECT holiday_name FROM holidaysss WHERE company_id = '$company_id' AND serialnumber = '$serial' AND branch = '$branch' AND date = '$date' AND paysched = '$paysched'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        return true;
    } else {
        return false;
    }
}


$conn->close();
?>