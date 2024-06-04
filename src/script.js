// Define months array
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var gateway = `ws://192.168.10.147/management`;
var websocket;
var SERIAL_NUMBER;
var timeout;
var details = [];
var ALLDetails = [];
var COMPANY_NAME;
var COMPANY_ADD;

var PAYSLIPS = [];
var PAYSLIP = [];
var PAYSCHED;

var from;
var to;
var PERIOD;
var MON;

var MONTH; //holi
var YEAR; //holi

var SSS;
var PHILHEALTH;
var PAGIBIG;
var firsHalfDeduction;
var D = [];
var file_opened = false;
var HOLIDAY_PERCENTAGE;

var phil;
var phil_first_half;
var pbig;
var pbig_first_half;
var sss_first_half;
var STAFFS;
var BRANCH;
var SELECTED_BRANCH;

var ALL_CLASS;
var ALL_SERIAL;

var COMPUTED = [];

var registeredBranch;

var COMPANY_ALLOWANCE;
var current_user;

var close_icon = `
<div class="close-window" style="position:absolute;right:-40px;top:-40px;cursor:pointer;">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#fff" class="bi bi-x-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
</div>`;

function initWebSocket() {
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
}

function onOpen(event) {
    console.log('Connection opened');
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 1000);
}

var deductions = {};
var CLASSES = {};

function onMessage(event) {
 
    try {
        let data = JSON.parse(event.data);
        if (data.message == 'registered') {
            errorNotification("Already registered.", "danger");
        }
        else if (data.message == 'success') {
            SERIAL_NUMBER = data.id;
            registeredBranch = data.uniqueID;
            $("input[type='submit']").prop("disabled", false);
            successNotification("Fingerprint confirmed.", "success");
        }
        
    } catch(err){
        console.log(err);
    }

    if (event.data == 'failed fingerprint') {
        console.log(event.data);
        errorNotification("Failed to identify the fingerprint.", "warning");
        errorNotification("Please try again.", "warning");
    }
    else if (event.data == "did not match") {
        errorNotification("Fingerprint didn't match.","warning");
    }
    else if (event.data == 'confirm') {
        successNotification("Confirm fingerprint.", "success");
    }
    else if (event.data.includes("machine")) {
        MACHINEID = event.data.replace(/machine/g, '');
        registeredBranch = MACHINEID;
    }
   
}

initWebSocket();

$(document).ready(function(){
    displayCurrentTime();

    document.body.insertAdjacentHTML("afterbegin", `
    <div id="notifications" class="notifications">
    </div>`);

    $.ajax({
        type: 'POST',
        url: '../php/get_user_name.php',
        success: function(res) {
            current_user = res;
        }
    })

    $.ajax({
        type: 'POST',
        url: '../php/fetch_classes.php',
        success: function(res){
            try {
                res = JSON.parse(res);
                for (let i = 0; i < res.length; i++) {
                    CLASSES[`${res[i].id}`] = res[i].class_name;
                }

            } catch (err) {
                console.log(err);
            }
        }
    })

    $.ajax({
        type: 'POST',
        url: '../php/fetch_company_allowance.php',
        success:function(res) {
            try {
                res = JSON.parse(res);
                COMPANY_ALLOWANCE = res;
            } catch (err) {
                console.log(err);
            }
        }
    })

    $.ajax({
        type: 'POST',
        url: '../php/fetch_sss_file.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
                for (let i = 0; i < res.length; i++) {
                    if (res[i].status == 'current') {
                        const excelData = atob(res[i].file);
                        // Parse Excel data using SheetJS
                        const workbook = XLSX.read(excelData, { type: 'binary' });
            
                        // Assuming you want to read the first sheet
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];

                        // Convert worksheet to JSON
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);
                        SSS = jsonData;
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
    });

    $.ajax({
        type: 'POST',
        url: '../php/fetch_contributions.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
                PHILHEALTH = res.phil;
                phil_first_half = res.phil_first_half;
                PAGIBIG = res.pbig;
                pbig_first_half = res.pbig_first_half;
                sss_first_half = res.sss_first_half;

            } catch (err) {
                console.log(err);
            }
        }
    });

    $.ajax({
        type: 'POST',
        url: '../php/staffs.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
                STAFFS = res;
            } catch (err){
                console.log(err);
            }
        }
    })


    
    $.ajax({
        type: 'POST',
        url: '../php/fetch_all_class.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
                ALL_CLASS = res;
            } catch(err) {
                console.log(err);
            }
        }
    })
    
    $.ajax({
        type: 'POST',
        url: '../php/fetch_company_name.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
                COMPANY_NAME = res.name;
                COMPANY_ADD = res.address;
                PAYSCHED = res.pay_sched;
            } catch (err) {
                console.log(err);
            }
        }
    })

    $.ajax({
        type: 'POST',
        url: '../php/fetch_machines.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
                BRANCH = res;
            } catch (err) {
                console.log(err);
            }
        }
    })

})

var salary_details;

function computeSalary(id) {
    var responseBody;
    $.ajax({
        type: 'POST',
        url: '../php/fetch_staff.php',
        data: {
            serial: id,
            branch: SELECTED_BRANCH
        },
        success: function(res){
   
            try{ 
                res = JSON.parse(res);
                responseBody = res;

                //fetch class
                $.ajax({
                    type: 'POST',
                    url: '../php/fetch_class.php',
                    data: {
                        class: responseBody.class,

                    }, success: function(res){
                    
                        try {
                            res = JSON.parse(res);

                            var className, in_sched, holiday_pay, hour_perday, ot_pay, rate, rateType, PAYDeductions;

                            className =  res.class_name;
                            hour_perday = res.hour_perday;
                            rate = res.rate;
                            PAYDeductions = res.deductions.split(" ");

                            rateType = res.rate_type;
                            
                            var name, pos, department, adjustment, CA, charges, sss_loan, pbig_loan, company_loan;
                            name = responseBody.name;
                            pos = responseBody.position;
                            department = responseBody.department;
                            adjustment = responseBody.adjustment;
                            CA = responseBody.cash_advance;
                            charges = responseBody.charges;
                            sss_loan = responseBody.sss_loan;
                            pbig_loan = responseBody.pag_ibig_loan;
                            company_loan = responseBody.company_loan;

                            $.ajax({
                                type: 'POST',
                                url: '../php/fetch_company_settings.php',
                                success: function(sched){

                                    try {
                                        sched = JSON.parse(sched);
                                    } catch (err) {
                                        sched = 'None';
                                    }

                                    if (PAYSCHED == 'twice-monthly') {
                                        $.ajax({
                                            type: 'POST',
                                            url: '../php/fetch_staffs_trail.php',
                                            data: {
                                                from: from,
                                                to: to,
                                                serialnumber: responseBody.serialnumber,
                                                branch: SELECTED_BRANCH
                                            },
                                            success: function(trail){
                                                compute(trail);
                                            }
                                        })

                                    } else if (PAYSCHED == 'monthly') {
                                        $.ajax({
                                            type: 'POST',
                                            url: '../php/fetch_staffs_trail.php',
                                            data: {
                                                serialnumber: responseBody.serialnumber,
                                                mon: MON,
                                                branch: SELECTED_BRANCH
                                            },
            
                                            success: function(trail){
                                                compute(trail);
                                            }
                                        })
                                    } else {
                                        errorNotification('Please update your settings.', 'warning');
                                    }

                                    function compute(trail) {
                                      
                                        try {
                                            trail = JSON.parse(trail);
   
                                            let ot_total = 0;
                                            let ut_total = 0;
                                            let ot_mins = 0;
                                            let ut_mins = 0;
                                            let late_mins = 0;
    
                                            var allowanceResponseBody, allowancePenalty, holidays;
                                            
                                            $.ajax({
                                                type: 'POST',
                                                url: '../php/fetch_employeeAllowance.php',
                                                data: {
                                                    serial: id,
                                                    branch: responseBody.branch,
                                                }, success: function(res){
                                                    
                                                    try {
                                                        allowanceResponseBody = JSON.parse(res);
                                                    } catch (err) {
                                                        allowanceResponseBody = 'None';
                                                    }

                                                 

                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/fetch_allowancePenaltyByClass.php',
                                                        success: function(res){
                                                            
                                                            try {
                                                                allowancePenalty = JSON.parse(res);
                                                            } catch (err) {
                                                                allowancePenalty = 'None';
                                                            }

                                                            $.ajax({
                                                                type: 'POST',
                                                                url: '../php/fetchHolidaysByClass.php',
                                                                data: {
                                                                    serial: responseBody.serialnumber,
                                                                    branch: responseBody.branch,
                                                                    paysched: PAYSCHED,
                                                                    from: from,
                                                                    to: to,
                                                                    month: MONTH,
                                                                    year: YEAR
                                                                }, success: function(res) {
                                                                    let holidaypay = parseFloat(res);
                                                                    details = [];

                                                                    details.push({"RATE" : rate});
                                                                    details.push({"RATE TYPE" : rateType.toUpperCase()});
                                                                    details.push({"WORKING DAYS" : $(`#cal${id}`).val()});

                                                                    PAYSLIP.push({'name' : COMPANY_NAME, 'row': '1', 'col': '1', 'span' : '4', 'align': 'center', 'bold' : true, 'size' : '20'})

                                                                    if (PAYSCHED == 'twice-monthly') {
                                                                        let d = new Date(from);
                                                                        let d2 = new Date(to);
                                                                        let m = months[d.getMonth()];
                                                                        let day = d.getDate();
                                                                        let day_2 = d2.getDate();
                                                                        let year = d.getFullYear();
                                                                        PAYSLIP.push({'name' : `${m} ${day}-${day_2}, ${year}`, 'row': '2', 'col': '3', 'span': '2', 'align': 'right'})

                                                                    } else if (PAYSCHED == 'monthly') {
                                                                        let parts = MON.split('-');
                                                                        let year = parts[0];
                                                                        let month = parts[1];
                                                                        // Create a Date object
                                                                        let date = new Date(year, month - 1); // Month is 0-based in JavaScript
                                                                        let formattedDate = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                                                                        PAYSLIP.push({'name' : `${formattedDate}`, 'row': '2', 'col': '3', 'span': '2', 'align': 'right'});
                                                                    }

                                                                    PAYSLIP.push({'name' : 'Name:', 'row': '3', 'col': '1'})
                                                                    PAYSLIP.push({'name' :  name, 'row': '3', 'col': '2', 'span': '3', 'align': 'left'})
                                                                    PAYSLIP.push({'name' : 'COMPENSATIONS', 'row': '5', 'col': '1', 'span' : '2', 'align': 'center', 'bold' : true})
                                                                    PAYSLIP.push({'name' : 'DEDUCTIONS', 'row': '5', 'col': '2', 'span' : '2', 'align': 'center', 'bold' : true})
                                                                    PAYSLIP.push({'name' : 'Basic', 'row': '6', 'col': '1'})

                                                                    let secondHalf = false;
                                                                    let numOfLeave = 0;
                                                                    let days_worked = 0;

                                                                    for (let i = 0; i < trail.length; i++) {
                                                                        try {
                                                                            if (trail[i].date != trail[i + 1].date) {
                                                                                days_worked += 1;
                                                                                if (trail[i].ot_approval == 'approved') {
                                                                                    ot_total += parseFloat(trail[i].ot_total);
                                                                                }
                                                                                ut_total += parseFloat(trail[i].ut_total);
                                                                                ot_mins += parseFloat(trail[i].ot_mins);
                                                                                ut_mins += parseFloat(trail[i].ut_mins);
                                                                            }
                                                                            
                                                                        } catch (err) {
                                                                            if (trail[i]) {
                                                                                const currentDate = new Date();

                                                                                // Get the year, month, and day
                                                                                const year = currentDate.getFullYear();
                                                                                const mon = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so we add 1
                                                                                const day = String(currentDate.getDate()).padStart(2, '0');

                                                                                //if (trail[i].date != `${year}-${mon}-${day}`)  {
                                                                                    days_worked += 1;
                                                                                //}
                                                                                if (trail[i].ot_approval == 'approved') {
                                                                                    ot_total += parseFloat(trail[i].ot_total);
                                                                                }
                                                                                ot_mins += parseFloat(trail[i].ot_mins);

                                                                                ut_mins += parseFloat(trail[i].ut_mins);
                                                                                
                                                                                if (trail[i].date != `${year}-${mon}-${day}`)  {
                                                                                    ut_total += parseFloat(trail[i].ut_total);
                                                                                }
                                                                            }
                                                                        }

                                                                        let HOURPERDAY = parseInt(hour_perday);
                                                                        HOURPERDAY = HOURPERDAY / 2;
                                                                        
                                                                        let OnLeave = false;

                                                                        if (parseInt(trail[i].leave_status) == 1) {
                                                                            OnLeave = true;
                                                                            numOfLeave += 1;
                                                                            days_worked += 1;
                                                                        }

                                                                        if (!OnLeave) {
                                                                            if (trail[i].total_hours <= HOURPERDAY) {
                                                                                //days_worked -= 0.5;
                                                                            }
                                                                        }

                                                                        late_mins += parseInt(trail[i].late_mins);
                                                                    }
                                                                    ///////////// COMPUTATION
                                                                    let salaryRate = parseInt(rate) * parseInt($(`#cal${id}`).val());
                                                                    details.push({"DAYS WORKED" : days_worked});
                                                                    if (numOfLeave > 0) {
                                                                        details.push({"DAYS LEAVE" : (numOfLeave)});
                                                                    }
                                                                    details.push({"SALARY RATE" : salaryRate.toLocaleString()});
                                                                    
                                                                    var absent = 0;
                                                                    rate = parseInt(rate);
                                                                    if (rateType == 'hourly') {
                                                                        rate = rate * parseInt(hour_perday);
                                                                    } else if (rateType == 'monthly') {
                                                                        rate = rate * 12;
                                                                        rate = rate / 365;
                                                                    }

                                                                    let basic = days_worked * rate;
                                                                    
                                                                    PAYSLIP.push({'name' : basic.toLocaleString(), 'row': '6', 'col': '2'})

                                                                    if (days_worked >= parseInt($(`#cal${id}`).val())) {
                                                                        absent = 0;
                                                                    } else {
                                                                        absent = (parseInt($(`#cal${id}`).val()) - parseInt(days_worked)) * rate;
                                                                    }

                                                                    let earned = 0;
                                                                    let net = 0;
                                                                    let total_deductions = 0;

                                                                    if (PAYDeductions.includes("absences")) {
                                                                        
                                                                        earned = salaryRate - absent;
                                                                        
                                                                        let a = absent - numOfLeave;
                                                                        details.push({"ABSENT (total)" : {"value" : a.toLocaleString(), "op" : "-"}});

                                                                        PAYSLIP.push({'name' : "Absent", 'row': '7', 'col': '1'})
                                                                        PAYSLIP.push({'name' : absent.toLocaleString(), 'row': '7', 'col': '2'})

                                                                    } else {
                                                                        earned = salaryRate;
                                                                        details.push({"ABSENT (total)" : {"value" : 0, "op" : "-"}});
                                                                        PAYSLIP.push({'name' : "Absent", 'row': '7', 'col': '1'})
                                                                        PAYSLIP.push({'name' : 0, 'row': '7', 'col': '2'})
                                                                    }

                                                                    details.push({"BASIC" : basic.toLocaleString()});

                                                                    if (PAYDeductions.includes('undertime')) {
                                                                        earned = earned - ut_total;
                                                                        details.push({"UNDERTIME (total)" : {"value" : ut_total.toFixed(2), "op" : "-"}});
                                                                        PAYSLIP.push({'name' : "Undertime", 'row': '8', 'col': '1'})
                                                                        PAYSLIP.push({'name' : ut_total.toFixed(2), 'row': '8', 'col': '2'})
                                                                    } else {
                                                                        details.push({"UNDERTIME (total)" : {"value" : 0, "op" : "-"}});
                                                                        PAYSLIP.push({'name' : "Undertime", 'row': '8', 'col': '1'})
                                                                        PAYSLIP.push({'name' : 0, 'row': '8', 'col': '2'})
                                                                    }

                                                                    if (PAYDeductions.includes('tardiness')) {
                                                                        let totalMinutesLate = late_mins;
                                                                        let tardiness = 0;
                                                                        if (rateType == 'daily') {
                                                                            let RATE = parseInt(rate);
                                                                            let HOURLY_RATE = RATE / 8;
                                                                            let PERMINUTE_RATE = HOURLY_RATE / 60;

                                                                            tardiness = (PERMINUTE_RATE * totalMinutesLate);
                                                                        } else if (rateType == 'hourly') {
                                                                            let RATE = parseInt(rate);
                                                                            let PERMINUTE_RATE = RATE / 60;

                                                                            tardiness = (PERMINUTE_RATE * totalMinutesLate);
                                                                        } else if (rateType == 'monthly') {
                                                                            let RATE = parseInt(rate) * 12;
                                                                            let DAILY_RATE = RATE / 365;
                                                                            let HOURLY_RATE = DAILY_RATE / 8;
                                                                            let PERMINUTE_RATE = HOURLY_RATE / 60;

                                                                            tardiness = (PERMINUTE_RATE * totalMinutesLate);
                                                                        }

                                                                        earned = earned - tardiness;
                                                                        details.push({"TARDINESS (total)" : {"value" : tardiness.toFixed(2), "op" : "-"}});
                                                                        PAYSLIP.push({'name' : "Tardiness", 'row': '9', 'col': '1'})
                                                                        PAYSLIP.push({'name' : tardiness.toFixed(2), 'row': '9', 'col': '2'})

                                                                    } else {
                                                                        details.push({"TARDINESS (total)" : {"value" : 0, "op" : "-"}});
                                                                        PAYSLIP.push({'name' : "Tardiness", 'row': '9', 'col': '1'})
                                                                        PAYSLIP.push({'name' : 0, 'row': '9', 'col': '2'})
                                                                    }

                                                                    earned = earned + holidaypay;
                                                                    // let obj = {'serial' : id, 'computed' : true, 'holidaypay': holidaypay};
                                                                    // COMPUTED.push(obj);
                                                                    details.push({"HOLIDAYS (total)" : {"value" : holidaypay, "op" : "+"}});

                                                                    PAYSLIP.push({'name' : "Holiday", 'row': '10', 'col': '1'})
                                                                    PAYSLIP.push({'name' : holidaypay, 'row': '10', 'col': '2'})

                                                                    let promise5;

                                                                    if (PAYSCHED == 'twice-monthly') {
                                                                        promise5 = new Promise(function(resolve, reject){
                                                                            $.ajax({
                                                                                type: 'POST',
                                                                                url: '../php/fetch_employee_early_in_pay.php',
                                                                                data: {
                                                                                    paysched: PAYSCHED,
                                                                                    serial: id,
                                                                                    branch: SELECTED_BRANCH,
                                                                                    from: from,
                                                                                    to: to
                                                                                },success: function(res) {
                                                                                    resolve(res);
                                                                                }
                                                                            })
                                                                        })
                                                                    } else if (PAYSCHED == 'monthly') {
                                                                        promise5 = new Promise(function(resolve, reject){
                                                                            $.ajax({
                                                                                type: 'POST',
                                                                                url: '../php/fetch_employee_early_in_pay.php',
                                                                                data: {
                                                                                    paysched: PAYSCHED,
                                                                                    serial: id,
                                                                                    branch: SELECTED_BRANCH,
                                                                                    month: MONTH
                                                                                },success: function(res) {
                                                                                    resolve(res);
                                                                                }
                                                                            })
                                                                        })
                                                                    }

                                                                    promise5.then(
                                                                        function(earlyinpay) {
                                                                           
                                                                            ot_total += parseFloat(earlyinpay);

                                                                            earned = earned + ot_total;
                                                                            details.push({"OVERTIME (total)" : {"value" : ot_total.toFixed(2), "op" : "+"}});

                                                                            PAYSLIP.push({'name' : "Overtime", 'row': '11', 'col': '1'})
                                                                            PAYSLIP.push({'name' : ot_total.toFixed(2), 'row': '11', 'col': '2'})

                                                                            net = earned;

                                                                            PAYSLIP[7]['name'] = earned.toFixed(2);
                                                                            details[6]['BASIC'] = earned.toFixed(2);

                                                                            details.push({"EARNED" : {"value" : earned.toLocaleString(), "highlight" : "", "op" : "+"}});

                                                                            let sss_contri = 0;
                                                                            let pbig_contri = 0;
                                                                            let phil_contri = 0;

                                                                            if (PAYSCHED == 'twice-monthly') {
                                                                                $.ajax({
                                                                                    type: 'POST',
                                                                                    url: '../php/determine_period.php',
                                                                                    data : {
                                                                                        id: id,
                                                                                        from: from,
                                                                                        branch: SELECTED_BRANCH
                                                                                    }, success: function(res) {
                                                                                        
                                                                                        if (PERIOD == 'second-half') {
                                                                                            try {
                                                                                                res = JSON.parse(res);
                                                                                                let s = earned + parseFloat(res.earnings);

                                                                                                if (SSS != 'undefined' && SSS != null) {
                                                                                                    for (let i = 0; i < SSS.length; i++) {
                                                                                                        let arr = Object.values(SSS[i]);
                                                                                                        if (arr[2] == 'Over') {

                                                                                                            if (s >= arr[1]) {
                                                                                                                sss_contri = arr[6];
                                                                                                                
                                                                                                                break;
                                                                                                            }

                                                                                                        } else {

                                                                                                            let arr = Object.values(SSS[i]);
                                                                                                            
                                                                                                            if (s >= arr[1] && s <= arr[2]) {
                                                                                                                sss_contri = arr[6];
                                                                                                                
                                                                                                                break;
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                    
                                                                                                }

                
                                                                                                if (PAGIBIG != 'undefined' && PAGIBIG != null) {
                                                                                                    let d = PAGIBIG;
                                                                                                    if (d.includes("%")) {
                                                                                                        d = d.replace(/%/g, '');
                                                                                                        d = parseFloat(d);
                                                                                                        d = d / 100;
                                                                                                        d = s * d;
                                                                                                    } else {
                                                                                                        d = parseFloat(d);
                                                                                                    }
                                                                                                    pbig_contri = d;
                                                                                                }
                
                                                                                                if (PHILHEALTH != 'undefined' && PHILHEALTH != null) {
                                                                                                    let d = PHILHEALTH;
                                                                                                    if (d.includes("%")) {
                                                                                                        d = d.replace(/%/g, '');
                                                                                                        d = parseFloat(d);
                                                                                                        d = d / 100;
                                                                                                        d = s * d;
                                                                                                    } else {
                                                                                                        d = parseFloat(d);
                                                                                                    }
                                                                                                    phil_contri = d;
                                                                                                }

                                                                                                sss_contri = sss_contri - parseFloat(res.sss);
                                                                                                phil_contri = phil_contri - parseFloat(res.phil);
                                                                                                pbig_contri = pbig_contri - parseFloat(res.pbig);

                                                                                            } catch (err) {
                                                                                                console.log(err);
                                                                                            }

                                                                                        
                                                                                        } else {
                                                                                            if (sss_first_half != 'undefined' && sss_first_half != null) {
                                                                                                sss_contri = sss_first_half;
                                                                                            }
                                                                                            if (pbig_first_half != 'undefined' && pbig_first_half != null) {
                                                                                                pbig_contri = pbig_first_half;
                                                                                            }
                                                                                            if (phil_first_half != 'undefined' && phil_first_half != null) {
                                                                                                phil_contri = phil_first_half;
                                                                                            }
                                                                                        }
                                                                                        
                                                                                        deductions[`deduc${id}`] = {"sss" : sss_contri, "pbig" : pbig_contri, "phil" : phil_contri};

                                                                                        D[`d${id}`] = {'sss' : deductions[`deduc${id}`].sss, 'phil' : deductions[`deduc${id}`].phil, 'pbig' : deductions[`deduc${id}`].pbig};
                    
                                                                                        if (deductions.hasOwnProperty(`deduc${id}`)) {
                                                                                            let sss, phil, pbig;
                                                                                            sss = parseFloat(deductions[`deduc${id}`].sss);
                                                                                            phil = parseFloat(deductions[`deduc${id}`].phil);
                                                                                            pbig = parseFloat(deductions[`deduc${id}`].pbig);

                                                                                            total_deductions = total_deductions + sss;
                                                                                            total_deductions = total_deductions + phil;
                                                                                            total_deductions = total_deductions + pbig;

                                                                                            details.push({"SSS" : {"value" : sss.toFixed(2), "op" : "-"}});
                                                                                            details.push({"PHILHEALTH" : {"value" : phil.toFixed(2), "op" : "-"}});
                                                                                            details.push({"PAG-IBIG" : {"value" : pbig.toFixed(2), "op" : "-"}});
                                                                                            
                                                                                            PAYSLIP.push({'name' : "SSS", 'row': '6', 'col': '3'})
                                                                                            PAYSLIP.push({'name' : sss.toFixed(2), 'row': '6', 'col': '4'})
                                                                                            PAYSLIP.push({'name' : "PhilHealth", 'row': '7', 'col': '3'})
                                                                                            PAYSLIP.push({'name' : phil.toFixed(2), 'row': '7', 'col': '4'})
                                                                                            PAYSLIP.push({'name' : "Pag-IBIG", 'row': '8', 'col': '3'})
                                                                                            PAYSLIP.push({'name' : pbig.toFixed(2), 'row': '8', 'col': '4'})
                                                                                            
                                                                                        } else {
                                                                                            details.push({"SSS" : {"value" : 0, "op" : "-"}});
                                                                                            details.push({"PHILHEALTH" : {"value" : 0, "op" : "-"}});
                                                                                            details.push({"PAG-IBIG" : {"value" : 0, "op" : "-"}});
                                                                                            PAYSLIP.push({'name' : "SSS", 'row': '6', 'col': '3'})
                                                                                            PAYSLIP.push({'name' : 0, 'row': '6', 'col': '4'})
                                                                                            PAYSLIP.push({'name' : "PhilHealth", 'row': '7', 'col': '3'})
                                                                                            PAYSLIP.push({'name' : 0, 'row': '7', 'col': '4'})
                                                                                            PAYSLIP.push({'name' : "Pag-IBIG", 'row': '8', 'col': '3'})
                                                                                            PAYSLIP.push({'name' : 0, 'row': '8', 'col': '4'})
                                                                                        }
                                                                                        total_deductions = total_deductions + parseInt(adjustment);
                                                                                        total_deductions = total_deductions + parseInt(CA);
                                                                                        total_deductions = total_deductions + parseInt(charges);
                                                                                        total_deductions = total_deductions + parseInt(sss_loan);
                                                                                        total_deductions = total_deductions + parseInt(pbig_loan);
                                                                                        total_deductions = total_deductions + parseInt(company_loan);

                                                                                        PAYSLIP.push({'name' : "Adjustment", 'row': '9', 'col': '3'})
                                                                                        PAYSLIP.push({'name' : adjustment, 'row': '9', 'col': '4'})
                                                                                        PAYSLIP.push({'name' : "Cash Advance", 'row': '10', 'col': '3'})
                                                                                        PAYSLIP.push({'name' : CA, 'row': '10', 'col': '4'})
                                                                                        PAYSLIP.push({'name' : "Charges", 'row': '11', 'col': '3'})
                                                                                        PAYSLIP.push({'name' : charges, 'row': '11', 'col': '4'})
                                                                                        PAYSLIP.push({'name' : "SSS Loan", 'row': '12', 'col': '3'})
                                                                                        PAYSLIP.push({'name' : sss_loan, 'row': '12', 'col': '4'})
                                                                                        PAYSLIP.push({'name' : "Pag-IBIG Loan", 'row': '13', 'col': '3'})
                                                                                        PAYSLIP.push({'name' : pbig_loan, 'row': '13', 'col': '4'})
                                                                                        PAYSLIP.push({'name' : "Company Loan", 'row': '14', 'col': '3'})
                                                                                        PAYSLIP.push({'name' : company_loan, 'row': '14', 'col': '4'})

                                                                                        PAYSLIP.push({'name' : "Total Deductions", 'row': '15', 'col': '3', 'bold' : true})
                                                                                        PAYSLIP.push({'name' : total_deductions.toLocaleString(), 'row': '15', 'col': '4', 'bold' : true})


                                                                                        PAYSLIP.push({'name' : "Total Earnings", 'row': '15', 'col': '1', 'bold' : true})
                                                                                        PAYSLIP.push({'name' : earned.toLocaleString(), 'row': '15', 'col': '2', 'bold' : true})


                                                                                        details.push({"ADJUSTMENT" : {"value" : adjustment, "op" : "-"}});
                                                                                        details.push({"CASH ADVANCE" : {"value" : CA, "op" : "-"}});
                                                                                        details.push({"CHARGES" : {"value" : charges, "op" : "-"}});
                                                                                        details.push({"SSS LOAN" : {"value" : sss_loan, "op" : "-"}});
                                                                                        details.push({"PAG-IBIG LOAN" : {"value" : pbig_loan, "op" : "-"}});
                                                                                        details.push({"COMPANY LOAN" : {"value" : company_loan, "op" : "-"}});
                                                                                        details.push({"TOTAL DEDUCTIONS" : {"value" : total_deductions.toLocaleString(), "highlight" : "", "op" : "-"}});
                                                                                        
                                                                                        net = net - total_deductions;

                                                                                        

                                                                                        if (sched != 'None') {
                                                                                            
                                                                                            let amount = 0;
                                                                                            let penalty = 0;

                                                                                            if (sched[0].pay_sched == 'twice-monthly') {
                                                                                            
                                                                                                
                                                                                                //class has allowance
                                                                                                if (allowanceResponseBody  != 'None') {
                                                                                                    
                                                                                                    
                                                                                                    for (let i = 0; i < allowanceResponseBody.length; i++) {

                                                                                                        let allowanceID = allowanceResponseBody[i].allowance_id;
                                                                                                        
                                                                                                        if (allowanceResponseBody[i].type == 'twice monthly') { //twice monthly allowance
                                                                                                            amount += parseFloat(allowanceResponseBody[i].amount);

                                                                                                            
                                                                                                            if (allowancePenalty != 'None') {
                                                                                                                
                                                                                                                for (let k = 0; k < allowancePenalty.length; k++) {
                                                                                                                    
                                                                                                                    if (allowancePenalty[k].allowance_id == allowanceID) {
                                                                                                                        
                                                                                                                        let deduction = allowancePenalty[k].deduction;
                        
                                                                                                                        //percentage
                                                                                                                        if (deduction.includes("%")) {
                                                                                                                            deduction = deduction.replace(/%/g, '');
                                                                                                                            deduction = parseFloat(deduction);
                        
                                                                                                                            if (allowancePenalty[k].type == 'absent') {
                                                                                                                                let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                        
                                                                                                                                deduction = deduction * numOfAbsent;
                                                                                                                                deduction = deduction / 100;
                        
                                                                                                                                let deducted = amount * deduction;
                                                                                                                                penalty = deducted;
                                                                                                                                amount = amount - deducted;
                        
                                                                                                                            } else {
                                                                                                                                let type = allowancePenalty[k].type.split("|");
                                                                                                                                let lateMins = parseInt(type[1]);
                                                                                                                                let numOfLate = 0;
                                                                                                                                for (let j = 0; j < trail.length; j++) {
                                                                                                                                    if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                        numOfLate += 1;
                                                                                                                                    }
                                                                                                                                }
                                                                                                                                deduction = deduction * numOfLate;
                                                                                                                                deduction = deduction / 100;
                        
                                                                                                                                let deducted = amount * deduction;
                                                                                                                                penalty = deducted;
                                                                                                                                amount = amount - deducted;
                                                                                                                            }
                        
                                                                                                                        } else {
                                                                                                                            deduction = parseFloat(deduction);
                        
                                                                                                                            if (allowancePenalty[k].type == 'absent') {
                                                                                                                                let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                        
                                                                                                                                deduction = deduction * numOfAbsent;
                                                                                                                                amount = amount - deduction;
                        
                                                                                                                            } else {
                                                                                                                                let type = allowancePenalty[k].type.split("|");
                                                                                                                                let lateMins = parseInt(type[1]);
                                                                                                                                let numOfLate = 0;
                                                                                                                                for (let j = 0; j < trail.length; j++) {
                                                                                                                                    if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                        numOfLate += 1;
                                                                                                                                    }
                                                                                                                                }
                                                                                                                                deduction = deduction * numOfLate;
                                                                                                                                penalty = deduction;
                                                                                                                                amount = amount - deduction;
                                                                                                                            }
                                                                                                                        }
                                                                                                                    
                                                                                                                    }
                                                                                                                }
                                                                                                                
                                                                                                            }

                                                                                                        } else {
                                                                                                            if (PERIOD == 'second-half') {
                                                                                                                amount += parseFloat(allowanceResponseBody[i].amount);

                                                                                                                if (allowancePenalty != 'None') {
                                                                                                        
                                                                                                                    for (let k = 0; k < allowancePenalty.length; k++) {
                                                                                                                        
                                                                                                                        if (allowancePenalty[k].allowance_id == allowanceID) {
                                                                                                                            
                                                                                                                            let deduction = allowancePenalty[k].deduction;
                            
                                                                                                                            //percentage
                                                                                                                            if (deduction.includes("%")) {
                                                                                                                                deduction = deduction.replace(/%/g, '');
                                                                                                                                deduction = parseFloat(deduction);
                            
                                                                                                                                if (allowancePenalty[k].type == 'absent') {
                                                                                                                                    let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                            
                                                                                                                                    deduction = deduction * numOfAbsent;
                                                                                                                                    deduction = deduction / 100;
                            
                                                                                                                                    let deducted = amount * deduction;
                                                                                                                                    penalty = deducted;
                                                                                                                                    amount = amount - deducted;
                            
                                                                                                                                } else {
                                                                                                                                    let type = allowancePenalty[k].type.split("|");
                                                                                                                                    let lateMins = parseInt(type[1]);
                                                                                                                                    let numOfLate = 0;
                                                                                                                                    for (let j = 0; j < trail.length; j++) {
                                                                                                                                        if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                            numOfLate += 1;
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                    deduction = deduction * numOfLate;
                                                                                                                                    deduction = deduction / 100;
                            
                                                                                                                                    let deducted = amount * deduction;
                                                                                                                                    penalty = deducted;
                                                                                                                                    amount = amount - deducted;
                                                                                                                                }
                            
                                                                                                                            } else {
                                                                                                                                deduction = parseFloat(deduction);
                            
                                                                                                                                if (allowancePenalty[k].type == 'absent') {
                                                                                                                                    let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                            
                                                                                                                                    deduction = deduction * numOfAbsent;
                                                                                                                                    amount = amount - deduction;
                            
                                                                                                                                } else {
                                                                                                                                    let type = allowancePenalty[k].type.split("|");
                                                                                                                                    let lateMins = parseInt(type[1]);
                                                                                                                                    let numOfLate = 0;
                                                                                                                                    for (let j = 0; j < trail.length; j++) {
                                                                                                                                        if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                            numOfLate += 1;
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                    deduction = deduction * numOfLate;
                                                                                                                                    penalty = deduction;
                                                                                                                                    amount = amount - deduction;
                                                                                                                                }
                                                                                                                            }
                                                                                                                        
                                                                                                                        }
                                                                                                                    }
                                                                                                                    
                                                                                                                }
                                                                                                            }
                                                                                                        }

                                                                                                        
                                                                                                        
                                                                                                        
                                                                                                    }
                                                                                                }

                                                                                            } else if (sched[0].pay_sched == 'monthly') {
                                                                                                if (allowanceResponseBody != 'None') {
                                                                                                    for (let i = 0; i < allowanceResponseBody.length; i++) {
                                                                                                        let allowanceID = allowanceResponseBody[i].allowance_id;
                
                                                                                                        if (allowanceResponseBody[i].type == 'monthly') {
                                                                                                            amount += parseInt(allowanceResponseBody[i].amount);

                                                                                                            
                                                                                                            if (allowancePenalty != 'None') {
                                                                                                                for (let k = 0; k < allowancePenalty.length; k++) {
                                                                                                                    if (allowancePenalty[k].allowance_id == allowanceID) {
                                                                                                                        let deduction = allowancePenalty[k].deduction;
                        
                                                                                                                        //percentage
                                                                                                                        if (deduction.includes("%")) {
                                                                                                                            deduction = deduction.replace(/%/g, '');
                                                                                                                            deduction = parseFloat(deduction);
                        
                                                                                                                            if (allowancePenalty[k].type == 'absent') {
                                                                                                                                let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                        
                                                                                                                                deduction = deduction * numOfAbsent;
                                                                                                                                deduction = deduction / 100;
                        
                                                                                                                                let deducted = amount * deduction;
                                                                                                                                penalty = deducted;
                                                                                                                                amount = amount - deducted;
                        
                                                                                                                            } else {
                                                                                                                                let type = allowancePenalty[k].type.split("|");
                                                                                                                                let lateMins = parseInt(type[1]);
                                                                                                                                let numOfLate = 0;
                                                                                                                                for (let j = 0; j < trail.length; j++) {
                                                                                                                                    if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                        numOfLate += 1;
                                                                                                                                    }
                                                                                                                                }
                                                                                                                                deduction = deduction * numOfLate;
                                                                                                                                deduction = deduction / 100;
                        
                                                                                                                                let deducted = amount * deduction;
                                                                                                                                penalty = deducted;
                                                                                                                                amount = amount - deducted;
                                                                                                                            }
                        
                                                                                                                        } else {
                                                                                                                            deduction = parseFloat(deduction);
                        
                                                                                                                            if (allowancePenalty[k].type == 'absent') {
                                                                                                                                let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                        
                                                                                                                                deduction = deduction * numOfAbsent;
                                                                                                                                amount = amount - deduction;
                        
                                                                                                                            } else {
                                                                                                                                let type = allowancePenalty[k].type.split("|");
                                                                                                                                let lateMins = parseInt(type[1]);
                                                                                                                                let numOfLate = 0;
                                                                                                                                for (let j = 0; j < trail.length; j++) {
                                                                                                                                    if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                        numOfLate += 1;
                                                                                                                                    }
                                                                                                                                }
                                                                                                                                deduction = deduction * numOfLate;
                                                                                                                                penalty = deduction;
                                                                                                                                amount = amount - deduction;
                                                                                                                            }
                                                                                                                        }
                                                                                                                    
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                
                                                                                                        
                
                
                                                                                                    }
                                                                                                }
                                                                                            }

                                                                                            

                                                                                            details.push({"ALLOWANCE (total)" : {"value" : amount.toLocaleString(), "op" : "+"}});
                                                                                            details.push({"ALLOWANCE PENALTY" : {"value" : penalty.toFixed(2), "op" : "-"}});

                                                                                            net = net + amount;

                                                                                            PAYSLIP.push({'name' : "Allowance", 'row': '16', 'col': '1', 'bold' : true})
                                                                                            PAYSLIP.push({'name' : amount.toLocaleString(), 'row': '16', 'col': '2', 'bold' : true})

                                                                                            PAYSLIP.push({'name' : "Net Earnings", 'row': '17', 'col': '1', 'span' : '3', 'align' : 'right', 'bold' : true, 'margin' : '15px'})
                                                                                            PAYSLIP.push({'name' : net.toLocaleString(), 'row': '17', 'col': '2', 'bold' : true})

                                                                                            PAYSLIP.push({'name' : "Signature", 'row': '18', 'col': '1', 'span' : '2', 'align' : 'center', 'border':'2px solid rgba(0,0,0,.6)'})

                                                                                            for (let i = 0; i < PAYSLIPS.length; i++) {
                                                                                                if (PAYSLIP[3].name == PAYSLIPS[i][3].name) {
                                                                                                    PAYSLIPS.splice(i, 1);
                                                                                                }
                                                                                            }

                                                                                            PAYSLIPS.push(PAYSLIP);
                                        
                                                                                            PAYSLIP = [];

                                                                                            details.push({"NET" : {"value" : net.toLocaleString(), "highlight" : ""}});
                                                                                        
                                                                                            
                                                                                            $(`#gross-pay${id}`).html(earned.toLocaleString());
                                                                                            $(`#net-pay${id}`).html(net.toLocaleString());

                                                                                            id = parseInt(id);
                                                                                            
                                                                                            if (ALLDetails.length < id + 1) {
                                                                                                for (let i = id; i > 0; i--) {
                                                                                                    ALLDetails[i] = " ";
                                                                                                    if (ALLDetails[i - 1] != null || ALLDetails[i - 1] != undefined) {
                                                                                                        break;
                                                                                                    }
                                                                                                }
                                                                                            }

                                                                                            ALLDetails[id] = details;
                                                                                            
                                                                                            if (PAYSCHED == 'twice-monthly') {
                                                                                                update_payroll_file(PAYSCHED, from, to, name, id, responseBody.class, className, ALLDetails[id][0]['RATE'], ALLDetails[id][1]['RATE TYPE'], ALLDetails[id][2]['WORKING DAYS'], ALLDetails[id][3]['DAYS WORKED'], ALLDetails[id][4]['SALARY RATE'], ALLDetails[id][5]['ABSENT (total)'].value, ALLDetails[id][6]['BASIC'], ALLDetails[id][7]['UNDERTIME (total)'].value, ALLDetails[id][8]['TARDINESS (total)'].value, ALLDetails[id][9]['HOLIDAYS (total)'].value, ALLDetails[id][10]['OVERTIME (total)'].value, ALLDetails[id][11]['EARNED'].value, ALLDetails[id][12]['SSS'].value, ALLDetails[id][13]['PHILHEALTH'].value, ALLDetails[id][14]['PAG-IBIG'].value, ALLDetails[id][15]['ADJUSTMENT'].value, ALLDetails[id][16]['CASH ADVANCE'].value, ALLDetails[id][17]['CHARGES'].value, ALLDetails[id][18]['SSS LOAN'].value, ALLDetails[id][19]['PAG-IBIG LOAN'].value, ALLDetails[id][20]['COMPANY LOAN'].value, ALLDetails[id][21]['TOTAL DEDUCTIONS'].value, ALLDetails[id][22]['ALLOWANCE (total)'].value, ALLDetails[id][23]['ALLOWANCE PENALTY'].value, ALLDetails[id][24]['NET'].value);
                                                                                            } else {
                                                                                                if (PAYSCHED == 'monthly') {
                                                                                                    update_payroll_file(PAYSCHED, MON, MON, name, id, responseBody.class, className, ALLDetails[id][0]['RATE'], ALLDetails[id][1]['RATE TYPE'], ALLDetails[id][2]['WORKING DAYS'], ALLDetails[id][3]['DAYS WORKED'], ALLDetails[id][4]['SALARY RATE'], ALLDetails[id][5]['ABSENT (total)'].value, ALLDetails[id][6]['BASIC'], ALLDetails[id][7]['UNDERTIME (total)'].value, ALLDetails[id][8]['TARDINESS (total)'].value, ALLDetails[id][9]['HOLIDAYS (total)'].value, ALLDetails[id][10]['OVERTIME (total)'].value, ALLDetails[id][11]['EARNED'].value, ALLDetails[id][12]['SSS'].value, ALLDetails[id][13]['PHILHEALTH'].value, ALLDetails[id][14]['PAG-IBIG'].value, ALLDetails[id][15]['ADJUSTMENT'].value, ALLDetails[id][16]['CASH ADVANCE'].value, ALLDetails[id][17]['CHARGES'].value, ALLDetails[id][18]['SSS LOAN'].value, ALLDetails[id][19]['PAG-IBIG LOAN'].value, ALLDetails[id][20]['COMPANY LOAN'].value, ALLDetails[id][21]['TOTAL DEDUCTIONS'].value, ALLDetails[id][22]['ALLOWANCE (total)'].value, ALLDetails[id][23]['ALLOWANCE PENALTY'].value, ALLDetails[id][24]['NET'].value);
                                                                                                }
                                                                                            }

                                                                                            let x = 0;
                                                                                            for (let i = 0; i < ALLDetails.length; i++) {
                                                                                                if (typeof ALLDetails[i] === 'object') {
                                                                                                    x += 1;
                                                                                                }
                                                                                            }

                                                                                            console.log(x);
                                                                                            
                                                                                            $("#available-payslip").html(`Available: ${x}`);

                                                                                                

                                                                                        } else {
                                                                                            errorNotification("Please update your settings.", "warning");
                                                                                        }
                                                                                    }
                                                                                })

                                                                            } else if (PAYSCHED == 'monthly') {
                                                                                let s = earned;

                                                                                if (SSS != 'undefined' && SSS != null) {
                                                                                    for (let i = 0; i < SSS.length; i++) {
                                                                                        let arr = Object.values(SSS[i]);
                                                                                        if (arr[2] == 'Over') {

                                                                                            if (s >= arr[1]) {
                                                                                                sss_contri = arr[6];
                                                                                                
                                                                                                break;
                                                                                            }

                                                                                        } else {

                                                                                            let arr = Object.values(SSS[i]);
                                                                                            
                                                                                            if (s >= arr[1] && s <= arr[2]) {
                                                                                                sss_contri = arr[6];
                                                                                                
                                                                                                break;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }

                                                                                if (PAGIBIG != 'undefined' && PAGIBIG != null) {
                                                                                    let d = PAGIBIG;
                                                                                    if (d.includes("%")) {
                                                                                        d = d.replace(/%/g, '');
                                                                                        d = parseFloat(d);

                                                                                        d = d / 100;
                                                                                        d = s * d;
                                                                                        
                                                                                    } else {
                                                                                        d = parseFloat(d);
                                                                                    }
                                                                                    pbig_contri = d;
                                                                                }

                                                                                if (PHILHEALTH != 'undefined' && PHILHEALTH != null) {
                                                                                    let d = PHILHEALTH;
                                                                                    if (d.includes("%")) {
                                                                                        d = d.replace(/%/g, '');
                                                                                        d = parseFloat(d);

                                                                                        d = d / 100;
                                                                                        d = s * d;
                                                                                        
                                                                                    } else {
                                                                                        d = parseFloat(d);
                                                                                    }
                                                                                    phil_contri = d;
                                                                                }

                                                                                deductions[`deduc${id}`] = {"sss" : sss_contri, "pbig" : pbig_contri, "phil" : phil_contri};

                                                                                D[`d${id}`] = {'sss' : deductions[`deduc${id}`].sss, 'phil' : deductions[`deduc${id}`].phil, 'pbig' : deductions[`deduc${id}`].pbig};
            
                                                                                if (deductions.hasOwnProperty(`deduc${id}`)) {
                                                                                    let sss, phil, pbig;
                                                                                    sss = parseFloat(deductions[`deduc${id}`].sss);
                                                                                    phil = parseFloat(deductions[`deduc${id}`].phil);
                                                                                    pbig = parseFloat(deductions[`deduc${id}`].pbig);

                                                                                    total_deductions = total_deductions + sss;
                                                                                    total_deductions = total_deductions + phil;
                                                                                    total_deductions = total_deductions + pbig;

                                                                                    details.push({"SSS" : {"value" : sss.toFixed(2), "op" : "-"}});
                                                                                    details.push({"PHILHEALTH" : {"value" : phil.toFixed(2), "op" : "-"}});
                                                                                    details.push({"PAG-IBIG" : {"value" : pbig.toFixed(2), "op" : "-"}});
                                                                                    
                                                                                    PAYSLIP.push({'name' : "SSS", 'row': '6', 'col': '3'})
                                                                                    PAYSLIP.push({'name' : sss.toFixed(2), 'row': '6', 'col': '4'})
                                                                                    PAYSLIP.push({'name' : "PhilHealth", 'row': '7', 'col': '3'})
                                                                                    PAYSLIP.push({'name' : phil.toFixed(2), 'row': '7', 'col': '4'})
                                                                                    PAYSLIP.push({'name' : "Pag-IBIG", 'row': '8', 'col': '3'})
                                                                                    PAYSLIP.push({'name' : pbig.toFixed(2), 'row': '8', 'col': '4'})

                                                                                    
                                                                                } else {

                                                                                    details.push({"SSS" : {"value" : 0, "op" : "-"}});
                                                                                    details.push({"PHILHEALTH" : {"value" : 0, "op" : "-"}});
                                                                                    details.push({"PAG-IBIG" : {"value" : 0, "op" : "-"}});


                                                                                    PAYSLIP.push({'name' : "SSS", 'row': '6', 'col': '3'})
                                                                                    PAYSLIP.push({'name' : 0, 'row': '6', 'col': '4'})
                                                                                    PAYSLIP.push({'name' : "PhilHealth", 'row': '7', 'col': '3'})
                                                                                    PAYSLIP.push({'name' : 0, 'row': '7', 'col': '4'})
                                                                                    PAYSLIP.push({'name' : "Pag-IBIG", 'row': '8', 'col': '3'})
                                                                                    PAYSLIP.push({'name' : 0, 'row': '8', 'col': '4'})
                                                                                }
                                                                                
                                                                                total_deductions = total_deductions + parseInt(adjustment);
                                                                                total_deductions = total_deductions + parseInt(CA);
                                                                                total_deductions = total_deductions + parseInt(charges);
                                                                                total_deductions = total_deductions + parseInt(sss_loan);
                                                                                total_deductions = total_deductions + parseInt(pbig_loan);
                                                                                total_deductions = total_deductions + parseInt(company_loan);

                                                                                PAYSLIP.push({'name' : "Adjustment", 'row': '9', 'col': '3'})
                                                                                PAYSLIP.push({'name' : adjustment, 'row': '9', 'col': '4'})
                                                                                PAYSLIP.push({'name' : "Cash Advance", 'row': '10', 'col': '3'})
                                                                                PAYSLIP.push({'name' : CA, 'row': '10', 'col': '4'})
                                                                                PAYSLIP.push({'name' : "Charges", 'row': '11', 'col': '3'})
                                                                                PAYSLIP.push({'name' : charges, 'row': '11', 'col': '4'})
                                                                                PAYSLIP.push({'name' : "SSS Loan", 'row': '12', 'col': '3'})
                                                                                PAYSLIP.push({'name' : sss_loan, 'row': '12', 'col': '4'})
                                                                                PAYSLIP.push({'name' : "Pag-IBIG Loan", 'row': '13', 'col': '3'})
                                                                                PAYSLIP.push({'name' : pbig_loan, 'row': '13', 'col': '4'})
                                                                                PAYSLIP.push({'name' : "Company Loan", 'row': '14', 'col': '3'})
                                                                                PAYSLIP.push({'name' : company_loan, 'row': '14', 'col': '4'})

                                                                                PAYSLIP.push({'name' : "Total Deductions", 'row': '15', 'col': '3', 'bold' : true})
                                                                                PAYSLIP.push({'name' : total_deductions.toLocaleString(), 'row': '15', 'col': '4', 'bold' : true})

                                                                                PAYSLIP.push({'name' : "Total Earnings", 'row': '15', 'col': '1', 'bold' : true})
                                                                                PAYSLIP.push({'name' : earned.toLocaleString(), 'row': '15', 'col': '2', 'bold' : true})

                                                                                details.push({"ADJUSTMENT" : {"value" : adjustment, "op" : "-"}});
                                                                                details.push({"CASH ADVANCE" : {"value" : CA, "op" : "-"}});
                                                                                details.push({"CHARGES" : {"value" : charges, "op" : "-"}});
                                                                                details.push({"SSS LOAN" : {"value" : sss_loan, "op" : "-"}});
                                                                                details.push({"PAG-IBIG LOAN" : {"value" : pbig_loan, "op" : "-"}});
                                                                                details.push({"COMPANY LOAN" : {"value" : company_loan, "op" : "-"}});
                                                                                details.push({"TOTAL DEDUCTIONS" : {"value" : total_deductions.toLocaleString(), "highlight" : "", "op" : "-"}});
                                                                                
                                                                                net = net - total_deductions;

                                                                                if (sched != 'None') {

                                                                                    let amount = 0;
                                                                                    let penalty = 0;

                                                                                    if (sched[0].pay_sched == 'twice-monthly') {
                                                                        
                                                                                        //class has allowance
                                                                                        if (allowanceResponseBody  != 'None') {
                                                                                    

                                                                                            for (let i = 0; i < allowanceResponseBody.length; i++) {
                                                                                                let allowanceID = allowanceResponseBody[i].allowance_id;

                                                                                                if (allowanceResponseBody[i].type == 'twice monthly') { //twice monthly allowance
                                                                                                    amount += parseInt(allowanceResponseBody[i].amount);

                                                                                                    if (allowancePenalty != 'None') {
                                                                                                    
                                                                                                        for (let k = 0; k < allowancePenalty.length; k++) {
                                                                                                            
                                                                                                            if (allowancePenalty[k].allowance_id == allowanceID) {
                                                                                                                
                                                                                                                let deduction = allowancePenalty[k].deduction;
                
                                                                                                                //percentage
                                                                                                                if (deduction.includes("%")) {
                                                                                                                    deduction = deduction.replace(/%/g, '');
                                                                                                                    deduction = parseFloat(deduction);
                
                                                                                                                    if (allowancePenalty[k].type == 'absent') {
                                                                                                                        let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                
                                                                                                                        deduction = deduction * numOfAbsent;
                                                                                                                        deduction = deduction / 100;
                
                                                                                                                        let deducted = amount * deduction;
                                                                                                                        penalty = deducted;
                                                                                                                        amount = amount - deducted;
                
                                                                                                                    } else {
                                                                                                                        let type = allowancePenalty[k].type.split("|");
                                                                                                                        let lateMins = parseInt(type[1]);
                                                                                                                        let numOfLate = 0;
                                                                                                                        for (let j = 0; j < trail.length; j++) {
                                                                                                                            if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                numOfLate += 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        deduction = deduction * numOfLate;
                                                                                                                        deduction = deduction / 100;
                
                                                                                                                        let deducted = amount * deduction;
                                                                                                                        penalty = deducted;
                                                                                                                        amount = amount - deducted;
                                                                                                                    }
                
                                                                                                                } else {
                                                                                                                    deduction = parseFloat(deduction);
                
                                                                                                                    if (allowancePenalty[k].type == 'absent') {
                                                                                                                        let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                
                                                                                                                        deduction = deduction * numOfAbsent;
                                                                                                                        amount = amount - deduction;
                
                                                                                                                    } else {
                                                                                                                        let type = allowancePenalty[k].type.split("|");
                                                                                                                        let lateMins = parseInt(type[1]);
                                                                                                                        let numOfLate = 0;
                                                                                                                        for (let j = 0; j < trail.length; j++) {
                                                                                                                            if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                numOfLate += 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        deduction = deduction * numOfLate;
                                                                                                                        penalty = deduction;
                                                                                                                        amount = amount - deduction;
                                                                                                                    }
                                                                                                                }
                                                                                                            
                                                                                                            }
                                                                                                        }
            
                                                                                                    }
                                                                                                } else {
                                                                                                    if (PERIOD == 'second-half') {
                                                                                                        amount += parseInt(allowanceResponseBody[i].amount);

                                                                                                        if (allowancePenalty != 'None') {
                                                                                                    
                                                                                                            for (let k = 0; k < allowancePenalty.length; k++) {
                                                                                                                
                                                                                                                if (allowancePenalty[k].allowance_id == allowanceID) {
                                                                                                                    
                                                                                                                    let deduction = allowancePenalty[k].deduction;
                    
                                                                                                                    //percentage
                                                                                                                    if (deduction.includes("%")) {
                                                                                                                        deduction = deduction.replace(/%/g, '');
                                                                                                                        deduction = parseFloat(deduction);
                    
                                                                                                                        if (allowancePenalty[k].type == 'absent') {
                                                                                                                            let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                    
                                                                                                                            deduction = deduction * numOfAbsent;
                                                                                                                            deduction = deduction / 100;
                    
                                                                                                                            let deducted = amount * deduction;
                                                                                                                            penalty = deducted;
                                                                                                                            amount = amount - deducted;
                    
                                                                                                                        } else {
                                                                                                                            let type = allowancePenalty[k].type.split("|");
                                                                                                                            let lateMins = parseInt(type[1]);
                                                                                                                            let numOfLate = 0;
                                                                                                                            for (let j = 0; j < trail.length; j++) {
                                                                                                                                if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                    numOfLate += 1;
                                                                                                                                }
                                                                                                                            }
                                                                                                                            deduction = deduction * numOfLate;
                                                                                                                            deduction = deduction / 100;
                    
                                                                                                                            let deducted = amount * deduction;
                                                                                                                            penalty = deducted;
                                                                                                                            amount = amount - deducted;
                                                                                                                        }
                    
                                                                                                                    } else {
                                                                                                                        deduction = parseFloat(deduction);
                    
                                                                                                                        if (allowancePenalty[k].type == 'absent') {
                                                                                                                            let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                    
                                                                                                                            deduction = deduction * numOfAbsent;
                                                                                                                            amount = amount - deduction;
                    
                                                                                                                        } else {
                                                                                                                            let type = allowancePenalty[k].type.split("|");
                                                                                                                            let lateMins = parseInt(type[1]);
                                                                                                                            let numOfLate = 0;
                                                                                                                            for (let j = 0; j < trail.length; j++) {
                                                                                                                                if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                    numOfLate += 1;
                                                                                                                                }
                                                                                                                            }
                                                                                                                            deduction = deduction * numOfLate;
                                                                                                                            penalty = deduction;
                                                                                                                            amount = amount - deduction;
                                                                                                                        }
                                                                                                                    }
                                                                                                                
                                                                                                                }
                                                                                                            }
                
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                                
                                                                                                

                                                                                                
                                                                                                
                                                                                            }
                                                                                        }

                                                                                    } else if (sched[0].pay_sched == 'monthly') {
                                                                                        if (allowanceResponseBody != 'None') {
                                                                                            for (let i = 0; i < allowanceResponseBody.length; i++) {

                                                                                                let allowanceID = allowanceResponseBody[i].allowance_id;
                                                                                                
                                                                                                if (allowanceResponseBody[i].type == 'monthly') {
                                                                                                    amount += parseInt(allowanceResponseBody[i].amount);

                                                                                                    if (allowancePenalty != 'None') {
                                                                                                        for (let k = 0; k < allowancePenalty.length; k++) {
                                                                                                            if (allowancePenalty[k].allowance_id == allowanceID) {
                                                                                                                let deduction = allowancePenalty[k].deduction;
                
                                                                                                                //percentage
                                                                                                                if (deduction.includes("%")) {
                                                                                                                    deduction = deduction.replace(/%/g, '');
                                                                                                                    deduction = parseFloat(deduction);
                
                                                                                                                    if (allowancePenalty[k].type == 'absent') {
                                                                                                                        let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                
                                                                                                                        deduction = deduction * numOfAbsent;
                                                                                                                        deduction = deduction / 100;
                
                                                                                                                        let deducted = amount * deduction;
                                                                                                                        penalty = deducted;
                                                                                                                        amount = amount - deducted;
                
                                                                                                                    } else {
                                                                                                                        let type = allowancePenalty[k].type.split("|");
                                                                                                                        let lateMins = parseInt(type[1]);
                                                                                                                        let numOfLate = 0;
                                                                                                                        for (let j = 0; j < trail.length; j++) {
                                                                                                                            if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                numOfLate += 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        deduction = deduction * numOfLate;
                                                                                                                        deduction = deduction / 100;
                
                                                                                                                        let deducted = amount * deduction;
                                                                                                                        penalty = deducted;
                                                                                                                        amount = amount - deducted;
                                                                                                                    }
                
                                                                                                                } else {
                                                                                                                    deduction = parseFloat(deduction);
                
                                                                                                                    if (allowancePenalty[k].type == 'absent') {
                                                                                                                        let numOfAbsent = parseInt($(`#cal${id}`).val()) - days_worked;
                
                                                                                                                        deduction = deduction * numOfAbsent;
                                                                                                                        amount = amount - deduction;
                
                                                                                                                    } else {
                                                                                                                        let type = allowancePenalty[k].type.split("|");
                                                                                                                        let lateMins = parseInt(type[1]);
                                                                                                                        let numOfLate = 0;
                                                                                                                        for (let j = 0; j < trail.length; j++) {
                                                                                                                            if (parseInt(trail[j].late_mins) >= lateMins) {
                                                                                                                                numOfLate += 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        deduction = deduction * numOfLate;
                                                                                                                        penalty = deduction;
                                                                                                                        amount = amount - deduction;
                                                                                                                    }
                                                                                                                }
                                                                                                            
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }

                                                                                                

                                                                                                

                                                                                            }
                                                                                        }
                                                                                    }

                                                                                    details.push({"ALLOWANCE (total)" : {"value" : amount.toLocaleString(), "op" : "+"}});
                                                                                    details.push({"ALLOWANCE PENALTY" : {"value" : penalty.toFixed(2), "op" : "-"}});

                                                                                    net = net + amount;

                                                                                    PAYSLIP.push({'name' : "Allowance", 'row': '16', 'col': '1', 'bold' : true})
                                                                                    PAYSLIP.push({'name' : amount.toLocaleString(), 'row': '16', 'col': '2', 'bold' : true})

                                                                                    PAYSLIP.push({'name' : "Net Earnings", 'row': '17', 'col': '1', 'span' : '3', 'align' : 'right', 'bold' : true, 'margin' : '15px'})
                                                                                    PAYSLIP.push({'name' : net.toLocaleString(), 'row': '17', 'col': '2', 'bold' : true})

                                                                                    PAYSLIP.push({'name' : "Signature", 'row': '18', 'col': '1', 'span' : '2', 'align' : 'center', 'border':'2px solid rgba(0,0,0,.6)'})

                                                                                    for (let i = 0; i < PAYSLIPS.length; i++) {
                                                                                        if (PAYSLIP[3].name == PAYSLIPS[i][3].name) {
                                                                                            PAYSLIPS.splice(i, 1);
                                                                                        }
                                                                                    }

                                                                                    PAYSLIPS.push(PAYSLIP);
                                                                                    
                                                                                    PAYSLIP = [];

                                                                                    details.push({"NET" : {"value" : net.toLocaleString(), "highlight" : ""}});
                                                                                    
                                                                                    $(`#gross-pay${id}`).html(earned.toLocaleString());
                                                                                    $(`#net-pay${id}`).html(net.toLocaleString());

                                                                                    id = parseInt(id);
                                                                                    
                                                                                    if (ALLDetails.length < id + 1) {
                                                                                        for (let i = id; i > 0; i--) {
                                                                                            ALLDetails[i] = " ";
                                                                                            if (ALLDetails[i - 1] != null || ALLDetails[i - 1] != undefined) {
                                                                                                break;
                                                                                            }
                                                                                        }
                                                                                    }

                                                                                    ALLDetails[id] = details;

                                                                                    if (PAYSCHED == 'twice-monthly') {
                                                                                        update_payroll_file(PAYSCHED, from, to, name, id, responseBody.class, className, ALLDetails[id][0]['RATE'], ALLDetails[id][1]['RATE TYPE'], ALLDetails[id][2]['WORKING DAYS'], ALLDetails[id][3]['DAYS WORKED'], ALLDetails[id][4]['SALARY RATE'], ALLDetails[id][5]['ABSENT (total)'].value, ALLDetails[id][6]['BASIC'], ALLDetails[id][7]['UNDERTIME (total)'].value, ALLDetails[id][8]['TARDINESS (total)'].value, ALLDetails[id][9]['HOLIDAYS (total)'].value, ALLDetails[id][10]['OVERTIME (total)'].value, ALLDetails[id][11]['EARNED'].value, ALLDetails[id][12]['SSS'].value, ALLDetails[id][13]['PHILHEALTH'].value, ALLDetails[id][14]['PAG-IBIG'].value, ALLDetails[id][15]['ADJUSTMENT'].value, ALLDetails[id][16]['CASH ADVANCE'].value, ALLDetails[id][17]['CHARGES'].value, ALLDetails[id][18]['SSS LOAN'].value, ALLDetails[id][19]['PAG-IBIG LOAN'].value, ALLDetails[id][20]['COMPANY LOAN'].value, ALLDetails[id][21]['TOTAL DEDUCTIONS'].value, ALLDetails[id][22]['ALLOWANCE (total)'].value, ALLDetails[id][23]['ALLOWANCE PENALTY'].value, ALLDetails[id][24]['NET'].value);

                                                                                    } else {
                                                                                        if (PAYSCHED == 'monthly') {
                                                                                            update_payroll_file(PAYSCHED, MON, MON, name, id, responseBody.class, className, ALLDetails[id][0]['RATE'], ALLDetails[id][1]['RATE TYPE'], ALLDetails[id][2]['WORKING DAYS'], ALLDetails[id][3]['DAYS WORKED'], ALLDetails[id][4]['SALARY RATE'], ALLDetails[id][5]['ABSENT (total)'].value, ALLDetails[id][6]['BASIC'], ALLDetails[id][7]['UNDERTIME (total)'].value, ALLDetails[id][8]['TARDINESS (total)'].value, ALLDetails[id][9]['HOLIDAYS (total)'].value, ALLDetails[id][10]['OVERTIME (total)'].value, ALLDetails[id][11]['EARNED'].value, ALLDetails[id][12]['SSS'].value, ALLDetails[id][13]['PHILHEALTH'].value, ALLDetails[id][14]['PAG-IBIG'].value, ALLDetails[id][15]['ADJUSTMENT'].value, ALLDetails[id][16]['CASH ADVANCE'].value, ALLDetails[id][17]['CHARGES'].value, ALLDetails[id][18]['SSS LOAN'].value, ALLDetails[id][19]['PAG-IBIG LOAN'].value, ALLDetails[id][20]['COMPANY LOAN'].value, ALLDetails[id][21]['TOTAL DEDUCTIONS'].value, ALLDetails[id][22]['ALLOWANCE (total)'].value, ALLDetails[id][23]['ALLOWANCE PENALTY'].value, ALLDetails[id][24]['NET'].value);
                                                                                        }
                                                                                    }

                                                                                    let x = 0;

                                                                                    for (let i = 0; i < ALLDetails.length; i++) {
                                                                                        if (typeof ALLDetails[i] === 'object') {
                                                                                            x += 1;
                                                                                        }
                                                                                    }

                                                                                    
                                                                                    
                                                                                    $("#available-payslip").html(`Available: ${x}`);

                                                                                } else {
                                                                                    errorNotification("Please update your settings.", "warning");
                                                                                }
                                                                                
                                                                            }
                                                                        }
                                                                    )
                                                                    
                                                                }
                                                            });
    
                                                           
                                                        } 
    
                                                    })
                                                    
                                                }
                                            })
                                            
                                            
                                        } catch(err) {
                                            console.log(err);
                                        }
                                    }
                                }
                            })

                        } catch(err) {
                            console.log(err);
                        }
                    }
                })

            } catch(err) {
                console.log(err);
            }
        }
    })
}

function update_payroll_file(paysched, col1, col2, name, serial, _class, class_name, rate, rate_type, working_days, days_worked, salary_rate, absent, basic, ut, tard, holi, ot, earned, sss, phil, pbig, adjustment, cash_advance, charges, sss_loan, pbig_loan, company_loan, total_deductions, allowance, penalty, net) {

    salary_rate = salary_rate.replace(/,/g, '');
    salary_rate = parseFloat(salary_rate);
    absent = absent.replace(/,/g, '');
    absent = parseFloat(absent);
    basic = basic.replace(/,/g, '');
    basic = parseFloat(basic);
    earned = earned.replace(/,/g, '');
    earned = parseFloat(earned);
    total_deductions = total_deductions.replace(/,/g, '');
    total_deductions = parseFloat(total_deductions);
    allowance = allowance.replace(/,/g, '');
    allowance = parseFloat(allowance);
    net = net.replace(/,/g, '');
    net = parseFloat(net);

    $.ajax({
        type: 'POST',
        url: '../php/update_payroll_file.php',
        data: {
            paysched: paysched,
            col1: col1,
            col2: col2,
            name: name,
            serial: serial,
            class: _class,
            class_name: class_name,
            rate: rate,
            rate_type: rate_type,
            working_days: working_days,
            days_worked: days_worked,
            salary_rate: salary_rate,
            absent: absent,
            basic: basic,
            ut: ut,
            tard: tard,
            holi: holi,
            ot: ot,
            earned: earned,
            sss: sss,
            phil: phil,
            pbig: pbig,
            adjustment: adjustment,
            cash_advance: cash_advance,
            charges: charges,
            sss_loan: sss_loan,
            pbig_loan: pbig_loan,
            company_loan: company_loan,
            total_deductions: total_deductions,
            allowance: allowance,
            penalty: penalty,
            net: net,
            branch: SELECTED_BRANCH

        }, success: function(res) {
            console.log(res);
        }
    })
}

function createTableFromObject(obj) {
    
    let maxRow = 0;
    let maxCol = 0;
    obj.forEach(item => {
        maxRow = Math.max(maxRow, parseInt(item.row));
        maxCol = Math.max(maxCol, parseInt(item.col));
    });

    let table = document.createElement('table');

    table.setAttribute("border", "1");
    
    // Create cells based on max row and column values
    for (let i = 0; i < maxRow; i++) {
        let row = table.insertRow(i);
        for (let j = 0; j < maxCol; j++) {
            let cell = row.insertCell(j);
            // Find the item corresponding to this cell
            let item = obj.find(item => parseInt(item.row) === (i + 1) && parseInt(item.col) === (j + 1));
            if (item) {
                cell.textContent = item.name;
                if (item.hasOwnProperty('span')) {
                    cell.colSpan = parseInt(item.span);
                }
                if (item.hasOwnProperty('align')) {
                    cell.style.textAlign = item.align;
                }
                if (item.hasOwnProperty('bold')) {
                    cell.style.fontWeight = "bold";
                }
                if (item.hasOwnProperty("size")) {
                    cell.style.fontSize = `${item.size}px`;
                }
                if (item.hasOwnProperty("border")) {
                    cell.style.borderTop = item.border;
                }
                cell.style.padding = "0 5px";
            }
            
        }
    }
    
    return table;
    
}



function generatePayslips() {
    $(".payroll-document").remove();
    $(".employee-trail-document").remove();

    try {
        $("#pages").remove();
    } catch (err) {
        console.log("");
    }

    document.body.insertAdjacentHTML("afterbegin", `
    <div class="pages" id="pages" style="display:none;">
    </div>`);

    PAYSLIPS.forEach(function(index) {
        let arr = Object.values(index);
        console.log(arr);
        if (parseFloat(arr[39].name) > 0) {
            var table = createTableFromObject(index);
            document.getElementById("pages").appendChild(table);
        }
        
    })

    const style = document.createElement('style');
    style.textContent = `
    @media print {
        @page {
        size: portrait;
        }
    }
    `;
    document.head.appendChild(style);

    window.print();
}

var file_created = false;

function generateFile(res, staffs_len){

    let promise;

    if (PAYSCHED == 'twice-monthly') {
        promise = new Promise(function(resolve, reject){
            $.ajax({
                type: 'POST',
                url: '../php/generateFile.php',
                data: {
                    data: res,
                    paysched: PAYSCHED,
                    period: PERIOD,
                    from: from,
                    branch: SELECTED_BRANCH,
                    to: to
                },
                success: function(res) {
                    resolve(res);
                }
            })
        });

    } else if (PAYSCHED == 'monthly') {
        promise = new Promise(function(resolve, reject){
            $.ajax({
                type: 'POST',
                url: '../php/generateFile.php',
                data: {
                    data: res,
                    paysched: PAYSCHED,
                    branch: SELECTED_BRANCH,
                    mon: MON
                },
                success: function(res) {
                    resolve(res);
                }
            })
        });
    }

    promise.then(
        function(result) {
            
            responseBody = res;

            if (result == 'exists') {
                errorNotification("File already exists.", "danger");
                file_created = true;
            }

            if (!file_created) {
                var content = "";
                for (let i = 0; i < res.length; i++) {
                    content += `
                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                        <td>${res[i].name}</td>
                        <td><input type="number" id="cal${res[i].serialnumber}" style="margin-bottom:-1px;" placeholder="Enter calendar working days"/></td>
                        <td id="gross-pay${res[i].serialnumber}">0</td>
                        <td>
                        <label class="switch" data-s="${res[i].serialnumber}" style="margin-bottom:-20px">
                            <input id="sss-cbbox" type="checkbox" checked>
                            <span class="slider round"></span>
                        </label>
                        </td>
                        <td>
                            <label class="switch" data-s="${res[i].serialnumber}" style="margin-bottom:-20px">
                                <input id="phil-cbox" type="checkbox" checked>
                                <span class="slider round"></span>
                            </label>
                        </td>
                        <td>
                            <label class="switch" data-s="${res[i].serialnumber}" style="margin-bottom:-20px">
                                <input id="pbig-cbox" type="checkbox" checked>
                                <span class="slider round"></span>
                            </label>
                        </td>
                        <td id="net-pay${res[i].serialnumber}">0</td>
                        <td id="paid${res[i].serialnumber}">Not paid</td>
                        <td>
                        <button class="action-button mr-1 payslip${res[i].serialnumber} view-details" data-class="${res[i].class}" data-id="${res[i].serialnumber}" data-name="${res[i].name}" data-position="${res[i].position}" style="background:orange;display:none;">DETAILS</button>
                        <button class="action-button mr-1 compute-salary" data-id="${res[i].serialnumber}">COMPUTE</button>
                        
                        <button class="action-button trail mr-1" data-id="${res[i].serialnumber}">TRAIL</button>
                    </tr>`;
                }

                let txt = "";
                if (PAYSCHED != null || PAYSCHED !== 'undefined') {
                    if (PAYSCHED == 'twice-monthly') {
                        let newdate = new Date(from);
                        let newdate2 = new Date(to);
                        let _mon = months[newdate.getMonth()];
                        let _d1 = newdate.getDate();
                        let _d2 = newdate2.getDate();
                        let _year = newdate.getFullYear();

                        txt += `${_mon} ${_d1}-${_d2}, ${_year}`;
                    } else {
                        txt = `${formatDate(MON)}`;
                    }
                }
                

                function formatDate(inputDate) {
                    // Split the inputDate into year and month parts
                    const [year, month] = inputDate.split('-');
                
                    // Convert month from numeric string to integer
                    const monthNumber = parseInt(month, 10);
                
                    // Create a Date object with the year and month
                    const date = new Date(year, monthNumber - 1);
                
                    // Get the month name in abbreviated form (e.g., 'Apr')
                    const monthName = date.toLocaleString('default', { month: 'short' });
                
                    // Format the result as 'MMM YYYY'
                    return `${monthName} ${year}`;
                }

                let br;
                for (let k = 0; k < BRANCH.length; k++) {
                    if (BRANCH[k].machine_id == SELECTED_BRANCH) {
                        br = BRANCH[k].branch_name;
                    }
                }

                document.body.insertAdjacentHTML("afterbegin", `
                <div class="pop-up-window">
                    <div class="window-content pt-5" style="position:relative;">
                        ${close_icon}
                        <p class="text-center text-white" style="font-size:20px;">PAYROLL (${txt})<br><span style="font-size:15px;">${br}</span></p>
                        <div class="payroll-header-buttons" style="display:flex;justify-content:space-between;align-items:end;"><div style="color:#fff;display:flex;"><button class="action-button add-holiday2 mr-2">ADD HOLIDAY</button></div>
                        <div style="display:flex;flex-direction:column;color:#fff;align-items:center;"><span id="available-payslip">Available: 0</span><button class="action-button generate-payslip">GENERATE PAYSLIP</button></div>
                        </div>
                        <hr>
                        <div class="text-white mb-2" style="margin-top:-10px;">Employees: <span class="text-center">${staffs_len}</span></div>
                        <div class="table-container" style="max-height:60vh;overflow:auto;max-width:70vw;min-width:50vw;">
                            <table>
                                <thead>
                                    <tr>
                                        <td>NAME OF EMPLOYEE</td>
                                        <td style="display:flex;align-items:center;">WORKING DAYS &nbsp; 
                                            <svg style="cursor:pointer;" class="add-working-days" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square-fill" viewBox="0 0 16 16">
                                            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm6.5 4.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0"/>
                                            </svg>
                                        </td>
                                        <td>EARNED</td>
                                        <td>SSS</td>
                                        <td>PHILHEALTH</td>
                                        <td>PAG-IBIG</td>
                                        <td>NET PAY</td>
                                        <td>STATUS</td>
                                        <td>ACTION</td>
                                    </tr>
                                </thead>
                                <tbody id="tbody">
                                    ${content}
                                </tbody>
                            </table>
                        </div>
                        <br>
                        <div style="text-align:right;">
                            <button class="action-button print-payroll-document">PRINT DOCUMENT</button>
                        </div>
                    </div>
                </div>`);

                $(".print-payroll-document").click(function(event){
                    event.stopImmediatePropagation();

                    $(".payroll-document").remove();
                    $(".pages").remove();
                    $(".employee-trail-document").remove();

                    let tbody_content = "";
                    let total_net = 0;
                    for (let i = 0; i < ALLDetails.length; i++) {
                        let employee = false;
                        let name;
                        for (let j = 0; j < res.length; j++) {
                            if (parseInt(res[j].serialnumber) == i) {
                                employee = true;
                                name = res[j].name;
                                break;
                            }
                        }

                        if (typeof ALLDetails[i] === 'object') {
                            tbody_content += `
                            <tr>
                                <td>${name}</td>
                                <td>${ALLDetails[i][4]['SALARY RATE']}</td>
                                <td>${ALLDetails[i][5]['ABSENT (total)'].value}</td>
                                <td>${ALLDetails[i][7]['UNDERTIME (total)'].value}</td>
                                <td>${ALLDetails[i][8]['TARDINESS (total)'].value}</td>
                                <td>${ALLDetails[i][6]['BASIC']}</td>
                                <td>${ALLDetails[i][9]['HOLIDAYS (total)'].value}</td>
                                <td>${ALLDetails[i][10]['OVERTIME (total)'].value}</td>
                                <td>${ALLDetails[i][11]['EARNED'].value}</td>
                                <td>${ALLDetails[i][12]['SSS'].value}</td>
                                <td>${ALLDetails[i][13]['PHILHEALTH'].value}</td>
                                <td>${ALLDetails[i][14]['PAG-IBIG'].value}</td>
                                <td>${ALLDetails[i][15]['ADJUSTMENT'].value}</td>
                                <td>${ALLDetails[i][16]['CASH ADVANCE'].value}</td>
                                <td>${ALLDetails[i][17]['CHARGES'].value}</td>
                                <td>${ALLDetails[i][18]['SSS LOAN'].value}</td>
                                <td>${ALLDetails[i][19]['PAG-IBIG LOAN'].value}</td>
                                <td>${ALLDetails[i][20]['COMPANY LOAN'].value}</td>
                                <td>${ALLDetails[i][21]['TOTAL DEDUCTIONS'].value}</td>
                                <td>${ALLDetails[i][22]['ALLOWANCE (total)'].value}</td>
                                <td>${ALLDetails[i][24]['NET'].value}</td>
                            </tr>`;

                            let net = ALLDetails[i][24]['NET'].value
                            net = net.replace(/,/g, '');
                            net = parseFloat(net);
                            total_net += net;
                        } else {
                            if (employee) {
                                tbody_content += `
                                <tr>
                                    <td>${name}</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                </tr>`;
                            }
                            
                        }
                        
                    }

                    tbody_content += `
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>${total_net.toFixed(2)}</td>
                    </tr>`;

                    document.body.insertAdjacentHTML("afterbegin",`
                    <div class="payroll-document" style="display:none;margin-top:100px;">
                        <h5 class="text-center">${COMPANY_NAME}</h5>
                        <p class="text-center">${COMPANY_ADD}</p>
                        <h6 class="text-center">PAYROLL</h6>
                        <p class="text-center">${txt}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th rowspan="2" style="text-align:center;">Name of Employees</th>
                                    <th colspan="7" style="text-align:center;">COMPENSATION</th>
                                    <th rowspan="2">Earnings</th>
                                    <th colspan="9" style="text-align:center;">DEDUCTIONS</th>
                                    <th rowspan="2" style="text-align:center;">Total Deductions</th>
                                    <th rowspan="2">Allowance</th>
                                    <th rowspan="2">Net Pay</th>
                                </tr>
                                <tr>
                                    <th>SALARY RATE</th>
                                    <th>ABSENT</th>
                                    <th>UNDERTIME</th>
                                    <th>TARDINESS</th>
                                    <th>BASIC</th>
                                    <th>HOLIDAY</th>
                                    <th>OVERTIME</th>
                                    <th>SSS</th>
                                    <th>PHILHEALTH</th>
                                    <th>PAG-IBIG</th>
                                    <th>ADJUSTMENT</th>
                                    <th>CASH ADVANCE</th>
                                    <th>CHARGES</th>
                                    <th>SSS LOAN</th>
                                    <th>PAG-IBIG LOAN</th>
                                    <th>COMPANY LOAN</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tbody_content}
                            </tbody>
                        </table>
                    </div>`);

                    const style = document.createElement('style');
                    style.textContent = `
                    @media print {
                        @page {
                        size: landscape;
                        }
                    }
                    `;
                    document.head.appendChild(style);

                    window.print();
                })
                

                $(".add-working-days").click(function(event){
                    event.stopImmediatePropagation();

                   
                    $.ajax({
                        type: 'POST',
                        url: '../php/fetch_all_serial.php',
                        data: {
                            branch: SELECTED_BRANCH,
                        }, success: function(res) {
                            try {
                                ALL_SERIAL = JSON.parse(res);

                                let ops ="";
                                for (let i = 0; i < ALL_CLASS.length; i++) {
                                    ops += `
                                    <option style="border-bottom:1px solid rgba(0,0,0,0.1);" value="${ALL_CLASS[i].class}">${ALL_CLASS[i].class_name}</option>`;
                                }

                                let ops2 = "";
                                for (let i = 0; i < ALL_SERIAL.length; i++) {
                                    ops2 += `
                                    <option style="border-bottom:1px solid rgba(0,0,0,0.1);" value="${ALL_SERIAL[i].serial}">${ALL_SERIAL[i].name}</option>`;
                                }

                                document.body.insertAdjacentHTML("afterbegin", `
                                <div class="third-layer-overlay">
                                    <div class="tlo-wrapper pt-5" style="min-width:400px;position:relative;">
                                        ${close_icon}
                                        <p class="text-white text-center" style="font-size:20px;">ADD WORKING DAYS</p>
                                        <hr>
                                        <div style="display:flex;flex-direction:column;color:#fff;">
                                            <span>SELECT BY:</span>
                                            <select id="select-by">
                                                <option value="class">Class</option>
                                                <option value="employee">Employee</option>
                                            </select>
                                            <span>SELECT MULTIPLE: (Hold CTRL)</span>
                                            <select id="selection" multiple>
                                                ${ops}
                                            </select>
                                            <span>WORKING DAYS:</span>
                                            <input type="number" id="working-days" placeholder="Enter working days"/>
                                            <br>
                                            <input type="button" value="ADD"/>
                                        </div>
                                    </div>
                                </div>`);

                                $("input[type='button']").click(function(event){
                                    event.stopImmediatePropagation();
                                    let selected = $("#selection").val();
                                    let workingDays = $("#working-days").val();

                                    if ($("#select-by").val() == 'class') {
                                        if (selected.length > 0) {
                                            for (let i = 0; i < selected.length; i++) {
                                                for (let j = 0; j < ALL_SERIAL.length; j++){
                                                    if (ALL_SERIAL[j].class == selected[i]) {
                                                        $(`#cal${ALL_SERIAL[j].serial}`).val(workingDays);
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        if (selected.length > 0) {
                                            for (let i = 0; i < selected.length; i++) {
                                                $(`#cal${selected[i]}`).val(workingDays);
                                            }
                                        }
                                    }

                                    successNotification("Working days added.", "success");
                                    $(".third-layer-overlay").remove();
                                })

                                $("select#select-by").change(function(event){
                                    if ($(this).val() === 'class') {
                                        $("select#selection").html(ops);
                                    } else {
                                        $("select#selection").html(ops2);
                                    }
                                })

                                $(".close-window").click(function(event){
                                    $(".third-layer-overlay").remove();
                                })

                                
                            } catch (err) {
                                console.log(err);

                            }
                        }
                    })
                    

                })

                $("input[type='checkbox']").change(function(event){
                    let snum = $(this).parent("label").data("s");

                    let name;
                    for (let n = 0; n < STAFFS.length; n++) {
                        if (STAFFS[n].serialnumber == snum) {
                            name = STAFFS[n].name;
                        }
                    }

                    if ($(`#net-pay${snum}`).html() === '0' || $(`#net-pay${snum}`).html() === '0.00') {
                        $(this).prop('checked', !$(this).prop('checked'));
                    } else {
                        let net = $(`#net-pay${snum}`).html();
                        net = net.replace(/,/g, '');
                        net = parseFloat(net);

                        let td = ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'].value;
                        td = td.replace(/,/g, '');
                        td = parseFloat(td);

                        if ($(this).is(":checked")) {
                            if ($(this).attr("id").includes("sss")) {
                                let ded = parseFloat(D[`d${snum}`].sss);
                                net = net - ded;
                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                deductions[`deduc${snum}`]['sss'] = D[`d${snum}`].sss;

                                td = td + ded;

                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};
                                ALLDetails[parseInt(snum)][12]['SSS'] = {'value' : D[`d${snum}`].sss.toFixed(2), 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};


                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                    let plip  = PAYSLIPS[x];
                                    for (let s = 0; s < plip.length; s++) {
                                        if (plip[s].name == name) {
                                            plip[19]['name'] = D[`d${snum}`].sss.toFixed(2);
                                            plip[37]['name'] = td.toFixed(2);
                                            plip[42]['name'] = net.toLocaleString();
                                        }
                                    }
                                }
                                
                            }
                            if ($(this).attr("id").includes("phil")) {
                                let ded = parseFloat(D[`d${snum}`].phil);
                                net = net - ded;
                                
                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                td = td + ded;
                                
                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};                 
                                deductions[`deduc${snum}`]['phil'] = D[`d${snum}`].phil;
                                ALLDetails[parseInt(snum)][13]['PHILHEALTH'] = {'value' : D[`d${snum}`].phil.toFixed(2), 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                    let plip  = PAYSLIPS[x];
                                    for (let s = 0; s < plip.length; s++) {
                                        if (plip[s].name == name) {
                                            plip[21]['name'] = D[`d${snum}`].phil.toFixed(2);
                                            plip[37]['name'] = td.toFixed(2);
                                            plip[42]['name'] = net.toLocaleString();
                                        }
                                    }
                                }
                            }
                            if ($(this).attr("id").includes("pbig")) {
                                let ded = parseFloat(D[`d${snum}`].pbig);
                                net = net - ded;
                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                td = td + ded;
                                
                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};
                                deductions[`deduc${snum}`]['pbig'] = D[`d${snum}`].pbig;
                                ALLDetails[parseInt(snum)][14]['PAG-IBIG'] = {'value' : D[`d${snum}`].pbig.toFixed(2), 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                    let plip  = PAYSLIPS[x];
                                    for (let s = 0; s < plip.length; s++) {
                                        if (plip[s].name == name) {
                                            plip[23]['name'] = D[`d${snum}`].pbig.toFixed(2);
                                            plip[37]['name'] = td.toFixed(2);
                                            plip[42]['name'] = net.toLocaleString();
                                        }
                                    }
                                }
                            }

        
                            
                        } else {
                            if ($(this).attr("id").includes("sss")) {
                                let ded = parseFloat(deductions[`deduc${snum}`].sss);
                                net = net + ded;
                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                td = td - ded;
                                
                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};
                                deductions[`deduc${snum}`]['sss'] = 0;
                                ALLDetails[parseInt(snum)][12]['SSS'] = {'value' : deductions[`deduc${snum}`].sss.toFixed(2), 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                    let plip  = PAYSLIPS[x];
                                    for (let s = 0; s < plip.length; s++) {
                                        if (plip[s].name == name) {
                                            plip[19]['name'] = deductions[`deduc${snum}`].sss.toFixed(2);
                                            plip[37]['name'] = td.toFixed(2);
                                            plip[42]['name'] = net.toLocaleString();
                                        }
                                    }
                                }
                            }
                            if ($(this).attr("id").includes("phil")) {
                                
                                let ded = parseFloat(deductions[`deduc${snum}`].phil);
                                
                                net = net + ded;
                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                td = td - ded;
                                
                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};
                                deductions[`deduc${snum}`]['phil'] = 0;
                                ALLDetails[parseInt(snum)][13]['PHILHEALTH'] = {'value' : deductions[`deduc${snum}`].phil.toFixed(2), 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                    let plip  = PAYSLIPS[x];
                                    for (let s = 0; s < plip.length; s++) {
                                        if (plip[s].name == name) {
                                            plip[21]['name'] = deductions[`deduc${snum}`].phil.toFixed(2);
                                            plip[37]['name'] = td.toFixed(2);
                                            plip[42]['name'] = net.toLocaleString();
                                        }
                                    }
                                }
                            }

                            if ($(this).attr("id").includes("pbig")) {
                                
                                let ded = parseFloat(deductions[`deduc${snum}`].pbig);
                                td = td - ded;
                                
                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};
                                net = net + ded;
                                $(`#net-pay${snum}`).html(net.toLocaleString());

                                deductions[`deduc${snum}`]['pbig'] = 0;
                                ALLDetails[parseInt(snum)][14]['PAG-IBIG'] = {'value' : deductions[`deduc${snum}`].pbig.toFixed(2), 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                    let plip  = PAYSLIPS[x];
                                    for (let s = 0; s < plip.length; s++) {
                                        if (plip[s].name == name) {
                                            plip[23]['name'] = deductions[`deduc${snum}`].pbig.toFixed(2);
                                            plip[37]['name'] = td.toFixed(2);
                                            plip[42]['name'] = net.toLocaleString();
                                        }
                                    }
                                }
                            }
                        }

                        
                        if (PAYSCHED == 'twice-monthly') {
                            $.ajax({
                                type: 'POST',
                                url: '../php/update_contri_file.php',
                                data: {
                                    serial: snum,
                                    col1: from,
                                    col2: to,
                                    paysched: PAYSCHED,
                                    sss: deductions[`deduc${snum}`].sss,
                                    phil: deductions[`deduc${snum}`].phil,
                                    pbig: deductions[`deduc${snum}`].pbig,
                                    td: td,
                                    net: net,
                                    branch: SELECTED_BRANCH
                                }, success:function(res) {
                                    console.log(res);
                                }
                            })
                        } else if (PAYSCHED == 'monthly') {
                            $.ajax({
                                type: 'POST',
                                url: '../php/update_contri_file.php',
                                data: {
                                    serial: snum,
                                    col1: MON,
                                    col2: MON,
                                    paysched: PAYSCHED,
                                    sss: deductions[`deduc${snum}`].sss,
                                    phil: deductions[`deduc${snum}`].phil,
                                    pbig: deductions[`deduc${snum}`].pbig,
                                    td: td,
                                    net: net,
                                    branch: SELECTED_BRANCH
                                }, success:function(res) {
                                    console.log(res);
                                }
                            })
                        }
                    }

                
                })
    
                $(".trail").click(function(event){
                    event.stopImmediatePropagation();
                    let serial = $(this).data("id");

                    let promise;
                    if (PAYSCHED == 'twice-monthly') {
                        promise = new Promise(function(resolve, reject){
                            $.ajax({
                                type: 'POST',
                                url: '../php/fetch_employee_trail.php',
                                data : {
                                    serial: serial,
                                    from: from,
                                    to: to,
                                    branch: SELECTED_BRANCH
                                },
                                success: function(res) {
                                    resolve(res);
                                }
                            });
                        });
                        
                    } else if (PAYSCHED == 'monthly') {
                        promise = new Promise(function(resolve, reject){
                            $.ajax({
                                type: 'POST',
                                url: '../php/fetch_employee_trail.php',
                                data : {
                                    serial: serial,
                                    mon: MON,
                                    branch: SELECTED_BRANCH
                                },
                                success: function(res) {
                                    resolve(res);
                                }
                            });
                        });
                    }

                    promise.then(
                        function(res) {
                            let content = "";
                            let doc_content = "";

                            try {
                                res = JSON.parse(res);
                                for (let i = 0; i < res.length; i++) {
                                    function convertTo12HourFormat(timeString) {
                                        const timePortion = timeString.split(' ')[1];
                                        const [hours, minutes] = timePortion.split(':').map(Number);
                                        const meridian = hours >= 12 ? 'PM' : 'AM';
                                        const hours12 = hours % 12 || 12;
                                        return `${hours12}:${minutes < 10 ? '0' : ''}${minutes} ${meridian}`;
                                    }
                                    const dateObj = new Date(res[i].date);
                                    const month = months[dateObj.getMonth()];
                                    const day = dateObj.getDate();
                                    const year = dateObj.getFullYear();
    
                                    content += `
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td style="padding:5px;font-size:14px;">${res[i].name}</td>
                                        <td style="padding:5px;font-size:14px;">${CLASSES[res[i].class]}</td>
                                        <td style="padding:5px;font-size:14px;">${convertTo12HourFormat(res[i].start_time)}</td>
                                        <td style="padding:5px;font-size:14px;">${convertTo12HourFormat(res[i].end_time)}</td>
                                        <td style="padding:5px;font-size:14px;">${res[i].late_mins} (mins)</td>
                                        <td style="padding:5px;font-size:14px;">${parseFloat(res[i].total_hours).toFixed(2)} hrs</td>
                                        <td style="padding:5px;font-size:14px;">${res[i].ot_mins} (mins)</td>
                                        <td style="padding:5px;font-size:14px;">${res[i].ut_mins} (mins)</td>
                                        <td style="padding:5px;font-size:14px;">${month} ${day}, ${year}</td>
                                    </tr>`;

                                    doc_content += `
                                    <tr>
                                        <td>${res[i].name}</td>
                                        <td style="padding:5px;font-size:14px;">${convertTo12HourFormat(res[i].start_time)}</td>
                                        <td style="padding:5px;font-size:14px;">${convertTo12HourFormat(res[i].end_time)}</td>
                                        <td style="padding:5px;font-size:14px;">${res[i].late_mins} (mins)</td>
                                        <td style="padding:5px;font-size:14px;">${res[i].ot_mins} (mins)</td>
                                        <td style="padding:5px;font-size:14px;">${res[i].ut_mins} (mins)</td>
                                        <td style="padding:5px;font-size:14px;">${month} ${day}, ${year}</td>
                                    </tr>`;
                                }

                            } catch (err) {
                                console.log(err);
                                content += `
                                <tr>
                                    <td colspan="8" class="text-center pt-3">No item</td>
                                </tr>`;
                            }

                            document.body.insertAdjacentHTML("afterbegin", `
                            <div class="third-layer-overlay">
                                <div class="tlo-wrapper pt-5" style="min-width:500px;position:relative;">
                                    ${close_icon}
                                    <p class="text-white text-center" style="font-size:20px;">EMPLOYEE TRAIL</p>
                                    <hr>
                                    <div class="table-container"  style="max-height:40vh;overflow:auto;max-width:60vw;min-width:45vw;">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <td>NAME</td>
                                                    <td>CLASS</td>
                                                    <td>TIME IN</td>
                                                    <td>TIME OUT</td>
                                                    <td>LATE</td>
                                                    <td>HOURS WORKED</td>
                                                    <td>OVERTIME</td>
                                                    <td>UNDERTIME</td>
                                                    <td>DATE</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${content}
                                            </tbody>
                                        </table>
                                    </div>
                                    <br>
                                    <button class="action-button print-trail">PRINT EMPLOYEE TRAIL</button>
                                </div>
                            </div>
                            `);

                            $(".print-trail").click(function(event){
                                event.stopImmediatePropagation();
                                
                                $(".pages").remove();
                                $(".payroll-document").remove();
                                $(".employee-trail-document").remove();

                                document.body.insertAdjacentHTML("afterbegin", `
                                <div class="employee-trail-document" style="display:none;padding:1cm 1cm 0 1cm;">
                                    <p class="text-center" style="font-size:25px;font-weight:bold;">${txt}</p>
                                    <br>
                                    <table>
                                        <tr>
                                            <td>NAME</td>
                                            <td>TIME IN</td>
                                            <td>TIME OUT</td>
                                            <td>LATE</td>
                                            <td>OVERTIME</td>
                                            <td>UNDERTIME</td>
                                            <td>DATE</td>
                                        </tr>
                                        ${doc_content}
                                    </table>
                                </div>
                                `);

                                const style = document.createElement('style');
                                style.textContent = `
                                @media print {
                                    @page {
                                        size: portrait;
                                        margin: 1cm;
                                    }
                                }
                                `;
                                document.head.appendChild(style);
                                window.print();
                            })
                            
                            $(".close-window").click(function(event){
                                $(".third-layer-overlay").remove();
                            })
                        }
                    )
                })
    
                $(".generate-payslip").on("click", function(event){
                    event.stopImmediatePropagation();
                    let isEmpty = true;
    
                    for (let i = 0; i < ALLDetails.length; i++) {
                        if (typeof ALLDetails[i] === 'object') {
                            isEmpty = false;
                        }
                    }
    
                    if (!isEmpty) {
                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="third-layer-overlay">
                            <div class="tlo-wrapper pt-5" style="min-width:500px;position:relative;">
                                ${close_icon}
                                <p class="text-white text-center" style="font-size:20px;">GENERATE PAYSLIP</p>
                                <hr>
                                <div class="btns">
                                    <button id="continue" style="background:orange;">CONTINUE</button>
                                    <button id="cancel" class="action-button">CANCEL</button>
                                </div>
                            </div>
                        </div>
                        `);
        
                        $("button").click(function(event){
                            event.stopImmediatePropagation();
                            if ($(this).attr("id").includes("continue")) {
                                generatePayslips();
                            }
                            $(".third-layer-overlay").remove();
                        })
        
                        $(".close-window").click(function(){
                            $(".third-layer-overlay").remove();
                        })
    
                    } else {
                        errorNotification("Cannot process your request.", "danger");
                    }
                    
                })
    
                
    
    
                $(".add-deductions").on("click", function(event){
                    event.stopImmediatePropagation();
                    let serialID = $(this).data("id");

                    if (deductions.hasOwnProperty(`deduc${serialID}`)) {
                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="third-layer-overlay">
                            <div class="tlo-wrapper pt-5" style="position:relative;">
                                ${close_icon}
                                <p class="text-white text-center" style="font-size:20px;">DEDUCTIONS</p>
                                <br>
                                <hr>
                                <form id="addDeductionForm">
                                    <span>SSS (excel file):</span>
                                    <input type="number" placeholder="SSS Deduction" value="${deductions[`deduc${serialID}`].sss}" name="sss"/>
                                    <span>Pag-IBIG:</span>
                                    <input type="number" placeholder="Pag-IBIG Deduction" value="${deductions[`deduc${serialID}`].pbig}" name="pbig"/>
                                    <span>PhilHealth:</span>
                                    <input type="number" placeholder="PhilHealth Deduction" value="${deductions[`deduc${serialID}`].phil}" name="phil"/>
                                    <br>
                                    <input type="submit" value="ADD DEDUCTIONS"/>
                                </form>
                            </div>
                        </div>
                        `);
                    } else {
                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="third-layer-overlay">
                            <div class="tlo-wrapper pt-5" style="position:relative;">
                                ${close_icon}
                                <p class="text-white text-center" style="font-size:20px;">DEDUCTIONS</p>
                                <br>
                                <hr>
                                <form id="addDeductionForm">
                                    <span>SSS:</span>
                                    <input type="number" placeholder="SSS Deduction" name="sss"/>
                                    <span>Pag-IBIG:</span>
                                    <input type="number" placeholder="Pag-IBIG Deduction" name="pbig"/>
                                    <span>PhilHealth:</span>
                                    <input type="number" placeholder="PhilHealth Deduction" name="phil"/>
                                    <br>
                                    <input type="submit" value="ADD DEDUCTIONS"/>
                                </form>
                            </div>
                        </div>
                        `);
                    }
    
                    $("input[type='submit']").click(function(event){
                        event.preventDefault();
                        let data = new FormData(document.getElementById("addDeductionForm"));
                        var formDataObject = {};
                        let isNotEmpty = true;
                        data.forEach(function(value, key){
                            formDataObject[key] = value;
                            if (value === '') {
                                formDataObject[key] = 0;
                            }
                        });
                        
                        deductions[`deduc${serialID}`] = {"sss" : formDataObject.sss, "pbig" : formDataObject.pbig, "phil" : formDataObject.phil}
                        successNotification("Deductions added.", "success");
                        $(".third-layer-overlay").remove();
                            
                    })
    
                    $(".close-window").click(function(){
                        $(".third-layer-overlay").remove();
                    })
                })

                $(".remove-holiday").on("click", function(event){
                    event.stopImmediatePropagation();

                    let ops = "";
    
                    $.ajax({
                        type: 'POST',
                        url: '../php/fetchHolidaysDate.php',
                        success: function(res){
                            try {
                                res = JSON.parse(res);
                                for (let i = 0; i < res.length; i++) {
                                    const date = new Date(res[i].date);

                                    // Get month, day, and year components
                                    const month = months[date.getMonth()];
                                    const day = date.getDate();
                                    const year = date.getFullYear();
    
                                    // Construct the formatted date string
                                    const formattedDate = `${month} ${day}, ${year}`;
    
                                    ops += `
                                    <option value="${res[i].id}">${formattedDate}</option>
                                    `;
                                }
    
                            } catch(err) {
                                console.log(err);
                            }
    
                            document.body.insertAdjacentHTML("afterbegin", `
                                <div class="third-layer-overlay">
                                    <div class="tlo-wrapper pt-5" style="position:relative;">
                                        ${close_icon}
                                        <p class="text-white text-center" style="font-size:20px;">REMOVE HOLIDAY BY DATE</p>
                                        <hr>
                                        <form id="removeHolidayForm">
                                            <span>SELECT DATE</span>
                                            <select name="id">
                                                <option value="">Select date</option>
                                                ${ops}
                                            </select>
                                            
                                            <br>
                                            <input type="submit" value="REMOVE HOLIDAY"/>
                                        </form>
                                    </div>
                                </div>
                            `);
    
                            $("input[type='submit']").click(function(event){
                                event.preventDefault();
                                let data = new FormData(document.getElementById("removeHolidayForm"));
                                var formDataObject = {};
                                let isNotEmpty = true;
                                data.forEach(function(value, key){
                                    formDataObject[key] = value;
                                    if (value === '') {
                                        isNotEmpty = false;
                                    }
                                });
    
                                if (!isNotEmpty) {
                                    errorNotification("Fields must be filled out.", "warning");
                                } else {
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/remove_holidaypay.php',
                                        data: {
                                            id: formDataObject.id,
                                        }, success: function(res){
                                        
                                            if (res.includes('success')) {
                                                successNotification("Selected holiday removed.", "success");
                                                $(".third-layer-overlay").remove();
                                            }
                                        }
                                    })
                                }
                                
                            })
    
    
                            $(".close-window").click(function(){
                                $(".third-layer-overlay").remove();
                            })
    
                            
                        }
                    })
                })

                $(".add-holiday2").click(function(event){
                    event.stopImmediatePropagation();

                    $.ajax({
                        type: 'POST',
                        url: '../php/fetch_month_holidays.php',
                        data: {
                            month: MONTH,
                            year: YEAR,
                            branch: SELECTED_BRANCH,
                            paysched: PAYSCHED
                            
                        },success: function(res) {
                            
                            try {
                                res = JSON.parse(res);
                                let holiday = "";
                                for (let i = 0; i < res.length; i++) {

                                    const date = new Date(res[i].date);

                                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                                    const formattedDate = date.toLocaleDateString('en-US', options);

                                    if (i == 0) {
                                        holiday += `
                                        <div id="div${i}" style="color:#fff;border-bottom:1px solid rgba(0,0,0,0.1);padding:10px;border-top:1px solid rgba(0,0,0,0.1);display:flex;justify-content:space-between;"><span style="cursor:pointer;" data-date="${res[i].date}">${formattedDate} (${res[i].holiday_name}) </span> <div><button class="action-button delete ml-2" data-date="${res[i].date}" data-id="${i}">Delete</button></div></div>`;
                                    } else if (i > 0) {
                                        holiday += `
                                        <div id="div${i}" style="color:#fff;border-bottom:1px solid rgba(0,0,0,0.1);padding:10px;display:flex;justify-content:space-between;"><span style="cursor:pointer;" data-date="${res[i].date}">${formattedDate} (${res[i].holiday_name})</span> <div><button class="action-button delete ml-2" data-date="${res[i].date}" data-id="${i}">Delete</button></div></div>`;
                                    }
                                    
                                }
                                document.body.insertAdjacentHTML("afterbegin", `
                                <div class="fourth-layer-overlay">
                                    <div class="folo-wrapper pt-5" style="min-width:25vw;position:relative;">
                                        ${close_icon}
                                        <p class="text-white text-center" style="font-size:20px;">HOLIDAYS</p>
                                        <button class="action-button add mb-2">ADD HOLIDAY</button>
                                        <div>
                                            ${holiday}
                                        </div>
                                    </div>
                                </div>`);

                                $(".close-window").click(function(event){
                                    event.stopImmediatePropagation();
                                    $(".fourth-layer-overlay").remove();
                                })

                            
                                $(".delete").click(function(event){
                                    event.stopImmediatePropagation();
                                    let date = $(this).data("date");
                                    let id = $(this).data("id");
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/delete_holidayyy.php',
                                        data: {
                                            date: date,
                                            branch: SELECTED_BRANCH,
                                            paysched: PAYSCHED
                                        },success: function(res) {
                                            console.log(res);
                                            if (res == 'deleted') {
                                                $(`#div${id}`).remove();
                                            }
                                        }
                                    })
                                })

                                $(".add").click(function(event){
                                    event.stopImmediatePropagation();
                                    $(".fourth-layer-overlay").remove();
                                    add_holiday();
                                })

                                $("span").click(function(event){
                                    event.stopImmediatePropagation();
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/get_holidayyy.php',
                                        data: {
                                            date: $(this).data("date"),
                                            branch: SELECTED_BRANCH,
                                            paysched: PAYSCHED
                                        },success: function(res) {
                                            try {
                                                res = JSON.parse(res);
                                                let date = res[0].date;
                                                $(".fourth-layer-overlay").remove();

                                                const date2 = new Date(res[0].date);

                                                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                                                const formattedDate = date2.toLocaleDateString('en-US', options);

                                                let d = new Date(res[0].date);
                                                let d_before = new Date(res[0].date);
                                                let d_after = new Date(res[0].date);
                                                d_before.setDate(d_before.getDate() - 1);
                                                d_after.setDate(d_after.getDate() + 1);

                                                const formatDate = (inputDate) => {
                                                    const year = inputDate.getFullYear();
                                                    const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                                                    const day = String(inputDate.getDate()).padStart(2, '0');
                                                    return `${year}-${month}-${day}`;
                                                };

                                                const monthName = months[d.getMonth()]; // Get month name based on zero-based index
                                                const day = d.getDate();
                                                const year = d.getFullYear();

                                                let d1 = new Date(d_before);
                                                let d2 = new Date(d_after);
                                                const monthName1 = months[d1.getMonth()]; // Get month name based on zero-based index
                                                const day1 = d1.getDate();
                                                const year1 = d1.getFullYear();

                                                const monthName2 = months[d2.getMonth()]; // Get month name based on zero-based index
                                                const day2 = d2.getDate();
                                                const year2 = d2.getFullYear();

                                                // Format the date as "MonthName day, year"
                                                const _formattedDate = `${monthName} ${day}, ${year}`;
                                                const formattedDate1 = `${monthName1} ${day1}, ${year1}`;
                                                const formattedDate2 = `${monthName2} ${day2}, ${year2}`;

                                                d_before = formatDate(d_before);
                                                d_after = formatDate(d_after);

                                                let tbody = "";
                                                let arr = [];
                                                for (let j = 0; j < res.length; j++) {
                                                    let approved = false;
                                                    let present = 'Absent';

                                                    if (res[j].approved == 1) {
                                                        approved = true;
                                                    }

                                                    if (res[j].present == 1) {
                                                        present = 'Worked';
                                                    }

                                                    let button;


                                                    if (approved) {
                                                        button = `<button class="action-button approve-holiday" style="padding:5px 10px;border-radius:4px;border:none;color:#fff;background:orange;">Approved</button>`;
                                                    } else {
                                                        button = `<button class="action-button approve-holiday" style="padding:5px 10px;border-radius:4px;border:none;color:#fff;background:var(--teal);">Approve</button>`;
                                                    }

                                                    tbody += `
                                                    <tr data-name="${res[j].employee}" data-id="${res[j].serialnumber}" data-class="${res[j].class}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                        <td>${res[j].employee}</td>
                                                        <td>${res[j].isvalid_date_before}</td>
                                                        <td>${present}</td>
                                                        <td>${res[j].isvalid_date_after}</td>
                                                        <td>${button}</td>
                                                    </tr>`;

                                                    arr.push(res[j].percentage);
                                                }

                                                let p;
                                                p = Math.max(...arr);
                                                

                                                document.body.insertAdjacentHTML("afterbegin", `
                                                <div class="fourth-layer-overlay">
                                                    <div class="folo-wrapper pt-5" style="min-width:50vw;position:relative;">
                                                        ${close_icon}
                                                        <p class="text-white text-center" style="font-size:20px;">${formattedDate}<br><span style="font-size:15px;">${res[0].holiday_name}</span></p>
                                                        <hr>
                                                        <div style="display:flex;flex-direction:column;width:25%;margin-bottom:5px;">
                                                            <span style="font-size:15px;color:#fff;">Holiday percentage:</span>
                                                            <input type="number" value="${p}" id="percentage" placeholder="Enter percentage"/>
                                                        </div>

                                                        <div class="table-container" style="max-height:50vh;max-width:60vw;overflow:auto;">
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <td>Employee</td>
                                                                        <td>${formattedDate1}</td>
                                                                        <td>${_formattedDate} (Holiday)</td>
                                                                        <td>${formattedDate2}</td>
                                                                        <td>Action</td>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    ${tbody}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>`);

                                                $(".approve-holiday").click(function(event){
                                                    event.stopImmediatePropagation();
    
                                                    if ($("#percentage").val() === '') {
                                                        errorNotification("Please enter holiday percentage.", "warning");
                                                    } else {
                                                        let snum = $(this).parent("td").parent("tr").data("id");
                                                        let _class = $(this).parent("td").parent("tr").data("class");
                                                        let name = $(this).parent("td").parent("tr").data("name");
                                                        $(this).css("background", "orange");
                                                        $(this).html("Approved");
                                                        $.ajax({
                                                            type: 'POST',
                                                            url: '../php/fetch_class.php',
                                                            data: {
                                                                class: _class,
                                                            },
                                                            success: function(res) {
                                                                
    
                                                                try {
                                                                    res = JSON.parse(res);
                                                                    let rate = parseInt(res.rate);
                                                                    let hour_perday = parseInt(res.hour_perday);
                                                                    let rate_type = res.rate_type;
    
                                                                    if (rate_type == 'hourly') {
                                                                        rate = rate * hour_perday;
                                                                    } else if (rate_type == 'monthly') {
                                                                        rate = rate * 12;
                                                                        rate = rate / 365; //based on 365 days per year factor
                                                                    }
    
                                                                    let perc = $("#percentage").val();
                                                                    perc = parseFloat(perc);
                                                                    let pay = perc * rate;
                                                                    pay = parseFloat(pay);
    
                                                                    $.ajax({
                                                                        type: 'POST',
                                                                        url: '../php/update_holiday.php',
                                                                        data: {
                                                                            serial: snum,
                                                                            branch: SELECTED_BRANCH,
                                                                            date: date,
                                                                            month: MONTH,
                                                                            year: YEAR,
                                                                            pay: pay,
                                                                            perc: perc,
                                                                            paysched: PAYSCHED
                                                                        }, success: function(res) {
                                                                            console.log(res);
                                                                        }
                                                                    })
    
                                                                    try {
                                                                        // ALLDetails[snum][9]['HOLIDAYS (total)'] = pay;
                                                                        // let earned2 = ALLDetails[snum][11]['EARNED'].value;
                                                                        // earned2 = parseFloat(earned2);
                                                                        // earned2 += pay;
                                                                        // ALLDetails[snum][11]['EARNED'] = {'value' : earned2, 'highlight': '', op: '+'};
                                                                        // let net2 = ALLDetails[snum][24]['NET'].value;
                                                                        // net2 = parseFloat(net2);
                                                                        // net2 += pay;
                                                                        // ALLDetails[snum][24]['NET'] = {'value' : net2, 'highlight': ''};
    
                                                                        for (let i = 0; i < PAYSLIPS.length; i++) {
                                                                            // if (PAYSLIPS[i][3].name == name) {
                                                                            //     PAYSLIPS[i][15]['name'] = pay;
                                                                            //     let earnings = parseFloat(PAYSLIPS[i][39].name);
                                                                            //     let net = parseFloat(PAYSLIPS[i][43].name);
                                                                            //     earnings += pay;
                                                                            //     net += pay;
                                                                            //     PAYSLIPS[i][39]['name'] = earnings;
                                                                            //     PAYSLIPS[i][43]['name'] = net;
                                                                            // }
                                                                        }
    
                                                                    } catch(err) {
                                                                        console.log(err);
                                                                    }
    
                                                                    // if (COMPUTED.length > 0) {
                                                                    //     for (let i = 0; i < COMPUTED.length; i++) {
                                                                    //         if (COMPUTED[i].serial == snum && COMPUTED[i].date == $("#holiday-date").val()) {
                                                                    //             //computed = COMPUTED[i].computed;
                                                                    //             COMPUTED.splice(i, 1);
                                                                    //         }
                                                                    //     }
                                                                    //     let obj = {'serial' : snum, 'holidaypay' : pay, 'date' : $("#holiday-date").val()};
                                                                    //     COMPUTED.push(obj);
                                                                    // } else {
                                                                    //     let obj = {'serial' : snum, 'holidaypay' : pay, 'date' : $("#holiday-date").val()};
                                                                    //     COMPUTED.push(obj);
                                                                    // }
                                                                    
                                                                    successNotification("Approved.", "success");
                                                                } catch (err) {
                                                                    console.log(err);
                                                                    errorNotification("Error fetching class.", "danger");
                                                                }
    
                                                                
                                                            }
                                                        })
    
    
                                                        
                                                        
                                                    }
                                                    
    
    
                                                })

                                                $(".close-window").click(function(event){
                                                    event.stopImmediatePropagation();
                                                    $(".fourth-layer-overlay").remove();
                                                })

                                            } catch(err) {
                                                console.log(err);
                                            }
                                        }
                                    })
                                })

                            } catch (err) {
                                add_holiday();
                                
                            }

                            function add_holiday() {
                                document.body.insertAdjacentHTML("afterbegin", `
                                <div class="fourth-layer-overlay">
                                    <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                                        ${close_icon}
                                        <p class="text-white text-center" style="font-size:20px;">ADD HOLIDAY</p>
                                        <hr>
                                        <div style="color:#fff;display:flex;flex-direction:column;">
                                        <span>DETAILS:</span>
                                        <input type="text" placeholder="Enter holiday details" id="holiday-details">
                                        <span>SELECT DATE:</span>
                                        <input type="date" id="holiday-date">
                                        <br>
                                        <input type="button" value="ADD HOLIDAY"/>
                                        </div>
                                    </div>
                                </div>`);

                                $("input[type='button']").click(function(event){
                                    event.stopImmediatePropagation();

                                    let date = $("#holiday-date").val();

                                    let dateParts = date.split("-");

                                    // Extract the year and month
                                    let year = dateParts[0];
                                    let month = dateParts[1];

                                    YEAR = year;
                                    MONTH = month;

                                   
                                    let holi_name = $("#holiday-details").val();

                                    let d = new Date(date);
                                    let d_before = new Date(date);
                                    let d_after = new Date(date);
                                    d_before.setDate(d_before.getDate() - 1);
                                    d_after.setDate(d_after.getDate() + 1);

                                    const formatDate = (inputDate) => {
                                        const year = inputDate.getFullYear();
                                        const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                                        const day = String(inputDate.getDate()).padStart(2, '0');
                                        return `${year}-${month}-${day}`;
                                    };

                                    d_before = formatDate(d_before);
                                    d_after = formatDate(d_after);

                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/validate_employees.php',
                                        data: {
                                            date: date,
                                            date_before: d_before,
                                            date_after: d_after,
                                            branch: SELECTED_BRANCH,
                                            paysched: PAYSCHED
                                            
                                        }, success: function(res) {
                                            $(".fourth-layer-overlay").remove();
                                            let tbody = "";
                                            try {
                                                res = JSON.parse(res);

                                                for (let i = 0; i < res.staffs.length; i++) {
                                                    let serial = res.staffs[i].serialnumber;
                                                    serial = parseInt(serial);
                                                    //before holiday
                                                    let arr = [];
                                                    let present = false;
                                                    for (let j = 0; j < res.present_before_holiday.length; j++) {
                                                        let snumber = res.present_before_holiday[j].serialnumber;
                                                        snumber = parseInt(snumber);

                                                        if (serial == snumber) {
                                                            present = true;
                                                            arr.push(parseInt(res.present_before_holiday[j].ut_mins));
                                                        }
                                                    }

                                                    let isValid;
                                                    if (present) {
                                                        isValid = 'Worked ';
                                                    } else {
                                                        isValid = 'Absent';
                                                    }
                                                    
                                                    if (arr.length > 0) {
                                                        let min = Math.min(...arr);
                                                        if (min > 0) {
                                                            isValid += `<span class="tooltip3"> (undertime)<span class="tooltiptext3">Undertime ${min} minutes.</span></span>`;
                                                        }
                                                    }

                                                    //on holiday
                                                    let presentOnHoliday = false;
                                                    for (let k = 0; k < res.present_on_holiday.length; k++) {
                                                        let snumber = res.present_on_holiday[k].serialnumber;
                                                        snumber = parseInt(snumber);
                                                        if (serial == snumber) {
                                                            presentOnHoliday = true;
                                                        }
                                                    }

                                                    if (presentOnHoliday) {
                                                        presentOnHoliday = 'Worked';
                                                    } else {
                                                        presentOnHoliday = 'Absent';
                                                    }

                                                    //after holiday
                                                    let arr2 = [];
                                                    let present2 = false;
                                                    for (let l = 0; l < res.present_after_holiday.length; l++) {
                                                        let snumber = res.present_after_holiday[l].serialnumber;
                                                        snumber = parseInt(snumber);
                                                        if (serial == snumber) {
                                                            present2 = true;
                                                            arr2.push(parseInt(res.present_after_holiday[l].ut_mins));
                                                        }
                                                    }

                                                    let isValid2;
                                                    if (present2) {
                                                        isValid2 = 'Worked ';
                                                    } else {
                                                        isValid2 = 'Absent';
                                                    }
                                                    
                                                    if (arr2.length > 0) {
                                                        let min = Math.min(...arr2);
                                                        if (min > 0) {
                                                            isValid2 += `<span class="tooltip3"> (undertime)<span class="tooltiptext3">Undertime ${min} minutes.</span></span>`;
                                                        }
                                                    }

                                                    let button = `<button class="action-button approve-holiday" style="padding:5px 10px;border-radius:4px;border:none;color:#fff;background:var(--teal);">Approve</button>`;

                                                    // for (let i = 0; i < COMPUTED.length; i++) {
                                                    //     if (COMPUTED[i].serial == serial && COMPUTED[i].date == $("#holiday-date").val()) {
                                                    //         button = `<button class="action-button approve-holiday" style="padding:5px 10px;border-radius:4px;border:none;color:#fff;background:orange;">Approved</button>`;
                                                    //     }
                                                    // }
                                                    
                                                    tbody += `
                                                    <tr data-name="${res.staffs[i].name}" data-id="${res.staffs[i].serialnumber}" data-class="${res.staffs[i].class}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                        <td>${res.staffs[i].name}</td>
                                                        <td>${isValid}</td>
                                                        <td>${presentOnHoliday}</td>
                                                        <td>${isValid2}</td>
                                                        <td>${button}</td>
                                                    </tr>`;

                                                    let p = 0;
                                                    if (presentOnHoliday == 'Worked') {
                                                        p = 1;
                                                    }
                                                    
                                                    if (PAYSCHED == 'twice-monthly') {
                                                        $.ajax({
                                                            type: 'POST',
                                                            url: '../php/add_holidayyy.php',
                                                            data: {
                                                                branch: SELECTED_BRANCH,
                                                                month: MONTH,
                                                                year: YEAR,
                                                                date: date,
                                                                name: holi_name,
                                                                employee: res.staffs[i].name,
                                                                serial: res.staffs[i].serialnumber,
                                                                date_before: isValid,
                                                                present: p,
                                                                class: res.staffs[i].class,
                                                                date_after: isValid2,
                                                                paysched: PAYSCHED,
                                                                from: from,
                                                                to: to
                                                                
                                                            },
                                                            success: function(res){
                                                                console.log(res);
                                                            }
                                                        })
                                                    } else {
                                                        $.ajax({
                                                            type: 'POST',
                                                            url: '../php/add_holidayyy.php',
                                                            data: {
                                                                branch: SELECTED_BRANCH,
                                                                month: MONTH,
                                                                year: YEAR,
                                                                date: date,
                                                                name: holi_name,
                                                                employee: res.staffs[i].name,
                                                                serial: res.staffs[i].serialnumber,
                                                                date_before: isValid,
                                                                present: p,
                                                                class: res.staffs[i].class,
                                                                date_after: isValid2,
                                                                paysched: PAYSCHED
                                                                
                                                            },
                                                            success: function(res){
                                                                console.log(res);
                                                            }
                                                        })
                                                    }
                                                    
                                                }

                                            } catch(err) {

                                            }

                                            const monthName = months[d.getMonth()]; // Get month name based on zero-based index
                                            const day = d.getDate();
                                            const year = d.getFullYear();

                                            let d1 = new Date(d_before);
                                            let d2 = new Date(d_after);
                                            const monthName1 = months[d1.getMonth()]; // Get month name based on zero-based index
                                            const day1 = d1.getDate();
                                            const year1 = d1.getFullYear();

                                            const monthName2 = months[d2.getMonth()]; // Get month name based on zero-based index
                                            const day2 = d2.getDate();
                                            const year2 = d2.getFullYear();

                                            // Format the date as "MonthName day, year"
                                            const formattedDate = `${monthName} ${day}, ${year}`;
                                            const formattedDate1 = `${monthName1} ${day1}, ${year1}`;
                                            const formattedDate2 = `${monthName2} ${day2}, ${year2}`;

                                            

                                            document.body.insertAdjacentHTML("afterbegin", `
                                            <div class="fourth-layer-overlay">
                                                <div class="folo-wrapper pt-5" style="min-width:40vw;position:relative;">
                                                    ${close_icon}
                                                    <p class="text-white text-center" style="font-size:20px;">${formattedDate}<br><span style="font-size:15px;">${holi_name}</span></p>
                                                    
                                                    <hr>
                                                    <div style="display:flex;flex-direction:column;width:25%;margin-bottom:5px;">
                                                        <span style="font-size:15px;color:#fff;">Holiday percentage:</span>
                                                        <input type="number" id="percentage"  placeholder="Enter percentage"/>
                                                    </div>

                                                    <div class="table-container" style="max-height:50vh;overflow:auto;">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <td>Employee</td>
                                                                    <td>${formattedDate1}</td>
                                                                    <td>${formattedDate} (${holi_name})</td>
                                                                    <td>${formattedDate2}</td>
                                                                    <td>Action</td>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                ${tbody}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>`);

                                            $(".approve-holiday").click(function(event){
                                                event.stopImmediatePropagation();

                                                if ($("#percentage").val() === '') {
                                                    errorNotification("Please enter holiday percentage.", "warning");
                                                } else {
                                                    let snum = $(this).parent("td").parent("tr").data("id");
                                                    let _class = $(this).parent("td").parent("tr").data("class");
                                                    let name = $(this).parent("td").parent("tr").data("name");
                                                    $(this).css("background", "orange");
                                                    $(this).html("Approved");
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/fetch_class.php',
                                                        data: {
                                                            class: _class,
                                                        },
                                                        success: function(res) {
                                                            

                                                            try {
                                                                res = JSON.parse(res);
                                                                let rate = parseInt(res.rate);
                                                                let hour_perday = parseInt(res.hour_perday);
                                                                let rate_type = res.rate_type;

                                                                if (rate_type == 'hourly') {
                                                                    rate = rate * hour_perday;
                                                                } else if (rate_type == 'monthly') {
                                                                    rate = rate * 12;
                                                                    rate = rate / 365; //based on 365 days per year factor
                                                                }

                                                                let perc = $("#percentage").val();
                                                                perc = parseFloat(perc);
                                                                let pay = perc * rate;
                                                                pay = parseFloat(pay);

                                                                $.ajax({
                                                                    type: 'POST',
                                                                    url: '../php/update_holiday.php',
                                                                    data: {
                                                                        serial: snum,
                                                                        branch: SELECTED_BRANCH,
                                                                        date: date,
                                                                        month: MONTH,
                                                                        year: YEAR,
                                                                        pay: pay,
                                                                        perc: perc,
                                                                        paysched: PAYSCHED
                                                                    }, success: function(res) {
                                                                        console.log(res);
                                                                    }
                                                                })

                                                                try {
                                                                    // ALLDetails[snum][9]['HOLIDAYS (total)'] = pay;
                                                                    // let earned2 = ALLDetails[snum][11]['EARNED'].value;
                                                                    // earned2 = parseFloat(earned2);
                                                                    // earned2 += pay;
                                                                    // ALLDetails[snum][11]['EARNED'] = {'value' : earned2, 'highlight': '', op: '+'};
                                                                    // let net2 = ALLDetails[snum][24]['NET'].value;
                                                                    // net2 = parseFloat(net2);
                                                                    // net2 += pay;
                                                                    // ALLDetails[snum][24]['NET'] = {'value' : net2, 'highlight': ''};

                                                                    for (let i = 0; i < PAYSLIPS.length; i++) {
                                                                        // if (PAYSLIPS[i][3].name == name) {
                                                                        //     PAYSLIPS[i][15]['name'] = pay;
                                                                        //     let earnings = parseFloat(PAYSLIPS[i][39].name);
                                                                        //     let net = parseFloat(PAYSLIPS[i][43].name);
                                                                        //     earnings += pay;
                                                                        //     net += pay;
                                                                        //     PAYSLIPS[i][39]['name'] = earnings;
                                                                        //     PAYSLIPS[i][43]['name'] = net;
                                                                        // }
                                                                    }

                                                                } catch(err) {
                                                                    console.log(err);
                                                                }

                                                                // if (COMPUTED.length > 0) {
                                                                //     for (let i = 0; i < COMPUTED.length; i++) {
                                                                //         if (COMPUTED[i].serial == snum && COMPUTED[i].date == $("#holiday-date").val()) {
                                                                //             //computed = COMPUTED[i].computed;
                                                                //             COMPUTED.splice(i, 1);
                                                                //         }
                                                                //     }
                                                                //     let obj = {'serial' : snum, 'holidaypay' : pay, 'date' : $("#holiday-date").val()};
                                                                //     COMPUTED.push(obj);
                                                                // } else {
                                                                //     let obj = {'serial' : snum, 'holidaypay' : pay, 'date' : $("#holiday-date").val()};
                                                                //     COMPUTED.push(obj);
                                                                // }
                                                                
                                                                successNotification("Approved.", "success");
                                                            } catch (err) {
                                                                console.log(err);
                                                                errorNotification("Error fetching class.", "danger");
                                                            }

                                                            
                                                        }
                                                    })


                                                    
                                                    
                                                }
                                                


                                            })

                                            $(".close-window").click(function(event){
                                                event.stopImmediatePropagation();
                                                $(".fourth-layer-overlay").remove();
                                            })
                                        }
                                    })
                                })

                                $(".close-window").click(function(event){
                                    event.stopImmediatePropagation();
                                    $(".fourth-layer-overlay").remove();
                                })
                            }
                        }
                    })
                    // document.body.insertAdjacentHTML("afterbegin", `
                    // <div class="fourth-layer-overlay">
                    //     <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                    //         ${close_icon}
                    //         <p class="text-white text-center" style="font-size:20px;">ADD HOLIDAY</p>
                    //         <hr>
                    //         <div style="color:#fff;display:flex;flex-direction:column;">
                    //         <span>ENTER PERCENTAGE:</span>
                    //         <input type="text" placeholder="Enter percentage" id="percentage">
                    //         <br>
                    //         <input type="button" value="ADD HOLIDAY"/>
                    //         </div>
                    //     </div>
                    // </div>`);

                    

                    
                })
    
                $(".add-holiday").on("click", function(event){
                    event.stopImmediatePropagation();
    
                    let ops = "";
    
                    $.ajax({
                        type: 'POST',
                        url: '../php/fetchHolidays.php',
                        success: function(res){
                            
                            try {
                                res = JSON.parse(res);
                                
                                for (let i = 0; i < res.length; i++) {
                                    ops += `
                                    <option value="${res[i].id}|${res[i].class}">${res[i].holiday_name}</option>
                                    `;
                                }
    
                            } catch(err) {
                                console.log(err);
                            }
    
                            document.body.insertAdjacentHTML("afterbegin", `
                                <div class="third-layer-overlay">
                                    <div class="tlo-wrapper pt-5" style="position:relative;">
                                        ${close_icon}
                                        <p class="text-white text-center" style="font-size:20px;">ADD HOLIDAY</p>
                                        <hr>
                                        <form id="addHolidayForm">
                                            <span>SELECT HOLIDAY</span>
                                            <select name="holiday">
                                                <option value="">Select holiday</option>
                                                ${ops}
                                            </select>
                                            <span>SELECT DATE</span>
                                            <input type="date" name="date"/>
                                            <br>
                                            <input type="submit" value="ADD HOLIDAY"/>
                                        </form>
                                    </div>
                                </div>
                            `);
    
                            $("input[type='submit']").click(function(event){
                                event.preventDefault();
                                let data = new FormData(document.getElementById("addHolidayForm"));
                                var formDataObject = {};
                                let isNotEmpty = true;
                                data.forEach(function(value, key){

                                    if (data.getAll(key).length > 1) {
                                        formDataObject[key] = data.getAll(key);
                                    } else {
                                        formDataObject[key] = value;
                                    }
    
                                    if (value === '') {
                                        isNotEmpty = false;
                                    }
                                });

                                let val = formDataObject.holiday.split("|");
                                formDataObject['holiday'] = val[0];
                                formDataObject['class'] = val[1];
    
                                if (!isNotEmpty) {
                                    errorNotification("Fields must be filled out.", "warning");
                                } else {
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/add_holidaypay.php',
                                        data: {
                                            holiday: formDataObject.holiday,
                                            class: formDataObject.class,
                                            date: formDataObject.date,
                                        }, success: function(res){
    
                                            if (res.includes('success')) {
                                                successNotification("Holiday added.", "success");
                                                $(".third-layer-overlay").remove();
                                            }
                                        }
                                    })
                                }
                            })
    
    
                            $(".close-window").click(function(){
                                $(".third-layer-overlay").remove();
                            })
                        }
                    })
                })
    
                $(".compute-salary").on("click", function(event){
                    event.stopImmediatePropagation();
                    let id = $(this).data("id");
    
                    
                    if ($(`#cal${id}`).val() === '') {
                        errorNotification("Please enter working days.", "warning");
                    }
    
                    else {
                        computeSalary(id);
                        //$(this).remove();
                        $(`.payslip${id}`).css("display", "inline");
                    }
                })
    
                $(".view-details").on("click", function(event){
                    event.stopImmediatePropagation();
    
                    let id = $(this).data("id");
                    console.log(id);
                    let name = $(this).data("name");
                    let position = $(this).data("position");
                    let CLASS = $(this).data("class");
                    let class_name = CLASSES[CLASS];
    
                    let content = "";
    
                    let reportArr = [];
                    reportArr.push(name);
                    reportArr.push(id);
                    reportArr.push(CLASS);
                    reportArr.push(class_name);
                
                    for (let i = 0; i < ALLDetails[id].length; i++) {
                        for (let key in ALLDetails[id][i]) {
                            let NAME = key;
                            if (ALLDetails[id][i].hasOwnProperty(key)) {
                                let value = ALLDetails[id][i][key];
                                
                                try {
                                    if (ALLDetails[id][i][key].hasOwnProperty('value')) {
    
                                        try {
                                            value = ALLDetails[id][i][key].value.toLocaleString();
                                        } catch (err) {
                                            value = ALLDetails[id][i][key].value;
                                        }
                                    }
    
                                    if (ALLDetails[id][i][key].hasOwnProperty('highlight')) {
                                        if (ALLDetails[id][i][key].hasOwnProperty('op')) {
                                            content += `
                                            <tr style="background:rgba(255,255,255,0.2);color: #000;border-bottom:1px solid rgba(0,0,0,0.1);">
                                                <td>${NAME}</td>
                                                <td>${ALLDetails[id][i][key].op} ${value}</td>
                                            </tr>`;
                                        } else {
                                            content += `
                                            <tr style="background:rgba(255,255,255,0.2);color: #000;border-bottom:1px solid rgba(0,0,0,0.1);">
                                                <td>${NAME}</td>
                                                <td>${value}</td>
                                            </tr>`;
                                        }
                                        
    
                                    } else {
                                        if (ALLDetails[id][i][key].hasOwnProperty('op')) {
                                            content += `
                                            <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                <td>${NAME}</td>
                                                <td>${ALLDetails[id][i][key].op} ${value}</td>
                                            </tr>`;
                                        } else {
                                            content += `
                                            <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                <td>${NAME}</td>
                                                <td>${value}</td>
                                            </tr>`;
                                        }
                                    } 
    
                                } catch(err) {
                                    console.log(err);
                                }
    
                                reportArr.push(value);
                                
                            }
                        }
                    }
                    
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="third-layer-overlay">
                        <div class="tlo-wrapper pt-5" style="position:relative;">
                            ${close_icon}
                            <p class="text-white text-center" style="font-size:20px;">${name}</p>
                            <hr>
                            <div class="table-container" style="max-height:40vh;overflow:auto;max-width:60vw;min-width:30vw;border-bottom:1px solid rgba(0,0,0,0.1);">
                                <table>
                                    <thead>
                                        <tr>
                                            <td>NAME</td>
                                            <td>VALUE</td>
                                        </tr>
                                    </thead>
                                    <tbody id="tbody">
                                        ${content}
                                    </tbody>
                                </table>
                            </div>
                            <br>
                            <br>
                        </div>
                    </div>`);

                    // <div style="text-align:center;">
                    //     <input type="button" data-details='{"name":"${reportArr[0]}", "serial":"${reportArr[1]}", "class": "${reportArr[2]}", "class_name":"${reportArr[3]}", "rate": "${reportArr[4]}", "rate_type": "${reportArr[5]}", "working_days": "${reportArr[6]}", "days_worked": "${reportArr[7]}", "salary_rate": "${reportArr[8]}", "absent":"${reportArr[9]}", "basic": "${reportArr[10]}", "ut_total": "${reportArr[11]}", "tardiness" : "${reportArr[12]}", "holiday": "${reportArr[13]}", "ot_total" : "${reportArr[14]}", "earnings" : "${reportArr[15]}", "sss" : "${reportArr[16]}", "phil" : "${reportArr[17]}", "pbig": "${reportArr[18]}", "adjustment": "${reportArr[19]}", "cash_advance": "${reportArr[20]}", "charges" : "${reportArr[21]}", "sss_loan": "${reportArr[22]}", "pbig_loan": "${reportArr[23]}", "company_loan" : "${reportArr[24]}", "total_deductions": "${reportArr[25]}", "allowance": "${reportArr[26]}", "allowance_penalty": "${reportArr[27]}", "net": "${reportArr[28]}" }' style="width:80%;background:var(--teal);color:#fff !important;" class="paid" value="PAID"/>
                    // </div>
    
                    $(".paid").click(function(event){
                        event.stopImmediatePropagation();
    
                        let details = $(this).data("details");

                        details.salary_rate = details.salary_rate.replace(/,/g, '');
                        details.basic = details.basic.replace(/,/g, '');
                        details.holiday = details.holiday.replace(/,/g, '');
                        details.earnings = details.earnings.replace(/,/g, '');
                        details.allowance = details.allowance.replace(/,/g, '');
                        details.total_deductions = details.total_deductions.replace(/,/g, '');
                        details.net = details.net.replace(/,/g, '');
                        
                        if (PAYSCHED != null || PAYSCHED !== 'undefined') {
                            let d;
                        
                            if (PAYSCHED == 'twice-monthly') {
                                d = new Date(from);
                                
                            } else if (PAYSCHED == 'monthly') {
                                d = new Date();
                            }

                            let mon = months[d.getMonth()];
                            let year = d.getFullYear();

                            if (PAYSCHED == 'twice-monthly') {
                                $.ajax({
                                    type: 'POST',
                                    url: '../php/determine_period.php',
                                    data : {
                                        id: id,
                                    },
                                    success: function(res) {
                                        var period = res;

                                        $.ajax({
                                            type: 'POST',
                                            url: '../php/employee_paid.php',
                                            data: {
                                                id: id,
                                                name: details.name,
                                                class: details.class,
                                                class_name: details.class_name,
                                                rate: details.rate,
                                                rate_type: details.rate_type,
                                                working_days: details.working_days,
                                                days_worked: details.days_worked,
                                                salary_rate: details.salary_rate,
                                                absent: details.absent,
                                                basic: details.basic,
                                                ut_total: details.ut_total,
                                                tardiness: details.tardiness,
                                                holiday: details.holiday,
                                                ot_total: details.ot_total,
                                                earnings: details.earnings,
                                                sss: details.sss,
                                                phil: details.phil,
                                                pbig: details.pbig,
                                                adjustment: details.adjustment,
                                                cash_advance: details.cash_advance,
                                                charges: details.charges,
                                                sss_loan: details.sss_loan,
                                                pbig_loan: details.pbig_loan,
                                                company_loan: details.company_loan,
                                                total_deductions: details.total_deductions,
                                                allowance: details.allowance,
                                                allowance_penalty: details.allowance_penalty,
                                                net: details.net,
                                                month: mon,
                                                year: year,
                                                paysched: PAYSCHED,
                                                period: period,
                                                from: from,
                                                to: to
                                            },

                                            success: function(res) {
                                                console.log(res);
                                                if (res == 'paid') {
                                                    successNotification(`${name} is paid.`, "success");
                                                    $(`#paid${id}`).html("Paid");
                                                    $(".third-layer-overlay").remove();
                                                } 
                                            }
                                        })
                                    }
                                })
                            } else {
                                $.ajax({
                                    type: 'POST',
                                    url: '../php/employee_paid.php',
                                    data: {
                                        id: id,
                                        name: details.name,
                                        class: details.class,
                                        class_name: details.class_name,
                                        rate: details.rate,
                                        rate_type: details.rate_type,
                                        working_days: details.working_days,
                                        days_worked: details.days_worked,
                                        salary_rate: details.salary_rate,
                                        absent: details.absent,
                                        basic: details.basic,
                                        ut_total: details.ut_total,
                                        tardiness: details.tardiness,
                                        holiday: details.holiday,
                                        ot_total: details.ot_total,
                                        earnings: details.earnings,
                                        sss: details.sss,
                                        phil: details.phil,
                                        pbig: details.pbig,
                                        adjustment: details.adjustment,
                                        cash_advance: details.cash_advance,
                                        charges: details.charges,
                                        sss_loan: details.sss_loan,
                                        pbig_loan: details.pbig_loan,
                                        company_loan: details.company_loan,
                                        total_deductions: details.total_deductions,
                                        allowance: details.allowance,
                                        allowance_penalty: details.allowance_penalty,
                                        net: details.net,
                                        month: mon,
                                        year: year,
                                        paysched: PAYSCHED,
                                        period: '',
                                        from: '',
                                        to: ''
                                    },
                                    success: function(res) {
    
                                        if (res == 'paid') {
                                            successNotification(`${name} is paid.`, "success");
                                            $(`#paid${id}`).html("Paid");
                                            $(".third-layer-overlay").remove();
                                        } 
                                    }
                                })
                            }
                        }
                    })
    
                    $(".close-window").on("click", function(event){
                        event.stopImmediatePropagation();
                        $(".third-layer-overlay").remove();
                    })

                })
    
                $(".close-window").on("click", function(event){
                    event.stopImmediatePropagation();
                    ALLDetails = [];
                    PAYSLIPS = [];
                    try {
                        document.getElementById("pages").innerHTML = "";
                    } catch (err) {
                        console.log(err);
                    }

                    $(".pop-up-window").remove();

                    $.ajax({
                        type: 'POST',
                        url: '../php/remove_holidays.php',
                        success: function(res) {}
                    })
                })
            }
        }
    )
    
}

function confirmation_window(title, btn, continueCallback, cancelCallback) {
    document.body.insertAdjacentHTML("afterbegin", `
    <div class="confirmation-overlay">
        <div class="con-wrapper" style="min-width:25vw;">
            <p class="text-center text-white" style="font-size:20px">${title}</p>
            <hr>
            <div class="btns">
                <button id="continue" style="background:var(--teal);">${btn}</button>
                <button id="cancel"  style="background:var(--teal);">CANCEL</button>
            </div>
        </div>
    </div>`);

    $("#continue").click(function(event){
        event.stopImmediatePropagation();
        continueCallback();

    })

    $("#cancel").click(function(event){
        event.stopImmediatePropagation();
        cancelCallback();

    })
}

function delete_file(title, btn, col1, col2, x, branch, f) {

    confirmation_window(title, btn, function() {
        if (PAYSCHED == 'twice-monthly') {
            col1 = "0" + col1;
        }

        $.ajax({
            type: 'POST',
            url: '../php/delete_payroll_file.php',
            data: {
                paysched: PAYSCHED,
                col1: col1,
                col2: col2,
                branch: branch
            },
            success: function(res) {
                console.log(res);
                if (res == 'deleted') {
                    $(`.file${x}`).remove();
                    successNotification('File deleted.', 'success');

                    $.ajax({
                        type: 'POST',
                        url: '../php/add_log.php',
                        data: {
                            log: `Deleted file ${f}.`,
                            branch: SELECTED_BRANCH,
                            user: current_user

                        },success: function(log_res) {
                            console.log(log_res);
                        }
                    })
                }
            }
        })

        

        $(".confirmation-overlay").remove();
    }, function() {
        //cancelled
        $(".confirmation-overlay").remove();
    })
}


$(".payroll").on("click", function(event){
    event.stopImmediatePropagation();

    $.ajax({
        type: 'POST',
        url: '../php/files_history.php',
        data : {
            paysched: PAYSCHED,
        },
        success: function(res) {
 
            try {
                res = JSON.parse(res);
   
                let file = "";
                for (let i = 0; i < res.length; i++) {
                    if (PAYSCHED == 'twice-monthly') {  

                        let recent = "";
                        if (i == 0) {
                            recent += `<div style="position:absolute;top:7px;left:7px;font-size:12px;color:#fff;">Recent</div>`;
                        }

                        let year = "";
                        year += `<div style="position:absolute;bottom:7px;left:7px;font-size:15px;color:#fff;">${res[i].from_date.split("-")[0]}</div>`;

                        let monthIndex = parseInt(res[i].from_date.split("-")[1]) - 1;
                        let mon = months[monthIndex];

                        file += `
                        <div class="file file${i}" style="position:relative;" data-col1="${res[i].from_date}" data-col2="${res[i].to_date}" data-branch="${res[i].branch}">
                            ${recent}
                            ${year}
                            <div class="menu">
                                <svg class="dropdown-toggle" id="svgdropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                </svg>
                                <div class="dropdown-menu" aria-labelledby="svgdropdown">
                                    <a class="dropdown-item" onclick="this.parentNode.parentNode.parentNode.click();">Open file</a>
                                    <a class="dropdown-item" onclick=" delete_file('DELETE PAYROLL FILE', 'CONFIRM', '${res[i].from_date}', '${res[i].to_date}', '${i}', '${res[i].branch}', '${mon} ${res[i].from_date.split("-")[2]}-${res[i].to_date.split("-")[2]}, ${res[i].from_date.split("-")[0]}')">Delete file</a>
                                </div>
                            </div>
                            <div style="position:absolute;top:60%;transform:translateY(-60%);width:calc(100% - 10px);">
                                <p class="text-white text-center" style="font-size:17px;">${mon} ${res[i].from_date.split("-")[2]}-${res[i].to_date.split("-")[2]}</p>
                            </div>
                        </div>`;

                    } else {

                        if (PAYSCHED == 'monthly') {
                            let recent = "";
                            if (i == 0) {
                                recent += `<div style="position:absolute;top:7px;left:7px;font-size:12px;color:#fff;">Recent</div>`;
                            }

                            file += `
                            <div class="file file${i}" style="position:relative;" data-col1="${res[i].month}" data-col2="${res[i].year}" data-branch="${res[i].branch}">
                                ${recent}
                                <div class="menu">
                                    <svg class="dropdown-toggle" id="svgdropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                    </svg>
                                    <div class="dropdown-menu" aria-labelledby="svgdropdown">
                                        <a class="dropdown-item" onclick="this.parentNode.parentNode.parentNode.click();">Open file</a>
                                        <a class="dropdown-item" onclick="delete_file('DELETE PAYROLL FILE', 'CONFIRM', '${res[i].month}', '${res[i].year}', '${i}', '${res[i].branch}', '${months[parseInt(res[i].month) - 1]} ${res[i].year}')">Delete file</a>
                                    </div>
                                </div>
                                <div style="position:absolute;top:50%;transform:translateY(-50%);width:calc(100% - 10px);">
                                    <p class="text-white text-center" style="font-size:17px;">${months[parseInt(res[i].month) - 1]} ${res[i].year}</p>
                                </div>
                            </div>`;
                        }

                    }
                }
                
                document.body.insertAdjacentHTML("afterbegin", `
                <div class="pop-up-window">
                    <div class="window-content pt-5" style="position:relative;min-width:35vw;">
                        ${close_icon}
                        <p class="text-center text-white" style="font-size:20px;">PAYROLL FILES HISTORY</p>
                        <hr>
                        <div class="payroll-files-container">
                            ${file}
                        </div>
                        <hr>
                        <button class="action-button generate-new">Create new file</button>
                    </div>
                </div>`);

                $(".menu").click(function(event){
                    event.stopImmediatePropagation();
                    var dropdownMenu = this.querySelector('.dropdown-menu');
                    if (!dropdownMenu.classList.contains('show')) {
                        dropdownMenu.classList.add('show');
                    } else {
                        dropdownMenu.classList.remove('show');
                    }
                })

                $(".file").click(function(event){
                    event.stopImmediatePropagation();



                    if (PAYSCHED == 'twice-monthly') {
                        from = $(this).data("col1");
                        to = $(this).data("col2");
                        
                    } else if (PAYSCHED == 'monthly') {
                        MON = `${$(this).data("col2")}-${$(this).data("col1")}`;
                    }

                    SELECTED_BRANCH = $(this).data("branch");


                    $.ajax({
                        type: 'POST',
                        url: '../php/fetch_file.php',
                        data: {
                            paysched: PAYSCHED,
                            branch: SELECTED_BRANCH,
                            col1: $(this).data("col1"),
                            col2: $(this).data("col2")

                        },success: function(res) {
                            try {
                                res = JSON.parse(res);

                                var content = "";
                                $(".pop-up-window").remove();

                                let x = 0;
                                for (let i = 0; i < res.length; i++) {
                                    PERIOD = res[i].period;

                                    MONTH = res[i].month;
                                    YEAR = res[i].year;

                                    // if (parseFloat(res[i].holiday) > 0) {
                                    //     let obj = {'serial' : res[i].serialnumber, 'holidaypay': res[i].holiday, 'date' : ''};
                                    //     COMPUTED.push(obj);
                                    // }

                                    PAYSLIP.push({'name' : COMPANY_NAME, 'row': '1', 'col': '1', 'span' : '4', 'align': 'center', 'bold' : true, 'size' : '20'})

                                    if (PAYSCHED == 'twice-monthly') {
                                        let d = new Date(res[i].from_date);
                                        let d2 = new Date(res[i].to_date);
                                        let m = months[d.getMonth()];
                                        let day = d.getDate();
                                        let day_2 = d2.getDate();
                                        let year = d.getFullYear();

                                        PAYSLIP.push({'name' : `${m} ${day}-${day_2}, ${year}`, 'row': '2', 'col': '3', 'span': '2', 'align': 'right'});

                                        

                                    } else if (PAYSCHED == 'monthly') {
                                        
                                        let year = res[i].year;
                                        let month = res[i].month;
                                        // Create a Date object
                                        let date = new Date(year, month - 1); // Month is 0-based in JavaScript

                                        // Format the date as "MMM YYYY"
                                        let formattedDate = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                                        PAYSLIP.push({'name' : `${formattedDate}`, 'row': '2', 'col': '3', 'span': '2', 'align': 'right'})
                                    }

                                    PAYSLIP.push({'name' : 'Name:', 'row': '3', 'col': '1'})
                                    PAYSLIP.push({'name' : res[i].name, 'row': '3', 'col': '2', 'span': '3', 'align': 'left'})
                                    PAYSLIP.push({'name' : 'COMPENSATIONS', 'row': '5', 'col': '1', 'span' : '2', 'align': 'center', 'bold' : true})
                                    PAYSLIP.push({'name' : 'DEDUCTIONS', 'row': '5', 'col': '2', 'span' : '2', 'align': 'center', 'bold' : true})
                                    PAYSLIP.push({'name' : 'Basic', 'row': '6', 'col': '1'})
                                    PAYSLIP.push({'name' : res[i].basic, 'row': '6', 'col': '2'})
                                    PAYSLIP.push({'name' : "Absent", 'row': '7', 'col': '1'})
                                    PAYSLIP.push({'name' : res[i].absent, 'row': '7', 'col': '2'})         
                                    PAYSLIP.push({'name' : "Undertime", 'row': '8', 'col': '1'})
                                    PAYSLIP.push({'name' : res[i].ut_total, 'row': '8', 'col': '2'})
                                    PAYSLIP.push({'name' : "Tardiness", 'row': '9', 'col': '1'})
                                    PAYSLIP.push({'name' : res[i].tardiness, 'row': '9', 'col': '2'})
                                    PAYSLIP.push({'name' : "Holiday", 'row': '10', 'col': '1'})
                                    PAYSLIP.push({'name' : res[i].holiday, 'row': '10', 'col': '2'})
                                    PAYSLIP.push({'name' : "Overtime", 'row': '11', 'col': '1'})
                                    PAYSLIP.push({'name' : res[i].ot_total, 'row': '11', 'col': '2'})
                                    PAYSLIP.push({'name' : "SSS", 'row': '6', 'col': '3'})
                                    PAYSLIP.push({'name' : res[i].sss, 'row': '6', 'col': '4'})
                                    PAYSLIP.push({'name' : "PhilHealth", 'row': '7', 'col': '3'})
                                    PAYSLIP.push({'name' : res[i].phil, 'row': '7', 'col': '4'})
                                    PAYSLIP.push({'name' : "Pag-IBIG", 'row': '8', 'col': '3'})
                                    PAYSLIP.push({'name' : res[i].pbig, 'row': '8', 'col': '4'})
                                    PAYSLIP.push({'name' : "Adjustment", 'row': '9', 'col': '3'})
                                    PAYSLIP.push({'name' : res[i].adjustment, 'row': '9', 'col': '4'})
                                    PAYSLIP.push({'name' : "Cash Advance", 'row': '10', 'col': '3'})
                                    PAYSLIP.push({'name' : res[i].cash_advance, 'row': '10', 'col': '4'})
                                    PAYSLIP.push({'name' : "Charges", 'row': '11', 'col': '3'})
                                    PAYSLIP.push({'name' : res[i].charges, 'row': '11', 'col': '4'})
                                    PAYSLIP.push({'name' : "SSS Loan", 'row': '12', 'col': '3'})
                                    PAYSLIP.push({'name' : res[i].sss_loan, 'row': '12', 'col': '4'})
                                    PAYSLIP.push({'name' : "Pag-IBIG Loan", 'row': '13', 'col': '3'})
                                    PAYSLIP.push({'name' : res[i].pbig_loan, 'row': '13', 'col': '4'})
                                    PAYSLIP.push({'name' : "Company Loan", 'row': '14', 'col': '3'})
                                    PAYSLIP.push({'name' : res[i].company_loan, 'row': '14', 'col': '4'})
                                    PAYSLIP.push({'name' : "Total Deductions", 'row': '15', 'col': '3', 'bold' : true})
                                    PAYSLIP.push({'name' : res[i].total_deductions, 'row': '15', 'col': '4', 'bold' : true})
                                    PAYSLIP.push({'name' : "Total Earnings", 'row': '15', 'col': '1', 'bold' : true})
                                    PAYSLIP.push({'name' : res[i].earnings, 'row': '15', 'col': '2', 'bold' : true})
                                    PAYSLIP.push({'name' : "Allowance", 'row': '16', 'col': '1', 'bold' : true})
                                    PAYSLIP.push({'name' : res[i].allowance, 'row': '16', 'col': '2', 'bold' : true})
                                    PAYSLIP.push({'name' : "Net Earnings", 'row': '17', 'col': '1', 'span' : '3', 'align' : 'right', 'bold' : true, 'margin' : '15px'})
                                    PAYSLIP.push({'name' : res[i].net, 'row': '17', 'col': '2', 'bold' : true})

                                    PAYSLIP.push({'name' : "Signature", 'row': '18', 'col': '1', 'span' : '2', 'align' : 'center', 'border':'2px solid rgba(0,0,0,.6)'})

                                    PAYSLIPS.push(PAYSLIP);
                                    PAYSLIP = [];
                                    details = [];
                                                                                                        
                                    details.push({"RATE" : res[i].rate});
                                    details.push({"RATE TYPE" : res[i].rate_type});
                                    details.push({"WORKING DAYS" : res[i].working_days});
                                    details.push({"DAYS WORKED" : res[i].days_worked});
                                    details.push({"SALARY RATE" : res[i].salary_rate});
                                    details.push({"ABSENT (total)" : {"value" : res[i].absent, "op" : "-"}});
                                    details.push({"BASIC" : res[i].basic});
                                    
                                    details.push({"UNDERTIME (total)" : {"value" : res[i].ut_total, "op" : "-"}});
                                    details.push({"TARDINESS (total)" : {"value" : res[i].tardiness, "op" : "-"}});
                                    details.push({"HOLIDAYS (total)" : {"value" : res[i].holiday, "op" : "+"}});

                                    details.push({"OVERTIME (total)" : {"value" : res[i].ot_total, "op" : "+"}});

                                    details.push({"EARNED" : {"value" : res[i].earnings, "highlight" : "", "op" : "+"}});
                                    details.push({"SSS" : {"value" : res[i].sss, "op" : "-"}});
                                    details.push({"PHILHEALTH" : {"value" : res[i].phil, "op" : "-"}});
                                    details.push({"PAG-IBIG" : {"value" : res[i].pbig, "op" : "-"}});
                                    details.push({"ADJUSTMENT" : {"value" : res[i].adjustment, "op" : "-"}});

                                    details.push({"CASH ADVANCE" :{"value" : res[i].cash_advance, "op" : "-"}});
                                    details.push({"CHARGES" : {"value" : res[i].charges, "op" : "-"}});
                                    details.push({"SSS LOAN" : {"value" : res[i].sss_loan, "op" : "-"}});
                                    details.push({"PAG-IBIG LOAN" :{"value" : res[i].pbig_loan, "op" : "-"}});
                                    details.push({"COMPANY LOAN" : {"value" : res[i].company_loan, "op" : "-"}});
                                    details.push({"TOTAL DEDUCTIONS" : {"value" : res[i].total_deductions, "highlight" : "", "op" : "-"}});
                                    details.push({"ALLOWANCE (total)" : {"value" : res[i].allowance, "op" : "+"}});
                                    details.push({"ALLOWANCE PENALTY" : {"value" : res[i].allowance_penalty, "op" : "-"}});
                                    details.push({"NET" : {"value" : res[i].net, "highlight" : ""}});

                                    ALLDetails[res[i].serialnumber] = details;

                                    D[`d${res[i].serialnumber}`] = {'sss' : res[i].sss, 'phil' : res[i].phil, 'pbig' : res[i].pbig};
                                    deductions[`deduc${res[i].serialnumber}`] = {'sss' : res[i].sss, 'phil' : res[i].phil, 'pbig' : res[i].pbig};


                                    x += 1;

                                    let sss, phil, pbig = "";
                                    if (parseFloat(res[i].sss) > 0) {
                                        sss = "checked";
                                    }
                                    if (parseFloat(res[i].phil) > 0) {
                                        phil = "checked";
                                    }
                                    if (parseFloat(res[i].pbig) > 0) {
                                        pbig = "checked";
                                    }
                                    //computeSalary(res[i].serialnumber);
                                    content += `
                                    <tr id="trow${res[i].serialnumber}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>${res[i].name}</td>
                                        <td><input type="number" readonly id="cal${res[i].serialnumber}" value="${res[i].working_days}" style="margin-bottom:-1px;background:rgba(255,255,255,0.5) !important;" placeholder="Enter calendar working days"/></td>
                                        <td id="gross-pay${res[i].serialnumber}">${res[i].earnings}</td>
                                        <td>
                                            <label class="switch" data-s="${res[i].serialnumber}" style="margin-bottom:-20px">
                                                <input id="sss-cbbox" type="checkbox" class="disabled" ${sss}>
                                                <span class="slider round"></span>
                                            </label>
                                        </td>
                                        <td>
                                            <label class="switch" data-s="${res[i].serialnumber}" style="margin-bottom:-20px">
                                                <input id="phil-cbox" type="checkbox" class="disabled" ${phil}>
                                                <span class="slider round"></span>
                                            </label>
                                        </td>
                                        <td>
                                            <label class="switch" data-s="${res[i].serialnumber}" style="margin-bottom:-20px">
                                                <input id="pbig-cbox" type="checkbox" class="disabled" ${pbig}>
                                                <span class="slider round"></span>
                                            </label>
                                        </td>
                                        <td id="net-pay${res[i].serialnumber}">${res[i].net}</td>
                                        <td>
                                        <button class="action-button mr-1 payslip${res[i].serialnumber} view-details" data-class="${res[i].class}" data-id="${res[i].serialnumber}" data-name="${res[i].name}" style="background:orange !important;display:none;" >DETAILS</button>
                                        <button class="action-button mr-1 compute-salary" data-id="${res[i].serialnumber}" disabled style="background:rgba(32, 201, 151, .5) !important;">COMPUTE</button>
                                        <button class="action-button trail mr-1" data-id="${res[i].serialnumber}" disabled style="background:rgba(32, 201, 151, .5) !important;">TRAIL</button>
                                    </tr>`;
                                }

                                let txt = "";
                                if (PAYSCHED != null || PAYSCHED !== 'undefined') { 
                                    if (PAYSCHED == 'twice-monthly') {
                                        let newdate = new Date(from);
                                        let newdate2 = new Date(to);
                                        let _mon = months[newdate.getMonth()];
                                        let _d1 = newdate.getDate();
                                        let _d2 = newdate2.getDate();
                                        let _year = newdate.getFullYear();
                                        txt += `${_mon} ${_d1}-${_d2}, ${_year}`;
                                        
                                    } else {
                                        txt = `${formatDate(MON)}`;
                                    }
                                }

                                $.ajax({
                                    type: 'POST',
                                    url: '../php/add_log.php',
                                    data: {
                                        log: `Opened file ${txt}.`,
                                        branch: SELECTED_BRANCH,
                                        user: current_user

                                    },success: function(log_res) {
                                        console.log(log_res);
                                    }
                                })

                                function formatDate(inputDate) {
                                    // Split the inputDate into year and month parts
                                    const [year, month] = inputDate.split('-');
                                
                                    // Convert month from numeric string to integer
                                    const monthNumber = parseInt(month, 10);
                                
                                    // Create a Date object with the year and month
                                    const date = new Date(year, monthNumber - 1);
                                
                                    // Get the month name in abbreviated form (e.g., 'Apr')
                                    const monthName = date.toLocaleString('default', { month: 'short' });
                                
                                    // Format the result as 'MMM YYYY'
                                    return `${monthName} ${year}`;
                                }

                                let br;
                                for (let k = 0; k < BRANCH.length; k++) {
                                    if (BRANCH[k].machine_id == SELECTED_BRANCH) {
                                        br = BRANCH[k].branch_name;
                                    }
                                }

                                document.body.insertAdjacentHTML("afterbegin", `
                                <div class="pop-up-window">
                                    <div class="window-content pt-5" style="position:relative;">
                                        ${close_icon}
                                        <p class="text-center text-white" style="font-size:20px;">PAYROLL (${txt})<br><span style="font-size:15px;">${br}</span></p>
                                        <div class="payroll-header-buttons" style="display:flex;justify-content:space-between;align-items:end;"><div style="color:#fff;display:flex;"><button class="action-button add-holiday2 mr-2" disabled style="background:rgba(32, 201, 151, .5) !important;">ADD HOLIDAY</button></div>
                                        <div style="display:flex;flex-direction:column;color:#fff;align-items:center;"><span id="available-payslip">Available: 0</span><button class="action-button generate-payslip">GENERATE PAYSLIP</button></div>
                                        </div>
                                        <hr>
                                        <div class="text-white mb-2" style="margin-top:-10px;">Employees: <span class="text-center">${res.length}</span></div>
                                        <div class="table-container" style="max-height:60vh;overflow:auto;max-width:70vw;min-width:50vw;">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <td>NAME OF EMPLOYEE</td>
                                                        <td style="display:flex;align-items:center;">WORKING DAYS &nbsp; 
                                                            <svg class="add-working-days disabled"style="cursor:pointer;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square-fill" viewBox="0 0 16 16">
                                                            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm6.5 4.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0"/>
                                                            </svg>
                                                        </td>
                                                        <td>EARNED</td>
                                                        <td>SSS</td>
                                                        <td>PHILHEALTH</td>
                                                        <td>PAG-IBIG</td>
                                                        <td>NET PAY</td>
                                                        <td>ACTION</td>
                                                    </tr>
                                                </thead>
                                                <tbody id="tbody">
                                                    ${content}
                                                </tbody>
                                            </table>
                                        </div>
                                        <br>
                                        
                                        <div style="display:flex;justify-content:space-between;">
                                            <button class="action-button enable-editing">ENABLE</button>
                                            <button class="action-button print-payroll-document">PRINT DOCUMENT</button>
                                        </div>
                                    </div>
                                </div>`);

                                $(".enable-editing").click(function(event){
                                    event.stopImmediatePropagation();

                                    $(this).css("background", "orange");
                                    
                                    $("button").prop('disabled', false);
                                    
                                    $("input[type='checkbox']").removeClass("disabled");
                                    
                                    $("input[type='number']").removeAttr("readonly");
                                    $("input[type='number']").css("background", "rgba(255,255,255,1)");
                                    $("button").css("background", "rgba(32, 201, 151, 1)");
                                    
                                    $(".add-working-days").removeClass("disabled");

                                })
                                
                                $(".print-payroll-document").click(function(event){
                                    event.stopImmediatePropagation();

                                    $(".payroll-document").remove();
                                    $(".pages").remove();
                                    $(".employee-trail-document").remove();

                                    let tbody_content = "";
                                    let total_net = 0;
                                    for (let i = 0; i < ALLDetails.length; i++) {
                                        if (typeof ALLDetails[i] === 'object') {
                                            let name;
                                            for (let j = 0; j < res.length; j++) {
                                                if (parseInt(res[j].serialnumber) == i) {
                                                    name = res[j].name;
                                                    break;
                                                }
                                            }

                                            tbody_content += `
                                            <tr>
                                                <td>${name}</td>
                                                <td>${ALLDetails[i][4]['SALARY RATE']}</td>
                                                <td>${ALLDetails[i][5]['ABSENT (total)'].value}</td>
                                                <td>${ALLDetails[i][7]['UNDERTIME (total)'].value}</td>
                                                <td>${ALLDetails[i][8]['TARDINESS (total)'].value}</td>
                                                <td>${ALLDetails[i][6]['BASIC']}</td>
                                                <td>${ALLDetails[i][9]['HOLIDAYS (total)'].value}</td>
                                                <td>${ALLDetails[i][10]['OVERTIME (total)'].value}</td>
                                                <td>${ALLDetails[i][11]['EARNED'].value}</td>
                                                <td>${ALLDetails[i][12]['SSS'].value}</td>
                                                <td>${ALLDetails[i][13]['PHILHEALTH'].value}</td>
                                                <td>${ALLDetails[i][14]['PAG-IBIG'].value}</td>
                                                <td>${ALLDetails[i][15]['ADJUSTMENT'].value}</td>
                                                <td>${ALLDetails[i][16]['CASH ADVANCE'].value}</td>
                                                <td>${ALLDetails[i][17]['CHARGES'].value}</td>
                                                <td>${ALLDetails[i][18]['SSS LOAN'].value}</td>
                                                <td>${ALLDetails[i][19]['PAG-IBIG LOAN'].value}</td>
                                                <td>${ALLDetails[i][20]['COMPANY LOAN'].value}</td>
                                                <td>${ALLDetails[i][21]['TOTAL DEDUCTIONS'].value}</td>
                                                <td>${ALLDetails[i][22]['ALLOWANCE (total)'].value}</td>
                                                <td>${ALLDetails[i][24]['NET'].value}</td>
                                            </tr>`;
                                            
                                            let net = ALLDetails[i][24]['NET'].value
                                            net = net.replace(/,/g, '');
                                            net = parseFloat(net);
                                            total_net += net;
                                        }
                                        
                                    }

                                    tbody_content += `
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>${total_net.toFixed(2)}</td>
                                    </tr>`;

                                    document.body.insertAdjacentHTML("afterbegin",`
                                    <div class="payroll-document" style="display:none;margin-top:100px;">
                                        <h5 class="text-center">${COMPANY_NAME}</h5>
                                        <p class="text-center">${COMPANY_ADD}</p>
                                        <h6 class="text-center">PAYROLL</h6>
                                        <p class="text-center">${txt}</p>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th rowspan="2" style="text-align:center;">Name of Employees</th>
                                                    <th colspan="7" style="text-align:center;">COMPENSATION</th>
                                                    <th rowspan="2">Earnings</th>
                                                    <th colspan="9" style="text-align:center;">DEDUCTIONS</th>
                                                    <th rowspan="2" style="text-align:center;">Total Deductions</th>
                                                    <th rowspan="2">Allowance</th>
                                                    <th rowspan="2">Net Pay</th>
                                                </tr>
                                                <tr>
                                                    <th>SALARY RATE</th>
                                                    <th>ABSENT</th>
                                                    <th>UNDERTIME</th>
                                                    <th>TARDINESS</th>
                                                    <th>BASIC</th>
                                                    <th>HOLIDAY</th>
                                                    <th>OVERTIME</th>
                                                    <th>SSS</th>
                                                    <th>PHILHEALTH</th>
                                                    <th>PAG-IBIG</th>
                                                    <th>ADJUSTMENT</th>
                                                    <th>CASH ADVANCE</th>
                                                    <th>CHARGES</th>
                                                    <th>SSS LOAN</th>
                                                    <th>PAG-IBIG LOAN</th>
                                                    <th>COMPANY LOAN</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${tbody_content}
                                            </tbody>
                                        </table>
                                    </div>`);

                                    const style = document.createElement('style');
                                    style.textContent = `
                                    @media print {
                                        @page {
                                        size: landscape;
                                        }
                                    }
                                    `;
                                    document.head.appendChild(style);

                                    window.print();
                                })

                                $("#available-payslip").html(`Available: ${x}`);

                                $(".add-working-days").click(function(event){
                                    event.stopImmediatePropagation();


                                    if ($(this).attr("class") == "add-working-days") {
                                        
                                        let ops ="";
                                        for (let i = 0; i < ALL_CLASS.length; i++) {
                                            ops += `
                                            <option style="border-bottom:1px solid rgba(0,0,0,0.1);" value="${ALL_CLASS[i].class}">${ALL_CLASS[i].class_name}</option>`;
                                        }

                                       
                                        $.ajax({
                                            type: 'POST',
                                            url: '../php/fetch_all_serial.php',
                                            data: {
                                                branch: SELECTED_BRANCH,
                                            }, success: function(res) {
                                                try {
                                                    ALL_SERIAL = JSON.parse(res);

                                                    let ops2 = "";
                                                    for (let i = 0; i < ALL_SERIAL.length; i++) {
                                                        ops2 += `
                                                        <option style="border-bottom:1px solid rgba(0,0,0,0.1);" value="${ALL_SERIAL[i].serial}">${ALL_SERIAL[i].name}</option>`;
                                                    }
                                
                                                    document.body.insertAdjacentHTML("afterbegin", `
                                                    <div class="third-layer-overlay">
                                                        <div class="tlo-wrapper pt-5" style="min-width:400px;position:relative;">
                                                            ${close_icon}
                                                            <p class="text-white text-center" style="font-size:20px;">ADD WORKING DAYS</p>
                                                            <hr>
                                                            <div style="display:flex;flex-direction:column;color:#fff;">
                                                                <span>SELECT BY:</span>
                                                                <select id="select-by">
                                                                    <option value="class">Class</option>
                                                                    <option value="employee">Employee</option>
                                                                </select>
                                                                <span>SELECT MULTIPLE: (Hold CTRL)</span>
                                                                <select id="selection" multiple>
                                                                    ${ops}
                                                                </select>
                                                                <span>WORKING DAYS:</span>
                                                                <input type="number" id="working-days" placeholder="Enter working days"/>
                                                                <br>
                                                                <input type="button" value="ADD"/>
                                                            </div>
                                                        </div>
                                                    </div>`);
                                
                                                    $("input[type='button']").click(function(event){
                                                        event.stopImmediatePropagation();
                                                        let selected = $("#selection").val();
                                                        let workingDays = $("#working-days").val();


                                
                                                        if ($("#select-by").val() == 'class') {
                                                            if (selected.length > 0) {
                                                                for (let i = 0; i < selected.length; i++) {
                                                                    for (let j = 0; j < ALL_SERIAL.length; j++){
                                                                        if (ALL_SERIAL[j].class == selected[i]) {
                                                                            $(`#cal${ALL_SERIAL[j].serial}`).val(workingDays);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        } else {
                                                            if (selected.length > 0) {
                                                                for (let i = 0; i < selected.length; i++) {
                                                                    $(`#cal${selected[i]}`).val(workingDays);
                                                                }
                                                            }
                                                        }
                                
                                                        successNotification("Working days added.", "success");
                                                        $(".third-layer-overlay").remove();
                                                    })
                                
                                                    $("select#select-by").change(function(event){
                                                        if ($(this).val() === 'class') {
                                                            $("select#selection").html(ops);
                                                        } else {
                                                            $("select#selection").html(ops2);
                                                        }
                                                    })
                                
                                                    $(".close-window").click(function(event){
                                                        $(".third-layer-overlay").remove();
                                                    })
                                               
                                                } catch (err) {
                                                    errorNotification("An error occured.", "danger");
                                       
                                                }
                                            }
                                        })
                                        

                    
                                        
                                    }

                                    
                                })
                
                                $("input[type='checkbox']").change(function(event){
                                    let snum = $(this).parent("label").data("s");

                                    let name;
                                    for (let n = 0; n < STAFFS.length; n++) {
                                        if (STAFFS[n].serialnumber == snum) {
                                            name = STAFFS[n].name;
                                        }
                                    }

                                
                
                                    if ($(`#net-pay${snum}`).html() === '0' || $(`#net-pay${snum}`).html() === '0.00' || $(this).hasClass("disabled")) {
                                        $(this).prop('checked', !$(this).prop('checked'));
                                    } else {
                                        let net = $(`#net-pay${snum}`).html();
                                        net = net.replace(/,/g, '');
                                        net = parseFloat(net);
                
                                        let td = ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'].value;
                                        td = td.replace(/,/g, '');
                                        td = parseFloat(td);
                
                                        if ($(this).is(":checked")) {

                                            ALLDetails[parseInt(snum)];
                                            if ($(this).attr("id").includes("sss")) {
                                                let ded = parseFloat(D[`d${snum}`].sss);
                                                net = net - ded;
                                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                                deductions[`deduc${snum}`]['sss'] = D[`d${snum}`].sss;
                
                                                td = td + ded;
                
                                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};
                                                ALLDetails[parseInt(snum)][12]['SSS'] = {'value' : D[`d${snum}`].sss, 'op' : '-'};
                                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                                    let plip  = PAYSLIPS[x];
                                                    for (let s = 0; s < plip.length; s++) {
                                                        if (plip[s].name == name) {
                                                            plip[19]['name'] = D[`d${snum}`].sss.toFixed(2);
                                                            plip[37]['name'] = td.toFixed(2);
                                                            plip[42]['name'] = net.toLocaleString();
                                                        }
                                                    }
                                                }

                                                
                                            }
                                            if ($(this).attr("id").includes("phil")) {
                                                let ded = parseFloat(D[`d${snum}`].phil);
                                                net = net - ded;
                                                
                                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                                td = td + ded;
                                                
                                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};                 
                                                deductions[`deduc${snum}`]['phil'] = D[`d${snum}`].phil;
                                                ALLDetails[parseInt(snum)][13]['PHILHEALTH'] = {'value' : D[`d${snum}`].phil, 'op' : '-'};
                                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                                    let plip  = PAYSLIPS[x];
                                                    for (let s = 0; s < plip.length; s++) {
                                                        if (plip[s].name == name) {
                                                            plip[21]['name'] = D[`d${snum}`].phil.toFixed(2);
                                                            plip[37]['name'] = td.toFixed(2);
                                                            plip[42]['name'] = net.toLocaleString();
                                                        }
                                                    }
                                                }

                          
                                            }
                                            if ($(this).attr("id").includes("pbig")) {
                                                let ded = parseFloat(D[`d${snum}`].pbig);
                                                net = net - ded;
                                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                                td = td + ded;
                                                
                                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};
                                                deductions[`deduc${snum}`]['pbig'] = D[`d${snum}`].pbig;
                                                ALLDetails[parseInt(snum)][14]['PAG-IBIG'] = {'value' : D[`d${snum}`].pbig, 'op' : '-'};
                                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                                    let plip  = PAYSLIPS[x];
                                                    for (let s = 0; s < plip.length; s++) {
                                                        if (plip[s].name == name) {
                                                            plip[23]['name'] = D[`d${snum}`].pbig.toFixed(2);
                                                            plip[37]['name'] = td.toFixed(2);
                                                            plip[42]['name'] = net.toLocaleString();
                                                        }
                                                    }
                                                }

                                            }

                                            if (PAYSCHED == 'twice-monthly') {
                                                $.ajax({
                                                    type: 'POST',
                                                    url: '../php/update_contri_file.php',
                                                    data: {
                                                        serial: snum,
                                                        col1: from,
                                                        col2: to,
                                                        paysched: PAYSCHED,
                                                        sss: D[`d${snum}`].sss,
                                                        phil: D[`d${snum}`].phil,
                                                        pbig: D[`d${snum}`].pbig,
                                                        td: td,
                                                        net: net,
                                                        branch: SELECTED_BRANCH
                                                    }, success:function(res) {
                                                        console.log(res);
                                                    }
                                                })
                                            } else if (PAYSCHED == 'monthly') {
                                                $.ajax({
                                                    type: 'POST',
                                                    url: '../php/update_contri_file.php',
                                                    data: {
                                                        serial: snum,
                                                        col1: MON,
                                                        col2: MON,
                                                        paysched: PAYSCHED,
                                                        sss: D[`d${snum}`].sss,
                                                        phil: D[`d${snum}`].phil,
                                                        pbig: D[`d${snum}`].pbig,
                                                        td: td,
                                                        net: net,
                                                        branch: SELECTED_BRANCH
                                                    }, success:function(res) {
                                                        console.log(res);
                                                    }
                                                })
                                            }
                                            
                                        } else {

                                            if ($(this).attr("id").includes("sss")) {
                                                let ded = parseFloat(deductions[`deduc${snum}`].sss);
                                                net = net + ded;
                                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                                td = td - ded;
                                                
                                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};
                                                deductions[`deduc${snum}`]['sss'] = 0;
                                                ALLDetails[parseInt(snum)][12]['SSS'] = {'value' : deductions[`deduc${snum}`].sss, 'op' : '-'};
                                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                                    let plip  = PAYSLIPS[x];
                                                    for (let s = 0; s < plip.length; s++) {
                                                        if (plip[s].name == name) {
                                                            plip[19]['name'] = deductions[`deduc${snum}`].sss.toFixed(2);
                                                            plip[37]['name'] = td.toFixed(2);
                                                            plip[42]['name'] = net.toLocaleString();
                                                        }
                                                    }
                                                }

                                        
                                            }
                                            if ($(this).attr("id").includes("phil")) {
                                                
                                                let ded = parseFloat(deductions[`deduc${snum}`].phil);
                                                
                                                net = net + ded;
                                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                                td = td - ded;
                                                
                                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};
                                                deductions[`deduc${snum}`]['phil'] = 0;
                                                ALLDetails[parseInt(snum)][13]['PHILHEALTH'] = {'value' : deductions[`deduc${snum}`].phil, 'op' : '-'};
                                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                                    let plip  = PAYSLIPS[x];
                                                    for (let s = 0; s < plip.length; s++) {
                                                        if (plip[s].name == name) {
                                                            plip[21]['name'] = deductions[`deduc${snum}`].phil.toFixed(2);
                                                            plip[37]['name'] = td.toFixed(2);
                                                            plip[42]['name'] = net.toLocaleString();
                                                        }
                                                    }
                                                }

                                            }
                                            if ($(this).attr("id").includes("pbig")) {
                                                
                                                let ded = parseFloat(deductions[`deduc${snum}`].pbig);
                                                td = td - ded;
                                                
                                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toFixed(2), 'highlight' : '', 'op' : '-'};
                                                net = net + ded;
                                                $(`#net-pay${snum}`).html(net.toLocaleString());
                
                                                deductions[`deduc${snum}`]['pbig'] = 0;
                                                ALLDetails[parseInt(snum)][14]['PAG-IBIG'] = {'value' : deductions[`deduc${snum}`].pbig, 'op' : '-'};
                                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};

                                                for (let x = 0; x < PAYSLIPS.length; x++) {
                                                    let plip  = PAYSLIPS[x];
                                                    for (let s = 0; s < plip.length; s++) {
                                                        if (plip[s].name == name) {
                                                            plip[23]['name'] = deductions[`deduc${snum}`].pbig.toFixed(2);
                                                            plip[37]['name'] = td.toFixed(2);
                                                            plip[42]['name'] = net.toLocaleString();
                                                        }
                                                    }
                                                }

                                          
                                            }

                                            if (PAYSCHED == 'twice-monthly') {
                                                $.ajax({
                                                    type: 'POST',
                                                    url: '../php/update_contri_file.php',
                                                    data: {
                                                        serial: snum,
                                                        col1: from,
                                                        col2: to,
                                                        paysched: PAYSCHED,
                                                        sss: deductions[`deduc${snum}`].sss,
                                                        phil: deductions[`deduc${snum}`].phil,
                                                        pbig: deductions[`deduc${snum}`].pbig,
                                                        td: td,
                                                        net: net,
                                                        branch: SELECTED_BRANCH
                                                    }, success:function(res) {
                                                        console.log(res);
                                                    }
                                                })
                                            } else if (PAYSCHED == 'monthly') {
                                                $.ajax({
                                                    type: 'POST',
                                                    url: '../php/update_contri_file.php',
                                                    data: {
                                                        serial: snum,
                                                        col1: MON,
                                                        col2: MON,
                                                        paysched: PAYSCHED,
                                                        sss: deductions[`deduc${snum}`].sss,
                                                        phil: deductions[`deduc${snum}`].phil,
                                                        pbig: deductions[`deduc${snum}`].pbig,
                                                        td: td,
                                                        net: net,
                                                        branch: SELECTED_BRANCH
                                                    }, success:function(res) {
                                                        console.log(res);
                                                    }
                                                })
                                            }
                                        }
                                    }
                                })
                    
                                $(".trail").click(function(event){
                                    event.stopImmediatePropagation();
                                    let serial = $(this).data("id");
                
                                    let promise;
                                    if (PAYSCHED == 'twice-monthly') {
                                        promise = new Promise(function(resolve, reject){
                                            $.ajax({
                                                type: 'POST',
                                                url: '../php/fetch_employee_trail.php',
                                                data : {
                                                    serial: serial,
                                                    from: from,
                                                    to: to,
                                                    branch: SELECTED_BRANCH
                                                },
                                                success: function(res) {
                                                    resolve(res);
                                                }
                                            });
                                        });
                                        
                                    } else if (PAYSCHED == 'monthly') {
                                        promise = new Promise(function(resolve, reject){
                                            $.ajax({
                                                type: 'POST',
                                                url: '../php/fetch_employee_trail.php',
                                                data : {
                                                    serial: serial,
                                                    mon: MON,
                                                    branch: SELECTED_BRANCH
                                                },
                                                success: function(res) {
                                                    resolve(res);
                                                }
                                            });
                                        });
                                    }
                
                                    promise.then(
                                        function(res) {
                                            let content = "";
                                            let doc_content = "";
                                            try {
                                                res = JSON.parse(res);
                                                for (let i = 0; i < res.length; i++) {
                                                    function convertTo12HourFormat(timeString) {
                                                        const timePortion = timeString.split(' ')[1];
                                                        const [hours, minutes] = timePortion.split(':').map(Number);
                                                        const meridian = hours >= 12 ? 'PM' : 'AM';
                                                        const hours12 = hours % 12 || 12;
                                                        return `${hours12}:${minutes < 10 ? '0' : ''}${minutes} ${meridian}`;
                                                    }
                                                    const dateObj = new Date(res[i].date);
                                                    const month = months[dateObj.getMonth()];
                                                    const day = dateObj.getDate();
                                                    const year = dateObj.getFullYear();
                    
                                                    content += `
                                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                        <td style="padding:5px;font-size:14px;">${res[i].name}</td>
                                                        <td style="padding:5px;font-size:14px;">${CLASSES[res[i].class]}</td>
                                                        <td style="padding:5px;font-size:14px;">${convertTo12HourFormat(res[i].start_time)}</td>
                                                        <td style="padding:5px;font-size:14px;">${convertTo12HourFormat(res[i].end_time)}</td>
                                                        <td style="padding:5px;font-size:14px;">${res[i].late_mins} (mins)</td>
                                                        <td style="padding:5px;font-size:14px;">${parseFloat(res[i].total_hours).toFixed(2)} hrs</td>
                                                        <td style="padding:5px;font-size:14px;">${res[i].ot_mins} (mins)</td>
                                                        <td style="padding:5px;font-size:14px;">${res[i].ut_mins} (mins)</td>
                                                        <td style="padding:5px;font-size:14px;">${month} ${day}, ${year}</td>
                                                    </tr>`;

                                                    doc_content += `
                                                    <tr>
                                                        <td>${res[i].name}</td>
                                                        <td style="padding:5px;font-size:14px;">${convertTo12HourFormat(res[i].start_time)}</td>
                                                        <td style="padding:5px;font-size:14px;">${convertTo12HourFormat(res[i].end_time)}</td>
                                                        <td style="padding:5px;font-size:14px;">${res[i].late_mins} (mins)</td>
                                                        <td style="padding:5px;font-size:14px;">${res[i].ot_mins} (mins)</td>
                                                        <td style="padding:5px;font-size:14px;">${res[i].ut_mins} (mins)</td>
                                                        <td style="padding:5px;font-size:14px;">${month} ${day}, ${year}</td>
                                                    </tr>`;
                                                }
                
                                            } catch (err) {
                                                console.log(err);
                                                content += `
                                                <tr>
                                                    <td colspan="8" class="text-center pt-3">No item</td>
                                                </tr>`;
                                            }
                                            document.body.insertAdjacentHTML("afterbegin", `
                                            <div class="third-layer-overlay">
                                                <div class="tlo-wrapper pt-5" style="min-width:500px;position:relative;">
                                                    ${close_icon}
                                                    <p class="text-white text-center" style="font-size:20px;">EMPLOYEE TRAIL</p>
                                                    <hr>
                                                    <div class="table-container"  style="max-height:40vh;overflow:auto;max-width:60vw;min-width:45vw;">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <td>NAME</td>
                                                                    <td>CLASS</td>
                                                                    <td>TIME IN</td>
                                                                    <td>TIME OUT</td>
                                                                    <td>LATE</td>
                                                                    <td>HOURS WORKED</td>
                                                                    <td>OVERTIME</td>
                                                                    <td>UNDERTIME</td>
                                                                    <td>DATE</td>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                ${content}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <br>
                                                    <button class="action-button print-trail">PRINT EMPLOYEE TRAIL</button>
                                                </div>
                                            </div>
                                            `);

                                            $(".print-trail").click(function(event){
                                                event.stopImmediatePropagation();
                                                $(".employee-trail-document").remove();
                                                $(".pages").remove();
                                                $(".payroll-document").remove();

                                                document.body.insertAdjacentHTML("afterbegin", `
                                                <div class="employee-trail-document" style="display:none;padding:1cm 1cm 0 1cm;">
                                                    <p class="text-center" style="font-size:25px;font-weight:bold;">${txt}</p>
                                                    <br>
                                                    <table>
                                                        <tr>
                                                            <td>NAME</td>
                                                            <td>TIME IN</td>
                                                            <td>TIME OUT</td>
                                                            <td>LATE</td>
                                                            <td>OVERTIME</td>
                                                            <td>UNDERTIME</td>
                                                            <td>DATE</td>
                                                        </tr>
                                                        ${doc_content}
                                                    </table>
                                                </div>
                                                `);

                                                const style = document.createElement('style');
                                                style.textContent = `
                                                @media print {
                                                    @page {
                                                        size: portrait;
                                                        margin: 1cm;
                                                    }
                                                }
                                                `;
                                                document.head.appendChild(style);

                                                window.print();

                                            })
                                            $(".close-window").click(function(event){
                                                $(".third-layer-overlay").remove();
                                            })
                                        }
                                    )
                                    
                                })
                    
                                $(".generate-payslip").on("click", function(event){
                                    event.stopImmediatePropagation();

                                    let isEmpty = true;
                    
                                    for (let i = 0; i < ALLDetails.length; i++) {
                                        if (typeof ALLDetails[i] === 'object') {
                                            isEmpty = false;
                                        }
                                    }

                    
                                    if (!isEmpty) {
                                        document.body.insertAdjacentHTML("afterbegin", `
                                        <div class="third-layer-overlay">
                                            <div class="tlo-wrapper pt-5" style="min-width:500px;position:relative;">
                                                ${close_icon}
                                                <p class="text-white text-center" style="font-size:20px;">GENERATE PAYSLIP</p>
                                                <hr>
                                                <div class="btns">
                                                    <button id="continue" style="background:orange;">CONTINUE</button>
                                                    <button id="cancel" class="action-button">CANCEL</button>
                                                </div>
                                            </div>
                                        </div>
                                        `);
                        
                                        $("button").click(function(event){
                                            event.stopImmediatePropagation();
                                            if ($(this).attr("id").includes("continue")) {
                                                generatePayslips();
                                            }
                                            $(".third-layer-overlay").remove();
                                        })
                        
                                        $(".close-window").click(function(){
                                            $(".third-layer-overlay").remove();
                                        })
                                        
                    
                                    } else {
                                        errorNotification("Cannot process your request.", "danger");
                                    }
                                })
                    
                                

                                $(".add-deductions").on("click", function(event){
                                    event.stopImmediatePropagation();
                                    let serialID = $(this).data("id");
                
                                    if (deductions.hasOwnProperty(`deduc${serialID}`)) {
                                        document.body.insertAdjacentHTML("afterbegin", `
                                        <div class="third-layer-overlay">
                                            <div class="tlo-wrapper pt-5" style="position:relative;">
                                                ${close_icon}
                                                <p class="text-white text-center" style="font-size:20px;">DEDUCTIONS</p>
                                                <br>
                                                <hr>
                                                <form id="addDeductionForm">
                                                    <span>SSS (excel file):</span>
                                                    <input type="number" placeholder="SSS Deduction" value="${deductions[`deduc${serialID}`].sss}" name="sss"/>
                                                    <span>Pag-IBIG:</span>
                                                    <input type="number" placeholder="Pag-IBIG Deduction" value="${deductions[`deduc${serialID}`].pbig}" name="pbig"/>
                                                    <span>PhilHealth:</span>
                                                    <input type="number" placeholder="PhilHealth Deduction" value="${deductions[`deduc${serialID}`].phil}" name="phil"/>
                                                    <br>
                                                    <input type="submit" value="ADD DEDUCTIONS"/>
                                                </form>
                                            </div>
                                        </div>
                                        `);
                                    } else {
                                        document.body.insertAdjacentHTML("afterbegin", `
                                        <div class="third-layer-overlay">
                                            <div class="tlo-wrapper pt-5" style="position:relative;">
                                                ${close_icon}
                                                <p class="text-white text-center" style="font-size:20px;">DEDUCTIONS</p>
                                                <br>
                                                <hr>
                                                <form id="addDeductionForm">
                                                    <span>SSS:</span>
                                                    <input type="number" placeholder="SSS Deduction" name="sss"/>
                                                    <span>Pag-IBIG:</span>
                                                    <input type="number" placeholder="Pag-IBIG Deduction" name="pbig"/>
                                                    <span>PhilHealth:</span>
                                                    <input type="number" placeholder="PhilHealth Deduction" name="phil"/>
                                                    <br>
                                                    <input type="submit" value="ADD DEDUCTIONS"/>
                                                </form>
                                            </div>
                                        </div>
                                        `);
                                    }
                    
                                    $("input[type='submit']").click(function(event){
                                        event.preventDefault();
                                        let data = new FormData(document.getElementById("addDeductionForm"));
                                        var formDataObject = {};
                                        let isNotEmpty = true;
                                        data.forEach(function(value, key){
                                            formDataObject[key] = value;
                                            if (value === '') {
                                                formDataObject[key] = 0;
                                            }
                                        });
                                        
                                        deductions[`deduc${serialID}`] = {"sss" : formDataObject.sss, "pbig" : formDataObject.pbig, "phil" : formDataObject.phil}
                                        successNotification("Deductions added.", "success");
                                        $(".third-layer-overlay").remove();
                                            
                                    })
                    
                                    $(".close-window").click(function(){
                                        $(".third-layer-overlay").remove();
                                    })
                                })
                
                                $(".remove-holiday").on("click", function(event){
                                    event.stopImmediatePropagation();
                
                                    let ops = "";
                    
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/fetchHolidaysDate.php',
                                        success: function(res){
                                            try {
                                                res = JSON.parse(res);
                                            
                                                for (let i = 0; i < res.length; i++) {
                                                    const date = new Date(res[i].date);
                    
                                                    // Get month, day, and year components
                                                    const month = months[date.getMonth()];
                                                    const day = date.getDate();
                                                    const year = date.getFullYear();
                    
                                                    // Construct the formatted date string
                                                    const formattedDate = `${month} ${day}, ${year}`;
                    
                                                    ops += `
                                                    <option value="${res[i].id}">${formattedDate}</option>
                                                    `;
                                                }
                    
                                            } catch(err) {
                                                console.log(err);
                                            }
                    
                                            document.body.insertAdjacentHTML("afterbegin", `
                                                <div class="third-layer-overlay">
                                                    <div class="tlo-wrapper pt-5" style="position:relative;">
                                                        ${close_icon}
                                                        <p class="text-white text-center" style="font-size:20px;">REMOVE HOLIDAY BY DATE</p>
                                                        <hr>
                                                        <form id="removeHolidayForm">
                                                            <span>SELECT DATE</span>
                                                            <select name="id">
                                                                <option value="">Select date</option>
                                                                ${ops}
                                                            </select>
                                                            
                                                            <br>
                                                            <input type="submit" value="REMOVE HOLIDAY"/>
                                                        </form>
                                                    </div>
                                                </div>
                                            `);
                    
                                            $("input[type='submit']").click(function(event){
                                                event.preventDefault();
                                                let data = new FormData(document.getElementById("removeHolidayForm"));
                                                var formDataObject = {};
                                                let isNotEmpty = true;
                                                data.forEach(function(value, key){
                                                    formDataObject[key] = value;
                                                    if (value === '') {
                                                        isNotEmpty = false;
                                                    }
                                                });
                    
                                                if (!isNotEmpty) {
                                                    errorNotification("Fields must be filled out.", "warning");
                                                } else {
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/remove_holidaypay.php',
                                                        data: {
                                                            id: formDataObject.id,
                                                        }, success: function(res){
                                                        
                                                            if (res.includes('success')) {
                                                                successNotification("Selected holiday removed.", "success");
                                                                $(".third-layer-overlay").remove();
                                                            }
                                                        }
                                                    })
                                                }
                                                
                                            })
                    
                    
                                            $(".close-window").click(function(){
                                                $(".third-layer-overlay").remove();
                                            })
                    
                                            
                                        }
                                    })
                                })

                                $(".add-holiday2").click(function(event){
                                    event.stopImmediatePropagation();

                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/fetch_month_holidays.php',
                                        data: {
                                            month: MONTH,
                                            year: YEAR,
                                            branch: SELECTED_BRANCH,
                                            paysched: PAYSCHED
                                            
                                        },success: function(res) {
                                            
                                            try {
                                                res = JSON.parse(res);
                                               
                                                let holiday = "";
                                                for (let i = 0; i < res.length; i++) {

                                                    const date = new Date(res[i].date);

                                                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                                                    const formattedDate = date.toLocaleDateString('en-US', options);

                                                    if (i == 0) {
                                                        holiday += `
                                                        <div id="div${i}" style="color:#fff;border-bottom:1px solid rgba(0,0,0,0.1);padding:10px;border-top:1px solid rgba(0,0,0,0.1);display:flex;justify-content:space-between;"><span style="cursor:pointer;" data-date="${res[i].date}">${formattedDate} (${res[i].holiday_name}) </span> <div><button class="action-button delete ml-2" data-date="${res[i].date}" data-id="${i}">Delete</button></div></div>`;
                                                    } else if (i > 0) {
                                                        holiday += `
                                                        <div id="div${i}" style="color:#fff;border-bottom:1px solid rgba(0,0,0,0.1);padding:10px;display:flex;justify-content:space-between;"><span style="cursor:pointer;" data-date="${res[i].date}">${formattedDate} (${res[i].holiday_name})</span> <div><button class="action-button delete ml-2" data-date="${res[i].date}" data-id="${i}">Delete</button></div></div>`;
                                                    }
                                                    
                                                }
                                                document.body.insertAdjacentHTML("afterbegin", `
                                                <div class="fourth-layer-overlay">
                                                    <div class="folo-wrapper pt-5" style="min-width:25vw;position:relative;">
                                                        ${close_icon}
                                                        <p class="text-white text-center" style="font-size:20px;">HOLIDAYS</p>
                                                        <button class="action-button add mb-2">ADD HOLIDAY</button>
                                                        <div>
                                                            ${holiday}
                                                        </div>
                                                    </div>
                                                </div>`);

                                                $(".close-window").click(function(event){
                                                    event.stopImmediatePropagation();
                                                    $(".fourth-layer-overlay").remove();
                                                })

                                                

                                                $(".delete").click(function(event){
                                                    event.stopImmediatePropagation();
                                                    let date = $(this).data("date");
                                                    let id = $(this).data("id");
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/delete_holidayyy.php',
                                                        data: {
                                                            date: date,
                                                            branch: SELECTED_BRANCH,
                                                            paysched: PAYSCHED
                                                        },success: function(res) {
                                                            console.log(res);
                                                            if (res == 'deleted') {
                                                                $(`#div${id}`).remove();
                                                            }
                                                        }
                                                    })
                                                })

                                                $(".add").click(function(event){
                                                    event.stopImmediatePropagation();
                                                    $(".fourth-layer-overlay").remove();
                                                    add_holiday();
                                                })

                                                $("span").click(function(event){
                                                    event.stopImmediatePropagation();
                                                    
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/get_holidayyy.php',
                                                        data: {
                                                            date: $(this).data("date"),
                                                            branch: SELECTED_BRANCH,
                                                            paysched: PAYSCHED
                                                        },success: function(res) {
                                                            try {
                                                                res = JSON.parse(res);
                                                                let date = res[0].date;
                                                                $(".fourth-layer-overlay").remove();
                                                                
                                                                const date2 = new Date(res[0].date);

                                                                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                                                                const formattedDate = date2.toLocaleDateString('en-US', options);

                                                                let d = new Date(res[0].date);
                                                                let d_before = new Date(res[0].date);
                                                                let d_after = new Date(res[0].date);
                                                                d_before.setDate(d_before.getDate() - 1);
                                                                d_after.setDate(d_after.getDate() + 1);

                                                                const formatDate = (inputDate) => {
                                                                    const year = inputDate.getFullYear();
                                                                    const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                                                                    const day = String(inputDate.getDate()).padStart(2, '0');
                                                                    return `${year}-${month}-${day}`;
                                                                };

                                                                const monthName = months[d.getMonth()]; // Get month name based on zero-based index
                                                                const day = d.getDate();
                                                                const year = d.getFullYear();

                                                                let d1 = new Date(d_before);
                                                                let d2 = new Date(d_after);
                                                                const monthName1 = months[d1.getMonth()]; // Get month name based on zero-based index
                                                                const day1 = d1.getDate();
                                                                const year1 = d1.getFullYear();

                                                                const monthName2 = months[d2.getMonth()]; // Get month name based on zero-based index
                                                                const day2 = d2.getDate();
                                                                const year2 = d2.getFullYear();

                                                                // Format the date as "MonthName day, year"
                                                                const _formattedDate = `${monthName} ${day}, ${year}`;
                                                                const formattedDate1 = `${monthName1} ${day1}, ${year1}`;
                                                                const formattedDate2 = `${monthName2} ${day2}, ${year2}`;

                                                                d_before = formatDate(d_before);
                                                                d_after = formatDate(d_after);

                                                                let tbody = "";
                                                                let arr = [];
                                                                
                                                                for (let j = 0; j < res.length; j++) {
                                                                    let approved = false;
                                                                    let present = 'Absent';

                                                                    if (res[j].approved == 1) {
                                                                        approved = true;
                                                                    }

                                                                    if (res[j].present == 1) {
                                                                        present = 'Worked';
                                                                    }

                                                                    let button;


                                                                    if (approved) {
                                                                        button = `<button class="action-button approve-holiday" style="padding:5px 10px;border-radius:4px;border:none;color:#fff;background:orange;">Approved</button>`;
                                                                    } else {
                                                                        button = `<button class="action-button approve-holiday" style="padding:5px 10px;border-radius:4px;border:none;color:#fff;background:var(--teal);">Approve</button>`;
                                                                    }

                                                                    tbody += `
                                                                    <tr data-name="${res[j].employee}" data-id="${res[j].serialnumber}" data-class="${res[j].class}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                                        <td>${res[j].employee}</td>
                                                                        <td>${res[j].isvalid_date_before}</td>
                                                                        <td>${present}</td>
                                                                        <td>${res[j].isvalid_date_after}</td>
                                                                        <td>${button}</td>
                                                                    </tr>`;

                                                                    arr.push(res[j].percentage);
                                                                    
                                                                }

                                                                let p;
                                                                p = Math.max(...arr);
                                                                
                                                                

                                                                document.body.insertAdjacentHTML("afterbegin", `
                                                                <div class="fourth-layer-overlay">
                                                                    <div class="folo-wrapper pt-5" style="min-width:50vw;position:relative;">
                                                                        ${close_icon}
                                                                        <p class="text-white text-center" style="font-size:20px;">${formattedDate}<br><span style="font-size:15px;">${res[0].holiday_name}</span></p>
                                                                        <hr>
                                                                        <div style="display:flex;flex-direction:column;width:25%;margin-bottom:5px;">
                                                                            <span style="font-size:15px;color:#fff;">Holiday percentage:</span>
                                                                            <input type="number" id="percentage" value="${p}" placeholder="Enter percentage"/>
                                                                        </div>

                                                                        <div class="table-container" style="max-height:50vh;max-width:60vw;overflow:auto;">
                                                                            <table>
                                                                                <thead>
                                                                                    <tr>
                                                                                        <td>Employee</td>
                                                                                        <td>${formattedDate1}</td>
                                                                                        <td>${_formattedDate} (${res[0].holiday_name})</td>
                                                                                        <td>${formattedDate2}</td>
                                                                                        <td>Action</td>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    ${tbody}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>`);

                                                                $(".approve-holiday").click(function(event){
                                                                    event.stopImmediatePropagation();
                    
                                                                    if ($("#percentage").val() === '') {
                                                                        errorNotification("Please enter holiday percentage.", "warning");
                                                                    } else {
                                                                        let snum = $(this).parent("td").parent("tr").data("id");
                                                                        let _class = $(this).parent("td").parent("tr").data("class");
                                                                        let name = $(this).parent("td").parent("tr").data("name");
                                                                        $(this).css("background", "orange");
                                                                        $(this).html("Approved");
                                                                        $.ajax({
                                                                            type: 'POST',
                                                                            url: '../php/fetch_class.php',
                                                                            data: {
                                                                                class: _class,
                                                                            },
                                                                            success: function(res) {
                                                                                
                    
                                                                                try {
                                                                                    res = JSON.parse(res);
                                                                                    let rate = parseInt(res.rate);
                                                                                    let hour_perday = parseInt(res.hour_perday);
                                                                                    let rate_type = res.rate_type;
                    
                                                                                    if (rate_type == 'hourly') {
                                                                                        rate = rate * hour_perday;
                                                                                    } else if (rate_type == 'monthly') {
                                                                                        rate = rate * 12;
                                                                                        rate = rate / 365; //based on 365 days per year factor
                                                                                    }
                    
                                                                                    let perc = $("#percentage").val();
                                                                                    perc = parseFloat(perc);
                                                                                    let pay = perc * rate;
                                                                                    pay = parseFloat(pay);
                    
                                                                                    $.ajax({
                                                                                        type: 'POST',
                                                                                        url: '../php/update_holiday.php',
                                                                                        data: {
                                                                                            serial: snum,
                                                                                            branch: SELECTED_BRANCH,
                                                                                            date: date,
                                                                                            month: MONTH,
                                                                                            year: YEAR,
                                                                                            pay: pay,
                                                                                            perc: perc,
                                                                                            paysched: PAYSCHED
                                                                                        }, success: function(res) {
                                                                                            console.log(res);
                                                                                        }
                                                                                    })
                    
                                                                                    try {
                                                                                        // ALLDetails[snum][9]['HOLIDAYS (total)'] = pay;
                                                                                        // let earned2 = ALLDetails[snum][11]['EARNED'].value;
                                                                                        // earned2 = parseFloat(earned2);
                                                                                        // earned2 += pay;
                                                                                        // ALLDetails[snum][11]['EARNED'] = {'value' : earned2, 'highlight': '', op: '+'};
                                                                                        // let net2 = ALLDetails[snum][24]['NET'].value;
                                                                                        // net2 = parseFloat(net2);
                                                                                        // net2 += pay;
                                                                                        // ALLDetails[snum][24]['NET'] = {'value' : net2, 'highlight': ''};
                    
                                                                                        for (let i = 0; i < PAYSLIPS.length; i++) {
                                                                                            // if (PAYSLIPS[i][3].name == name) {
                                                                                            //     PAYSLIPS[i][15]['name'] = pay;
                                                                                            //     let earnings = parseFloat(PAYSLIPS[i][39].name);
                                                                                            //     let net = parseFloat(PAYSLIPS[i][43].name);
                                                                                            //     earnings += pay;
                                                                                            //     net += pay;
                                                                                            //     PAYSLIPS[i][39]['name'] = earnings;
                                                                                            //     PAYSLIPS[i][43]['name'] = net;
                                                                                            // }
                                                                                        }
                    
                                                                                    } catch(err) {
                                                                                        console.log(err);
                                                                                    }
                    
                                                                                    // if (COMPUTED.length > 0) {
                                                                                    //     for (let i = 0; i < COMPUTED.length; i++) {
                                                                                    //         if (COMPUTED[i].serial == snum && COMPUTED[i].date == $("#holiday-date").val()) {
                                                                                    //             //computed = COMPUTED[i].computed;
                                                                                    //             COMPUTED.splice(i, 1);
                                                                                    //         }
                                                                                    //     }
                                                                                    //     let obj = {'serial' : snum, 'holidaypay' : pay, 'date' : $("#holiday-date").val()};
                                                                                    //     COMPUTED.push(obj);
                                                                                    // } else {
                                                                                    //     let obj = {'serial' : snum, 'holidaypay' : pay, 'date' : $("#holiday-date").val()};
                                                                                    //     COMPUTED.push(obj);
                                                                                    // }
                                                                                    
                                                                                    successNotification("Approved.", "success");
                                                                                } catch (err) {
                                                                                    console.log(err);
                                                                                    errorNotification("Error fetching class.", "danger");
                                                                                }
                    
                                                                                
                                                                            }
                                                                        })
                    
                    
                                                                        
                                                                        
                                                                    }
                                                                    
                    
                    
                                                                })

                                                                $(".close-window").click(function(event){
                                                                    event.stopImmediatePropagation();
                                                                    $(".fourth-layer-overlay").remove();
                                                                })

                                                            } catch(err) {
                                                                console.log(err);
                                                            }
                                                        }
                                                    })
                                                })

                                            } catch (err) {
                                                add_holiday();
                                                
                                            }

                                            function add_holiday() {
                                                document.body.insertAdjacentHTML("afterbegin", `
                                                <div class="fourth-layer-overlay">
                                                    <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                                                        ${close_icon}
                                                        <p class="text-white text-center" style="font-size:20px;">ADD HOLIDAY</p>
                                                        <hr>
                                                        <div style="color:#fff;display:flex;flex-direction:column;">
                                                        <span>DETAILS:</span>
                                                        <input type="text" placeholder="Enter holiday details" id="holiday-details">
                                                        <span>SELECT DATE:</span>
                                                        <input type="date" id="holiday-date">
                                                        <br>
                                                        <input type="button" value="ADD HOLIDAY"/>
                                                        </div>
                                                    </div>
                                                </div>`);

                                                $("input[type='button']").click(function(event){
                                                    event.stopImmediatePropagation();

                                                    let date = $("#holiday-date").val();
                                                    let holi_name = $("#holiday-details").val();

                                                    let d = new Date(date);
                                                    let d_before = new Date(date);
                                                    let d_after = new Date(date);
                                                    d_before.setDate(d_before.getDate() - 1);
                                                    d_after.setDate(d_after.getDate() + 1);

                                                    const formatDate = (inputDate) => {
                                                        const year = inputDate.getFullYear();
                                                        const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                                                        const day = String(inputDate.getDate()).padStart(2, '0');
                                                        return `${year}-${month}-${day}`;
                                                    };

                                                    d_before = formatDate(d_before);
                                                    d_after = formatDate(d_after);

                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/validate_employees.php',
                                                        data: {
                                                            date: date,
                                                            date_before: d_before,
                                                            date_after: d_after,
                                                            branch: SELECTED_BRANCH,
                                                            paysched: PAYSCHED
                                                        }, success: function(res) {
                                                            $(".fourth-layer-overlay").remove();
                                                            let tbody = "";
                                                            try {
                                                                res = JSON.parse(res);
                                                                

                                                                for (let i = 0; i < res.staffs.length; i++) {
                                                                    let serial = res.staffs[i].serialnumber;
                                                                    serial = parseInt(serial);
                                                                    //before holiday
                                                                    let arr = [];
                                                                    let present = false;
                                                                    for (let j = 0; j < res.present_before_holiday.length; j++) {
                                                                        let snumber = res.present_before_holiday[j].serialnumber;
                                                                        snumber = parseInt(snumber);

                                                                        if (serial == snumber) {
                                                                            present = true;
                                                                            arr.push(parseInt(res.present_before_holiday[j].ut_mins));
                                                                        }
                                                                    }

                                                                    let isValid;
                                                                    if (present) {
                                                                        isValid = 'Worked ';
                                                                    } else {
                                                                        isValid = 'Absent';
                                                                    }
                                                                    
                                                                    if (arr.length > 0) {
                                                                        let min = Math.min(...arr);
                                                                        if (min > 0) {
                                                                            isValid += `<span class="tooltip3"> (undertime)<span class="tooltiptext3">Undertime ${min} minutes.</span></span>`;
                                                                        }
                                                                    }

                                                                    //on holiday
                                                                    let presentOnHoliday = false;
                                                                    for (let k = 0; k < res.present_on_holiday.length; k++) {
                                                                        let snumber = res.present_on_holiday[k].serialnumber;
                                                                        snumber = parseInt(snumber);
                                                                        if (serial == snumber) {
                                                                            presentOnHoliday = true;
                                                                        }
                                                                    }

                                                                    if (presentOnHoliday) {
                                                                        presentOnHoliday = 'Worked';
                                                                    } else {
                                                                        presentOnHoliday = 'Absent';
                                                                    }

                                                                    //after holiday
                                                                    let arr2 = [];
                                                                    let present2 = false;
                                                                    for (let l = 0; l < res.present_after_holiday.length; l++) {
                                                                        let snumber = res.present_after_holiday[l].serialnumber;
                                                                        snumber = parseInt(snumber);
                                                                        if (serial == snumber) {
                                                                            present2 = true;
                                                                            arr2.push(parseInt(res.present_after_holiday[l].ut_mins));
                                                                        }
                                                                    }

                                                                    let isValid2;
                                                                    if (present2) {
                                                                        isValid2 = 'Worked ';
                                                                    } else {
                                                                        isValid2 = 'Absent';
                                                                    }
                                                                    
                                                                    if (arr2.length > 0) {
                                                                        let min = Math.min(...arr2);
                                                                        if (min > 0) {
                                                                            isValid2 += `<span class="tooltip3"> (undertime)<span class="tooltiptext3">Undertime ${min} minutes.</span></span>`;
                                                                        }
                                                                    }

                                                                    let button = `<button class="action-button approve-holiday" style="padding:5px 10px;border-radius:4px;border:none;color:#fff;background:var(--teal);">Approve</button>`;

                                                                    // for (let i = 0; i < COMPUTED.length; i++) {
                                                                    //     if (COMPUTED[i].serial == serial && COMPUTED[i].date == $("#holiday-date").val()) {
                                                                    //         button = `<button class="action-button approve-holiday" style="padding:5px 10px;border-radius:4px;border:none;color:#fff;background:orange;">Approved</button>`;
                                                                    //     }
                                                                    // }
                                                                    
                                                                    tbody += `
                                                                    <tr data-name="${res.staffs[i].name}" data-id="${res.staffs[i].serialnumber}" data-class="${res.staffs[i].class}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                                        <td>${res.staffs[i].name}</td>
                                                                        <td>${isValid}</td>
                                                                        <td>${presentOnHoliday}</td>
                                                                        <td>${isValid2}</td>
                                                                        <td>${button}</td>
                                                                    </tr>`;

                                                                    let p = 0;
                                                                    if (presentOnHoliday == 'Worked') {
                                                                        p = 1;
                                                                    }
                                                                    
                                                                    if (PAYSCHED == 'twice-monthly') {
                                                                        $.ajax({
                                                                            type: 'POST',
                                                                            url: '../php/add_holidayyy.php',
                                                                            data: {
                                                                                branch: SELECTED_BRANCH,
                                                                                month: MONTH,
                                                                                year: YEAR,
                                                                                date: date,
                                                                                name: holi_name,
                                                                                employee: res.staffs[i].name,
                                                                                serial: res.staffs[i].serialnumber,
                                                                                date_before: isValid,
                                                                                present: p,
                                                                                class: res.staffs[i].class,
                                                                                date_after: isValid2,
                                                                                paysched: PAYSCHED,
                                                                                from: from,
                                                                                to: to
                                                                                
                                                                            },
                                                                            success: function(res){
                                                                                console.log(res);
                                                                            }
                                                                        })
                                                                    } else {
                                                                        $.ajax({
                                                                            type: 'POST',
                                                                            url: '../php/add_holidayyy.php',
                                                                            data: {
                                                                                branch: SELECTED_BRANCH,
                                                                                month: MONTH,
                                                                                year: YEAR,
                                                                                date: date,
                                                                                name: holi_name,
                                                                                employee: res.staffs[i].name,
                                                                                serial: res.staffs[i].serialnumber,
                                                                                date_before: isValid,
                                                                                present: p,
                                                                                class: res.staffs[i].class,
                                                                                date_after: isValid2,
                                                                                paysched: PAYSCHED
                                                                                
                                                                            },
                                                                            success: function(res){
                                                                                console.log(res);
                                                                            }
                                                                        })
                                                                    }
                                                                    
                                                                }

                                                            } catch(err) {

                                                            }

                                                            const monthName = months[d.getMonth()]; // Get month name based on zero-based index
                                                            const day = d.getDate();
                                                            const year = d.getFullYear();

                                                            let d1 = new Date(d_before);
                                                            let d2 = new Date(d_after);
                                                            const monthName1 = months[d1.getMonth()]; // Get month name based on zero-based index
                                                            const day1 = d1.getDate();
                                                            const year1 = d1.getFullYear();

                                                            const monthName2 = months[d2.getMonth()]; // Get month name based on zero-based index
                                                            const day2 = d2.getDate();
                                                            const year2 = d2.getFullYear();

                                                            // Format the date as "MonthName day, year"
                                                            const formattedDate = `${monthName} ${day}, ${year}`;
                                                            const formattedDate1 = `${monthName1} ${day1}, ${year1}`;
                                                            const formattedDate2 = `${monthName2} ${day2}, ${year2}`;

                                                            document.body.insertAdjacentHTML("afterbegin", `
                                                            <div class="fourth-layer-overlay">
                                                                <div class="folo-wrapper pt-5" style="min-width:40vw;position:relative;">
                                                                    ${close_icon}
                                                                    <p class="text-white text-center" style="font-size:20px;">${formattedDate}<br><span style="font-size:15px;">${holi_name}</span></p>
                                                                    
                                                                    <hr>
                                                                    <div style="display:flex;flex-direction:column;width:25%;margin-bottom:5px;">
                                                                        <span style="font-size:15px;color:#fff;">Holiday percentage:</span>
                                                                        <input type="number" id="percentage" placeholder="Enter percentage"/>
                                                                    </div>

                                                                    <div class="table-container" style="max-height:50vh;overflow:auto;">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <td>Employee</td>
                                                                                    <td>${formattedDate1}</td>
                                                                                    <td>${formattedDate} (Holiday)</td>
                                                                                    <td>${formattedDate2}</td>
                                                                                    <td>Action</td>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                ${tbody}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>`);

                                                            $(".approve-holiday").click(function(event){
                                                                event.stopImmediatePropagation();

                                                                if ($("#percentage").val() === '') {
                                                                    errorNotification("Please enter holiday percentage.", "warning");
                                                                } else {
                                                                    let snum = $(this).parent("td").parent("tr").data("id");
                                                                    let _class = $(this).parent("td").parent("tr").data("class");
                                                                    let name = $(this).parent("td").parent("tr").data("name");
                                                                    $(this).css("background", "orange");
                                                                    $(this).html("Approved");
                                                                    $.ajax({
                                                                        type: 'POST',
                                                                        url: '../php/fetch_class.php',
                                                                        data: {
                                                                            class: _class,
                                                                        },
                                                                        success: function(res) {
                                                                            try {
                                                                                res = JSON.parse(res);
                                                                                let rate = parseInt(res.rate);
                                                                                let hour_perday = parseInt(res.hour_perday);
                                                                                let rate_type = res.rate_type;

                                                                                if (rate_type == 'hourly') {
                                                                                    rate = rate * hour_perday;
                                                                                } else if (rate_type == 'monthly') {
                                                                                    rate = rate * 12;
                                                                                    rate = rate / 365; //based on 365 days per year factor
                                                                                }

                                                                                let perc = $("#percentage").val();
                                                                                perc = parseFloat(perc);
                                                                                let pay = perc * rate;
                                                                                pay = parseFloat(pay);

                                                                                $.ajax({
                                                                                    type: 'POST',
                                                                                    url: '../php/update_holiday.php',
                                                                                    data: {
                                                                                        serial: snum,
                                                                                        branch: SELECTED_BRANCH,
                                                                                        date: date,
                                                                                        month: MONTH,
                                                                                        year: YEAR,
                                                                                        pay: pay,
                                                                                        perc: perc,
                                                                                        paysched: PAYSCHED
                                                                                    }, success: function(res) {
                                                                                        console.log(res);
                                                                                    }
                                                                                })

                                                                                try {
                                                                                    // ALLDetails[snum][9]['HOLIDAYS (total)'] = pay;
                                                                                    // let earned2 = ALLDetails[snum][11]['EARNED'].value;
                                                                                    // earned2 = parseFloat(earned2);
                                                                                    // earned2 += pay;
                                                                                    // ALLDetails[snum][11]['EARNED'] = {'value' : earned2, 'highlight': '', op: '+'};
                                                                                    // let net2 = ALLDetails[snum][24]['NET'].value;
                                                                                    // net2 = parseFloat(net2);
                                                                                    // net2 += pay;
                                                                                    // ALLDetails[snum][24]['NET'] = {'value' : net2, 'highlight': ''};
    
                                                                                    for (let i = 0; i < PAYSLIPS.length; i++) {
                                                                                        // if (PAYSLIPS[i][3].name == name) {
                                                                                        //     PAYSLIPS[i][15]['name'] = pay;
                                                                                        //     let earnings = parseFloat(PAYSLIPS[i][39].name);
                                                                                        //     let net = parseFloat(PAYSLIPS[i][43].name);
                                                                                        //     earnings += pay;
                                                                                        //     net += pay;
                                                                                        //     PAYSLIPS[i][39]['name'] = earnings;
                                                                                        //     PAYSLIPS[i][43]['name'] = net;
                                                                                        // }
                                                                                    }

                                                                                } catch(err) {
                                                                                    console.log(err);
                                                                                }

                                                                                // if (COMPUTED.length > 0) {
                                                                                //     for (let i = 0; i < COMPUTED.length; i++) {
                                                                                //         if (COMPUTED[i].serial == snum && COMPUTED[i].date == $("#holiday-date").val()) {
                                                                                //             //computed = COMPUTED[i].computed;
                                                                                //             COMPUTED.splice(i, 1);
                                                                                //         }
                                                                                //     }
                                                                                //     let obj = {'serial' : snum, 'holidaypay' : pay, 'date' : $("#holiday-date").val()};
                                                                                //     COMPUTED.push(obj);
                                                                                // } else {
                                                                                //     let obj = {'serial' : snum, 'holidaypay' : pay, 'date' : $("#holiday-date").val()};
                                                                                //     COMPUTED.push(obj);
                                                                                // }
                                                                                
                                                                                successNotification("Approved.", "success");
                                                                            } catch (err) {
                                                                                console.log(err);
                                                                                errorNotification("Error fetching class.", "danger");
                                                                            }

                                                                            
                                                                        }
                                                                    })


                                                                    
                                                                    
                                                                }
                                                                


                                                            })

                                                            $(".close-window").click(function(event){
                                                                event.stopImmediatePropagation();
                                                                $(".fourth-layer-overlay").remove();
                                                            })
                                                        }
                                                    })
                                                })

                                                $(".close-window").click(function(event){
                                                    event.stopImmediatePropagation();
                                                    $(".fourth-layer-overlay").remove();
                                                })
                                            }
                                        }
                                    })
                                    // document.body.insertAdjacentHTML("afterbegin", `
                                    // <div class="fourth-layer-overlay">
                                    //     <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                                    //         ${close_icon}
                                    //         <p class="text-white text-center" style="font-size:20px;">ADD HOLIDAY</p>
                                    //         <hr>
                                    //         <div style="color:#fff;display:flex;flex-direction:column;">
                                    //         <span>ENTER PERCENTAGE:</span>
                                    //         <input type="text" placeholder="Enter percentage" id="percentage">
                                    //         <br>
                                    //         <input type="button" value="ADD HOLIDAY"/>
                                    //         </div>
                                    //     </div>
                                    // </div>`);

                                    

                                    
                                })
                    
                                $(".add-holiday").on("click", function(event){
                                    event.stopImmediatePropagation();
                    
                                    let ops = "";
                    
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/fetchHolidays.php',
                                        success: function(res){
                                            
                                            try {
                                                res = JSON.parse(res);
                                                
                                                for (let i = 0; i < res.length; i++) {
                                                    ops += `
                                                    <option value="${res[i].id}|${res[i].class}">${res[i].holiday_name}</option>
                                                    `;
                                                }
                    
                                            } catch(err) {
                                                console.log(err);
                                            }
                    
                                            document.body.insertAdjacentHTML("afterbegin", `
                                            <div class="third-layer-overlay">
                                                <div class="tlo-wrapper pt-5" style="position:relative;">
                                                    ${close_icon}
                                                    <p class="text-white text-center" style="font-size:20px;">ADD HOLIDAY</p>
                                                    <hr>
                                                    <form id="addHolidayForm">
                                                        <span>SELECT HOLIDAY</span>
                                                        <select name="holiday">
                                                            <option value="">Select holiday</option>
                                                            ${ops}
                                                        </select>
                                                        <span>SELECT DATE</span>
                                                        <input type="date" name="date"/>
                                                        <br>
                                                        <input type="submit" value="ADD HOLIDAY"/>
                                                    </form>
                                                </div>
                                            </div>`);
                    
                                            $("input[type='submit']").click(function(event){
                                                event.preventDefault();
                                                let data = new FormData(document.getElementById("addHolidayForm"));
                                                var formDataObject = {};
                                                let isNotEmpty = true;
                                                data.forEach(function(value, key){
                                                    if (data.getAll(key).length > 1) {
                                                        formDataObject[key] = data.getAll(key);
                                                    } else {
                                                        formDataObject[key] = value;
                                                    }
                    
                                                    if (value === '') {
                                                        isNotEmpty = false;
                                                    }
                                                });
                
                                                let val = formDataObject.holiday.split("|");
                                                formDataObject['holiday'] = val[0];
                                                formDataObject['class'] = val[1];
                    
                                                if (!isNotEmpty) {
                                                    errorNotification("Fields must be filled out.", "warning");
                                                } else {
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/add_holidaypay.php',
                                                        data: {
                                                            holiday: formDataObject.holiday,
                                                            class: formDataObject.class,
                                                            date: formDataObject.date,
                                                        }, success: function(res){
                    
                                                            if (res.includes('success')) {
                                                                successNotification("Holiday added.", "success");
                                                                $(".third-layer-overlay").remove();
                                                            }
                                                        }
                                                    })
                                                }
                                            })
                    
                    
                                            $(".close-window").click(function(){
                                                $(".third-layer-overlay").remove();
                                            })
                                        }
                                    })
                                })
                    
                                $(".compute-salary").on("click", function(event){
                                    event.stopImmediatePropagation();
                                    let id = $(this).data("id");

                                    //$(`#trow${id}`).children("input[type='checkbox']").prop("checked", true);
                    
                                    if ($(`#cal${id}`).val() === '') {
                                        errorNotification("Please enter working days.", "warning");
                                    } else {
                                        computeSalary(id);
                                        //$(this).remove();
                                        $(`.payslip${id}`).css("display", "inline");
                                    }
                                })
                    
                                $(".view-details").on("click", function(event){
                                    event.stopImmediatePropagation();


                    
                                    let id = $(this).data("id");
                                    console.log(id);
                                    let name = $(this).data("name");
                                  
                                    let CLASS = $(this).data("class");
                                    let class_name = CLASSES[CLASS];
                    
                                    let content = "";
                    
                                    let reportArr = [];
                                    reportArr.push(name);
                                    reportArr.push(id);
                                    reportArr.push(CLASS);
                                    reportArr.push(class_name);
                                
                                    for (let i = 0; i < ALLDetails[id].length; i++) {
                                        for (let key in ALLDetails[id][i]) {
                                            let NAME = key;
                                            if (ALLDetails[id][i].hasOwnProperty(key)) {
                                                let value = ALLDetails[id][i][key];
                                                
                                                try {
                                                    if (ALLDetails[id][i][key].hasOwnProperty('value')) {
                    
                                                        try {
                                                            value = ALLDetails[id][i][key].value.toLocaleString();
                                                        } catch (err) {
                                                            value = ALLDetails[id][i][key].value;
                                                        }
                                                    }
                    
                                                    if (ALLDetails[id][i][key].hasOwnProperty('highlight')) {
                                                        if (ALLDetails[id][i][key].hasOwnProperty('op')) {
                                                            content += `
                                                            <tr style="background:rgba(255,255,255,0.2);color: #000;border-bottom:1px solid rgba(0,0,0,0.1);">
                                                                <td>${NAME}</td>
                                                                <td>${ALLDetails[id][i][key].op} ${value}</td>
                                                            </tr>`;
                                                        } else {
                                                            content += `
                                                            <tr style="background:rgba(255,255,255,0.2);color: #000;border-bottom:1px solid rgba(0,0,0,0.1);">
                                                                <td>${NAME}</td>
                                                                <td>${value}</td>
                                                            </tr>`;
                                                        }
                                                        
                    
                                                    } else {
                                                        if (ALLDetails[id][i][key].hasOwnProperty('op')) {
                                                            content += `
                                                            <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                                <td>${NAME}</td>
                                                                <td>${ALLDetails[id][i][key].op} ${value}</td>
                                                            </tr>`;
                                                        } else {
                                                            content += `
                                                            <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                                <td>${NAME}</td>
                                                                <td>${value}</td>
                                                            </tr>`;
                                                        }
                                                    } 
                    
                                                } catch(err) {
                                                    console.log(err);
                                                }
                    
                                                reportArr.push(value);
                                                
                                            }
                                        }
                                    }
                                    
                                    document.body.insertAdjacentHTML("afterbegin", `
                                    <div class="third-layer-overlay">
                                        <div class="tlo-wrapper pt-5" style="position:relative;">
                                            ${close_icon}
                                            <p class="text-white text-center" style="font-size:20px;">${name}</p>
                                            <hr>
                                            <div class="table-container" style="max-height:40vh;overflow:auto;max-width:60vw;min-width:30vw;border-bottom:1px solid rgba(0,0,0,0.1);">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <td>NAME</td>
                                                            <td>VALUE</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="tbody">
                                                        ${content}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <br>
                                            <br>
                                        </div>
                                    </div>`);
                
                                    // <div style="text-align:center;">
                                    //     <input type="button" data-details='{"name":"${reportArr[0]}", "serial":"${reportArr[1]}", "class": "${reportArr[2]}", "class_name":"${reportArr[3]}", "rate": "${reportArr[4]}", "rate_type": "${reportArr[5]}", "working_days": "${reportArr[6]}", "days_worked": "${reportArr[7]}", "salary_rate": "${reportArr[8]}", "absent":"${reportArr[9]}", "basic": "${reportArr[10]}", "ut_total": "${reportArr[11]}", "tardiness" : "${reportArr[12]}", "holiday": "${reportArr[13]}", "ot_total" : "${reportArr[14]}", "earnings" : "${reportArr[15]}", "sss" : "${reportArr[16]}", "phil" : "${reportArr[17]}", "pbig": "${reportArr[18]}", "adjustment": "${reportArr[19]}", "cash_advance": "${reportArr[20]}", "charges" : "${reportArr[21]}", "sss_loan": "${reportArr[22]}", "pbig_loan": "${reportArr[23]}", "company_loan" : "${reportArr[24]}", "total_deductions": "${reportArr[25]}", "allowance": "${reportArr[26]}", "allowance_penalty": "${reportArr[27]}", "net": "${reportArr[28]}" }' style="width:80%;background:var(--teal);color:#fff !important;" class="paid" value="PAID"/>
                                    // </div>
                    
                                    $(".paid").click(function(event){
                                        event.stopImmediatePropagation();
                    
                                        let details = $(this).data("details");
                
                                        details.salary_rate = details.salary_rate.replace(/,/g, '');
                                        details.basic = details.basic.replace(/,/g, '');
                                        details.holiday = details.holiday.replace(/,/g, '');
                                        details.earnings = details.earnings.replace(/,/g, '');
                                        details.allowance = details.allowance.replace(/,/g, '');
                                        details.total_deductions = details.total_deductions.replace(/,/g, '');
                                        details.net = details.net.replace(/,/g, '');
                                        
                                        if (PAYSCHED != null || PAYSCHED !== 'undefined') {
                                            let d;
                                        
                                            if (PAYSCHED == 'twice-monthly') {
                                                d = new Date(from);
                                                
                                            } else if (PAYSCHED == 'monthly') {
                                                d = new Date();
                                            }
                
                                            let mon = months[d.getMonth()];
                                            let year = d.getFullYear();
                
                                            if (PAYSCHED == 'twice-monthly') {
                                                $.ajax({
                                                    type: 'POST',
                                                    url: '../php/determine_period.php',
                                                    data : {
                                                        id: id,
                                                    },
                                                    success: function(res) {
                                                        var period = res;
                
                                                        $.ajax({
                                                            type: 'POST',
                                                            url: '../php/employee_paid.php',
                                                            data: {
                                                                id: id,
                                                                name: details.name,
                                                                class: details.class,
                                                                class_name: details.class_name,
                                                                rate: details.rate,
                                                                rate_type: details.rate_type,
                                                                working_days: details.working_days,
                                                                days_worked: details.days_worked,
                                                                salary_rate: details.salary_rate,
                                                                absent: details.absent,
                                                                basic: details.basic,
                                                                ut_total: details.ut_total,
                                                                tardiness: details.tardiness,
                                                                holiday: details.holiday,
                                                                ot_total: details.ot_total,
                                                                earnings: details.earnings,
                                                                sss: details.sss,
                                                                phil: details.phil,
                                                                pbig: details.pbig,
                                                                adjustment: details.adjustment,
                                                                cash_advance: details.cash_advance,
                                                                charges: details.charges,
                                                                sss_loan: details.sss_loan,
                                                                pbig_loan: details.pbig_loan,
                                                                company_loan: details.company_loan,
                                                                total_deductions: details.total_deductions,
                                                                allowance: details.allowance,
                                                                allowance_penalty: details.allowance_penalty,
                                                                net: details.net,
                                                                month: mon,
                                                                year: year,
                                                                paysched: PAYSCHED,
                                                                period: period,
                                                                from: from,
                                                                to: to
                                                            },
                
                                                            success: function(res) {

                                                                if (res == 'paid') {
                                                                    successNotification(`${name} is paid.`, "success");
                                                                    $(`#paid${id}`).html("Paid");
                                                                    $(".third-layer-overlay").remove();
                                                                } 
                                                            }
                                                        })
                                                    }
                                                })

                                            } else {
                                                $.ajax({
                                                    type: 'POST',
                                                    url: '../php/employee_paid.php',
                                                    data: {
                                                        id: id,
                                                        name: details.name,
                                                        class: details.class,
                                                        class_name: details.class_name,
                                                        rate: details.rate,
                                                        rate_type: details.rate_type,
                                                        working_days: details.working_days,
                                                        days_worked: details.days_worked,
                                                        salary_rate: details.salary_rate,
                                                        absent: details.absent,
                                                        basic: details.basic,
                                                        ut_total: details.ut_total,
                                                        tardiness: details.tardiness,
                                                        holiday: details.holiday,
                                                        ot_total: details.ot_total,
                                                        earnings: details.earnings,
                                                        sss: details.sss,
                                                        phil: details.phil,
                                                        pbig: details.pbig,
                                                        adjustment: details.adjustment,
                                                        cash_advance: details.cash_advance,
                                                        charges: details.charges,
                                                        sss_loan: details.sss_loan,
                                                        pbig_loan: details.pbig_loan,
                                                        company_loan: details.company_loan,
                                                        total_deductions: details.total_deductions,
                                                        allowance: details.allowance,
                                                        allowance_penalty: details.allowance_penalty,
                                                        net: details.net,
                                                        month: mon,
                                                        year: year,
                                                        paysched: PAYSCHED,
                                                        period: '',
                                                        from: '',
                                                        to: ''
                                                    },
                                                    success: function(res) {
                                                        if (res == 'paid') {
                                                            successNotification(`${name} is paid.`, "success");
                                                            $(`#paid${id}`).html("Paid");
                                                            $(".third-layer-overlay").remove();
                                                        } 
                                                    }
                                                })
                                            }
                                        }
                                    })
                    
                                    $(".close-window").on("click", function(event){
                                        event.stopImmediatePropagation();
                                        $(".third-layer-overlay").remove();
                                    })
                
                                })
                    
                                $(".close-window").on("click", function(event){
                                    event.stopImmediatePropagation();
                                    ALLDetails = [];
                                    PAYSLIPS = [];

                                    try {
                                        document.getElementById("pages").innerHTML = "";
                                    } catch (err) {
                                        console.log(err);
                                    }

                                    $(".pop-up-window").remove();
                
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/remove_holidays.php',
                                        success: function(res) {}
                                    })
                                })


                            } catch (err) {
                                console.log(err);
                            }
                        }
                    })
                })

                $(".generate-new").click(function(event){
                    event.stopImmediatePropagation();
                    $(".pop-up-window").remove();
                    newFile();
                })

                $(".close-window").click(function(event){
                    event.stopImmediatePropagation();
                    $(".pop-up-window").remove();
                })

            } catch (err) {
                newFile();
            }


            function newFile() {
                let ops = "";
                for (let i = 0; i < BRANCH.length; i++) {
                    ops += `
                    <option value="${BRANCH[i].machine_id}">${BRANCH[i].branch_name}</option>`;
                }

                if (PAYSCHED != null || PAYSCHED !== 'undefined') {
                    if (PAYSCHED == 'twice-monthly') {
                        document.body.insertAdjacentHTML("afterbegin", `
                            <div class="pop-up-window">
                                <div class="window-content pt-5" style="position:relative;">
                                    ${close_icon}
                                    <p class="text-center text-white" style="font-size:20px;">GENERATE PAYROLL FILE</p>
                                    <hr>
                                    <div style="display:flex;flex-direction:column;min-width:20vw;color:#fff;">
                                        <span>Select branch:</span>
                                        <select id="branch">
                                            ${ops}
                                        </select>
                                        <span>Select period:</span>
                                        <select id="period">
                                            <option value="first-half">First half</option>
                                            <option value="second-half">Second half</option>
                                        </select>
                                        
                                        <span>From date: </span>
                                        <input type="date" id="from" />
                                        <span>To date:</span>
                                        <input type="date" id="to" />
                                        <br>
                                        <input type="button" value="PROCEED"/>
                                    </div>
                                </div>
                            </div>
                        `);

                        $("#from").on('change', function() {
                            let date = new Date($(this).val());
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
                            const day = String(date.getDate()).padStart(2, '0');

                            $("#to").val(`${year}-${month}-01`);
                        }); 
            
                        $(".close-window").click(function(){
                            $(".pop-up-window").remove();
                        })
            
                        $("input[type='button']").click(function(event){
                            event.stopImmediatePropagation();
                            if ($("#from").val() !== '' && $("#to").val() !== '' && $("#period").val() !== '') {
                                from = $("#from").val();
                                to = $("#to").val();
                                PERIOD = $("#period").val();
                                SELECTED_BRANCH = $("#branch").val();
                                $(".pop-up-window").remove();

                                let txt = "";
                               
                                let newdate = new Date(from);
                                let newdate2 = new Date(to);
                                let _mon = months[newdate.getMonth()];
                                let _d1 = newdate.getDate();
                                let _d2 = newdate2.getDate();
                                let _year = newdate.getFullYear();
                                txt += `${_mon} ${_d1}-${_d2}, ${_year}`;
                                        
                                   
                                $.ajax({
                                    type: 'POST',
                                    url: '../php/add_log.php',
                                    data: {
                                        log: `Created file ${txt}.`,
                                        branch: SELECTED_BRANCH,
                                        user: current_user

                                    },success: function(log_res) {
                                        console.log(log_res);
                                    }
                                })

                                

                                proceed();
                            } else {
                                errorNotification("Please select date to proceed.", "warning");
                            }
                        })
                        
                    } else {

                        const currentDate = new Date();
            
                        // Get the current year and month in the format "YYYY-MM"
                        const yearMonth = currentDate.toISOString().slice(0, 7);
            
            
                        document.body.insertAdjacentHTML("afterbegin", `
                            <div class="pop-up-window">
                                <div class="window-content pt-5" style="position:relative;">
                                    ${close_icon}
                                    <p class="text-center text-white" style="font-size:20px;">GENERATE PAYROLL FILE</p>
                                    <hr>
                                    <div style="display:flex;flex-direction:column;min-width:20vw;color:#fff;">
                                        <span>Select branch: </span>
                                        <select name="branch" id="branch">
                                            ${ops}
                                        </select>
                                        <span>Select month: </span>
                                        <input type="month" value="${yearMonth}" id="MON"/>
                                        <br>
                                        <input type="button" value="PROCEED"/>
                                    </div>
                                </div>
                            </div>
                        `);
            
                        $(".close-window").click(function(){
                            $(".pop-up-window").remove();
                        })
            
                        $("input[type='button']").click(function(event){
                            event.stopImmediatePropagation();
                            if ($("#MON").val() !== '') {
                                MON = $("#MON").val();
                                SELECTED_BRANCH = $("#branch").val();
                                
                                $(".pop-up-window").remove();

                                let txt = `${formatDate(MON)}`;

                                $.ajax({
                                    type: 'POST',
                                    url: '../php/add_log.php',
                                    data: {
                                        log: `Created file ${txt}.`,
                                        branch: SELECTED_BRANCH,
                                        user: current_user

                                    },success: function(log_res) {
                                        console.log(log_res);
                                    }
                                })

                                function formatDate(inputDate) {
                                    // Split the inputDate into year and month parts
                                    const [year, month] = inputDate.split('-');
                                
                                    // Convert month from numeric string to integer
                                    const monthNumber = parseInt(month, 10);
                                
                                    // Create a Date object with the year and month
                                    const date = new Date(year, monthNumber - 1);
                                
                                    // Get the month name in abbreviated form (e.g., 'Apr')
                                    const monthName = date.toLocaleString('default', { month: 'short' });
                                
                                    // Format the result as 'MMM YYYY'
                                    return `${monthName} ${year}`;
                                }

                                proceed();
                            } else {
                                errorNotification("Please select month to proceed.", "warning");
                            }
                        })
                    }
                }
            }
        }
    })

    function proceed() {
        $.ajax({
            type: 'POST',
            url: '../php/fetch_branch_staff.php',
            data: {
                branch: SELECTED_BRANCH,
            },
            success: function(res){
                try {
                    res = JSON.parse(res);

                    generateFile(res, res.length);
                    
                } catch(err) {
                    console.log(err);
                }

                
            }
        })
    }

})

//management
$(".add-staff").on("click", function(event){
    event.stopImmediatePropagation();

    $.ajax({
        type: 'GET',
        url: '../php/fetch_classes.php',
        success: function(res){
       
            try {
                res = JSON.parse(res);
                
                let ops = "";
                let branch = "";

                for (let i = 0; i < res.length ; i++) {
                    ops += `
                    <option value="${res[i].id}">${res[i].class_name}</option>
                    `;
                }

                for (let i = 0; i < BRANCH.length; i++) {
                    branch += `
                    <option value="${res[i].machine_id}">${BRANCH[i].branch_name}</option>`;
                }

                document.body.insertAdjacentHTML("afterbegin", `
                <div class="pop-up-window">
                    <div class="window-content pt-5" style="position:relative;">
                        ${close_icon}
                        <p class="text-center text-white" style="font-size:20px;">REGISTER EMPLOYEE</p>
                        
                        <div style="display: flex;align-items: center;margin-top:10px;margin-bottom:10px;">
                            <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                            <div style="flex:2;display:grid;place-items:center;color:#fff;">EMPLOYEE DETAILS</div>
                            <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                        </div>
                        
                        <form id="registerStaffForm" enctype="multipart/form-data">
                            <input type="text" placeholder="Name" name="name" autocomplete="off">
                            <input type="number" placeholder="Age" name="age" autocomplete="off">
                            <input type="text" placeholder="Phone number" name="phone" autocomplete="off">
                            <input type="text" placeholder="Position" name="position" autocomplete="off">
                            <input type="text" placeholder="Department" name="department" autocomplete="off">
                            
                            <span>SELECT CLASS:</span>
                            <select name="class">
                                ${ops}
                            </select>
                        
                            <span>DATE EMPLOYED: </span>
                            <input type="date" name="employed"/>
                            <span>UPLOAD PICTURE: (Optional)</span>
                            <input type="file" name="file"/>

                            <div style="display: flex;align-items: center;margin-top:10px;">
                                <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                                <div style="flex:2;display:grid;place-items:center;color:#fff;">SCAN FINGERPRINT</div>
                                <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                            </div>

                            <div class="fingerprint-login pb-4" style="display:grid;place-items:center;margin-top:-30px;">
                                <img src="../src/images/fid.png" style="height:200px;"/>
                            </div>

                            <input disabled type="submit" onclick="addStaff()" value="Add Staff" style="background:var(--lg);"/>
                        </form>
                    </div>
                </div>`);

                $(".close-window").on("click", function(event){
                    event.stopImmediatePropagation();
                    $(".pop-up-window").remove();
                })

            } catch (err) {
                console.log(err);
            }
        }
    });

    
})

$(".view-staffs").on("click", function(event){
    event.stopImmediatePropagation();

    $.ajax({
        type: 'GET',
        url: '../php/staffs.php',
        success:function(res){
            let data = JSON.parse(res);
            let br = "";
            for (let i = 0; i < BRANCH.length; i++) {
                br += `<option value="${BRANCH[i].machine_id}">${BRANCH[i].branch_name}</option>`;
            }
         
            let content = ""; 
            document.body.insertAdjacentHTML("afterbegin", `
            <div class="pop-up-window">
                <div class="window-content" style="position:relative;">
                    ${close_icon}
                    <p class="text-center text-white" style="font-size:20px;">EMPLOYEES (<span id="num-of-staffs"></span>)</p>
                    
                    <hr>
                    <select id="branch" style="margin-bottom:10px;">
                        <option value="">Select branch</option>
                        ${br}
                    </select>
                    <div class="table-container" style="max-height:60vh;overflow:auto;max-width:80vw;min-width:60vw;">
                        <table>
                            <thead>
                                <tr>
                                    <td>NAME OF EMPLOYEE</td>
                                    <td>CLASS</td>
                                    <td>STATUS</td>
                                    <td>ADJUSTMENT</td>
                                    <td>CHARGES</td>
                                    <td>CASH ADV.</td>
                                    <td>SSS LOAN</td>
                                    <td>Pag-IBIG LOAN</td>
                                    <td>COMPANY LOAN</td>
                                    <td class="text-center">ACTION</td>
                                </tr>
                            </thead>
                            <tbody id="tbody">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`);

            $("#branch").change(function(event){
                if ($(this).val() !== '') {
                    
                    $.ajax({
                        type: 'POST',
                        url: '../php/fetch_branch_staff.php',
                        data: {
                            branch: $(this).val(),
                        }, success: function(res) {
                            let content = "";
                            try {
                                data = JSON.parse(res);
                                
                                for (let i = 0; i < data.length; i++) {
                                    content += `
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>${data[i].name}</td>
                                        <td>${CLASSES[data[i].class]}</td>
                                        <td>${data[i].status}</td>
                                        <td>${data[i].adjustment}</td>
                                        <td>${data[i].charges}</td>
                                        <td>${data[i].cash_advance}</td>
                                        <td>${data[i].sss_loan}</td>
                                        <td>${data[i].pag_ibig_loan}</td>
                                        <td>${data[i].company_loan}</td>
                                        <td style="display:grid;grid-template-columns: auto auto auto auto;column-gap:5px;">
                                            <button class="action-button employee-profile" data-details='{"branch":"${data[i].branch}","serial": "${data[i].serialnumber}", "name": "${data[i].name}", "age" : "${data[i].age}", "phone": "${data[i].contact_number}", "class": "${CLASSES[data[i].class]}", "pos": "${data[i].position}", "dept" : "${data[i].department}", "employed" : "${data[i].date_employed}" }'> PROFILE</button>
                                            
                                            <button class="action-button add-allowance" data-name="${data[i].name}" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-branch="${data[i].branch}"> ALLOWANCE</button>
                                            <button class="action-button add-deductions" data-branch="${data[i].branch}" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-name="${data[i].name}" data-dept="${data[i].department}" data-pos="${data[i].position}"> DEDUCTIONS</button>
                                        </td>
                                    </tr>`;
                                }

                                $("#num-of-staffs").html(data.length);
                                
                            }
                            catch(err) {
                                content += `
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td colspan="10" style="text-align:center;padding:10px 0;">No item.</td>
                                    </tr>`;

                                $("#num-of-staffs").html("0");
                                
                            }


                            $("#tbody").html("");
                            document.getElementById("tbody").insertAdjacentHTML("afterbegin", `${content}`);


                            $(".add-deductions").on("click", function(event){
                                event.stopImmediatePropagation();
                                let snumber = $(this).data("snumber");
                                let id = $(this).data("id");
                                let name = $(this).data("name");
                                let pos = $(this).data("pos");
                                let dept = $(this).data("dept");
                                let branch = $(this).data("branch");
                                
                                OPEN(snumber, id, name, dept, pos, branch);
                            })


                            $(".add-allowance").click(function(event){
                                event.stopImmediatePropagation();
                                
                                let snum = $(this).data("snumber");
                                let branch = $(this).data("branch");
                                let user_name = $(this).data("name");
                                
                                $.ajax({
                                    type: 'POST',
                                    url: '../php/fetch_employeeAllowance.php',
                                    data: {
                                        serial: snum,
                                        branch: branch
                                    }, success: function(res) {
                                        
                                        let content = "";
                                        try {
                                            res = JSON.parse(res);
                                            for (let i = 0; i < res.length; i++) {
                                                content += `
                                                <tr id="row${res[i].id}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                    <td>${res[i].allowance_name}</td>
                                                    <td>${res[i].amount}</td>
                                                    <td>${res[i].type}</td>
                                                    <td><button data-id="${res[i].id}" data-allid="${res[i].allowance_id}" class="action-button delete-allowance">DELETE</button></td>
                                                </tr>`;
                                            }

                                        } catch (err) {
                                            content += `
                                            <tr>
                                                <td colspan="4" style="text-align:center;padding:10px 0;">No item.</td>
                                            </tr>`;
                                        }
                
                                        document.body.insertAdjacentHTML("afterbegin", `
                                        <div class="third-layer-overlay">
                                            <div class="tlo-wrapper pt-5" style="position:relative;min-width:30vw;">
                                                ${close_icon}
                                                <p class="text-center text-white" style="font-size:20px;">ALLOWANCE</p>
                                                <button class="action-button" id="add">ADD ALLOWANCE</button>
                                                <hr>
                                                <div class="table-container">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <td>NAME</td>
                                                                <td>AMOUNT</td>
                                                                <td>TYPE</td>
                                                                <td>ACTION</td>
                                                            </tr>
                                                        </thead>
                                                        ${content}
                                                    </table>
                                                </div>
                                            </div>
                                        </div>`);
                
                                        $(".delete-allowance").click(function(event){
                                            event.stopImmediatePropagation();
                                            let id = $(this).data("id");
                                            $.ajax({
                                                type: 'POST',
                                                url: '../php/delete_employee_allowance.php',
                                                data: {
                                                    serial: snum,
                                                    branch: branch,
                                                    id: id
                                                }, success: function(res) {
                                                    if (res == 'deleted') {
                                                        $(`#row${id}`).remove();
                                                        successNotification('Allowance deleted.', 'success');
                                                    }
                                                }
                                            })
                                        })
                
                                        $(".close-window").click(function(event){
                                            $(".third-layer-overlay").remove();
                                        })
                
                                        $("#add").click(function(event){
                                            event.stopImmediatePropagation();
                                            let all = "";

                                            if (COMPANY_ALLOWANCE == 'undefined' || COMPANY_ALLOWANCE == null) {
                                                errorNotification("Please set up company allowance.", "warning");
                                            } else {
                                                for (let i = 0; i < COMPANY_ALLOWANCE.length; i++) {
                                                    all += `
                                                    <option value="${COMPANY_ALLOWANCE[i].id}">${COMPANY_ALLOWANCE[i].name}</option>`;
                                                }
    
                                                document.body.insertAdjacentHTML("afterbegin", `
                                                <div class="fourth-layer-overlay">
                                                    <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                                                        ${close_icon}
                                                        <p class="text-white text-center" style="font-size:20px;">ADD ALLOWANCE</p>
                                                        <hr>
                                                        <form id="addallowanceForm">
                                                            <span>SELECT ALLOWANCE:</span>
                                                            <select name="allowance">
                                                                ${all}
                                                            </select>
                                                            <br>
                                                            <input type="submit" value="ADD ALLOWANCE"/>
                                                        </form>
                                                    </div>
                                                </div>`);
                    
                                                $(".close-window").click(function(event){
                                                    $(".fourth-layer-overlay").remove();
                                                })
                    
                                                $("input[type='submit']").click(function(event){
                                                    event.preventDefault();
                                                    let id = $("select").val();
                                                    let obj;
                                                    for (let i = 0; i < COMPANY_ALLOWANCE.length; i++) {
                                                        if (id == COMPANY_ALLOWANCE[i].id) {
                                                            obj = COMPANY_ALLOWANCE[i];
                                                        }
                                                    }

                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/add_employee_allowance.php',
                                                        data: {
                                                            serial: snum,
                                                            branch: branch,
                                                            allid: obj.id,
                                                            allname: obj.name,
                                                            amount: obj.amount,
                                                            type: obj.type

                                                        },success: function(res) {
                                                            if (res == 'success') {
                                                                successNotification("Allowance added.", "success");
                                                                $(".fourth-layer-overlay").remove();

                                                                $.ajax({
                                                                    type: 'POST',
                                                                    url: '../php/add_log.php',
                                                                    data: {
                                                                        log: `Added ${obj.name} allowance to ${user_name}.`,
                                                                        branch: branch,
                                                                        user: current_user
                                                                    },success: function(log_res) {
                                                                        console.log(log_res);
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                    
                                                })
                                            }

                                            
                                              
                                            
                                           
                                            
                                        })
                
                                    }
                                })
                            })

                            $(".employee-profile").click(function(event){
                                event.stopImmediatePropagation();
                                let details = $(this).data("details");
                
                                $.ajax({
                                    type: 'POST',
                                    url: '../php/get_photo.php',
                                    data: {
                                        serial: details.serial,
                                        branch: details.branch
                                    }, success: function(res) {
                                        console.log(res);
                                        let imgSrc;
                                        if (res != 'none') {
                                            imgSrc = "data:image/jpeg;base64," + res;
                                        } else {
                                            imgSrc = "https://placehold.jp/20c997/ffffff/250x200.png?text=Photo";
                                        }
                                        let br;
                                        for (let i = 0; i < BRANCH.length; i++) {
                                            if (BRANCH[i].machine_id == details.branch) {
                                                br = BRANCH[i].branch_name;
                                            }
                                        }
                                        
                
                                        document.body.insertAdjacentHTML("afterbegin", `
                                            <div class="third-layer-overlay">
                                                <div class="tlo-wrapper pt-5 text-white" style="position:relative;max-height:60vh;max-width:50vw;min-width:35vw">
                                                    ${close_icon}
                                                    <p class="text-center" style="font-size:20px;">${COMPANY_NAME}</p>
                                                    <hr>
                                                    <div>
                                                        <div class="profile-container">
                                                            <div class="profile-pic" style="width:250px;height:200px;"><img src="${imgSrc}" alt="photo" style="width:250px;height:200px;border:1px solid rgba(0,0,0,0.1);object-fit:cover;"/></div>
                                                            <div class="profile-details">
                                                                <span>Name:  ${details.name}</span>
                                                                <span>Age:  ${details.age}</span>
                                                                <span>Contact:  ${details.phone}</span>
                                                                <span>Class:  ${details.class}</span>
                                                                <span>Position:  ${details.pos}</span>
                                                                <span>Branch:  ${br}</span>
                                                                <span>Date Employed:  ${details.employed}</span>
                                                                <div style="margin-top:10px;"></div>
                                                                <span><button class="action-button">Full details</button></span>
                                                            </div>
                                                        </div>
                                                        <hr>
                                                    </div>
                                                </div>
                                            </div>`);
                            
                                            $(".close-window").click(function(event){
                                                $(".third-layer-overlay").remove();
                                            })
                
                                    }
                                })
                
                                
                            })
                        }
                    })
                }
            })

            $(".close-window").click(function(event){
                event.stopImmediatePropagation();
                $(".pop-up-window").remove();
            })

            for (let i = 0; i < data.length; i++) {
                let totalHours = parseFloat(data[i].total_hours);
                totalHours = totalHours.toFixed(2);

                content += `
                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                    <td>${data[i].name}</td>
                    <td>${CLASSES[data[i].class]}</td>
                    <td>${data[i].status}</td>
                    <td>${data[i].adjustment}</td>
                    <td>${data[i].charges}</td>
                    <td>${data[i].cash_advance}</td>
                    <td>${data[i].sss_loan}</td>
                    <td>${data[i].pag_ibig_loan}</td>
                    <td>${data[i].company_loan}</td>
                    <td style="display:grid;grid-template-columns: auto auto auto auto;column-gap:5px;">
                        <button class="action-button employee-profile" data-details='{"branch":"${data[i].branch}","serial": "${data[i].serialnumber}", "name": "${data[i].name}", "age" : "${data[i].age}", "phone": "${data[i].contact_number}", "class": "${CLASSES[data[i].class]}", "pos": "${data[i].position}", "dept" : "${data[i].department}", "employed" : "${data[i].date_employed}" }'>PROFILE</button>
                        <button class="action-button add-allowance" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-branch="${data[i].branch}" data-name="${data[i].name}"> ALLOWANCE</button>
                        <button class="action-button add-deductions" data-branch="${data[i].branch}" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-name="${data[i].name}" data-dept="${data[i].department}" data-pos="${data[i].position}"> DEDUCTIONS</button>
                    </td>
                </tr>`;
            }

            //<button class="action-button open" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-name="${data[i].name}" data-dept="${data[i].department}" data-pos="${data[i].position}">LEAVE</button>
            document.getElementById("tbody").insertAdjacentHTML("afterbegin", `${content}`);
            $("#num-of-staffs").html(data.length);

            $(".add-allowance").click(function(event){
                event.stopImmediatePropagation();
                let snum = $(this).data("snumber");
                let branch = $(this).data("branch");
                let user_name = $(this).data("name");
                
                $.ajax({
                    type: 'POST',
                    url: '../php/fetch_employeeAllowance.php',
                    data: {
                        serial: snum,
                        branch: branch
                    }, success: function(res) {
                        
                        let content = "";
                        try {
                            res = JSON.parse(res);
                            for (let i = 0; i < res.length; i++) {
                                content += `
                                <tr id="row${res[i].id}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>${res[i].allowance_name}</td>
                                    <td>${res[i].amount}</td>
                                    <td>${res[i].type}</td>
                                    <td><button data-id="${res[i].id}" data-allid="${res[i].allowance_id}" class="action-button delete-allowance">DELETE</button></td>
                                </tr>`;
                            }

                        } catch (err) {
                            content += `
                            <tr>
                                <td colspan="4" style="text-align:center;padding:10px 0;">No item.</td>
                            </tr>`;
                        }

                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="third-layer-overlay">
                            <div class="tlo-wrapper pt-5" style="position:relative;min-width:30vw;">
                                ${close_icon}
                                <p class="text-center text-white" style="font-size:20px;">ALLOWANCE</p>
                                <button class="action-button" id="add">ADD ALLOWANCE</button>
                                <hr>
                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>NAME</td>
                                                <td>AMOUNT</td>
                                                <td>TYPE</td>
                                                <td>ACTION</td>
                                            </tr>
                                        </thead>
                                        ${content}
                                    </table>
                                </div>
                            </div>
                        </div>`);

                        $(".delete-allowance").click(function(event){
                            event.stopImmediatePropagation();
                            let id = $(this).data("id");
                            $.ajax({
                                type: 'POST',
                                url: '../php/delete_employee_allowance.php',
                                data: {
                                    serial: snum,
                                    branch: branch,
                                    id: id
                                }, success: function(res) {
                                    if (res == 'deleted') {
                                        $(`#row${id}`).remove();
                                        successNotification('Allowance deleted.', 'success');
                                    }
                                }
                            })
                        })

                        $(".close-window").click(function(event){
                            $(".third-layer-overlay").remove();
                        })

                        $("#add").click(function(event){
                            event.stopImmediatePropagation();
                            let all = "";

                            if (COMPANY_ALLOWANCE == 'undefined' || COMPANY_ALLOWANCE == null) {
                                errorNotification("Please set up company allowance.", "warning");
                            } else {
                                for (let i = 0; i < COMPANY_ALLOWANCE.length; i++) {
                                    all += `
                                    <option value="${COMPANY_ALLOWANCE[i].id}">${COMPANY_ALLOWANCE[i].name}</option>`;
                                }

                                document.body.insertAdjacentHTML("afterbegin", `
                                <div class="fourth-layer-overlay">
                                    <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                                        ${close_icon}
                                        <p class="text-white text-center" style="font-size:20px;">ADD ALLOWANCE</p>
                                        <hr>
                                        <form id="addallowanceForm">
                                            <span>SELECT ALLOWANCE:</span>
                                            <select name="allowance">
                                                ${all}
                                            </select>
                                            <br>
                                            <input type="submit" value="ADD ALLOWANCE"/>
                                        </form>
                                    </div>
                                </div>`);
                                
                                $(".close-window").click(function(event){
                                    $(".fourth-layer-overlay").remove();
                                })

                                $("input[type='submit']").click(function(event){
                                    event.preventDefault();
                                    let id = $("select").val();
                                    let obj;
                                    for (let i = 0; i < COMPANY_ALLOWANCE.length; i++) {
                                        if (id == COMPANY_ALLOWANCE[i].id) {
                                            obj = COMPANY_ALLOWANCE[i];
                                        }
                                    }
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/add_employee_allowance.php',
                                        data: {
                                            serial: snum,
                                            branch: branch,
                                            allid: obj.id,
                                            allname: obj.name,
                                            amount: obj.amount,
                                            type: obj.type
                                        },success: function(res) {
                                          
                                            if (res == 'success') {
                                                successNotification("Allowance added.", "success");
                                                $(".fourth-layer-overlay").remove();

                                                $.ajax({
                                                    type: 'POST',
                                                    url: '../php/add_log.php',
                                                    data: {
                                                        log: `Added ${obj.name} allowance to ${user_name}.`,
                                                        branch: branch,
                                                        user: current_user
                                                    },success: function(log_res) {
                                                        console.log(log_res);
                                                    }
                                                })
                                            }
                                        }
                                    })
                                    
                                })
                            }
                        })
                    }
                })
            })

            $(".employee-profile").click(function(event){
                event.stopImmediatePropagation();
                let details = $(this).data("details");

                $.ajax({
                    type: 'POST',
                    url: '../php/get_photo.php',
                    data: {
                        serial: details.serial,
                        branch: details.branch
                    }, success: function(res) {
                        console.log(res);
                        let imgSrc;
                        if (res != 'none') {
                            imgSrc = "data:image/jpeg;base64," + res;
                        } else {
                            imgSrc = "https://placehold.jp/20c997/ffffff/250x200.png?text=Photo";
                        }

                        let br;
                        for (let i = 0; i < BRANCH.length; i++) {
                            if (BRANCH[i].machine_id == details.branch) {
                                br = BRANCH[i].branch_name;
                            }
                        }

                        document.body.insertAdjacentHTML("afterbegin", `
                            <div class="third-layer-overlay">
                                <div class="tlo-wrapper pt-5 text-white" style="position:relative;max-height:60vh;max-width:50vw;min-width:35vw">
                                    ${close_icon}
                                    <p class="text-center" style="font-size:20px;">${COMPANY_NAME}</p>
                                    <hr>
                                    <div>
                                        <div class="profile-container">
                                            <div class="profile-pic" style="width:250px;height:200px;"><img src="${imgSrc}" alt="photo" style="width:250px;height:200px;border:1px solid rgba(0,0,0,0.1);object-fit:cover;"/></div>
                                            <div class="profile-details">
                                                <span>Name:  ${details.name}</span>
                                                <span>Age:  ${details.age}</span>
                                                <span>Contact:  ${details.phone}</span>
                                                <span>Class:  ${details.class}</span>
                                                <span>Position:  ${details.pos}</span>
                                                <span>Branch:  ${br}</span>
                                                <span>Date Employed:  ${details.employed}</span>
                                                <div style="margin-top:10px;"></div>
                                                <span><button class="action-button">Full details</button></span>
                                            </div>
                                        </div>
                                        <hr>
                                    </div>
                                </div>
                            </div>`);
            
                            $(".close-window").click(function(event){
                                $(".third-layer-overlay").remove();
                            })

                    }
                })

                
            })

            $(".open").on("click", function(event){
                event.stopImmediatePropagation();
                
                let snumber = $(this).data("snumber");
                let id = $(this).data("id");
                let name = $(this).data("name");
                let pos = $(this).data("pos");
                let dept = $(this).data("dept");

                var leave_start;
                var leave_end;

                $.ajax({
                    type: 'POST',
                    url: '../php/fetch_leave.php',
                    data: {
                        serial: snumber,
                    },
                    success: function(res) {
                        try {
                            res = JSON.parse(res);
                            leave_start = res[0].leave_start;
                            leave_end = res[0].leave_end;
                        } catch(err) {
                            console.log("");
                        }
                    }
                })

                document.body.insertAdjacentHTML("afterbegin", `
                <div class="third-layer-overlay">
                    <div class="tlo-wrapper pt-5"  style="max-height:60vh;max-width:30vw;min-width:30vw;position:relative;">
                        ${close_icon}
                        <p class="text-white text-center" style="font-size:20px;">${name}</p>
                        <p class="text-white text-center" style="font-size:13px;margin-top:-20px;">${dept} | ${pos}</p>
                        <hr>

                        <form style="width:100%;" id="staffSettings">
                            <table>
                                <thead>
                                    <tr>
                                        <td>TYPE</td>
                                        <td>VALUE</td>
                                        <td>ACTION</td>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>PAID LEAVE</td>
                                        <td id="leave"></td>
                                        <td style="display:grid;grid-template-columns: auto auto;column-gap:5px;">
                                            <input type="button" id="edit-leave" value="REQUEST"/>
                                            <input type="button" id="cancel-leave" value="CANCEL"/>
                                        </td>
                                    </tr>

                                </tbody>
                            </table>

                        </form>
                    </div>
                </div>`);

                setTimeout(() => {
                    if (leave_start != undefined || leave_start != null) {
                        $("#leave").html(`${leave_start} - ${leave_end}`);
                    } else {
                        $("#leave").html("None");
                    }

                }, 200);


                $("#edit-leave").click(function(event){
                    event.stopImmediatePropagation();
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="fourth-layer-overlay">
                        <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                            ${close_icon}
                            <p class="text-white text-center" style="font-size:20px;">SELECT DATE LEAVE</p>
                            <hr>
                            <form id="requestLeaveForm">
                                <span>DATE START:</span>
                                <input type="date" name="start">

                                <span>DATE END:</span>
                                <input type="date" name="end">
                               
                                <br>
                                <input type="submit" value="UPDATE"/>
                            </form>
                        </div>
                    </div>`);

                    $("input[type='submit']").click(function(event){
                        event.preventDefault();
                        let data = new FormData(document.getElementById("requestLeaveForm"));
                        var formDataObject = {};
                        let isNotEmpty = true;
                        data.forEach(function(value, key){
                            formDataObject[key] = value;
                            if (value === '') {
                                isNotEmpty = false;
                            }
                        });

                        if (!isNotEmpty) {
                            successNotification("Fields must be filled out.", "warning");
                        } else {
                            $.ajax({
                                type: 'POST',
                                url: '../php/req_leave.php',
                                data: {
                                    serial: snumber,
                                    start: formDataObject.start,
                                    paid_leave: formDataObject.paid_leave,
                                    end: formDataObject.end
                                }, success: function(res){
                                    try {
                                        
                                        if (res.includes('success')) {
                                            successNotification("Leave request done.", "success");
                                            $(".fourth-layer-overlay").remove();
                                        }
        
                                    } catch(err) {
                                        console.log(err);
                                    }
                                }
                            })
                        }
                    })


                    $(".close-window").on("click", function(event){
                        $(".fourth-layer-overlay").remove();
                    })
                })

                $("#cancel-leave").click(function(event){
                    event.stopImmediatePropagation();
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="fourth-layer-overlay">
                        <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                            ${close_icon}
                            <p class="text-white text-center" style="font-size:20px;">CANCEL LEAVE</p>
                            <hr>
                            <form>
                                <input type="submit" value="CONFIRM"/>
                            </form>
                        </div>
                    </div>`);

                    $("input[type='submit']").on("click", function(event){
                        event.preventDefault();

 
                      
                        $.ajax({
                            type: 'POST',
                            url: '../php/cancel_leave.php',
                            data: {
                                serial: snumber,
                                
                            }, success: function(res){
                                try {
                                    
                                    if (res.includes('success')) {
                                        successNotification("Leave request cancelled.", "success");
                                        $(".fourth-layer-overlay").remove();
                                    }
    
                                } catch(err) {
                                    console.log(err);
                                }
                            }
                        })
                        
                    })


                    $(".close-window").on("click", function(event){
                        $(".fourth-layer-overlay").remove();
                    })
                })

                $(".close-window").on("click", function(event){
                    $(".third-layer-overlay").remove();
                })

            })

            $(".add-deductions").on("click", function(event){
                event.stopImmediatePropagation();
                let snumber = $(this).data("snumber");
                let id = $(this).data("id");
                let name = $(this).data("name");
                let pos = $(this).data("pos");
                let dept = $(this).data("dept");
                let branch = $(this).data("branch");
                
                OPEN(snumber, id, name, dept, pos, branch);
            })
            
        }
    })
})

$(".settings").on("click", function(event){
    event.stopImmediatePropagation();
    $.ajax({
        type: 'POST',
        url: '../php/fetch_company_settings.php',
        success: function(res) {

            let ops = "";
            let inputs = "";
            let compname = "";
            let compadd = "";
            try {
                res = JSON.parse(res);
                compname = res[0].name;
                compadd = res[0].address;
                if (res[0].pay_sched == 'twice-monthly') {
                    ops += `
                    <option value="">Select schedule</option>
                    <option value="twice-monthly" selected>Twice monthly</option>
                    <option value="monthly">Monthly</option>`;

                    inputs += `
                    <span class="twice-mon-sched">Day of the month (1st half):</span>
                    <input class="twice-mon-sched" value="${res[0].day1}" name="day1" type="number" placeholder="1st half"/>
                    <span class="twice-mon-sched">Day of the month (2nd half):</span>
                    <input class="twice-mon-sched"value="${res[0].day2}" type="number" name="day2" placeholder="2nd half"/>`;
                } else {
                    ops += `
                    <option value="">Select schedule</option>
                    <option value="twice-monthly">Twice monthly</option>
                    <option value="monthly" selected>Monthly</option>`;

                    inputs += `
                    <span class="twice-mon-sched" style="visibility:hidden;">Day of the month (1st half):</span>
                    <input class="twice-mon-sched" name="day1" type="number" placeholder="1st half" style="visibility:hidden;"/>
                    <span class="twice-mon-sched" style="visibility:hidden;">Day of the month (2nd half):</span>
                    <input class="twice-mon-sched" type="number" name="day2" placeholder="2nd half" style="visibility:hidden;"/>`;
                }
            } catch (err) {
                ops += `
                <option value="">Select schedule</option>
                <option value="twice-monthly">Twice monthly</option>
                <option value="monthly">Monthly</option>`;
            }

            document.body.insertAdjacentHTML("afterbegin", `
            <div class="pop-up-window" style="overflow:auto;">
                <div class="window-content pt-5" style="position:relative;">
                    ${close_icon}
                    <div style="display: flex;align-items: center;margin-top:10px;margin-bottom:30px;">
                        <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                        <div style="flex:1;display:grid;place-items:center;color:#fff;font-size:20px;">COMPANY SETUP</div>
                        <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                    </div>
                    <form style="width:100%;" id="companySettingsForm">
                        <div class="company-details-wrapper">
                            <div>
                                <p class="text-center text-white">PAY SCHEDULE <br>(required)</p>
                                <div>
                                    <select id="payroll-sched" name="pay_sched" required>
                                        ${ops}
                                    </select>

                                   
                                </div>
                            </div>
                            <div>
                                <p class="text-center text-white">COMPANY DETAILS</p>
                                <div>
                                    <span>Company name: (required)</span>
                                    <input type="text" name="compname" value="${compname}"  autocomplete="off" placeholder="Enter company name"/>
                                    <span>Company address: (required)</span>
                                    <input type="text" name="compadd" value="${compadd}" placeholder="Enter company address"/>
                                </div>
                            </div>
                            <div>
                                <p class="text-center text-white">EMPLOYEES CLASSIFICATION<br>(add at least one)</p>
                                <div>
                                    <input type="button" id="add-class"  value="ADD"/>
                                </div>
                            </div>
                            <div>
                                <p class="text-center text-white">ALLOWANCE</p>
                                <div>
                                    <input type="button" id="add-allowance"  value="ADD"/>
                                </div>
                            </div>
                            
                            <div>
                                <p class="text-center text-white">ALLOWANCE PENALTY</p>
                                <div>
                                    <input type="button" id="add-penalties"  value="ADD"/>
                                </div>
                            </div>

                            <div class="deductions">
                                <input type="submit" value="UPDATE" style="width:100%;"/>
                            </div>
                        </div>
                    </form>
                </div>
            </div>`);

            $("#payroll-sched").on("change", function(){
                if ($(this).val().includes("twice")) {
                    $(".twice-mon-sched").css("visibility", "visible");
                } else {
                    $(".twice-mon-sched").css("visibility", "hidden");
                }
            })

            $.ajax({
                type: 'GET',
                url: '../php/fetch_company_settings.php',
                success: function(res){
                    try {
                        res = JSON.parse(res);
                        $(".pop-up-window input[name='allowance']").val(res[0].allowance);
                        $(".pop-up-window input[name='sss']").val(res[0].sss_deduction);
                        $(".pop-up-window input[name='phil']").val(res[0].philhealth_deduction);
                        $(".pop-up-window input[name='pbig']").val(res[0].pag_ibig_deduction);

                    } catch (err) {
                        console.log(err);
                    }
                }
            })

            $("input[type='submit']").on("click", function(event){
                event.preventDefault();
                event.stopImmediatePropagation();

                let data = new FormData(document.getElementById("companySettingsForm"));
                var formDataObject = {};

                data.forEach(function(value, key){
                    formDataObject[key] = value;
                });

                if (formDataObject.pay_sched == '') {
                    errorNotification("Please select pay schedule.", "warning");
                } else {
                    $.ajax({
                        type: 'POST',
                        url: '../php/update_company_settings.php',
                        data: {
                            pay_sched: formDataObject.pay_sched,
                            day1: 0,
                            day2: 0,
                            name: formDataObject.compname,
                            address: formDataObject.compadd

                        }, success: function(res){
                        
                            if (res == 'success') {
                                successNotification("Payroll settings updated.", "success");
                                
                                location.reload();
                               

                                try {
                                    $(".must").remove();
                                } catch(err){
                                    console.log("");
                                }

                            } else {
                                errorNotification("An error occured.", "danger");
                            }
                        }
                    })
                }
            })

            $("#add-class").on("click", function(event){
                event.stopImmediatePropagation();
                $.ajax({
                    type: 'POST',
                    url: '../php/fetchEmployeesClassification.php',
                    success: function(res){
                        let tbody = "";
                        try {
                            res = JSON.parse(res);
                            for (let i = 0; i < res.length; i++) {
                                const time = new Date('2000-01-01T' + res[i].clock_in_sched);
                                const time2 = new Date('2000-01-01T' + res[i].clock_out_sched);

                                // Extract hours and minutes
                                const hours = time.getHours();
                                const minutes = time.getMinutes();

                                const hours2 = time2.getHours();
                                const minutes2 = time2.getMinutes();

                                // Determine AM or PM
                                const period = hours >= 12 ? 'PM' : 'AM';
                                const period2 = hours2 >= 12 ? 'PM' : 'AM';

                                // Convert hours to 12-hour format
                                const displayHours = hours % 12 || 12;
                                const displayHours2 = hours2 % 12 || 12;

                                // Format the time string
                                const formattedTime = `${displayHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
                                const formattedTime2 = `${displayHours2}:${minutes2 < 10 ? '0' : ''}${minutes2} ${period2}`;

                                let deductions = res[i].deductions;
                                deductions = deductions.split(" ");
                                
                                let txt = "";

                                for (let x = 0; x < deductions.length; x++) {
                                    let str = deductions[x];
                                    str = str.charAt(0).toUpperCase() + str.slice(1);
                                    txt += str;
                                    if (deductions[x + 1]) {
                                        txt += ', ';
                                    }
                                }

                                tbody += `
                                <tr id="row${res[i].id}" style='border-bottom:1px solid rgba(0,0,0,0.1);'>
                                    <td>${res[i].class_name}</td>
                                    <td>${res[i].hour_perday} hrs</td>
                                    <td>${formattedTime}</td>
                                    <td>${formattedTime2}</td>
                                    <td>${res[i].rate} (${res[i].rate_type})</td>
                                    <td>${txt}</td>
                                    <td><input type="button" class="delete-row" data-id="${res[i].id}" value="DELETE"></td>
                                </tr>`
                            }

                        } catch (err) {
                            tbody += `
                            <tr>
                                <td colspan="7" style="padding:20px 0;text-align:center;">NO ITEM</td>
                            </tr>`;
                        }

                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="third-layer-overlay">
                            <div class="tlo-wrapper pt-5" style="position:relative;">
                                ${close_icon}
                                <p class="text-white text-center" style="font-size:20px;">EMPLOYEES CLASSIFICATION</p>
                                <button id="add" style="padding: 5px 15px;
                                border-radius: 4px;
                                background: var(--teal);
                                color: #fff;
                                border: none;
                                font-size: 15px;">ADD CLASS</button>
                                <hr>
                                <div class="table-container" style="max-height:60vh;overflow:auto;max-width:45vw;min-width:40vw;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>CLASS</td>
                                                <td>HOUR PER DAY</td>
                                                <td>CLOCK IN</td>
                                                <td>CLOCK OUT</td>
                                                <td>RATE</td>
                                                <td>DEDUCTIONS</td>
                                                <td>ACTION</td>
                                            </tr>
                                        </thead>
                                        <tbody id="tbody">
                                            ${tbody}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>`);

                        // $(".delete-row").on("click", function(event){
                        //     event.stopImmediatePropagation();
                        //     let id = $(this).data("id");

                        //     $.ajax({
                        //         type: 'POST',
                        //         url: '../php/delete_class.php',
                        //         data: {
                        //             id: id,
                        //         }, success: function(res){
                        //             if (res.includes("deleted")) {
                        //                 $(`#row${id}`).remove();
                        //             }
                        //         }
                        //     })
                        // })

                        $("#add").on("click", function(event){
                            event.stopImmediatePropagation();
                            document.body.insertAdjacentHTML("afterbegin", `
                            <div class="fourth-layer-overlay" style="overflow:auto;">
                                <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                                    ${close_icon}
                                    <p class="text-white text-center" style="font-size:20px;">ADD CLASS</p>
                                    <hr>
                                    <form id="addClassForm">
                                        <span>EMPLOYEE TYPE:</span>
                                        <input type="text" placeholder="Enter class" name="class"/>
                                        <span>HOUR PER DAY:</span>
                                        <select name="hour">
                                            <option value="4">4 hours</option>
                                            <option value="5">5 hours</option>
                                            <option value="6">6 hours</option>
                                            <option value="7">7 hours</option>
                                            <option value="8">8 hours</option>
                                            <option value="9">9 hours</option>
                                            <option value="10">10 hours</option>
                                        </select>
                                        <span>CLOCK IN:</span>
                                        <input type="time" name="clock_in"/>
                                        <span>CLOCK OUT:</span>
                                        <input type="time" name="clock_out"/>
                                        <span>RATE:</span>
                                        <input type="number" name="rate" placeholder="Enter rate"/>
                                        <span>RATE TYPE:</span>
                                        <select name="rate_type">
                                            <option value="daily">Daily</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        <div style="display: flex;align-items: center;margin-top:10px;margin-bottom:10px;">
                                            <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                                            <div style="flex:1;display:grid;place-items:center;color:#fff;">DEDUCT</div>
                                            <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                                        </div>
                                        <span>SELECT MULTIPLE: (Hold CTRL to select)</span>
                                        <select name="deductions" multiple>
                                            <option value="tardiness">Tardiness</option>
                                            <option value="undertime">Undertime</option>
                                            <option value="absences">Absences</option>
                                        </select>
                                        <br>
                                        <input type="submit" value="ADD CLASS"/>
                                    </form>
                                </div>
                            </div>`);

                            $("input[type='submit']").click(function(event){
                                event.preventDefault();
                                let data = new FormData(document.getElementById("addClassForm"));
                                var formDataObject = {};
                                let isNotEmpty = true;
                                data.forEach(function(value, key){
                                    if (data.getAll(key).length > 1) {
                                        formDataObject[key] = data.getAll(key);
                                    } else {
                                        formDataObject[key] = value;
                                    }
                                    if (value === '') {
                                        isNotEmpty = false;
                                    }
                                });

                                let deductions = "";
                                for (let x = 0; x < formDataObject.deductions.length; x++) {
                                    deductions += formDataObject.deductions[x] + " ";
                                }

                                formDataObject.deductions = deductions;


                                if (!isNotEmpty) {
                                    errorNotification("Input fields must be filled out.", "warning");
                                } else {
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/add_class.php',
                                        data: {
                                            class: formDataObject.class,
                                            hour: formDataObject.hour,
                                            clock_in: formDataObject.clock_in,
                                            clock_out: formDataObject.clock_out,
                                            rate: formDataObject.rate,
                                            rate_type: formDataObject.rate_type,
                                            deductions: formDataObject.deductions

                                        }, success: function(res){
                                            //console.log(res);
                                            try {
                                                res = JSON.parse(res);
                                                if (res.message == 'success') {
                                                    successNotification("New class added.", "success");
                                                    $(".fourth-layer-overlay").remove();

                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/add_log.php',
                                                        data: {
                                                            log: `Added class (${formDataObject.class}).`,
                                                            branch: 'All branch',
                                                            user: current_user
                                                        },success: function(log_res) {
                                                            
                                                        }
                                                    })
                                                }

                                            } catch(err) {
                                                console.log(err);
                                            }
                                        }
                                    })
                                }
                            })
                        
                            $(".close-window").on("click", function(event){
                                event.stopImmediatePropagation();
                                $(".fourth-layer-overlay").remove();
                            })
                        })
                    
                        $(".close-window").on("click", function(event){
                            event.stopImmediatePropagation();
                            $(".third-layer-overlay").remove();
                        })
                    }
                })
            })

            $("#add-allowance").on("click", function(event){
                event.stopImmediatePropagation();

                $.ajax({
                    type: 'POST',
                    url: '../php/fetchCompanyAllowance.php',
                    success: function(res){
                    
                        let tbody = "";
                        try {
                            res = JSON.parse(res);
                            for (let i = 0; i < res.length; i++) {
                                
                                tbody += `
                                <tr id="row${res[i].id}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>${res[i].name}</td>
                                    <td>${res[i].amount}</td>
                                    <td>${res[i].type}</td>
                                    <td><input type="button" class="delete-row" data-name="${res[i].name}" data-id="${res[i].id}" value="DELETE"></td>
                                </tr>`;
                            }

                        } catch (err) {
                            tbody += `
                            <tr>
                                <td colspan="4" style="padding:20px 0;text-align:center;">NO ITEM</td>
                            </tr>`;
                        }

                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="third-layer-overlay">
                            <div class="tlo-wrapper pt-5" style="position:relative;">
                                ${close_icon}
                                <p class="text-white text-center" style="font-size:20px;">ALLOWANCE</p>
                                <button id="add" style="padding: 5px 15px;
                                border-radius: 4px;
                                background: var(--teal);
                                color: #fff;
                                border: none;
                                font-size: 15px;">ADD ALLOWANCE</button>
                                <hr>
                                <div class="table-container" style="max-height:60vh;overflow:auto;max-width:30vw;min-width:30vw;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>NAME</td>
                                                <td>AMOUNT</td>
                                                <td>DETAIL</td>
                                                <td>ACTION</td>
                                            </tr>
                                        </thead>
                                        <tbody id="tbody">
                                        ${tbody}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>`);

                        $(".delete-row").on("click", function(event){
                            event.stopImmediatePropagation();
                            let id = $(this).data("id");
                            let name = $(this).data("name");

                            $.ajax({
                                type: 'POST',
                                url: '../php/delete_allowance.php',
                                data: {
                                    id: id,
                                    
                                }, success: function(res){
                                    if (res == "deleted") {
                                        $(`#row${id}`).remove();
                                        successNotification(`${name} deleted.`, "success");
                                    }
                                }
                            })
                        })

                        $("#add").on("click", function(event){
                            event.stopImmediatePropagation();

                            $.ajax({
                                type: 'GET',
                                url: '../php/fetch_classes.php',
                                success: function(res){
                            
                                    try {
                                        res = JSON.parse(res);
                                        
                                        let ops = "";

                                        for (let i = 0; i < res.length ; i++) {
                                            ops += `
                                            <option value="${res[i].id}">${res[i].class_name}</option>
                                            `;
                                        }

                                        let emps = "";
                                        for (let i = 0; i < STAFFS.length; i++) {
                                            emps += `<option value="${STAFFS[i].serialnumber}">${STAFFS[i].name}</option>`;
                                        }

                                        let typeOps = "";
                                        let help = "";
                                        if ($("#payroll-sched").val().includes("twice")) {
                                            typeOps += `
                                            <option value="twice monthly">Twice monthly</option>
                                            <option value="monthly">Monthly</option>`;
                                            
                                            help += `
                                            <svg class="help" style="margin-top:-3px;margin-left:5px;cursor:pointer;" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-question-circle-fill" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
                                            </svg>
                                            <span class="tip" style="display:none;position:absolute;top:-250%;left:40%;padding:10px;z-index:1000;background:var(--teal);box-shadow:0 0 5px rgba(0,0,0,.5);border-radius:4px 4px 4px 0;color:#fff;">Monthly allowance will be added every second half.</span>`;
                                        } else {
                                            typeOps += `
                                            <option value="monthly">Monthly</option>`;
                                        }
                                        
                                        document.body.insertAdjacentHTML("afterbegin", `
                                        <div class="fourth-layer-overlay">
                                            <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                                                ${close_icon}
                                                <p class="text-white text-center" style="font-size:20px;">ADD ALLOWANCE</p>
                                                <hr>
                                                <form id="addAllowanceForm">
                                                    <span>ALLOWANCE NAME:</span>
                                                    <input type="text" placeholder="Enter name" name="name"/>
                                                    <span>AMOUNT:</span>
                                                        <input type="number" name="amount" placeholder="Enter amount"/>
                                                        <span style="position:relative;">ALLOWANCE TYPE: ${help}
                                                    </span>
                                                    <select name="type">
                                                        ${typeOps}
                                                    </select>
                                                    
                                                    <br>
                                                    <input type="submit" value="ADD ALLOWANCE"/>
                                                </form>
                                            </div>
                                        </div>`);


                                        $("svg").on("mouseover", function(event){
                                           $("span.tip").show();
                                        })

                                        $("svg").on("mouseout", function(event){
                                            $("span.tip").hide();
                                        })

                                        $("input[type='submit']").click(function(event){
                                            event.preventDefault();
                                            let data = new FormData(document.getElementById("addAllowanceForm"));
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
                                                url: '../php/add_allowance.php',
                                                data: {
                                                    name: formDataObject.name,
                                                    amount: formDataObject.amount,
                                                    type: formDataObject.type,
                                                }, success: function(res){
                                                    if (res == 'success') {
                                                        successNotification("Allowance added.", "success");

                                                        $.ajax({
                                                            type: 'POST',
                                                            url: '../php/add_log.php',
                                                            data: {
                                                                log: `Added company (${formDataObject.name}) allowance.`,
                                                                branch: 'All branch',
                                                                user: current_user
                                                            },success: function(log_res) {
                                                                setTimeout(() => {
                                                                    location.reload();
                                                                }, 1500);
                                                                $(".fourth-layer-overlay").remove();
                                                            }
                                                        })

                                                    
                                                    }
                                                }
                                            })
                                            
                                        })
                                    
                                        $(".close-window").on("click", function(event){
                                            event.stopImmediatePropagation();
                                            $(".fourth-layer-overlay").remove();
                                        })

                                    } catch (err) {
                                        errorNotification("Add at least one class.", "warning");
                                    }
                                } 
                            })
                        })
                    
                        $(".close-window").on("click", function(event){
                            event.stopImmediatePropagation();
                            $(".third-layer-overlay").remove();
                        })
                    }
                })
            })

            $(".close-window").on("click", function(event){
                $(".pop-up-window").remove();
            })

            $("#add-penalties").on("click", function(event){
                event.stopImmediatePropagation();
                
                $.ajax({
                    type: 'POST',
                    url: '../php/fetchCompanyPenalty.php',
                    success: function(res){
                    
                        let tbody = "";
                        try {

                            res = JSON.parse(res);
                            for (let i = 0; i < res.length; i++) {
                              

                                let strArr = res[i].type.split("|");
                            
                                tbody += `
                                <tr id="row${res[i].id}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>${res[i].allowance_name}</td>
                                    <td>${strArr[0]} (${strArr[1]} mins)</td>
                                    <td>${res[i].deduction}</td>
                                    <td><input type="button" class="delete-row" data-name="${res[i].allowance_name}" data-id="${res[i].id}" value="DELETE"></td>
                                </tr>`;

                            }

                        } catch (err) {
                            tbody += `
                            <tr>
                                <td colspan="5" style="padding:20px 0;text-align:center;">NO ITEM</td>
                            </tr>`;
                        }

                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="third-layer-overlay">
                            <div class="tlo-wrapper pt-5" style="position:relative;">
                                ${close_icon}
                                <p class="text-white text-center" style="font-size:20px;">ALLOWANCE PENALTIES</p>
                                <button id="add" style="padding: 5px 15px;
                                border-radius: 4px;
                                background: var(--teal);
                                color: #fff;
                                border: none;
                                font-size: 15px;">ADD PENALTY</button>
                                <hr>
                                <div class="table-container" style="max-height:60vh;overflow:auto;max-width:30vw;min-width:30vw;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>ALLOWANCE</td>
                                                <td>TYPE</td>
                                                <td>DEDUCTION</td>
                                                <td>ACTION</td>
                                            </tr>
                                        </thead>
                                        <tbody id="tbody">
                                            ${tbody}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>`);

                        $(".delete-row").on("click", function(event){
                            event.stopImmediatePropagation();
                            let id = $(this).data("id");
                            let name = $(this).data("name");

                            $.ajax({
                                type: 'POST',
                                url: '../php/delete_penalty.php',
                                data: {
                                    id: id,
                                }, success: function(res){
                                    
                                    if (res.includes("deleted")) {
                                        $(`#row${id}`).remove();
                                        errorNotification(`${name} penalty deleted`, "success");
                                    }
                                }
                            })
                        })

                        $("#add").on("click", function(event){
                            event.stopImmediatePropagation();
                            $.ajax({
                                type: 'GET',
                                url: '../php/fetch_classes.php',
                                success: function(res){
                            
                                    try {
                                        res = JSON.parse(res);
                                        
                                        var ops = "";
                                        var allowanceOps = "";

                                        for (let i = 0; i < res.length ; i++) {
                                            ops += `
                                            <option value="${res[i].id}">${res[i].class_name}</option>
                                            `;
                                        }

                                        $.ajax({
                                            type: 'POST',
                                            url: '../php/fetchCompanyAllowance.php',
                                            success: function(res) {
                                                try {
                                                    res = JSON.parse(res);

                                                    for (let i = 0; i < res.length; i++) {
                                                        allowanceOps += `
                                                        <option value="${res[i].id}|${res[i].name}">${res[i].name}</option>`;
                                                    }
                                                } catch (err) {
                                                    console.log(err);
                                                }

                                                document.body.insertAdjacentHTML("afterbegin", `
                                                <div class="fourth-layer-overlay">
                                                    <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                                                        ${close_icon}
                                                        <p class="text-white text-center" style="font-size:20px;">ADD PENALTY</p>
                                                        <hr>
                                                        <form id="addPenaltyForm">
                                                            <span>SELECT ALLOWANCE:</span>
                                                            <select id="type-select" name="allowance">
                                                                <option value="">Select allowance</option>
                                                                ${allowanceOps}
                                                            </select>
                                                            <span>SELECT TYPE:</span>
                                                            <select name="type">
                                                                <option value="late|5">Late (5 minutes)</option>
                                                                <option value="late|10">Late (10 minutes)</option>
                                                                <option value="late|30">Late (30 minutes)</option>
                                                                <option value="late|60">Late (60 minutes)</option>
                                                                <option value="absent">Absent</option>
                                                            </select>
                                                            <span>DEDUCTION (fixed or percentage):</span>
                                                            <input type="text" placeholder="Enter deduction" name="deduction">

                                                            <br>
                                                            <input type="submit" value="ADD PENALTY"/>
                                                        </form>
                                                    </div>
                                                </div>`);

                                                $("input[type='submit']").click(function(event){
                                                    event.preventDefault();
                                                    let data = new FormData(document.getElementById("addPenaltyForm"));
                                                    var formDataObject = {};
                                                    let isNotEmpty = true;
                                                    data.forEach(function(value, key){
                                                        formDataObject[key] = value;
                                                        if (value === '') {
                                                            isNotEmpty = false;
                                                        }
                                                    });

                                                    let all = formDataObject.allowance;
                                                    all = all.split("|");
                                                    let allid = all[0];
                                                    let allname = all[1];

                                                    if (!isNotEmpty) {
                                                        errorNotification("Fields must be filled out.", "warning");
                                                    } else {
                                                        $.ajax({
                                                            type: 'POST',
                                                            url: '../php/add_allowance_penalty.php',
                                                            data: {
                                                                allid: allid,
                                                                allname: allname,
                                                                deduction: formDataObject.deduction,
                                                                type: formDataObject.type,
                                                                
                                                            }, success: function(res){
                                                                
                                                                if (res == 'success') {
                                                                    successNotification(`${allname} penalty added.`, "success");
                                                                    $(".fourth-layer-overlay").remove();

                                                                    $.ajax({
                                                                        type: 'POST',
                                                                        url: '../php/add_log.php',
                                                                        data: {
                                                                            log: `Added allowance penalty.`,
                                                                            branch: 'All branch',
                                                                            user: current_user
                                                                        },success: function(log_res) {
                                                                            
                                                                        }
                                                                    })
                                                                }
                                                                    
                                                            }
                                                        })
                                                    }
                                                    
                                                })
                                            
                                                $(".close-window").on("click", function(event){
                                                    event.stopImmediatePropagation();
                                                    $(".fourth-layer-overlay").remove();
                                                })
                                            }
                                        })

                                        

                                    } catch (err) {
                                        errorNotification("Add at least one class.", "warning");
                                    }
                                }
                            });

                        })
                    
                        $(".close-window").on("click", function(event){
                            event.stopImmediatePropagation();
                            $(".third-layer-overlay").remove();
                        })
                    }
                })
                
            })

            $("#add-holiday").on("click", function(event){
                event.stopImmediatePropagation();

                $.ajax({
                    type: 'POST',
                    url: '../php/fetchCompanyHolidaysRATE.php',
                    success: function(res){

                        let tbody = "";
                        try {

                            res = JSON.parse(res);
                            for (let i = 0; i < res.length; i++) {
                                let classes = "";

                                let stringArray = res[i].class.split(" ");
                                for (let x = 0; x < stringArray.length; x++) {
                                    if (CLASSES.hasOwnProperty(stringArray[x])) {
                                        classes += CLASSES[stringArray[x]];
                                        if (CLASSES[stringArray[x + 1]]) {
                                            classes += ', ';
                                        }
                                    }
                                    
                                }

                                let exclusion;
                                if (res[i].exclusion == 'abh') {
                                    exclusion = 'Absent before holiday';
                                } else if (res[i].exclusion == 'aah') {
                                    exclusion = 'Absent after holiday';
                                } else if (res[i].exclusion == 'abaah') {
                                    exclusion = 'Absent before and after holiday';
                                } else if (res[i].exclusion == 'ubh') {
                                    exclusion = 'Undertime before holiday';
                                } else if (res[i].exclusion == 'uah') {
                                    exclusion = 'Undertime after holiday';
                                } else if (res[i].exclusion == 'ubaah') {
                                    exclusion = 'Undertime before and after holiday';
                                }

                                tbody += `
                                <tr id="row${res[i].id}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>${res[i].holiday_name}</td>
                                    <td>${res[i].worked}%</td>
                                    <td>${res[i].didnotwork}%</td>
                                    <td>${classes}</td>
                                    <td>${exclusion}</td>
                                    <td><input type="button" class="delete-row" data-id="${res[i].id}" value="DELETE"></td>
                                </tr>`;
                            }

                        } catch (err) {
                            tbody += `
                            <tr>
                                <td colspan="6" style="padding:20px 0;text-align:center;">NO ITEM</td>
                            </tr>`;
                        }

                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="third-layer-overlay">
                            <div class="tlo-wrapper pt-5" style="position:relative;">
                                ${close_icon}
                                <p class="text-white text-center" style="font-size:20px;">HOLIDAYS RATE</p>
                                <button id="add" style="padding: 5px 15px;
                                border-radius: 4px;
                                background: var(--teal);
                                color: #fff;
                                border: none;
                                font-size: 15px;">ADD HOLIDAY</button>
                                <hr>
                                <div class="table-container" style="max-height:60vh;overflow:auto;max-width:40vw;min-width:40vw;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>HOLIDAY</td>
                                                <td>WORKED</td>
                                                <td>DID NOT WORK</td>
                                                <td>CLASS</td>
                                                <td>EXCLUDE IF</td>
                                                <td>ACTION</td>
                                            </tr>
                                        </thead>
                                        <tbody id="tbody">
                                            ${tbody}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>`);

                        $(".delete-row").on("click", function(event){
                            event.stopImmediatePropagation();
                            let id = $(this).data("id");

                            $.ajax({
                                type: 'POST',
                                url: '../php/delete_holidayrate.php',
                                data: {
                                    id: id,
                                }, success: function(res){

                                    if (res.includes("deleted")) {
                                        
                                        $(`#row${id}`).remove();
                                    }
                                }
                            })
                        })

                        $("#add").on("click", function(event){
                            event.stopImmediatePropagation();

                            $.ajax({
                                type: 'GET',
                                url: '../php/fetch_classes.php',
                                success: function(res){
                            
                                    try {
                                        res = JSON.parse(res);
                                        
                                        let ops = "";

                                        for (let i = 0; i < res.length ; i++) {
                                            let str = "";
                                            if (res[i].holi_pay == 'not-eligible') {
                                                str = '(not-eligible)';
                                            }
                                            ops += `
                                            <option value="${res[i].id}">
                                                ${res[i].class_name} ${str}
                                            </option>
                                            `;
                                        }

                                        document.body.insertAdjacentHTML("afterbegin", `
                                        <div class="fourth-layer-overlay">
                                            <div class="folo-wrapper pt-5" style="min-width:20vw;position:relative;">
                                                ${close_icon}
                                                <p class="text-white text-center" style="font-size:20px;">ADD HOLIDAY</p>
                                                <hr>
                                                <form id="addHolidayForm">
                                                    <span>HOLIDAY:</span>
                                                    <input type="text" placeholder="Enter holiday" name="holiday">

                                                    <span>RATE IF WORKED (percentage):</span>
                                                    <input type="number" placeholder="Enter rate if worked" name="worked" />

                                                    <span>RATE IF DID NOT WORK (percentage):</span>
                                                    <input type="number" placeholder="Enter rate if did not work" name="didnotwork" />

                                                    <span style="display:flex;justify-content:space-between;">SELECT CLASS: (Hold CTRL to select) <svg class="select-all mr-3" style="cursor:pointer;" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#fff" class="bi bi-check2-all" viewBox="0 0 16 16">
                                                    <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0"/>
                                                    <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708"/>
                                                  </svg></span>
                                                    <select name="class" multiple>
                                                        ${ops}
                                                    </select>
                                                    

                                                    <span>EXCLUDE IF:</span>
                                                    <select name="holiday_policy">
                                                        <option value="abh">Absent before holiday</option>
                                                        <option value="aah">Absent after holiday</option>
                                                        <option value="abaah">Absent before and after holiday</option>
                                                        <option value="ubh">Undertime before holiday</option>
                                                        <option value="uah">Undertime after holiday</option>
                                                        <option value="ubaah">Undertime before and after holiday</option>
                                                    </select>

                                                    <br>
                                                    <input type="submit" value="ADD HOLIDAY RATE"/>
                                                </form>
                                            </div>
                                        </div>`);

                                        $(".select-all").click(function(event){
                                            event.stopImmediatePropagation();
                                            let select = $("select[name='class']");
                                            select.find("option").prop("selected", true);
                                        })

                                        $("input[type='submit']").click(function(event){
                                            event.preventDefault();
                                            let data = new FormData(document.getElementById("addHolidayForm"));
                                            var formDataObject = {};
                                            let isNotEmpty = true;
                                            data.forEach(function(value, key){
                                                
                                                if (data.getAll(key).length > 1) {
                                                    formDataObject[key] = data.getAll(key);
                                                } else {
                                                    formDataObject[key] = value;
                                                }
                                                
                                                if (value === '') {
                                                    isNotEmpty = false;
                                                }
                                            });

                                            let employeeClass = "";
                                            
                                            if (typeof formDataObject.class === 'object') {
                                                
                                                for (let x = 0; x < formDataObject.class.length; x++) {
                                                    employeeClass += formDataObject.class[x] + " ";
                                                }
    
                                                formDataObject.class = employeeClass;
                                            }

                                            if (!isNotEmpty) {
                                                errorNotification("Fields must be filled out.", "warning");
                                            } else {
                                                $.ajax({
                                                    type: 'POST',
                                                    url: '../php/add_holiday_setting.php',
                                                    data: {
                                                        holiday: formDataObject.holiday,
                                                        worked: formDataObject.worked,
                                                        didnotwork: formDataObject.didnotwork,
                                                        policy: formDataObject.holiday_policy,
                                                        class: formDataObject.class,
                                                        
                                                    }, success: function(res){
                                                    
                                                        try {
                                                            res = JSON.parse(res);
                                                            
                                                            if (res.message == 'success') {
                                                                successNotification("Holiday rate added.", "success");
                                                                $(".fourth-layer-overlay").remove();
                                                            }
                                                            
                                                        } catch(err) {
                                                            console.log(err);
                                                        }
                                                    }
                                                })
                                            }
                                            
                                            
                                        })

                                        
                                    
                                        $(".close-window").on("click", function(event){
                                            event.stopImmediatePropagation();
                                            $(".fourth-layer-overlay").remove();
                                        })

                                    } catch (err) {
                                        errorNotification("Add at least one class.", "warning");
                                    }
                                }
                            });

                            
                        })
                    
                    
                        $(".close-window").on("click", function(event){
                            event.stopImmediatePropagation();
                            $(".third-layer-overlay").remove();
                        })
                    }
                });
            })
        }
    })
})

function OPEN(snumber, id, name, age, position, branch) {
    $.ajax({
        type: 'POST',
        data: {
            serial: snumber,
            branch: branch
        },
        url: '../php/fetch_staff.php',
        success: function(res){
     
            try {
                let data = JSON.parse(res);

                document.body.insertAdjacentHTML("afterbegin", `
                <div class="third-layer-overlay">
                    <div class="tlo-wrapper pt-5" style="position:relative;">
                        ${close_icon}
                        <p class="text-white text-center" style="font-size:20px;">${name}</p>
                        <p class="text-white text-center" style="font-size:13px;margin-top:-20px;">${age} | ${position}</p>
                        <hr>
                        <form style="width:100%;" id="staffSettings">
                            <div class="tlo-content">
                                <div>
                                    <span>CHARGES:</span>
                                    <input type="number" name="charges"  value="${data.charges}" placeholder="Charges"/>
                                    <span>ADJUSTMENT:</span>
                                    <input type="number" name="adjustment"  value="${data.adjustment}" placeholder="Adjustment"/>
                                    <span>CASH ADVANCE:</span>
                                    <input type="number" name="cashad"  value="${data.cash_advance}" placeholder="Cash advance"/>
                                </div>
                                <div>
                                    <span>SSS LOAN:</span>
                                    <input type="number" name="sssloan" value="${data.sss_loan}" placeholder="SSS loan"/>
                                    <span>PAG-IBIG LOAN:</span>
                                    <input type="number" name="pbigloan"  value="${data.pag_ibig_loan}" placeholder="Pag-IBIG loan"/>
                                    <span>COMPANY LOAN:</span>
                                    <input type="number" name="comploan" value="${data.company_loan}" placeholder="Company loan"/>
                                </div>
                                <div style="grid-column: 1 / span 2;">
                                    <input type="submit" value="UPDATE"/>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>`);

                $("input[type='submit']").on("click", function(event){
                    event.preventDefault();
                    event.stopImmediatePropagation();
                   
                    let data2 = new FormData(document.getElementById("staffSettings"));
                    var formDataObject = {};
                    data2.forEach(function(value, key){
                        formDataObject[key] = value;
                    });

            
                    $.ajax({
                        type: 'POST',
                        url: '../php/update_staff_settings.php',
                        data: {
                            id: id,
                            branch: branch,
                            serialnumber: snumber,
                            charges: formDataObject.charges,
                            adjustment: formDataObject.adjustment,
                            cash_advance: formDataObject.cashad,
                            sss_loan: formDataObject.sssloan,
                            pbig_loan: formDataObject.pbigloan,
                            company_loan: formDataObject.comploan,
                        },
                        success: function(res){
                            
                            if (res == 'success') {
                                successNotification("Updated successfully.", "success");
                                $(".third-layer-overlay").remove();
                                $(".pop-up-window").remove();

                                if (parseFloat(formDataObject.comploan) != parseFloat(data.company_loan)) {
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/add_log.php',
                                        data: {
                                            log: `Added ${formDataObject.comploan} company loan deduction to ${name}.`,
                                            branch: branch,
                                            user: current_user
                                        },success: function(log_res) {
                                            
                                        }
                                    })
                                }
                                if (parseFloat(data.pag_ibig_loan) != parseFloat(formDataObject.pbigloan)) {
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/add_log.php',
                                        data: {
                                            log: `Added ${formDataObject.pbigloan} Pag-IBIG loan deduction to ${name}.`,
                                            branch: branch,
                                            user: current_user
                                        },success: function(log_res) {
                                            
                                        }
                                    })
                                }
                                if (parseFloat(data.sss_loan) != parseFloat(formDataObject.sssloan)) {
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/add_log.php',
                                        data: {
                                            log: `Added ${formDataObject.sssloan} SSS loan deduction to ${name}.`,
                                            branch: branch,
                                            user: current_user
                                        },success: function(log_res) {
                                            
                                        }
                                    })
                                }
                                if (parseFloat(data.cash_advance) != parseFloat(formDataObject.cashad)) {
                               
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/add_log.php',
                                        data: {
                                            log: `Added ${formDataObject.cashad} cash advance deduction to ${name}.`,
                                            branch: branch,
                                            user: current_user
                                        },success: function(log_res) {
                                            
                                        }
                                    })
                                }
                                
                                if (parseFloat(formDataObject.adjustment) != parseFloat(data.adjustment)) {
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/add_log.php',
                                        data: {
                                            log: `Added ${formDataObject.adjustment} adjustment deduction to ${name}.`,
                                            branch: branch,
                                            user: current_user
                                        },success: function(log_res) {
                                            
                                        }
                                    })
                                }
                                
                                if (parseFloat(formDataObject.charges) != parseFloat(data.charges)) {
                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/add_log.php',
                                        data: {
                                            log: `Added ${formDataObject.charges} charges deduction to ${name}.`,
                                            branch: branch,
                                            user: current_user
                                        },success: function(log_res) {
                                            
                                        }
                                    })
                                }
                               
                            }
                        }
                    })
                })
            
            
                $(".close-window").on("click", function(event){
                    event.stopImmediatePropagation();
                    $(".third-layer-overlay").remove();
                })
                
            } catch(err){
                
            }
        }
    })
}

$(".edit-staff").click(function(event){
    event.stopImmediatePropagation();
    let brOps = "";
    for (let i = 0; i < BRANCH.length; i++) {
        brOps += `<option value="${BRANCH[i].machine_id}">${BRANCH[i].branch_name}</option>`;
    }

    let selected_branch, emSerial;

    document.body.insertAdjacentHTML("afterbegin", `
    <div class="pop-up-window">
        <div class="window-content pt-5" style="position:relative;min-width:20vw;">
        ${close_icon}
            <p class="text-center text-white" style="font-size:20px;">EDIT STAFF</p>
            <hr>
            <div style="display:flex;flex-direction:column;color:#fff;">
                <span>SELECT BRANCH</span>
                <select id="branch">
                    <option value="">Select branch</option>
                    ${brOps}
                </select>
                <span>SELECT EMPLOYEE</span>
                <select id="employee">
                    <option value="">Waiting to select branch..</option>
                </select>
                <br>
                <input type="button" value="PROCEED"/>
            </div>
        </div>
    </div>`)

    $("input[type='button']").click(function(event){
        event.stopImmediatePropagation();
        let brOps = "";
        for (let i = 0; i < BRANCH.length; i++) {
            brOps += `
            <option value="${BRANCH[i].machine_id}">${BRANCH[i].branch_name}</option>`;
        }
        if ($("select#employee").val() !== '') {
            emSerial = $("select#employee").val();
            selected_branch = $("select#branch").val();
            document.body.insertAdjacentHTML("afterbegin", `
            <div class="third-layer-overlay">
                <div class="tlo-wrapper pt-5" style="min-width:400px;position:relative;">
                    ${close_icon}
                    <p class="text-white text-center" style="font-size:20px;">EDIT</p>
                    <hr>
                    <div style="display:flex;flex-direction:column;color:#fff;">
                        <span>SELECT TO EDIT:</span>
                        <select id="edit">
                            <option value="branch">Branch</option>
                            <option value="class">Class</option>
                        </select>
                        <span id="label">SELECT BRANCH</span>
                        <select id="name">
                            ${brOps}
                        </select>
                        <br>
                        <input type="submit" value="CONFIRM"/>
                    </div>
                </div>
            </div>`);

            $(".close-window").click(function(event){
                $(".third-layer-overlay").remove();
            })

            $("select#edit").change(function(event){
                $("select#name").html("");
                if ($(this).val() == 'branch') {
                    document.getElementById("name").insertAdjacentHTML("afterbegin", `${brOps}`);
                } else if ($(this).val() == 'class') {
                    let cOps = "";
                    for (let i = 0; i < ALL_CLASS.length; i++) {
                        cOps += `
                        <option value="${ALL_CLASS[i].class}">${ALL_CLASS[i].class_name}</option>`;
                    }
                    document.getElementById("name").insertAdjacentHTML("afterbegin", `${cOps}`);
                }
            })

            $("input[type='submit']").click(function(event){
                event.stopImmediatePropagation();
                $.ajax({
                    type: 'POST',
                    url: '../php/edit_staff.php',
                    data: {
                        name: $("select#edit").val(),
                        edit: $("select#name").val(),
                        branch: selected_branch,
                        serial: emSerial
                    },success: function(res){
                        console.log(res);
                        if (res == 'success') {
                            successNotification("Employee " + $("select#edit").val() + " changed.", "success");
                            $(".third-layer-overlay").remove();
                            $(".pop-up-window").remove();
                        }
                    }
                })
            })
        } 
    })

    $("select#branch").change(function(event){
        if ($(this).val() !== '') {
            selected_branch = $(this).val();
            $.ajax({
                type: 'POST',
                url: '../php/fetch_branch_staff.php',
                data: {
                    branch: $(this).val()
                },success: function(res) {
                    let emOps = "";
                    $("select#employee").html("");
                    try {
                        res = JSON.parse(res);
                        for (let i = 0; i < res.length; i++) {
                            emOps += `<option value="${res[i].serialnumber}">${res[i].name}</option>`;
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    document.getElementById("employee").insertAdjacentHTML("afterbegin", `${emOps}`);
                }
            })
        }
    })

    $("select#employee").change(function(event){
        event.stopImmediatePropagation();
        emSerial = $(this).val();
    })

    $(".close-window").click(function(event){
        $(".pop-up-window").remove();
    })
})

function addStaff(){
    event.preventDefault();
    let data = new FormData(document.getElementById("registerStaffForm"));
    var formDataObject = {};
    let isNotEmpty = true;
    data.forEach(function(value, key){
        formDataObject[key] = value;
        if (value === '' && key != 'file') {
            isNotEmpty = false;
        }
    });
    //formDataObject["serialnumber"] = 20;//SERIAL_NUMBER;

    var formData = new FormData();

    // Append form data to the FormData object
    formData.append('name', formDataObject.name);
    formData.append('age', formDataObject.age);
    formData.append('position', formDataObject.position);
    formData.append('department', formDataObject.department);
    formData.append('serialnumber', SERIAL_NUMBER);
    formData.append('class', formDataObject.class);
    formData.append('phone', formDataObject.phone);
    formData.append('date_employed', formDataObject.employed);
    formData.append('file', formDataObject.file);
    formData.append('branch', registeredBranch);
    
    if (isNotEmpty) {
        $.ajax({
            type: 'POST',
            url: '../php/add_staff.php',
            contentType: false,
            processData: false,
            data: formData,

            success: function(res){
               
                if (res == 'success') {
                    websocket.send(500);

                    $(".pop-up-window").remove();
                    $("input[type='text'], input[type='password'], input[type='number']").val('');
                    successNotification("New employee added.", "success");

                    $.ajax({
                        type: 'POST',
                        url: '../php/add_log.php',
                        data: {
                            log: `Added new employee named ${formDataObject.name}.`,
                            branch: registeredBranch,
                            user: current_user
                        },success: function(log_res) {
                            
                        }
                    })
                }
            }
        })
    } else {
        errorNotification("Fields must be filled out.", "danger")
    }
}

function exit(){
    $.ajax({
        type: 'POST',
        url: '../php/exit.php',
        success: function(res){
            if (res == 'success') {
                
                location.reload();
            }
        }
    })
}

function errorNotification(message, alertLevel){
    document.getElementById("notifications").insertAdjacentHTML("beforeend", `
    <div class="notification alert alert-${alertLevel}" role="alert">
        ${message}
    </div>
    `);
    clearTimeout(timeout);

    setTimeout(() => {
        $(".notification").remove();
    }, 5000);
}

function successNotification(message, alertLevel){
    document.getElementById("notifications").insertAdjacentHTML("beforeend", `
    <div class="notification alert alert-${alertLevel}" role="alert">
        ${message}
    </div>
    `);

    clearTimeout(timeout);
    
    timeout = setTimeout(() => {
        $(".notification").remove();
    }, 5000);
}

function displayCurrentTime(){
    setTimeout(() => {
        var currentTime = new Date();

        // Get the current date components
        var month = months[currentTime.getMonth()];
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();

        // Get the current time components
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();

        // Determine if it's AM or PM
        var meridiem = hours >= 12 ? 'PM' : 'AM';

        // Convert hours to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be displayed as 12

        // Format the time components to have leading zeros if needed
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        // Create a string representation of the current date and time
        var currentDateTimeString = month + ' ' + day + ', ' + year + ' (' + hours + ':' + minutes + ' ' + meridiem + ')';

        $(".current-time").html(currentDateTimeString);

        setTimeout(() => {
            displayCurrentTime();
        }, 1000);
    }, 1000)
}

$(".logs").click(function(event){
    event.stopImmediatePropagation();
    $.ajax({
        type: 'POST',
        url: '../php/fetch_logs.php',
        success: function(res) {
            let content = "";
            try {
                res = JSON.parse(res);
                for (let i = 0; i < res.length; i++) {
                    // Convert the string to a Date object
                    const date = new Date(res[i].time_log);
                    // Format the date into a human-readable string
                    const options = { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit', 
          
                    };
                    const formattedDate = date.toLocaleDateString('en-US', options);
                    let br;
                    for (let j = 0; j < BRANCH.length; j++) {
                        if (res[i].branch == BRANCH[j].machine_id) br = BRANCH[j].branch_name;
                    }
                    if (br == 'undefined' || br == null) {
                        br = 'All branch';
                    }
                    content += `
                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1)">
                        <td>${res[i].user}</td>
                        <td>${res[i].log}</td>
                        <td>${br}</td>
                        <td>${formattedDate}</td>
                    </tr>`;
                }

            } catch (err) {
                content += `
                <tr>
                    <td colspan="4" style="text-align:center;padding:10px 0;">No item</td>
                </tr>`;
            }

            document.body.insertAdjacentHTML("afterbegin", `
            <div class="pop-up-window">
                <div class="window-content" style="position:relative;">
                    ${close_icon}
                    <br>
                    <p class="text-center text-white" style="font-size:20px;">Logs</p>
                    <br>
                    <hr>
                    <div class="table-container" style="max-height:60vh;overflow:auto;max-width:80vw;min-width:30vw;">
                        <table>
                            <thead>
                                <td>USER</td>
                                <td>LOG</td>
                                <td>BRANCH</td>
                                <td>TIME</td>
                               
                            </thead>
                            ${content}
                        </table>
                    </div>
                </div>
            </div>`);

            $(".close-window").click(function(event){
                $(".pop-up-window").remove();
            })
        }
    })
})

