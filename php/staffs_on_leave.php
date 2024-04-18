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

$sql = "SELECT * FROM staffs WHERE company_id = '". $_SESSION['companyid'] . "'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output data of each row
 
    while($row = $result->fetch_assoc()) {
        if ($row['leave_start'] !== null) {
            $curDate = date('Y-m-d');
            
            $ended = false;
            if ($row['leave_end'] == $curDate || $row['leave_end'] < $curDate){
                updateLeaveStatus($conn, $_SESSION['companyid'], $row['serialnumber']);
                $ended = true;
            }

            if (!$ended) {
                if ($row['leave_start'] == $curDate || $curDate > $row['leave_start']) {
                    addTrail($conn, $_SESSION['companyid'], $row['serialnumber'], $row['class'], $row['name']);
                }
            }
        }
    }
}

function updateLeaveStatus($conn, $company_id, $serial) {
    $sql = "UPDATE staffs SET leave_start = NULL, leave_end = NULL WHERE serialnumber = '" . $serial . "' AND company_id = '$company_id'";
    if ($conn->query($sql) === TRUE) {

    }
}

function addTrail($conn, $company_id, $serial, $class, $name) {
    $sql = "INSERT INTO staffs_trail (company_id, name, class, serialnumber, date, leave_status, paid_status) VALUES (?, ?, ?, ?, NOW(), ?, ?)";
    $stmt = $conn->prepare($sql);
    $onLeave = 1;
    $paid = 'not paid';
    $stmt->bind_param("isssis",$company_id, $name, $class, $serial, $onLeave, $paid);

    $sameday = checkIfSameDay($conn, $company_id, $serial);

    if (!$sameday) {
        if ($stmt->execute()) {
        }
    }
    
}

function checkIfSameDay($conn, $company_id, $serial) {
    $sql = "SELECT leave_status FROM staffs_trail WHERE leave_status = 1 AND company_id = '$company_id' AND serialnumber = '$serial' AND DATE(date) = CURDATE()";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        return true;
    }

    return false;
}

$conn->close();
?>