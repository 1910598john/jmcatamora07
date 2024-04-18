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

if (isset($_POST['id'])) {
  $id = $_POST['id'];
  $company_id = $_SESSION['companyid'];

  $from_date = $_POST['from'];
  $to_date = $_POST['to'];

  $sql = "UPDATE staffs_trail SET paid_status = 'not paid' WHERE serialnumber = '$id' AND company_id = '$company_id' AND date BETWEEN DATE('$from_date') AND DATE('$to_date')";

  if ($conn->query($sql) === TRUE) {
    add_report($conn, $id, $company_id);
  }
}

function update_deductions($conn, $snumber, $company_id) {
  $sql = "UPDATE staffs SET adjustment = 0, cash_advance = 0, charges = 0, sss_loan = 0, pag_ibig_loan = 0, company_loan = 0, total_hours = 0 WHERE serialnumber = '$snumber' AND company_id = '$company_id'";
  
  if ($conn->query($sql) === TRUE) {
    add_report($conn, $snumber, $company_id);
  }
}

function add_report($conn, $snumber, $company_id) {
  $name = $_POST['name'];
  $class = $_POST['class'];
  $className = $_POST['class_name'];
  $rate = $_POST['rate'];
  $rate_type = $_POST['rate_type'];
  $working_days = $_POST['working_days'];
  $days_worked = $_POST['days_worked'];
  $salary_rate = $_POST['salary_rate'];
  $absent = $_POST['absent'];
  $basic = $_POST['basic'];
  $ut_total = $_POST['ut_total'];
  $tardiness = $_POST['tardiness'];
  $holiday = $_POST['holiday'];
  $ot_total = $_POST['ot_total'];
  $earnings = $_POST['earnings'];
  $sss = $_POST['sss'];
  $phil = $_POST['phil'];
  $pbig = $_POST['pbig'];
  $adjustment = $_POST['adjustment'];
  $cash_advance = $_POST['cash_advance'];
  $charges = $_POST['charges'];
  $sss_loan = $_POST['sss_loan'];
  $pbig_loan = $_POST['pbig_loan'];
  $company_loan = $_POST['company_loan'];
  $total_deductions = $_POST['total_deductions'];
  $allowance = $_POST['allowance'];
  $allowance_penalty = $_POST['allowance_penalty'];
  $net = $_POST['net'];
  $month = $_POST['month'];
  $year = $_POST['year'];
  
  $paysched = $_POST['paysched'];
  $period = $_POST['period'];
  $from = $_POST['from'];
  $to = $_POST['to'];

  $sql = "INSERT INTO reports (paysched, from_date, to_date, period, company_id, name, serialnumber, class, class_name, rate, rate_type, working_days, days_worked, salary_rate, absent, basic, ut_total, tardiness, holiday, ot_total, earnings, sss, phil, pbig, adjustment, cash_advance, charges, sss_loan, pbig_loan, company_loan, total_deductions, allowance, allowance_penalty, net, month, year)
    VALUES ('$paysched', '$from', '$to', '$period', '$company_id', '$name', '$snumber','$class', '$className', '$rate', '$rate_type', '$working_days', '$days_worked', '$salary_rate', '$absent', '$basic', '$ut_total', '$tardiness', '$holiday', '$ot_total', '$earnings','$sss', '$phil', '$pbig', '$adjustment', '$cash_advance', '$charges', '$sss_loan', '$pbig_loan', '$company_loan', '$total_deductions', '$allowance', '$allowance_penalty', '$net', '$month', '$year')";

  if ($conn->query($sql) === TRUE) {
    echo 'paid';
  }

}


$conn->close();

?>