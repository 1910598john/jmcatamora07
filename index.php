<?php
session_start();

if ((isset($_SESSION['username']))) {
    header('Location: ./home/');
} 

?>
<!DOCTYPE html>
<html>
<head>
    <title>Payroll System | Login</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="./src/main.css"/>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
</head>
<body>
<div class="container">
    <div class="row justify-content-center align-items-center" style="height: 100vh;">
        <div class="col-md-5 p-5" style="background-color: var(--teal);">
            <div style="height:50px;"> 
                <img style="width:100%;height:100%;object-fit:contain;" src="./src/images/Logo.png"/>
            </div>
            <div class="text-center">
                <h2 class="text-white" style="font-size:20px;text-shadow:0 0 5px #fff;">PAYROLL SYSTEM</h2>
            </div>
            <br>
            <hr>
            <p class="text-white text-center" style="text-shadow:0 0 5px #fff;">LOGIN</p>
            <div class="form">
                <form id="loginForm">
                    <div class="input-group mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                            </svg></span>
                        </div>
                        <input type="text" class="form-control" placeholder="Username" autocomplete="off" name="username" aria-label="Username" aria-describedby="basic-addon1">
                    </div>
                    <div class="input-group mb-2">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lock-fill" viewBox="0 0 16 16">
                                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/>
                            </svg></span>
                        </div>
                        <input type="password" class="form-control" placeholder="Password" autocomplete="off" name="password" aria-label="Password" aria-describedby="basic-addon1">
                    </div>
                    <input onclick="loginAdmin()" style="width: 100%;background:var(--lg);color: var(--gray-dark);border:none;padding: 8px;border-radius: 4px;" type="submit" value="Login"/>
                </form>
                <!--<a class="text-white" style="cursor:pointer;">Register</a>-->
            </div>
            
        </div>
    </div>
</div>
<script src="./main.js"></script>
</body>
</html>
