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
    $period = $_POST['period'];

    $exists = checkIfFileExists($conn, $from, $to, $_POST['branch']);

    $month = date('m', strtotime($from));
    $year = date('Y', strtotime($from));

    if (!$exists) {
      $stmt = $conn->prepare("INSERT INTO payroll_files (paysched, period, from_date, to_date, month, year, company_id, name, serialnumber, class, class_name, rate, rate_type, branch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      $stmt->bind_param("ssssssisisssss", $paysched, $period, $from, $to, $month, $year, $company_id, $name, $serialnumber, $class, $class_name, $rate, $rate_type, $branch);
  
      foreach ($datas as $data) {
        $name = $data['name'];
        $serialnumber = $data['serialnumber'];
        $class = $data['class'];
        $class_name = $CLASS['names'][$data['class']];
        $rate = $CLASS['rates'][$data['class']];
        $rate_type = $CLASS['types'][$data['class']];
        $branch = $_POST['branch'];
        if ($stmt->execute()) {
        }
      }

      $stmt->close();

    } else {
      echo 'exists';
    }
    

    
  }

  if (isset($_POST['mon'])) {
    $selectedMonth = date('m', strtotime($_POST['mon']));
    $selectedYear = date('Y', strtotime($_POST['mon']));

    $exists = checkIfFileExists2($conn, $selectedMonth, $selectedYear, $_POST['branch']);

    if (!$exists) {
      $stmt = $conn->prepare("INSERT INTO payroll_files (paysched, month, year, company_id, name, serialnumber, class, class_name, rate, rate_type, branch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      $stmt->bind_param("sssisisssss", $paysched, $selectedMonth, $selectedYear, $company_id, $name, $serialnumber, $class, $class_name, $rate, $rate_type, $branch);
  
      foreach ($datas as $data) {
        $name = $data['name'];
        $serialnumber = $data['serialnumber'];
        $class = $data['class'];
        $class_name = $CLASS['names'][$data['class']];
        $rate = $CLASS['rates'][$data['class']];
        $rate_type = $CLASS['types'][$data['class']];
        $branch = $_POST['branch'];
        if ($stmt->execute()) {
        }
      }

      $stmt->close();

    } else {
      echo 'exists';
    }

    

  }
}

function checkIfFileExists($conn, $from, $to, $branch) {
  $sql = "SELECT from_date, to_date FROM payroll_files WHERE company_id = '". $_SESSION['companyid'] . "' AND from_date = '$from' AND to_date = '$to' AND branch = '$branch'";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    return true;
  } else {
    return false;
  }
}

function checkIfFileExists2($conn, $mon, $year, $branch) {

  $sql = "SELECT month, year FROM payroll_files WHERE company_id = '". $_SESSION['companyid'] . "' AND month = '$mon' AND year = '$year' AND branch = '$branch' AND paysched = 'monthly'";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    return true;
  } else {
    return false;
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