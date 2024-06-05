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

if (isset($_POST['serialnumber'], $_POST['name'], $_POST['pos'], $_POST['dept'], $_POST['status']/* ,$_SESSION['companyid'] */) || isset($_SESSION['details'])) {

  if (isset($_SESSION['details'])) {
    $serialnumber = $_SESSION['details']['serialnumber'];
    $name = $_SESSION['details']['name'];
    $pos = $_SESSION['details']['pos'];
    $dept = $_SESSION['details']['dept'];
    $status = $_SESSION['details']['status'];
    $class = $_SESSION['details']['class'];
  } else {
    $serialnumber = $_POST['serialnumber'];
    $name = $_POST['name'];
    $pos = $_POST['pos'];
    $dept = $_POST['dept'];
    $status = $_POST['status'];
    $class = $_POST['class'];
    $branch = $_POST['branch'];
  }
  

  if (isset($_POST['companyid'])) {
    $company_id = $_POST['companyid'];
  } else {
    if (isset($_SESSION['details'])) {
      $company_id = $_SESSION['details']['companyid'];
    } else {
      $company_id = $_SESSION['companyid'];
    }
    
  }

  if (isset($_POST['timeout'])) {
    // Use prepared statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO attendance (name, position, department, serialnumber, time_logs, status, company_id, date, branch)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("sssississ", $name, $pos, $dept, $serialnumber, $_POST['timeout'], $status, $company_id, $_POST['date'], $branch);
  } else {
    // Use prepared statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO attendance (name, position, department, serialnumber, time_logs, status, company_id, date, branch)
    VALUES (?, ?, ?, ?, NOW(), ?, ?, NOW(), ?)");

    $stmt->bind_param("sssisis", $name, $pos, $dept, $serialnumber, $status, $company_id, $branch);
  }

  if ($stmt->execute()) {
    
    UPDATESTAFFSTATUS($conn, $serialnumber, $company_id, $status, $branch);
    UPDATESTAFF($conn, $serialnumber, $company_id, $branch);

    $Class = fetchClass($conn, $company_id, $serialnumber);

    if ($status == "OUT") {
      //calculateDaysWorked($conn, $serialnumber, $company_id);
      $in_log = getLastInLog($serialnumber, $company_id, $conn, $branch);
      
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

      
      $sameday = checkIfSameDayST($conn, $serialnumber, $company_id, $branch);
      $totalWorkedToday = fetchHourWorkedToday($conn, $company_id, $serialnumber, $branch);

      $id = $sameday['id'];
      $isSameDay = $sameday['isSameDay'];
      $paid_status = "not paid";


      $penalty = 0;

      if ($isSameDay) {
        $calc = 0;
        $out_emp = strtotime($sameday['end_time']);
        $in_emp = strtotime($in_log);
        $s = new DateTime("@$out_emp");
        $e = new DateTime("@$in_emp");
        $interv = $s->diff($e);
        $calc = $interv->h;
        $calc += $interv->i / 60;
        $consumed_time = round($calc * 60);

        $hr_prday = intval($Class['hour']);
        $start = new DateTime($Class['in']);
        $end = new DateTime($Class['out']);
        $interval = $start->diff($end);
        $hrs = $interval->h;
        $mis = $interval->i;
        $total_hrs = $hrs + ($mis / 60);

        $free_time = $total_hrs - $hr_prday;

        if ($consumed_time > ($free_time * 60)) {
          $penalty = $consumed_time - ($free_time * 60);
        }
      }

      $onLeave = 0;//onLeave($conn, $company_id, $serialnumber);
      // Update existing record instead of inserting a new one
      if (isset($_POST['timeout'])) {
        $sql = "INSERT INTO staffs_trail (name, class, company_id, hours_worked, start_time, end_time, date, serialnumber,  leave_status, paid_status, branch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssissssiiss", $name, $class, $company_id, $totalHoursWorked, $_POST['timein'], $_POST['timeout'], $_POST['date'], $serialnumber, $onLeave, $paid_status, $branch);
      } else {
        $sql = "INSERT INTO staffs_trail (name, class, company_id, hours_worked, start_time, end_time, date, serialnumber, leave_status, paid_status, branch) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssissiiss", $name, $class, $company_id, $totalHoursWorked, $in_log, $serialnumber, $onLeave, $paid_status, $branch);
      }

      if ($stmt->execute()) {
        if (isset($_POST['timeout'])) {
          updateStaffWorkedHours($serialnumber, $company_id, $conn, $totalHoursWorked, $conn->insert_id, $totalMinutesWorked, $id, $isSameDay, $_POST['timein'], $totalWorkedToday, $_POST['timeout'], $branch, $penalty);
        } else {
          updateStaffWorkedHours($serialnumber, $company_id, $conn, $totalHoursWorked, $conn->insert_id, $totalMinutesWorked, $id, $isSameDay, $in_log, $totalWorkedToday, date("Y-m-d H:i:s"), $branch, $penalty);
        }
      }
    } else {
      
      $rate = intval($Class['rate']);
      $type = intval($Class['type']);
      $max_hour = intval($Class['hour']);

      $in = strtotime(date("Y-m-d H:i:s"));
      $clock_in_sched = strtotime($Class['in']);

      if ($in < $clock_in_sched) {
          // Calculate the difference in seconds
        $startTime = new DateTime("@$in");
        $endTime = new DateTime("@$clock_in_sched");

        // Calculate the difference between the two timestamps
        $interval = $startTime->diff($endTime);

        // Calculate the total hours worked
        $totalHoursWorked = $interval->h;

        // Add minutes to the total hours worked
        $totalHoursWorked += $interval->i / 60;

        $minutes = round($totalHoursWorked * 60);

        if ($type === 'hourly') {
          $rate = $rate * $max_hour;
        } else if ($type === 'monthly') {
          $rate = $rate * 12;
          $rate = $rate / 365; //daily wage
          //based on 365 days per year factor
        }
      
        $per_hour = $rate / $max_hour;
        $per_min = $per_hour / 60;
      
        $early_in_pay = $minutes * $per_min;

        early_in_app($conn, $company_id, $serialnumber, $branch, $name, $pos, date("Y-m-d H:i:s"), $minutes, $early_in_pay);

      }
    }
  } 
}

function early_in_app($conn, $company_id, $serialnumber, $branch, $name, $pos, $timed_in, $minutes, $early_in_pay) {
  $sql = "INSERT INTO early_in_approval (company_id, branch, serialnumber, name, position, timed_in, early_in_mins, pay, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("isisssis", $company_id, $branch, $serialnumber, $name, $pos, $timed_in, $minutes, $early_in_pay);

  $stmt->execute();
}

function isRestDay($conn, $company_id, $serialnumber){
  $currentWeekday = strtolower(date('l'));

  $sql = "SELECT rest_day FROM staffs WHERE rest_day LIKE '%$currentWeekday%' AND serialnumber = '$serialnumber' AND company_id = '$company_id'";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    return 1;
  }

  return 0;
}

function isOffDay($conn, $company_id, $serialnumber){
  $currentWeekday = strtolower(date('l'));

  $sql = "SELECT off_day FROM staffs WHERE off_day LIKE '%$currentWeekday%' AND serialnumber = '$serialnumber' AND company_id = '$company_id'";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    return 1;
  }

  return 0;
}

function onLeave($conn, $company_id, $serialnumber){
  $sql = "SELECT leave_start FROM staffs WHERE serialnumber = '$serialnumber' AND company_id = '$company_id'";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if ($row['leave_start'] === null) {
      return 0;
    } else {
      return 1;
    }
  }
  
  return 0;
}

function UPDATESTAFF($conn, $serial, $company_id, $branch) {
  if (isset($_POST['date'])) {
    $sql = "UPDATE staffs SET date = '". $_POST['date'] ."' WHERE company_id = '$company_id' AND serialnumber = '$serial' AND branch = '$branch'";
  } else {
    $sql = "UPDATE staffs SET date = NOW() WHERE company_id = '$company_id' AND serialnumber = '$serial' AND branch = '$branch'";
  }

  if ($conn->query($sql) === TRUE) {
      
  }
}

function UPDATESTAFFSTATUS($conn, $serial, $company_id, $status, $branch) {
  if (isset($_POST['date'])) {
    $sql = "UPDATE staffs SET status = '". $status ."', date = '". $_POST['date'] ."' WHERE serialnumber = '" . $serial . "' AND company_id = '$company_id' AND branch = '$branch'";
  } else {
    $sql = "UPDATE staffs SET status = '". $status ."', date = NOW() WHERE serialnumber = '" . $serial . "' AND company_id = '$company_id' AND branch = '$branch'";
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

function getLastInLog($serial, $company_id, $conn, $branch){
  $sql = "SELECT time_logs FROM attendance WHERE company_id = '$company_id' AND serialnumber = '$serial'  AND status = 'IN' AND DATE(date) = CURDATE() ORDER BY id DESC LIMIT 1";
  $result = $conn->query($sql);
  
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    return $row['time_logs'];
  }
}

function getHourWorkedToday($serialnumber, $conn, $company_id, $branch){
  if (isset($_POST['timeout'])) {
    $sql = "SELECT hours_worked FROM staffs_trail WHERE serialnumber = '$serialnumber' AND company_id = '$company_id' AND branch = '$branch' AND DATE(date) = '". $_POST['date'] . "'";
    
  } else {
    $sql = "SELECT hours_worked FROM staffs_trail WHERE serialnumber = '$serialnumber' AND company_id = '$company_id' AND branch = '$branch' AND DATE(date) = CURDATE()";
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

function checkIfSameDay($conn, $serialnumber, $company_id, $branch){
  $sql = "SELECT date FROM attendance WHERE serialnumber = '$serialnumber' AND branch = '$branch' AND company_id = '$company_id' AND status = 'OUT' ORDER BY id DESC LIMIT 1";
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

function updateStaffWorkedHours($serial, $company_id, $conn, $hoursWorked, $id, $totalMinutesWorked, $id2, $isSameDay2, $timed_in, $totalWorkedToday, $timed_out, $branch, $penalty){
  $hour_worked_today = getHourWorkedToday($serial, $conn, $company_id, $branch);

  $isSameDay = checkIfSameDay($conn, $serial, $company_id, $branch);

  if (isset($_POST['date'])) {
    $sql = "UPDATE staffs SET total_hours = total_hours + $hoursWorked, hours_worked_today = $hour_worked_today WHERE company_id = '$company_id' AND serialnumber = '$serial' AND branch = '$branch'";
    if ($conn->query($sql) === TRUE) {
      updateTotalWorkedToday($conn, $hour_worked_today, $company_id, $serial, $id, $totalMinutesWorked, $id2, $isSameDay2, $timed_in, $totalWorkedToday, $timed_out, $id, $branch, $penalty);
    }
  } else {
    if (!$isSameDay) {
      updateHoursWorkedTodayToZero($conn, $serial, $company_id, $branch);
      $sql = "UPDATE staffs SET total_hours = total_hours + $hoursWorked, hours_worked_today = $hoursWorked WHERE company_id = '$company_id' AND serialnumber = '$serial' AND branch = '$branch'";
      if ($conn->query($sql) === TRUE) {
        
      }
    } else {
      $sql = "UPDATE staffs SET total_hours = total_hours + $hoursWorked, hours_worked_today = $hour_worked_today WHERE company_id = '$company_id' AND serialnumber = '$serial' AND branch = '$branch'";
      if ($conn->query($sql) === TRUE) {
        updateTotalWorkedToday($conn, $hour_worked_today, $company_id, $serial, $id, $totalMinutesWorked, $id2, $isSameDay2, $timed_in, $totalWorkedToday, $timed_out, $id, $branch, $penalty);
      }
    }
  }
}

function UPDATEOTANDUTVALUE($conn, $serial, $company_id, $id) {
  $sql = "UPDATE staffs_trail SET ot_total = '0', ut_total = '0', ot_mins = '0', ut_mins = '0' WHERE company_id = '$company_id' AND serialnumber = '$serial' AND id = '$id'";
  if ($conn->query($sql) === TRUE) {

  }
}

function updateTotalWorkedToday($conn, $hour_worked_today, $company_id, $serial, $id, $totalMinutesWorked, $id2, $isSameDay2, $timed_in,  $totalWorkedToday, $timed_out, $inserted_id, $branch, $penalty){
  $class = fetchClass($conn, $company_id, $serial);
  $rate = intval($class['rate']);
  $type = intval($class['type']);
  $max_hour = intval($class['hour']);
  $clock_in = $class['in'];
  $clock_out = $class['out'];

  $startTimestamp = strtotime($clock_in);
  $endTimestamp = strtotime($timed_in);

  $scheduledEndTime = strtotime($clock_out); 

  $clockOutTime = strtotime(date("H:i:s", strtotime($timed_out)));

  if ($endTimestamp < $startTimestamp) {
    $late_mins = 0;
  } else {
    $startTime = new DateTime("@$startTimestamp");
    $endTime = new DateTime("@$endTimestamp");

    // Calculate the difference between the two timestamps
    $interval = $startTime->diff($endTime);

    // Calculate the total hours worked
    $totalHoursWorked = $interval->h;

    // Add minutes to the total hours worked
    $totalHoursWorked += $interval->i / 60;

    $late_mins = round($totalHoursWorked * 60);
  }

  if ($type === 'hourly') {
    $rate = $rate * $max_hour;
  } else if ($type === 'monthly') {
    $rate = $rate * 12;
    $rate = $rate / 365; //daily wage
    //based on 365 days per year factor
  }

  $per_hour = $rate / $max_hour;
  $per_min = $per_hour / 60;

  $ot = 0;
  $ut = 0;

  //$maxnum = 60 * $max_hour;
  $ot_mins = 0;
  $ut_mins = 0;

  if ($clockOutTime < $scheduledEndTime) {
    $ut_mins = ($scheduledEndTime - $clockOutTime) / 60;
    $ut = $ut_mins * $per_min;
  } elseif ($clockOutTime > $scheduledEndTime) {
    $ot_mins = ($clockOutTime - $scheduledEndTime) / 60;
    $ot = $ot_mins * $per_min;
    ot_approval($conn, $ot, $ot_mins, $timed_in, $timed_out, $company_id, $inserted_id, $branch);
  }

  $totalWorkedToday = floatval($totalWorkedToday * 60);
  $totalMinutesWorked += $totalWorkedToday;

  if ($isSameDay2) {
    $sql = "UPDATE staffs_trail SET total_hours = total_hours + $hour_worked_today, ot_total = '$ot', ut_total = '$ut', ot_mins = '$ot_mins', ut_mins = '$ut_mins', late_mins = $penalty WHERE company_id = '$company_id' AND serialnumber = '$serial' AND branch = '$branch' AND id = '$id'";

  } else {
    $sql = "UPDATE staffs_trail SET total_hours = total_hours + $hour_worked_today, ot_total = '$ot', ut_total = '$ut', ot_mins = '$ot_mins', ut_mins = '$ut_mins', late_mins = $late_mins WHERE company_id = '$company_id' AND serialnumber = '$serial' AND branch = '$branch' AND id = '$id'";
  }

  if ($conn->query($sql) === TRUE) {
    if ($isSameDay2) {
      //UPDATEOTANDUTVALUE($conn, $serial, $company_id, $id2);
    }
  }
}

function ot_approval($conn, $total, $mins, $timed_in, $timed_out, $company_id, $inserted_id, $branch) {
  $serialnumber = $_POST['serialnumber'];
  $name = $_POST['name'];
  $pos = $_POST['pos'];
  $dept = $_POST['dept'];
  

  $stmt = $conn->prepare("INSERT INTO ot_approval (company_id, serialnumber, name, position, department, timed_in, timed_out, ot_mins, ot_pay, row_id, date, branch)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)");

  $stmt->bind_param("iisssssisis", $company_id, $serialnumber, $name, $pos, $dept, $timed_in, $timed_out, $mins, $total, $inserted_id, $branch);

  if ($stmt->execute()) {

  }

}

function fetchHourWorkedToday($conn, $company_id, $serialnumber, $branch) {
  $sql = "SELECT total_hours FROM staffs_trail WHERE serialnumber = '$serialnumber' AND branch = '$branch' AND company_id = '$company_id' AND DATE(date) = CURDATE() ORDER BY id DESC LIMIT 1";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    return $row['total_hours'];
  }

  return 0;
}

function checkIfSameDayST($conn, $serialnumber, $company_id, $branch){
  $sql = "SELECT id, date, end_time FROM staffs_trail WHERE serialnumber = '$serialnumber' AND branch = '$branch' AND company_id = '$company_id' ORDER BY id DESC LIMIT 1";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    $date1 = $row['date'];
    $date2 = date('Y-m-d');

    // Compare date portions
    if ($date1 == $date2) {
      return array('id' => $row['id'], 'isSameDay' => true, 'end_time' => $row['end_time']);
    } else {
      return array('id' => $row['id'], 'isSameDay' => false, 'end_time' => $row['end_time']);
    }
  } else {
    return array('id' => '0', 'isSameDay' => false, 'end_time' => '00:00:00');
  }
}

function updateHoursWorkedTodayToZero($conn, $serial, $company_id, $branch){
  $sql = "UPDATE staffs SET hours_worked_today = '0',  WHERE company_id = '$company_id' AND serialnumber = '$serial' AND branch = '$branch'";
  if ($conn->query($sql) === TRUE) {

  }
}

function fetchClassID($conn, $company_id, $serial) {
  $sql = "SELECT class FROM staffs WHERE serialnumber = '$serial' AND company_id = '$company_id'";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    return $row['class'];
  }
}

function fetchClass($conn, $company_id, $serial) {
  $classID = fetchClassID($conn, $company_id, $serial);

  $sql = "SELECT * FROM employees_classification WHERE company_id = '$company_id' AND id = '$classID'";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    return array('rate' => $row['rate'], 'type' => $row['rate_type'], 'hour' => $row['hour_perday'], 'in' => $row['clock_in_sched'], 'out' => $row['clock_out_sched']);
  }
}
$conn->close();
?>