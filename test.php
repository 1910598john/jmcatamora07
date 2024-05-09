<?php 
$details = array();

$details["name"] = $_POST['name'];
$details["username"] = $_POST['username'];
$details["password"] = $_POST['password'];

echo json_encode($details);
?>