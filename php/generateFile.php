<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "payroll";

session_start();

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

if (isset($_POST['data'])) {
  $datas = $_POST['data'];
  $paysched = $_POST['paysched'];
  $company_id = $_SESSION['companyid'];

  $CLASS = fetchClass($conn, $company_id);

  if (isset($_POST['from']) && isset($_POST['to'])) {
    $from = $_POST['from'];
    $to = $_POST['to'];

    $stmt = $conn->prepare("INSERT INTO payroll_files (paysched, from_date, to_date, company_id, name, serialnumber, class, class_name, rate, rate_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssisissss", $paysched, $from, $to, $company_id, $name, $serialnumber, $class, $class_name, $rate, $rate_type);

    foreach ($datas as $data) {
        $name = $data['name'];
        $serialnumber = $data['serialnumber'];
        $class = $data['class'];
        $class_name = $CLASS['names'][$data['class']];
        $rate = $CLASS['rates'][$data['class']];
        $rate_type = $CLASS['types'][$data['class']];
        if ($stmt->execute()) {
        }
    }

    $stmt->close();
  }

  if (isset($_POST['mon'])) {
    $selectedMonth = date('m', strtotime($_POST['mon']));
    $selectedYear = date('Y', strtotime($_POST['mon']));
    $stmt = $conn->prepare("INSERT INTO payroll_files (paysched, month, year, company_id, name, serialnumber, class, class_name, rate, rate_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssisissss", $paysched, $selectedMonth, $selectedYear, $company_id, $name, $serialnumber, $class, $class_name, $rate, $rate_type);

    foreach ($datas as $data) {
        $name = $data['name'];
        $serialnumber = $data['serialnumber'];
        $class = $data['class'];
        $class_name = $CLASS['names'][$data['class']];
        $rate = $CLASS['rates'][$data['class']];
        $rate_type = $CLASS['types'][$data['class']];
        if ($stmt->execute()) {
        }
    }

    $stmt->close();

  }

}

function fetchClass($conn, $company_id) {
    $sql = "SELECT * FROM employees_classification WHERE company_id = '". $_SESSION['companyid'] . "'";
    $result = $conn->query($sql);

    $classNames = array();
    $rates = array();
    $types = array();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $classNames[$row['id']] = $row['class_name'];
            $rates[$row['id']] = $row['rate'];
            $types[$row['id']] = $row['rate_type'];
        }

        return array('names' => $classNames, 'rates' => $rates, 'types' => $types);
    }
}
$conn->close();
?>