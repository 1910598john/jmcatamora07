
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

$classNames = array();
$rates = array();
$types = array();



$sql = "SELECT * FROM employees_classification WHERE company_id = '". $_SESSION['companyid'] . "'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {

        $classNames[$row['id']] = $row['class_name'];
        $rates[$row['id']] = $row['rate'];
        $types[$row['id']] = $row['rate_type'];
    }

    var_dump($classNames);

}

// Start and end timestamps
// date_default_timezone_set('Asia/Manila');

// // $currentWeekday = strtolower(date('l'));


// $startTimestamp = strtotime("2024-03-01 07:30:00");
// $endTimestamp = strtotime("2024-03-01 07:35:34");

// // Check if end timestamp is before start timestamp
// $scheduledEndTime = strtotime('17:00:00'); // Assuming scheduled end time is 5:00 PM

// // Example clock-out time (you might retrieve this from a database)
// $clockOutTime = strtotime('18:30:00'); // Assuming the employee clocked out at 4:30 PM

// // Check if under time
// if ($clockOutTime < $scheduledEndTime) {
//     $underTimeMinutes = ($scheduledEndTime - $clockOutTime) / 60;
//     echo "Employee is under time by $underTimeMinutes minutes.";
// } elseif ($clockOutTime > $scheduledEndTime) {
//     $overtimeMinutes = ($clockOutTime - $scheduledEndTime) / 60;
//     echo "Employee has worked overtime by $overtimeMinutes minutes.";
// }

// $servername = "localhost";
// $username = "root";
// $password = "";
// $dbname = "payroll";

// // Create connection
// $conn = new mysqli($servername, $username, $password, $dbname);
// // Check connection
// if ($conn->connect_error) {
//     die("Connection failed: " . $conn->connect_error);
// }

// if ($_FILES['file']['error'] === UPLOAD_ERR_OK) {
//     $filename = $_FILES['file']['name'];
//     $filedata = file_get_contents($_FILES['file']['tmp_name']);

//     $stmt = $conn->prepare("INSERT INTO files (filename, filedata) VALUES (?, ?)");
//     $stmt->bind_param("ss", $filename, $filedata);

//     if ($stmt->execute()) {
//         test($conn);
//     } else {
//         echo "Error uploading file.";
//     }

//     $stmt->close();
// } else {
//     echo "Error uploading file.";
// }

// function test($conn) {
//     $sql = "SELECT filedata FROM files";
//     $result = $conn->query($sql);

//     if ($result->num_rows > 0) {
//             // Output data of each row
//         $row = $result->fetch_assoc();
//             echo '<img src="data:image/jpeg;base64,' . base64_encode($row['filedata']) . ' alt="test"/>';

//         } else {
//             echo "0 results";
//     }
// }

$conn->close();
?>



