<?php
session_start();

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

if (!(isset($_SESSION['username']))) {
    header('Location: ../');
} 

?>

<!DOCTYPE html>
<html>
<head>
    <title>Biometric Attendance | Manage Staffs</title>
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
                    <p class="text-white text-center" style="text-transform: uppercase;">Employee Biometric <br>Attendance <br>- <br>Payroll System</p>
                </div>
                <hr>
                <div class="menu">
                    <a onclick="window.open('../home/', '_self');"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-fill" viewBox="0 0 16 16">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"/>
                        <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"/>
                      </svg> Home</a>
                    <a class="active"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill-gear" viewBox="0 0 16 16">
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
                <h1 class="text-white text-center">Management</h1>
                <p class="text-center current-time" style="color:rgba(255,255,255,0.8)" >-- 00, 0000 (00:00 --)</p>
                <br>
                <hr>
                <div class="buttons" style="min-height: 65vh;">
                    <div class="buttons-wrapper">
                        <div>
                            <p>Staffs</p>
                            <div class="button <?php if (isset($_SESSION['authorized'])) { echo 'view-staffs'; }?>">
                                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p>Add Staff</p>
                            <div class="button <?php if (isset($_SESSION['authorized'])) { echo 'add-staff'; }?>"  style="position:relative;">
                                <?php
                                
                                $sql = "SELECT id, name, age, position, department, status FROM staffs WHERE company_id = '". $_SESSION['companyid'] . "' ORDER BY id DESC";
                                $result = $conn->query($sql);
                
                                $numOfEmployees = $result->num_rows;

                                if ($numOfEmployees == 0) {
                                    echo "<span class='must' style='background:orange;border:1px solid var(--dark-teal);position:absolute;top:-5px;right:-5px;padding:10px;border-radius:50%;'></span>";
                                }
                
                                ?>
                                
                                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" class="bi bi-person-fill-add" viewBox="0 0 16 16">
                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                                  </svg>
                            </div>
                        </div>
                        <div>
                            <p>Edit Staff</p>
                            <div class="button ">
                                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" class="bi bi-person-fill-dash" viewBox="0 0 16 16">
                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                                  </svg>
                            </div>
                        </div>
                        <div>
                            <p>Payroll</p>
                            <div class="button payroll">
                                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0"/>
                                    <path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z"/>
                                    <path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z"/>
                                    <path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567"/>
                                  </svg>
                            </div>
                        </div>
                        
                        <div>
                            <p>Report</p>
                            <div class="button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z"/>
                                  </svg>
                            </div>
                        </div>
                        <div>
                            <p>Settings</p>
                            <div class="button <?php if (isset($_SESSION['authorized'])) { echo 'settings'; }?>" style="position:relative;">
                                <?php
                                $sql = "SELECT COUNT(*) as total FROM company_settings";
                                $result = $conn->query($sql);

                                if ($result) {
                                    $row = $result->fetch_assoc();
                                    $count = intval($row['total']);
                                    if ($count > 0) {
                                        $exists = checkComID($conn);
                                        if (!$exists) {
                                            echo '<span class="must" style="background:orange;border:1px solid var(--dark-teal);position:absolute;top:-5px;right:-5px;padding:10px;border-radius:50%;"></span>';
                                        }
                                        
                                    } else if ($count == 0) {
                                        echo '<span class="must" style="background:orange;border:1px solid var(--dark-teal);position:absolute;top:-5px;right:-5px;padding:10px;border-radius:50%;"></span>';
                                    }
                                    
                                }

                                function checkComID($conn) {
                                    $sql = "SELECT company_id FROM company_settings WHERE company_id = '". $_SESSION['companyid'] . "'";
                                    $result = $conn->query($sql);
                            
                                    if ($result->num_rows > 0) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                                ?>
                                
                                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                                    <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="../src/script.js"></script>

<?php

function notAuhorized() {
    echo "
    <script>
    $(document).ready(function(){
        document.body.insertAdjacentHTML('afterbegin', `
        <div class='pop-up-window'>
            <div class='window-content'>
                <p class='text-center text-white' style='font-size:20px;'>AUTHORIZATION</p>
                <div style='display: flex;align-items: center;margin-bottom:10px;'>
                    <div style='flex:1;height:1px;background:rgba(0,0,0,0.1);'></div>
                    <div style='flex:2;display:grid;place-items:center;color:#fff;'>Confirm Password</div>
                    <div style='flex:1;height:1px;background:rgba(0,0,0,0.1);'></div>
                </div>
                <form id='authorizationForm'>
                    <div class='input-group mb-2'>
                        <div class='input-group-prepend'>
                            <span class='input-group-text' id='basic-addon1'><svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-lock-fill' viewBox='0 0 16 16'>
                                <path d='M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2'/>
                            </svg></span>
                        </div>
                        <input type='password' class='form-control' placeholder='Enter password' name='password' aria-label='Password' aria-describedby='basic-addon1'>
                    </div>
                    <input onclick='isAuthorized()' style='width: 100%;background:var(--lg);color: var(--gray-dark);border:none;padding: 8px;border-radius: 4px;' type='submit' value='Confirm password'/>
                </form>
            </div>
        </div>
        `);
    })
    
    function isAuthorized() {
        event.preventDefault();
        let data = new FormData(document.getElementById('authorizationForm'));
        var formDataObject = {};
        let isNotEmpty = true;
        data.forEach(function(value, key){
            formDataObject[key] = value;
            if (value === '') {
                isNotEmpty = false;
            }
        });
    
        $.ajax({
            type: 'POST',
            url: '../php/authorization.php',
            data: {
                password: formDataObject.password,
            }, success:function(res){
                location.reload();
            }
        })
    }
    
    </script>
    ";
}

if (!isset($_SESSION['authorized'])) {
    notAuhorized();
}

?>
<script src="../src/notice.js"></script>
</body>
</html>































