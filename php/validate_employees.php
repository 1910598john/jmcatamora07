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
    $date = $_POST['date'];
    $date_before = $_POST['date_before'];
    $date_after = $_POST['date_after'];
    $branch = $_POST['branch'];
    $paysched = $_POST['paysched'];

    $sql = "SELECT * FROM staffs_trail WHERE company_id = '". $_SESSION['companyid'] . "' AND date = '$date' AND branch = '$branch'";
    $result = $conn->query($sql);

    $data = array();
    $arr = array();

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $arr[] = $row;
        }

        $data['present_on_holiday'] = $arr;
    } else {
        $data['present_on_holiday'] = $arr;
    }
    
    fetch_staffs_before_holiday($conn, $date_before, $date_after, $_SESSION['companyid'], $data, $branch);
}

function fetch_staffs_before_holiday($conn, $date_before, $date_after, $company_id, $data, $branch) {
    $sql = "SELECT * FROM staffs_trail WHERE company_id = '". $_SESSION['companyid'] . "' AND date = '$date_before' AND branch = '$branch'";
    $result = $conn->query($sql);

    $arr = array();

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $arr[] = $row;
        }
        $data['present_before_holiday'] = $arr;
    } else {
        $data['present_before_holiday'] = $arr;
    }

    fetch_staffs_after_holiday($conn, $date_before, $date_after, $company_id, $data, $branch);
}

function fetch_staffs_after_holiday($conn, $date_before, $date_after, $company_id, $data, $branch) {
    $sql = "SELECT * FROM staffs_trail WHERE company_id = '". $_SESSION['companyid'] . "' AND date = '$date_after' AND branch = '$branch'";
    $result = $conn->query($sql);

    $arr = array();

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $arr[] = $row;
        }
        $data['present_after_holiday'] = $arr;
    } else {
        $data['present_after_holiday'] = $arr;
    }

    
    fetch_staffs($conn, $data, $branch);
   
}

function fetch_staffs($conn, $data, $branch) {

    $sql = "SELECT name, serialnumber, class FROM staffs WHERE company_id = '". $_SESSION['companyid'] . "' AND branch = '$branch'";
    $result = $conn->query($sql);

    $arr = array();

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $arr[] = $row;
        }
        $data["staffs"] = $arr;

        echo json_encode($data);
    }
}


$conn->close();
?>