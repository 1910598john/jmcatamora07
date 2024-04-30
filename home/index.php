<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "payroll";

date_default_timezone_set('Asia/Manila');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (!(isset($_SESSION['username']))) {
    header('Location: ../');
}

$sql = "SELECT date FROM attendance WHERE company_id = '". $_SESSION['companyid'] . "' ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $date = $row['date'];

    
}

?>

<!DOCTYPE html>
<html>
<head>
    <title>Biometric Attendance | Home </title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="../src/main.css"/>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
</head>
<body>

<div class="container-fluid">
    <div class="row justify-content-center align-items-center">
        <div class="d-flex content-container">
            <div class="main-menu">
                <div class="fingerprint-login d-flex align-items-center justify-content-center pt-3">
                    <div style="width:30%;padding:5px;margin-right:5px;">
                        <img src="../src/images/fingerprint_img.png" style="width:100%;"/>
                    </div>
                    <p class="text-white text-center" style="text-transform: uppercase;">Employee Biometric <br>Attendance <br>- <br>Payroll System </p>
                </div>
                <hr>
                <div class="menu">
                    <a class="active"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-fill" viewBox="0 0 16 16">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"/>
                        <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"/>
                      </svg> Home</a>
                    <a onclick="window.open('../manage_staffs/', '_blank');"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill-gear" viewBox="0 0 16 16">
                        <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4m9.886-3.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>
                      </svg> Management</a>
                      <a onclick="exit()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                        <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                      </svg> Exit</a>
                </div>
            </div>
            <div class="main-content">
                <br>
                <h1 class="text-white text-center">Attendance (<span id="current-day">Today</span>) </h1>
                <p class="text-center current-time" style="color:rgba(255,255,255,0.8)" >-- 00, 0000 (00:00 --)</p>
                <br>
               
                <div style="min-height: 75vh;max-height:75vh;overflow: auto;">
                    <table>
                        <thead>
                            <tr>
                                <td>NAME</td>
                                <td>POSITION</td>
                                <td>DEPARTMENT</td>
                                <td>TIME LOGS</td>
                                <td>STATUS</td>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $sql = "SELECT name, position, department, time_logs, status FROM attendance WHERE company_id = '". $_SESSION['companyid'] . "' AND DATE(time_logs) = CURDATE() ORDER BY id DESC";
                            $result = $conn->query($sql);

                            if ($result->num_rows > 0) {
                                
                                // output data of each row
                                while($row = $result->fetch_assoc()) {
                                    $dateString = $row['time_logs'];
                                    $date = new DateTime($dateString);
                                    
                                    // Get hour (12-hour format)
                                    $hour = $date->format('h'); // 'h' for 12-hour format
                                    
                                    // Get minute
                                    $minute = $date->format('i');
                                    
                                    // Get meridiem (AM/PM)
                                    $meridiem = $date->format('A');
                                    
                                    $time = $hour . ':' . $minute .' '. $meridiem;
                                    
                                    echo "
                                    <tr style='border-bottom:1px solid rgba(0,0,0,0.1);'>
                                        <td>". $row['name'] . "</td>
                                        <td>". $row['position'] . "</td>
                                        <td>" . $row['department'] . "</td>
                                        <td>" . $time . "</td>
                                        <td>" .$row['status'] ."</td>
                                    </tr>
                                    ";
                                    
                                    
                                }
                                
                            } else {
                                echo "<tr style='border-bottom:1px solid rgba(0,0,0,0.1);'>
                                    <td colspan='5' style='text-align:center;padding:20px;'>Empty</td>
                                </tr>";
                            }

                            $conn->close();
                            ?>
                        </tbody>
                    </table>
                </div>
                
            </div>
        </div>
    </div>
</div>
<div id="notifications2" class="notifications2">
<?php
if (isset($_SESSION["time_logged"])) {
    $status = $_SESSION['time_logged'];
    if ($status == 'IN') {
        echo "
        <script>
        let notificationContainer = document.getElementById('notifications2');

        document.getElementById('notifications2').insertAdjacentHTML('beforeend', `
        <div class='notification alert alert-success' role='alert'>
           Timed in.
        </div>
        `);

        setTimeout(() => {
            while (notificationContainer .hasChildNodes()) {
                notificationContainer.removeChild(notificationContainer .firstChild);
            }
        }, 5000);
        </script>
        ";
    } else {
        echo "
        <script>
        let notificationContainer = document.getElementById('notifications2');

        document.getElementById('notifications2').insertAdjacentHTML('beforeend', `
        <div class='notification alert alert-success' role='alert'>
           Timed out.
        </div>
        `);

        setTimeout(() => {
            while (notificationContainer .hasChildNodes()) {
                notificationContainer.removeChild(notificationContainer .firstChild);
            }
        }, 5000);
        </script>
        ";
    }
    unset($_SESSION['time_logged']);
}

?>
</div>
<script src="./script.js"></script>
<script src="../src/notice.js"></script>

</body>
</html>































