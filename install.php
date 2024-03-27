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
		company_id int(11) NOT NULL
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
		class varchar(5) NOT NULL,
		age int(2) NOT NULL,
		position varchar(30) NOT NULL,
		department varchar(30) NOT NULL,
		contact_number varchar(20) NOT NULL,
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
		leave_start DATE,
		leave_end DATE,
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
		pay_sched varchar(30) NOT NULL,
		day1 int(2) NOT NULL,
		day2 int(2) NOT NULL,
		name varchar(100) NOT NULL,
		address varchar(100) NOT NULL
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS employees_classification (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		class_name varchar(30) NOT NULL,
		hour_perday int(2) NOT NULL,
		clock_in_sched TIME,
		rate int(10) NOT NULL,
		rate_type varchar(30) NOT NULL,
		ot_pay varchar(30) NOT NULL,
		holi_pay varchar(30) NOT NULL
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS company_allowance (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		allowance_name varchar(30) NOT NULL,
		amount int(10) NOT NULL,
		detail varchar(20),
		class varchar(5) NOT NULL
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS allowance_penalty (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		allowance varchar(10) NOT NULL,
		allowance_name varchar(100) NOT NULL,
		type varchar(30) NOT NULL,
		deduction varchar(10) NOT NULL,
		class varchar(5) NOT NULL
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS holidays (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		name varchar(30) NOT NULL,
		date DATE
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS company_holidays (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		holiday_name varchar(30) NOT NULL,
		worked varchar(10) NOT NULL,
		didnotwork varchar(10) NOT NULL,
		class varchar(5) NOT NULL,
		exclusion varchar(200) NOT NULL
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}


	$sql = "CREATE TABLE IF NOT EXISTS staffs_trail (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		name varchar(30) NOT NULL,
		class varchar(5) NOT NULL,
		serialnumber int(11) NOT NULL,
		hours_worked float(10) NOT NULL,
		start_time DATETIME,
		end_time DATETIME,
		total_hours float(10) NOT NULL,
		ot_total float(10) NOT NULL,
		ut_total float(10) NOT NULL,
		ot_mins float(10) NOT NULL,
		ut_mins float(10) NOT NULL,
		late_mins float(10) NOT NULL,
		paid_status varchar(30) NOT NULL,
		leave_status TINYINT(1) DEFAULT 0,
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

