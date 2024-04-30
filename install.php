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

	$sql = "CREATE TABLE IF NOT EXISTS contributions (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		phil varchar(10) NOT NULL,
		phil_first_half float(10, 2),
		pbig varchar(10) NOT NULL,
		pbig_first_half float(10, 2)
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	
	$sql = "CREATE TABLE IF NOT EXISTS sss (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(30) NOT NULL,
		sss LONGBLOB,
		sss_name varchar(100) NOT NULL,
		status varchar(30) NOT NULL
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
		file LONGBLOB,
		date_employed DATE,
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

	$sql = "CREATE TABLE IF NOT EXISTS reports (
		id int(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		paysched varchar(50) NOT NULL,
		from_date DATE,
		to_date DATE,
		period varchar(30) NOT NULL,
		company_id int(11) NOT NULL,
		name varchar(200) NOT NULL,
		serialnumber varchar(10) NOT NULL,
		class varchar(10) NOT NULL,
		class_name varchar(100) NOT NULL,
		rate int(15) NOT NULL,
		rate_type varchar(30) NOT NULL,
		working_days int(2) NOT NULL,
		days_worked int(2) NOT NULL,
		salary_rate float(20, 2) NOT NULL,
		absent float(20, 2) NOT NULL,
		basic float(20, 2) NOT NULL,
		ut_total float(20, 2) NOT NULL,
		tardiness float(20, 2) NOT NULL,
		holiday float(20, 2) NOT NULL,
		ot_total float(20, 2) NOT NULL,
		earnings float(20, 2) NOT NULL,
		sss float(20, 2) NOT NULL,
		phil float(20, 2) NOT NULL,
		pbig float(20, 2) NOT NULL,
		adjustment int(7) NOT NULL,
		cash_advance int(7) NOT NULL,
		charges int(7) NOT NULL,
		sss_loan int(7) NOT NULL,
		pbig_loan int(7) NOT NULL,
		company_loan int(7) NOT NULL,
		total_deductions float(20, 2) NOT NULL,
		allowance float(20, 2) NOT NULL,
		allowance_penalty float(20, 2) NOT NULL,
		net float(20, 2) NOT NULL,
		month varchar(30),
		year varchar(4)
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS payroll_files(
		id int(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		paysched varchar(50) NOT NULL,
		period varchar(50) NOT NULL,
		from_date DATE,
		to_date DATE,
		month varchar(30),
		year varchar(30),
		company_id int(11) NOT NULL,
		name varchar(200) NOT NULL,
		serialnumber varchar(10) NOT NULL,
		class varchar(10) NOT NULL,
		class_name varchar(100) NOT NULL,
		rate int(15) NOT NULL,
		rate_type varchar(30) NOT NULL,
		working_days int(2) NOT NULL,
		days_worked int(2) NOT NULL,
		salary_rate float(20, 2) NOT NULL,
		absent float(20, 2) NOT NULL,
		basic float(20, 2) NOT NULL,
		ut_total float(20, 2) NOT NULL,
		tardiness float(20, 2) NOT NULL,
		holiday float(20, 2) NOT NULL,
		ot_total float(20, 2) NOT NULL,
		earnings float(20, 2) NOT NULL,
		sss float(20, 2) NOT NULL,
		phil float(20, 2) NOT NULL,
		pbig float(20, 2) NOT NULL,
		adjustment int(7) NOT NULL,
		cash_advance int(7) NOT NULL,
		charges int(7) NOT NULL,
		sss_loan int(7) NOT NULL,
		pbig_loan int(7) NOT NULL,
		company_loan int(7) NOT NULL,
		total_deductions float(20, 2) NOT NULL,
		allowance float(20, 2) NOT NULL,
		allowance_penalty float(20, 2) NOT NULL,
		net float(20, 2) NOT NULL
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
		clock_out_sched TIME,
		rate int(10) NOT NULL,
		rate_type varchar(30) NOT NULL,
		deductions varchar(255) NOT NULL
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS users (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		name varchar(50) NOT NULL,
		username varchar(50) NOT NULL,
		password varchar(50) NOT NULL,
		permission JSON
	)";

	if ($conn->query($sql) === TRUE) {
	    echo "<br>Table created successfully";
	} else {
	    echo "Error creating table: " . $conn->error;
	}

	$sql = "CREATE TABLE IF NOT EXISTS ot_approval (
		id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		company_id int(11) NOT NULL,
		serialnumber int(10) NOT NULL,
		name varchar(100) NOT NULL,
		position varchar(100) NOT NULL,
		department varchar(100) NOT NULL,
		timed_in DATETIME,
		timed_out DATETIME,
		ot_mins int(5) NOT NULL,
		ot_pay float(10, 2) NOT NULL,
		row_id int(10) NOT NULL,
		date DATE
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
		ot_mins int(10) NOT NULL,
		ut_mins int(10) NOT NULL,
		ot_approval varchar(30) DEFAULT 'need approval',
		late_mins int(10) NOT NULL,
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
		class varchar(10) NOT NULL,
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

