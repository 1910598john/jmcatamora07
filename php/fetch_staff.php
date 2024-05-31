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

if (isset($_POST['serial'])) {
    $branch = $_POST['branch'];
    $serial = $_POST['serial'];
    
    $sql = "SELECT id, name, class, age, position, department, contact_number, serialnumber, adjustment, cash_advance, charges, sss_loan, pag_ibig_loan, company_loan, total_hours, hours_worked_today, status, date, leave_start, leave_end, date_employed, branch FROM staffs WHERE company_id = '". $_SESSION['companyid'] . "' AND serialnumber = '$serial' AND branch = '$branch'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
    // output data of each row

        $row = $result->fetch_assoc();

        echo json_encode($row);

    } 
}



$conn->close();
?>