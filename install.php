<?php
	//Connect to database
    $servername = "localhost";
    $username = "root";		//put your phpmyadmin username.(default is "root")
    $password = "";			//if your phpmyadmin has a password put it here.(default is "root")
    $dbname = "payroll";
    
	$conn = new mysqli($servername, $username, $password, $dbname);

	// Create database
	$sql = "CREATE DATABASE IF NOT EXISTS payroll";
	if ($conn->query($sql) === TRUE) {
	    echo "Database created!";
	} else {
	    echo "Error creating database: " . $conn->error;
	}

    
	$conn = new mysqli($servername, $username, $password, $dbname);

	//sql to create table
	$sql = "CREATE TABLE IF NOT EXISTS payroll_admin (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		registered_id int(3) NOT NULL,
		name varchar(30) NOT NULL,
		username varchar(30) NOT NULL,
		password varchar(30) NOT NULL,
		serialnumber int(11) NOT NULL,
		machine_id int(50) NOT NULL,
		company_id int(11) NOT NULL,
		company_name varchar(100) NOT NULL,
		company_add varchar(100) NOT NULL
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	//sql to create table
	$sql = "CREATE TABLE IF NOT EXISTS staffs (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		name varchar(30) NOT NULL,
		age int(2) NOT NULL,
		position varchar(30) NOT NULL,
		department varchar(30) NOT NULL,
		contact_number varchar(20) NOT NULL,
		rate int(10) NOT NULL,
		serialnumber int(11) NOT NULL,
		company_id int(11) NOT NULL,
		adjustment int(10) NOT NULL,
		cash_advance int(20) NOT NULL,
		charges int(11) NOT NULL,
		sss_loan int(11) NOT NULL,
		pag_ibig_loan int(11) NOT NULL,
		company_loan int(11) NOT NULL,
		total_hours float(10) NOT NULL,
		days_worked float(10) NOT NULL,
		hours_worked_today float(10) NOT NULL,
		status varchar(10) NOT NULL,
		ut_total float(11) NOT NULL,
		ot_total float(11) NOT NULL,
		date DATE
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS company_settings (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		sss_deduction int(10) NOT NULL,
		philhealth_deduction int(10) NOT NULL,
		pag_ibig_deduction int(10) NOT NULL,
		allowance int(20) NOT NULL
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS company_holidays (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		holiday_date DATE,
		percentage float(10)

	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}


	$sql = "CREATE TABLE IF NOT EXISTS staffs_trail (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		name varchar (30) NOT NULL,
		serialnumber int(11) NOT NULL,
		hours_worked float(10) NOT NULL,
		start_time DATETIME,
		end_time DATETIME,
		total_hours float(10) NOT NULL,
		ot_total float(10) NOT NULL,
		ut_total float(10) NOT NULL,
		date DATE
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS notice (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		name varchar (30) NOT NULL,
		serialnumber int(11) NOT NULL,
		position varchar(30) NOT NULL,
		department varchar(30) NOT NULL,
		contact_number varchar(20) NOT NULL,
		notice_message varchar(100) NOT NULL,
		date DATE
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	//sql to create table
	$sql = "CREATE TABLE IF NOT EXISTS attendance (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		name varchar(30) NOT NULL,
		position varchar(30) NOT NULL,
		department varchar(30) NOT NULL,
		serialnumber int(11) NOT NULL,
		time_logs DATETIME,
		status varchar(10) NOT NULL,
		company_id int(10) NOT NULL,
		date DATE
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	echo "<script>
			setTimeout(() => {
				document.write('Redirecting..');
			}, 1500);
			setTimeout(() => {
				window.open('./', '_self');
			}, 3500);
			</script>";


		
	$conn->close();
?>

