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
    
                checkDate2($conn, $serial, $company_id, $date2);
    
            } else {
                echo 'did not work';
            }

        } else {
            
            $sql = "SELECT date, ut_mins FROM staffs_trail WHERE date = '$date1' AND company_id = '$company_id' AND serialnumber = '$serial'";

            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $mins = intval($row['ut_mins']);

                if ($mins > 0) {
                    checkDate2($conn, $serial, $company_id, $date2);
                } else {
                    echo 'worked';
                }

            } else {
                echo 'did not work';
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
                    echo 'undertime';
                } else {
                    echo 'worked';
                }
            }

        } else if ($_POST['type'] == 'uah') {

            $sql = "SELECT date, ut_mins FROM staffs_trail WHERE date = '$date' AND company_id = '$company_id' AND serialnumber = '$serial'";

            $result = $conn->query($sql);
    
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $mins = intval($row['ut_mins']);

                if ($mins > 0) {
                    echo 'undertime 92';
                } else {
                    echo 'worked 94';
                }
            }

        } else if ($_POST['type'] == 'abh') {

            $sql = "SELECT date FROM staffs_trail WHERE date = '$date' AND company_id = '$company_id' AND serialnumber = '$serial'";

            $result = $conn->query($sql);
    
            if ($result->num_rows > 0) {
                echo 'worked';
                
            }
        } else if ($_POST['type'] == 'aah') {

            $sql = "SELECT date FROM staffs_trail WHERE date = '$date' AND company_id = '$company_id' AND serialnumber = '$serial'";

            $result = $conn->query($sql);
    
            if ($result->num_rows > 0) {
                echo 'worked';
                
            }
        }
        
    }
    
}

function checkDate2($conn, $serial, $company_id, $date2) {
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
    
            if ($mins > 0) {
                echo 'undertime';
            } else {
                echo 'worked';
            }

        } else {
            echo 'worked';
        }
    }
}

$conn->close();
?>