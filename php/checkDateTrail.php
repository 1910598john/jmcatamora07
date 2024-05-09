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

    if (isset($_POST['date1']) && isset($_POST['date2'])) {
        $date1 = $_POST['date1'];
        $date2 = $_POST['date2'];
    }

    $serial = $_POST['serial'];
    $company_id = $_SESSION['companyid'];

    if ($_POST['type'] == 'abaah' || $_POST['type'] == 'ubaah') {
        
        if ($_POST['type'] == 'abaah') {
            $sql = "SELECT date FROM staffs_trail WHERE date = '$date1' AND company_id = '$company_id' AND serialnumber = '$serial'";

            $result = $conn->query($sql);
    
            if ($result->num_rows > 0) {
                checkDate2($conn, $serial, $company_id, $date2, 'Valid');
            } else {
                checkDate2($conn, $serial, $company_id, $date2, 'Invalid');
            }

        } else {
            
            $sql = "SELECT date, ut_mins FROM staffs_trail WHERE date = '$date1' AND company_id = '$company_id' AND serialnumber = '$serial'";

            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $mins = intval($row['ut_mins']);

                if ($mins > 0) {
                    checkDate2($conn, $serial, $company_id, $date2, 'Invalid');
                } else {
                    checkDate2($conn, $serial, $company_id, $date2, 'Valid');
                }

            } 
        }
        
    } else {

        if ($_POST['type'] == 'ubh') {

            $sql = "SELECT date, ut_mins FROM staffs_trail WHERE date = '$date' AND company_id = '$company_id' AND serialnumber = '$serial'";

            $result = $conn->query($sql);
    
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $mins = intval($row['ut_mins']);

                if ($mins > 0) {
                    echo 'Invalid';
                } else {
                    echo 'Valid';
                }
            }

        } else if ($_POST['type'] == 'uah') {

            $sql = "SELECT date, ut_mins FROM staffs_trail WHERE date = '$date' AND company_id = '$company_id' AND serialnumber = '$serial'";

            $result = $conn->query($sql);
    
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $mins = intval($row['ut_mins']);

                if ($mins > 0) {
                    echo 'Invalid';
                } else {
                    echo 'Valid';
                }
            }

        } else if ($_POST['type'] == 'abh') {

            $sql = "SELECT date FROM staffs_trail WHERE date = '$date' AND company_id = '$company_id' AND serialnumber = '$serial'";

            $result = $conn->query($sql);
    
            if ($result->num_rows > 0) {
                echo 'Valid';
                
            }
        } else if ($_POST['type'] == 'aah') {

            $sql = "SELECT date FROM staffs_trail WHERE date = '$date' AND company_id = '$company_id' AND serialnumber = '$serial'";

            $result = $conn->query($sql);
    
            if ($result->num_rows > 0) {
                echo 'Valid';
                
            }
        }
        
    }
    
}

function checkDate2($conn, $serial, $company_id, $date2, $isValid) {
    
    if ($_POST['type'] == 'abaah') {
        $sql = "SELECT date FROM staffs_trail WHERE date = '$date2' AND company_id = '$company_id' AND serialnumber = '$serial'";
    } else {
        $sql = "SELECT date, ut_mins FROM staffs_trail WHERE date = '$date2' AND company_id = '$company_id' AND serialnumber = '$serial'";
    }
    
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        if ($_POST['type'] == 'ubaah') {
            $row = $result->fetch_assoc();
            $mins = intval($row['ut_mins']);
    
            $arr = array();
            if ($mins > 0) {
                
                $arr[0] = $isValid;
                $arr[1] = 'Invalid';
                //echo 'undertime';
            } else {
                $arr[0] = $isValid;
                $arr[1] = 'Valid';
            }

            echo json_encode($arr);

        } else {
            $arr = array();
            $arr[0] = $isValid;
            $arr[1] = 'Valid';

            echo json_encode($arr);
        }
    }
}

$conn->close();
?>