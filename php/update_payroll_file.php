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

if (isset($_POST['serial'])) {

    $paysched = $_POST['paysched'];
    $col1 = $_POST['col1'];
    $col2 = $_POST['col2'];
    $name = $_POST['name'];
    $snumber = $_POST['serial'];
    $class = $_POST['class'];
    $class = $_POST['class_name'];
    $rate = $_POST['rate'];
    $rate_type = $_POST['rate_type'];
    $working_days = $_POST['working_days'];
    $days_worked = $_POST['days_worked'];
    $salary_rate = $_POST['salary_rate'];
    $absent = $_POST['absent'];
    $basic = $_POST['basic'];
    $ut = $_POST['ut'];
    $tard = $_POST['tard'];
    $holi = $_POST['holi'];
    $ot = $_POST['ot'];
    $earned = $_POST['earned'];
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
    $penalty = $_POST['penalty'];
    $net = $_POST['net'];

    $company_id = $_SESSION['companyid'];

    if ($paysched == 'twice-monthly') {
        $sql = "UPDATE payroll_files SET working_days = '$working_days', days_worked = '$days_worked', salary_rate = '$salary_rate', absent = '$absent', basic = '$basic', ut_total = '$ut', tardiness = '$tard', holiday = '$holi', ot_total = '$ot', earnings = '$earned', sss = '$sss', phil = '$phil', pbig = '$pbig', adjustment = '$adjustment', cash_advance = '$cash_advance', charges = '$charges', sss_loan = '$sss_loan', pbig_loan = '$pbig_loan', company_loan = '$company_loan', total_deductions = '$total_deductions', allowance = '$allowance', allowance_penalty = '$penalty', net = '$net' WHERE serialnumber = '" . $snumber . "' AND company_id = '$company_id' AND from_date = '$col1' AND to_date = '$col2' ";
    } else {
        $selectedMonth = date('m', strtotime($_POST['col1']));
        $selectedYear = date('Y', strtotime($_POST['col1']));
        if ($paysched == 'monthly') {
            $sql = "UPDATE payroll_files SET working_days = '$working_days', days_worked = '$days_worked', salary_rate = '$salary_rate', absent = '$absent', basic = '$basic', ut_total = '$ut', tardiness = '$tard', holiday = '$holi', ot_total = '$ot', earnings = '$earned', sss = '$sss', phil = '$phil', pbig = '$pbig', adjustment = '$adjustment', cash_advance = '$cash_advance', charges = '$charges', sss_loan = '$sss_loan', pbig_loan = '$pbig_loan', company_loan = '$company_loan', total_deductions = '$total_deductions', allowance = '$allowance', allowance_penalty = '$penalty', net = '$net' WHERE serialnumber = '" . $snumber . "' AND company_id = '$company_id' AND month = '$selectedMonth' AND year = '$selectedYear'";
        }
    }
    
    if ($conn->query($sql) === TRUE) {
      echo "success";
    } 
}


$conn->close();

?>