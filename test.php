
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Upload</title>
</head>
<body>
    <form action="test.php" method="post" enctype="multipart/form-data">
        <input type="file" name="file" id="file">
        <input type="submit" value="Upload">
    </form>
</body>
</html>

<?php

// Start and end timestamps
date_default_timezone_set('Asia/Manila');

// $currentWeekday = strtolower(date('l'));

// $startTimestamp = strtotime("2024-03-01 07:30:00");
// $endTimestamp = strtotime("2024-03-01 07:35:34");

// // Check if end timestamp is before start timestamp
// if ($endTimestamp < $startTimestamp) {
//     echo "End timestamp is before start timestamp. Difference is negative.";
// } else {
//     // Convert timestamps to DateTime objects
//     $startTime = new DateTime("@$startTimestamp");
//     $endTime = new DateTime("@$endTimestamp");

//     // Calculate the difference between the two timestamps
//     $interval = $startTime->diff($endTime);

//     // Calculate the total hours worked
//     $totalHoursWorked = $interval->h;

//     // Add minutes to the total hours worked
//     $totalHoursWorked += $interval->i / 60;

//     $totalMinutesWorked = round($totalHoursWorked * 60);

//     echo "Total minutes worked: $totalMinutesWorked";
// }

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

if ($_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $filename = $_FILES['file']['name'];
    $filedata = file_get_contents($_FILES['file']['tmp_name']);

    $stmt = $conn->prepare("INSERT INTO files (filename, filedata) VALUES (?, ?)");
    $stmt->bind_param("ss", $filename, $filedata);

    if ($stmt->execute()) {
        test($conn);
    } else {
        echo "Error uploading file.";
    }

    $stmt->close();
} else {
    echo "Error uploading file.";
}

function test($conn) {
    $sql = "SELECT filedata FROM files";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
            // Output data of each row
        $row = $result->fetch_assoc();
            echo '<img src="data:image/jpeg;base64,' . base64_encode($row['filedata']) . ' alt="test"/>';

        } else {
            echo "0 results";
    }
}


?>