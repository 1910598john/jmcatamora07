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

    if ($_POST['type'] == 'abaah') {
        

        $sql = "SELECT date FROM staffs_trail WHERE date = '$date1' AND company_id = '$company_id' AND serialnumber = '$serial'";

        $result = $conn->query($sql);

        if ($result->num_rows > 0) {

            checkDate2($conn, $serial, $company_id, $date2);

        } else {
            echo 'did not work';
        }

    } else {
        
        $sql = "SELECT date FROM staffs_trail WHERE date = '$date' AND company_id = '$company_id' AND serialnumber = '$serial'";

        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
    
            echo 'worked';
            
        }
        
    }
    
}

function checkDate2($conn, $serial, $company_id, $date2) {
    $sql = "SELECT date FROM staffs_trail WHERE date = '$date2' AND company_id = '$company_id' AND serialnumber = '$serial'";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {

        echo 'worked';

    }
}



$conn->close();
?>