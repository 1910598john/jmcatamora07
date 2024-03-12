<?php
date_default_timezone_set('Asia/Manila');

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

if (isset($_POST['serialnumber'], $_POST['name'], $_POST['pos'], $_POST['dept'], $_POST['status']/* ,$_SESSION['companyid'] */)) {
  $serialnumber = $_POST['serialnumber'];
  $name = $_POST['name'];
  $pos = $_POST['pos'];
  $dept = $_POST['dept'];
  $status = $_POST['status'];

  if (isset($_POST['companyid'])) {
    $company_id = $_POST['companyid'];
  } else {
    $company_id = $_SESSION['companyid'];
  }

  if (isset($_POST['timeout'])) {
    // Use prepared statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO attendance (name, position, department, serialnumber, time_logs, status, company_id, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("sssissis", $name, $pos, $dept, $serialnumber, $_POST['timeout'], $status, $company_id, $_POST['date']);
  } else {
    // Use prepared statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO attendance (name, position, department, serialnumber, time_logs, status, company_id, date)
    VALUES (?, ?, ?, ?, NOW(), ?, ?, NOW())");

    $stmt->bind_param("sssisi", $name, $pos, $dept, $serialnumber, $status, $company_id);
  }

  if ($stmt->execute()) {
    
    UPDATESTAFFSTATUS($conn, $serialnumber, $company_id, $status);
    UPDATESTAFF($conn, $serialnumber, $company_id);

    if ($status == "OUT") {
      calculateDaysWorked($conn, $serialnumber, $company_id);
      $in_log = getLastInLog($serialnumber, $company_id, $conn);
      
      $endTimestamp;
      $startTimestamp;
      if (isset($_POST['timeout'])) {
        $endTimestamp = strtotime($_POST['timeout']);
        $startTimestamp = strtotime($_POST['timein']);
      } else {
        $endTimestamp = strtotime(date("Y-m-d H:i:s"));
        $startTimestamp = strtotime($in_log);
      }

      // Convert timestamps to DateTime objects
      $startTime = new DateTime("@$startTimestamp");
      $endTime = new DateTime("@$endTimestamp");

      // Calculate the difference between the two timestamps
      $interval = $startTime->diff($endTime);

      // Calculate the total hours worked
      $totalHoursWorked = $interval->h;

      // Add minutes to the total hours worked
      $totalHoursWorked += $interval->i / 60;

      $totalMinutesWorked = round($totalHoursWorked * 60);

      $sameday = checkIfSameDayST($conn, $serialnumber, $company_id);

      $id = $sameday['id'];
      $isSameDay = $sameday['isSameDay'];

      // Update existing record instead of inserting a new one
      if (isset($_POST['timeout'])) {
        $sql = "INSERT INTO staffs_trail (name, company_id, hours_worked, start_time, end_time, date, serialnumber) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sissssi", $name, $company_id, $totalHoursWorked, $_POST['timein'], $_POST['timeout'], $_POST['date'], $serialnumber);
      } else {
        $sql = "INSERT INTO staffs_trail (name, company_id, hours_worked, start_time, end_time, date, serialnumber) VALUES (?, ?, ?, ?, NOW(), NOW(), ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sissi", $name, $company_id, $totalHoursWorked, $in_log, $serialnumber);
      }

      if ($stmt->execute()) {
        updateStaffWorkedHours($serialnumber, $company_id, $conn, $totalHoursWorked, $conn->insert_id, $totalMinutesWorked, $id, $isSameDay);
      }
    }
  } 
}

function GETSTAFFRATE($conn, $serial, $company_id) {
  $sql = "SELECT rate FROM staffs WHERE serialnumber = '$serial' AND company_id = '$company_id'";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    return $row['rate'];
  }
}

function UPDATESTAFF($conn, $serial, $company_id) {
  if (isset($_POST['date'])) {
    $sql = "UPDATE staffs SET date = '". $_POST['date'] ."' WHERE company_id = '$company_id' AND serialnumber = '$serial' ";
  } else {
    $sql = "UPDATE staffs SET date = NOW() WHERE company_id = '$company_id' AND serialnumber = '$serial' ";
  }
  if ($conn->query($sql) === TRUE) {
      
  }
}

function UPDATESTAFFSTATUS($conn, $serial, $company_id, $status) {
  if (isset($_POST['date'])) {
    $sql = "UPDATE staffs SET status = '". $status ."', date = '". $_POST['date'] ."' WHERE serialnumber = '" . $serial . "' AND company_id = '$company_id'";
  } else {
    $sql = "UPDATE staffs SET status = '". $status ."', date = NOW() WHERE serialnumber = '" . $serial . "' AND company_id = '$company_id'";
  }

  if ($conn->query($sql) === TRUE) {
    $_SESSION['time_logged'] = $status;
    echo "success";
  }
}

function calculateDaysWorked($conn, $serial, $company_id) {
  $sql = "SELECT COUNT(DISTINCT DATE(date)) AS worked_days FROM attendance WHERE serialnumber = '$serial' AND company_id = '$company_id'";
  $result = $conn->query($sql);

  if ($result) {
    $row = $result->fetch_assoc();
    $count = $row['worked_days'];
    $count = intval($count);

    update_staff($conn, $count, $serial, $company_id);
  }
}

function update_staff($conn, $count, $serial, $company_id) {
  $sql = "UPDATE staffs SET days_worked = '$count' WHERE company_id = '$company_id' AND serialnumber = '$serial' ";
  if ($conn->query($sql) === TRUE) {
      
  }
}

function getLastInLog($serial, $company_id, $conn){
  $sql = "SELECT time_logs FROM attendance WHERE company_id = '$company_id' AND serialnumber = '$serial' AND status = 'IN' AND DATE(date) = CURDATE() ORDER BY id DESC LIMIT 1";
  $result = $conn->query($sql);
  
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    return $row['time_logs'];
  }
}

function getHourWorkedToday($serialnumber, $conn, $company_id){
  if (isset($_POST['timeout'])) {
    $sql = "SELECT hours_worked FROM staffs_trail WHERE serialnumber = '$serialnumber' AND company_id = '$company_id' AND DATE(date) = '". $_POST['date'] . "'";
    
  } else {
    $sql = "SELECT hours_worked FROM staffs_trail WHERE serialnumber = '$serialnumber' AND company_id = '$company_id' AND DATE(date) = CURDATE()";
  }
 
  $result = $conn->query($sql);
  $hours_worked = 0;
  $hours_worked = floatval($hours_worked);
  if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
      $hr = floatval($row['hours_worked']);
      $hours_worked += $hr;
    }
    return $hours_worked;
  }
  return 0;
}

function checkIfSameDay($conn, $serialnumber, $company_id){
  $sql = "SELECT date FROM attendance WHERE serialnumber = '$serialnumber' AND company_id = '$company_id' AND status = 'OUT' ORDER BY id DESC LIMIT 1";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    $date1 = $row['date'];
    $date2 = date('Y-m-d');

    // Compare date portions
    if ($date1 == $date2) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

function updateStaffWorkedHours($serial, $company_id, $conn, $hoursWorked, $id, $totalMinutesWorked, $id2, $isSameDay2){
  $hour_worked_today = getHourWorkedToday($serial, $conn, $company_id);
  $isSameDay = checkIfSameDay($conn, $serial, $company_id);

  if (isset($_POST['date'])) {
    $sql = "UPDATE staffs SET total_hours = total_hours + $hoursWorked, hours_worked_today = $hour_worked_today WHERE company_id = '$company_id' AND serialnumber = '$serial'";
    if ($conn->query($sql) === TRUE) {
      updateTotalWorkedToday($conn, $hour_worked_today, $company_id, $serial, $id, $totalMinutesWorked, $id2, $isSameDay2);
    }
  } else {
    if (!$isSameDay) {
      updateHoursWorkedTodayToZero($conn, $serial, $company_id);
      $sql = "UPDATE staffs SET total_hours = total_hours + $hoursWorked, hours_worked_today = $hoursWorked WHERE company_id = '$company_id' AND serialnumber = '$serial'";
      if ($conn->query($sql) === TRUE) {
        
      }
    } else {
      $sql = "UPDATE staffs SET total_hours = total_hours + $hoursWorked, hours_worked_today = $hour_worked_today WHERE company_id = '$company_id' AND serialnumber = '$serial'";
      if ($conn->query($sql) === TRUE) {
        updateTotalWorkedToday($conn, $hour_worked_today, $company_id, $serial, $id, $totalMinutesWorked, $id2, $isSameDay2);
      }
    }
  }
}

function UPDATEOTANDUTVALUE($conn, $serial, $company_id, $id) {
  $sql = "UPDATE staffs_trail SET ot_total = '0', ut_total = '0' WHERE company_id = '$company_id' AND serialnumber = '$serial' AND id = '$id'";
 
  if ($conn->query($sql) === TRUE) {

  }
}

function updateTotalWorkedToday($conn, $hour_worked_today, $company_id, $serial, $id, $totalMinutesWorked, $id2, $isSameDay2){

  $rate = GETSTAFFRATE($conn, $serial, $company_id);
  $rate = intval($rate);

  $per_hour = $rate / 8;
  $per_min = $per_hour / 60;

  $ot = 0;
  $ut = 0;

  if ($totalMinutesWorked > 480) {
    $ot = ($totalMinutesWorked - 480) * $per_min;
  }

  if ($totalMinutesWorked < 480) {
    $ut = (480 - $totalMinutesWorked) * $per_min;
  }

  $sql = "UPDATE staffs_trail SET total_hours = total_hours + $hour_worked_today, ot_total = '$ot', ut_total = '$ut' WHERE company_id = '$company_id' AND serialnumber = '$serial' AND id = '$id'";

  if ($conn->query($sql) === TRUE) {
    if ($isSameDay2) {
      UPDATEOTANDUTVALUE($conn, $serial, $company_id, $id2);
    }
  }
}

function checkIfSameDayST($conn, $serialnumber, $company_id){
  $sql = "SELECT id, date FROM staffs_trail WHERE serialnumber = '$serialnumber' AND company_id = '$company_id' ORDER BY id DESC LIMIT 1";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    $date1 = $row['date'];
    $date2 = date('Y-m-d');

    // Compare date portions
    if ($date1 == $date2) {
      return array('id' => $row['id'], 'isSameDay' => true);
    } else {
      return array('id' => $row['id'], 'isSameDay' => false);
    }
  }
}

function updateHoursWorkedTodayToZero($conn, $serial, $company_id){
  $sql = "UPDATE staffs SET hours_worked_today = '0',  WHERE company_id = '$company_id' AND serialnumber = '$serial'";
  if ($conn->query($sql) === TRUE) {
    
  }
}

$conn->close();
?>