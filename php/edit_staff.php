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
if (isset($_POST['name'])) {
    $name = $_POST['name'];
    $edit = $_POST['edit'];
    $branch = $_POST['branch'];
    $serial = $_POST['serial'];
    $company_id = $_SESSION['companyid'];

    if ($name == 'branch') {
        $sql = "UPDATE staffs SET branch = '$edit' WHERE serialnumber = '$serial' AND branch = '$branch' AND company_id = '$company_id'";
    } else {
        if ($name == 'class') {
            $sql = "UPDATE staffs SET class = '$edit' WHERE serialnumber = '$serial' AND branch = '$branch' AND company_id = '$company_id'";
        }
    }
    if ($conn->query($sql) === TRUE) {
        echo 'success';
        edit_trail($conn, $name, $edit, $company_id, $serial, $branch);
    } 
}

function edit_trail($conn, $name, $edit, $company_id, $serial, $branch) {
    if ($name == 'branch') {
        $sql = "UPDATE staffs_trail SET branch = '$edit' WHERE serialnumber = '$serial' AND branch = '$branch' AND company_id = '$company_id'";
    } else {
        if ($name == 'class') {
            $sql = "UPDATE staffs_trail SET class = '$edit' WHERE serialnumber = '$serial' AND branch = '$branch' AND company_id = '$company_id'";
        }
    }

    if ($conn->query($sql) === TRUE) {
      
        edit_attendance($conn, $name, $edit, $company_id, $serial, $branch);
        
    }
}

function edit_attendance($conn, $name, $edit, $company_id, $serial, $branch) {
    if ($name == 'branch') {
        $sql = "UPDATE attendance SET branch = '$edit' WHERE serialnumber = '$serial' AND branch = '$branch' AND company_id = '$company_id'";

        if ($conn->query($sql) === TRUE) {
          
            edit_ot_approval($conn, $name, $edit, $company_id, $serial, $branch);
            
        }
    } else {
        edit_ot_approval($conn, $name, $edit, $company_id, $serial, $branch);
    }

    
}

function edit_ot_approval($conn, $name, $edit, $company_id, $serial, $branch) {
    if ($name == 'branch') {
        $sql = "UPDATE ot_approval SET branch = '$edit' WHERE serialnumber = '$serial' AND branch = '$branch' AND company_id = '$company_id'";

        if ($conn->query($sql) === TRUE) {
            
                edit_notice($conn, $name, $edit, $company_id, $serial, $branch);
            
        }
    } else {
        edit_notice($conn, $name, $edit, $company_id, $serial, $branch);
    }

    
}

function edit_notice($conn, $name, $edit, $company_id, $serial, $branch) {
    if ($name == 'branch') {
        $sql = "UPDATE notice SET branch = '$edit' WHERE serialnumber = '$serial' AND branch = '$branch' AND company_id = '$company_id'";
    } else {
        if ($name == 'class') {
            $sql = "UPDATE notice SET class = '$edit' WHERE serialnumber = '$serial' AND branch = '$branch' AND company_id = '$company_id'";
        }
    }

    if ($conn->query($sql) === TRUE) {
    
        edit_files($conn, $name, $edit, $company_id, $serial, $branch);
      
    }
}
function edit_files($conn, $name, $edit, $company_id, $serial, $branch) {
    if ($name == 'branch') {
        $sql = "UPDATE payroll_files SET branch = '$edit' WHERE serialnumber = '$serial' AND branch = '$branch' AND company_id = '$company_id'";
    } else {
        if ($name == 'class') {
            $sql = "UPDATE payroll_files SET class = '$edit' WHERE serialnumber = '$serial' AND branch = '$branch' AND company_id = '$company_id'";
        }
    }

    if ($conn->query($sql) === TRUE) {   
    }
}
$conn->close();

?>