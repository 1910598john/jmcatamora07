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

if (isset($_POST['serialnumber'], $_POST['name'], $_POST['pos'], $_POST['dept'], $_POST['status'], $_SESSION['companyid'])) {
  $serialnumber = $_POST['serialnumber'];
  $name = $_POST['name'];
  $pos = $_POST['pos'];
  $dept = $_POST['dept'];
  $status = $_POST['status'];
  $company_id = $_SESSION['companyid'];

  

  // Use prepared statement to prevent SQL injection
  $stmt = $conn->prepare("INSERT INTO attendance (name, position, department, serialnumber, time_logs, status, company_id, date)
                          VALUES (?, ?, ?, ?, NOW(), ?, ?, NOW())");

  $stmt->bind_param("sssisi", $name, $pos, $dept, $serialnumber, $status, $company_id);
  if ($stmt->execute()) {
    
    echo "success";
    if ($status == "OUT") {
      $in_log = getLastInLog($serialnumber, $company_id, $conn);

      $startTimestamp = strtotime($in_log);
      $endTimestamp = strtotime(date("Y-m-d H:i:s"));

      // Convert timestamps to DateTime objects
      $startTime = new DateTime("@$startTimestamp");
      $endTime = new DateTime("@$endTimestamp");

      // Calculate the difference between the two timestamps
      $interval = $startTime->diff($endTime);

      // Calculate the total hours worked
      $totalHoursWorked = $interval->h;

      // Add minutes to the total hours worked
      $totalHoursWorked += $interval->i / 60;

      // Update existing record instead of inserting a new one
      $sql = "INSERT INTO staffs_trail (name, company_id, hours_worked, start_time, end_time, date, serialnumber) VALUES (?, ?, ?, ?, NOW(), NOW(), ?)";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("sissi", $name, $company_id, $totalHoursWorked, $in_log, $serialnumber);

      if ($stmt->execute()) {
        updateStaffWorkedHours($serialnumber, $company_id, $conn, $totalHoursWorked);
      }
    }
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

function getHourWorkedToday($serialnumber, $conn){
  $sql = "SELECT hours_worked FROM staffs_trail WHERE serialnumber = '$serialnumber' AND DATE(date) = CURDATE()";
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

function updateStaffWorkedHours($serial, $company_id, $conn, $hoursWorked){
  $hour_worked_today = getHourWorkedToday($serial, $conn);
  
  $sql = "UPDATE staffs SET total_hours = total_hours + $hoursWorked, hours_worked_today = $hour_worked_today WHERE company_id = '$company_id' AND serialnumber = '$serial'";
  if ($conn->query($sql) === TRUE) {
    
  }
}

$conn->close();
?>