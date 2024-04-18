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

var PAYSLIPS = [];
var PAYSLIP = [];
var PAYSCHED;

var from;
var to;

var SSS;
var PHILHEALTH;
var PAGIBIG;
var D = [];

var ALL_CLASS;
var ALL_SERIAL;




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
    console.log(event.data);
    
}



$(document).ready(function(){
    displayCurrentTime();
    initWebSocket();

    document.body.insertAdjacentHTML("afterbegin", `
    <div id="notifications" class="notifications">
    </div>`);

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
        url: '../php/fetch_all_serial.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
                ALL_SERIAL = res;
            } catch(err) {
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
                PAYSCHED = res.pay_sched;
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
                            holiday_pay = res.holi_pay;
                            ot_pay = res.ot_pay;
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
                                                url: '../php/fetch_allowance.php',
                                                data: {
                                                    class: responseBody.class,
                                                }, success: function(res){
                                                   
                                                    try {
                                                        allowanceResponseBody = JSON.parse(res);
                                                    } catch (err) {
                                                        allowanceResponseBody = 'None';
                                                    }

                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/fetch_allowancePenaltyByClass.php',
                                                        data: {
                                                            class: responseBody.class,
                                                        }, success: function(res){
                                                            
                                                            try {
                                                                allowancePenalty = JSON.parse(res);
                                                            } catch (err) {
                                                                allowancePenalty = 'None';
                                                            }

                                                            $.ajax({
                                                                type: 'POST',
                                                                url: '../php/fetchHolidaysByClass.php',
                                                                data: {
                                                                    class: responseBody.class,
            
                                                                }, success: function(res) {
                                                                    
                                                                    try {
                                                                        holidays = JSON.parse(res);
                                                                        
                                                                    } catch (err) {
                                                                        holidays = "None";
                                                                    }
                    
                                                                    if (holidays != 'None') {
                                                                        
                                                                            
                                                                            let obj = [];
                                                                            let promise;
                                                                            var HOLIDAYS_ARR = [];
                                                                            let workedARR = [];
                                                                            let workedOnHolidayArr = [];

                                                                            

                                                                            for (let i = 0; i < holidays.length; i++) {
                                                                                HOLIDAYS_ARR.push(holidays[i]);

                                                                                //startFetching(holidays[i].name, responseBody.class, date, id);
                                                                            }

                                                                            FETCH(0);

                                                                            function FETCH(x) {
                                                                                
                                                                                promise = new Promise(function(resolve, reject){
                                                                                    
                                                                                    $.ajax({
                                                                                        type: 'POST',
                                                                                        url: '../php/fetchCompanyHolidays.php',
                                                                                        data: {
                                                                                            id: HOLIDAYS_ARR[x].name,
                                                                                            class: responseBody.class,
                        
                                                                                        }, success: function(h) {
                                                                                            
                                                                                            
                                                                                            try {
                                                                                                h = JSON.parse(h);
                                                                                                resolve(h);

                                                                                            } catch (err) {
                                                                                                console.log(err);
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                });

                                                                                promise.then(
                                                                                    function(value) {
                                                                                        
                                                                                        obj.push(value);
                                                                                        
                                                                                        let promise;


                                                                                        if (obj[x].exclusion == 'abh') {

                                                                                            let DATE = new Date(HOLIDAYS_ARR[x].date);
                                                                                            DATE.setDate(DATE.getDate() - 1);
                                                                                            
                                                                                            let year = DATE.getFullYear();
                                                                                            let month = String(DATE.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
                                                                                            let day = String(DATE.getDate()).padStart(2, '0');
                        
                                                                                            // Format the date as "YYYY-MM-DD"
                                                                                            let dateString = `${year}-${month}-${day}`;
                                                                                        
                                                                                            promise = new Promise(function(resolve, reject){
                                                                                                $.ajax({
                                                                                                    type: 'POST',
                                                                                                    url: '../php/checkDateTrail.php',
                                                                                                    data: {
                                                                                                        type: obj[x].exclusion,
                                                                                                        date: `${dateString}`,
                                                                                                        serial: responseBody.serialnumber
                                                                                                        
                                                                                                    }, success: function(res1){
                                                                                                        resolve(res1);
                                                                                                    }
                                                                                                })
                                                                                            })
                                                                                        
                                                                                        } else if (obj[x].exclusion == 'aah') {
                        
                                                                                            let DATE = new Date(HOLIDAYS_ARR[x].date);
                                                                                            DATE.setDate(DATE.getDate() + 1);
                                                                                            
                                                                                            let year = DATE.getFullYear();
                                                                                            let month = String(DATE.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
                                                                                            let day = String(DATE.getDate()).padStart(2, '0');
                        
                                                                                            // Format the date as "YYYY-MM-DD"
                                                                                            let dateString = `${year}-${month}-${day}`;
                                                                                        
                                                                                            promise = new Promise(function(resolve, reject){
                                                                                                $.ajax({
                                                                                                    type: 'POST',
                                                                                                    url: '../php/checkDateTrail.php',
                                                                                                    data: {
                                                                                                        type: obj[x].exclusion,
                                                                                                        date: `${dateString}`,
                                                                                                        serial: responseBody.serialnumber
                                                                                                        
                                                                                                    }, success: function(res1){
                                                                                                        resolve(res1);
                                                                                                    }
                                                                                                })
                                                                                            })
                                                                                            
                                                                                        } else if (obj[x].exclusion == 'abaah') {
                                                                                            
                                                                                            let DATE = new Date(HOLIDAYS_ARR[x].date);
                                                                                            let DATE2 = new Date(HOLIDAYS_ARR[x].date);
                                                                                            DATE.setDate(DATE.getDate() - 1);
                                                                                            DATE2.setDate(DATE2.getDate() + 1);
                                                                                            
                                                                                            let year = DATE.getFullYear();
                                                                                            let month = String(DATE.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
                                                                                            let day = String(DATE.getDate()).padStart(2, '0');
                        
                                                                                            let year2 = DATE2.getFullYear();
                                                                                            let month2 = String(DATE2.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
                                                                                            let day2 = String(DATE2.getDate()).padStart(2, '0');
                        
                                                                                            // Format the date as "YYYY-MM-DD"
                                                                                            let dateString1 = `${year}-${month}-${day}`;
                                                                                            let dateString2 = `${year2}-${month2}-${day2}`;
                                                                                        
                                                                                            promise = new Promise(function(resolve, reject){
                                                                                                $.ajax({
                                                                                                    type: 'POST',
                                                                                                    url: '../php/checkDateTrail.php',
                                                                                                    data: {
                                                                                                        type: obj[x].exclusion,
                                                                                                        date: dateString1,
                                                                                                        date1: `${dateString1}`,
                                                                                                        date2: `${dateString2}`,
                                                                                                        serial: responseBody.serialnumber
                                                                                                        
                                                                                                    }, success: function(res1){
                                                                                                    
                                                                                                        resolve(res1);
                                                                                                    }
                                                                                                })
                                                                                            });
                                                                                        }

                                                                                        promise.then(

                                                                                            function(value) {
                                                                                                
                                                                                                workedARR.push(value);

                                                                                                let promise;

                                                                                                promise = new Promise(function(resolve, reject){
                                                                                                    $.ajax({
                                                                                                        type: 'POST',
                                                                                                        url: '../php/workedOnHoliday.php',
                                                                                                        data: {
                                                                                                            date: HOLIDAYS_ARR[x].date,
                                                                                                            snumber: responseBody.serialnumber,
                                                                                                        },success: function(res) {
                                                                                                            resolve(res);
                                                                                                        }
                                                                                                    });
                                                                                                })


                                                                                                promise.then(

                                                                                                    function(value) {
                                                                                                        
                                                                                                        workedOnHolidayArr.push(value);

                                                                                                        if (x < HOLIDAYS_ARR.length - 1) {
                                                                                                            FETCH(x + 1);
                                                                                                        } else {
                                                                                                            var holidayPay = 0;

                                                                                                            

                                                                                                            for (let i = 0; i < obj.length; i++) {
                                                                                                                let excluded = false;

                                                                                                                if (!workedARR[i].includes("worked")) {
                                                                                                                    excluded = true;
                                                                                                                }


                                                                                                                if (!excluded) {
                                                                                                                    let worked = false;
                                                                                                                
                                                                                                                    if (workedOnHolidayArr[i].includes("worked")) {
                                                                                                                        worked = true;
                                                                                                                    }

                                                                                                                    if (worked) {
                                                                                                                        let percentage = parseInt(obj[i].worked);
                                                                                                                        
                                                                                                                        percentage = percentage / 100;
                                                                                                                        holidayPay = holidayPay + (parseInt(rate) * percentage);

                                                                                                                    } else {
                                                                                                                        let percentage = parseInt(obj[i].didnotwork);
                                                                                                                        
                                                                                                                        percentage = percentage / 100;
                                                                                                                        holidayPay = holidayPay + (parseInt(rate) * percentage);
                                                                                                                    }
                                                                                                                }

                                                                                                            }


                                                                                                            details = [];

                                                                                                            let d = new Date(from);
                                                                                                            let d2 = new Date(to);
                                                                                                            let m = months[d.getMonth()];
                                                                                                            let day = d.getDate();
                                                                                                            let day_2 = d2.getDate();
                                                                                                            let year = d.getFullYear();

                                                                                                            
                                                                                                            details.push({"RATE" : rate});
                                                                                                            details.push({"RATE TYPE" : rateType.toUpperCase()});
                                                                                                            details.push({"WORKING DAYS" : $(`#cal${id}`).val()});

                                                                                                            PAYSLIP.push({'name' : COMPANY_NAME, 'row': '1', 'col': '1', 'span' : '4', 'align': 'center', 'bold' : true, 'size' : '20'})
                                                                                                            PAYSLIP.push({'name' : `${m} ${day}-${day_2}, ${year}`, 'row': '2', 'col': '3', 'span': '2', 'align': 'right'})
                                                                                                            PAYSLIP.push({'name' : 'Name:', 'row': '3', 'col': '1'})
                                                                                                            PAYSLIP.push({'name' : name, 'row': '3', 'col': '2', 'span': '3', 'align': 'left'})
                                                                                                            PAYSLIP.push({'name' : 'COMPENSATIONS', 'row': '5', 'col': '1', 'span' : '2', 'align': 'center', 'bold' : true})
                                                                                                            PAYSLIP.push({'name' : 'DEDUCTIONS', 'row': '5', 'col': '2', 'span' : '2', 'align': 'center', 'bold' : true})
                                                                                                            PAYSLIP.push({'name' : 'Basic', 'row': '6', 'col': '1'})
                                                                                                          
    
                                                                                                            let secondHalf = false;
                                                                                                            let numOfLeave = 0;
                                                                                                            let days_worked = 0;

                                                                                                            for (let i = 0; i < trail.length; i++) {
                                                                                                                ot_total += parseFloat(trail[i].ot_total);
                                                                                                                ut_total += parseFloat(trail[i].ut_total);
                                                                                                                ot_mins += parseFloat(trail[i].ot_mins);
                                                                                                                ut_mins += parseFloat(trail[i].ut_mins);
                                                                                                                days_worked += 1;
                                                                                                                
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
                                                                                                                        days_worked -= 0.5;
                                                                                                                    }
                                                                                                                }
                                                                                                                
                                                                                                                late_mins += parseInt(trail[i].late_mins);
                                                                                                            }

                                                                                                            var salaryRate = parseInt(rate) * parseInt($(`#cal${id}`).val());

                                                                                                            details.push({"DAYS WORKED" : days_worked});

                                                                                                            if (numOfLeave > 0) {
                                                                                                                details.push({"DAYS LEAVE" : (numOfLeave)});
                                                                                                            }
                                                                                                            
                                                                                                            details.push({"SALARY RATE" : salaryRate.toLocaleString()});

                                                                                                            var absent;
                                                                                                            rate = parseInt(rate);
                                                                                                            if (rateType == 'hourly') {
                                                                                                                rate = rate * parseInt(hour_perday);
                                                                                                            } else if (rateType == 'monthly') {
                                                                                                                rate = rate * 12;
                                                                                                                rate = rate / 365;
                                                                                                            }

                                                                                                            let basic = days_worked * rate;
                                                                                                            

                                                                                                            PAYSLIP.push({'name' : basic.toLocaleString(), 'row': '6', 'col': '2'})
                                                                                                            
                                                                                                        
                                                                                                            absent = (parseInt($(`#cal${id}`).val()) - parseInt(days_worked)) * rate;
                                                                                                            
                                                                                                            let earned = 0;
                                                                                                            let net = 0;
                                                                                                            
                                                                                                            let total_deductions = 0;
    
                                                                                                            if (PAYDeductions.includes("absences")) {
                                                                                                                if (absent > 0) {
                                                                                                                    earned = salaryRate - absent;
                                                                                                                }
                                                                                                                let a = absent - numOfLeave;
                                                                                                                
                                                                                                                details.push({"ABSENT (total)" : {"value" : a.toFixed(2), "op" : "-"}});
                                                                                                                PAYSLIP.push({'name' : "Absent", 'row': '7', 'col': '1'})
                                                                                                                PAYSLIP.push({'name' : absent.toLocaleString(), 'row': '7', 'col': '2'})

                                                                                                            } else {
                                                                                                                earned = salaryRate;
                                                                                                                details.push({"ABSENT (total)" : {"value" : 0, "op" : "-"}});
                                                                                                                PAYSLIP.push({'name' : "Absent", 'row': '7', 'col': '1'})
                                                                                                                PAYSLIP.push({'name' : 0, 'row': '7', 'col': '2'})
                                                                                                            }

                                                                                                            details.push({"BASIC" : basic.toLocaleString()});

                                                                                                            if (ot_pay == 'eligible') {

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
                                                                                                            }

                                                                                                           

                                                                                                            if (PAYDeductions.includes('tardiness')) {
                                                                                                                let totalMinutesLate = late_mins;
                                                                                                                let tardiness = 0;
                                                                                                                if (rateType == 'daily') {
                                                                                                                    let RATE = parseInt(rate);
                                                                                                                    let HOURLY_RATE = RATE / 8;
                                                                                                                    let PERMINUTE_RATE = HOURLY_RATE / 60;
                                
                                                                                                                    tardiness =  (PERMINUTE_RATE * totalMinutesLate);
                                                                                                                } else if (rateType == 'hourly') {
                                                                                                                    let RATE = parseInt(rate);
                                                                                                                    let PERMINUTE_RATE = RATE / 60;
                                
                                                                                                                    tardiness =  (PERMINUTE_RATE * totalMinutesLate);
                                                                                                                } else if (rateType == 'monthly') {
                                                                                                                    let RATE = parseInt(rate) * 12;
                                                                                                                    let DAILY_RATE = RATE / 365;
                                                                                                                    let HOURLY_RATE = DAILY_RATE / 8;
                                                                                                                    let PERMINUTE_RATE = HOURLY_RATE / 60;
                                
                                                                                                                    tardiness = (PERMINUTE_RATE * totalMinutesLate);
                                                                                                                }

                                                                                                                earned = earned - tardiness;
                                                                                                                PAYSLIP.push({'name' : "Tardiness", 'row': '9', 'col': '1'})
                                                                                                                PAYSLIP.push({'name' : tardiness.toFixed(2), 'row': '9', 'col': '2'})

                                                                                                                details.push({"TARDINESS (total)" : {"value" : tardiness.toFixed(2), "op" : "-"}});
                                                                                                            } else {
                                                                                                                details.push({"TARDINESS (total)" : {"value" : 0, "op" : "-"}});
                                                                                                                PAYSLIP.push({'name' : "Tardiness", 'row': '9', 'col': '1'})
                                                                                                                PAYSLIP.push({'name' : 0, 'row': '9', 'col': '2'})
                                                                                                            }

                                                                                                            if (holiday_pay == 'eligible') {
                                                                                                                earned = earned + holidayPay;

                                                                                                                details.push({"HOLIDAYS (total)" : {"value" : holidayPay.toLocaleString(), "op" : "+"}});
                                                                                                                PAYSLIP.push({'name' : "Holiday", 'row': '10', 'col': '1'})
                                                                                                                PAYSLIP.push({'name' : holidayPay.toLocaleString(), 'row': '10', 'col': '2'})
                                                                                                            } else {
                                                                                                                details.push({"HOLIDAYS (total)" : {"value" : 0, "op" : "+"}});
                                                                                                                PAYSLIP.push({'name' : "Holiday", 'row': '10', 'col': '1'})
                                                                                                                PAYSLIP.push({'name' : 0, 'row': '10', 'col': '2'})
                                                                                                            }

                                                                                                            if (ot_pay == 'eligible') {
                                                                                                                earned = earned + ot_total;

                                                                                                                details.push({"OVERTIME (total)" : {"value" : ot_total.toFixed(2), "op" : "+"}});

                                                                                                                PAYSLIP.push({'name' : "Overtime", 'row': '11', 'col': '1'})
                                                                                                                PAYSLIP.push({'name' : ot_total.toFixed(2), 'row': '11', 'col': '2'})
                                                                                                             
                                                                                                            } else {
                                                                                                                details.push({"OVERTIME (total)" : {"value" : 0, "op" : "+"}});
                                                                                                                PAYSLIP.push({'name' : "Overtime", 'row': '11', 'col': '1'})
                                                                                                                PAYSLIP.push({'name' : 0, 'row': '11', 'col': '2'})
                                                                                                            }

                                                                                                            details.push({"EARNED" : {"value" : earned.toLocaleString(), "highlight" : "", "op" : "+"}});
                                                                                                           
                                                                                                            net = earned;

                                                                                                            let sss_contri = 0;
                                                                                                            let pbig_contri = 0;
                                                                                                            let phil_contri = 0;

                                                                                                            let s = salaryRate * 2;
                                                                                                            if (SSS != 'undefined' && SSS != null) {
                                                                                                                for (let i = 0; i < SSS.length; i++) {
                                                                                                                    if (SSS[i][2] == 'Over') {
                                                                                                                      if (s >= SSS[i][1]) {
                                                                                                                        sss_contri = SSS[i][6];
                                                                                                                        break;
                                                                                                                      }
                                                                                                                    } else {
                                                                                                                      if (s >= SSS[i][1] && s <= SSS[i][2]) {
                                                                                                                        sss_contri = SSS[i][6];
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
                                                                                                                total_deductions = total_deductions + parseFloat(deductions[`deduc${id}`].sss);
                                                                                                                total_deductions = total_deductions + parseFloat(deductions[`deduc${id}`].phil);
                                                                                                                total_deductions = total_deductions + parseFloat(deductions[`deduc${id}`].pbig);

                                                                                                                details.push({"SSS" : {"value" : deductions[`deduc${id}`].sss, "op" : "-"}});
                                                                                                                details.push({"PHILHEALTH" : {"value" : deductions[`deduc${id}`].phil, "op" : "-"}});
                                                                                                                details.push({"PAG-IBIG" : {"value" : deductions[`deduc${id}`].pbig, "op" : "-"}});
                                                                                                                
                                                                                                                PAYSLIP.push({'name' : "SSS", 'row': '6', 'col': '3'})
                                                                                                                PAYSLIP.push({'name' : deductions[`deduc${id}`].sss, 'row': '6', 'col': '4'})
                                                                                                                PAYSLIP.push({'name' : "PhilHealth", 'row': '7', 'col': '3'})
                                                                                                                PAYSLIP.push({'name' : deductions[`deduc${id}`].phil, 'row': '7', 'col': '4'})
                                                                                                                PAYSLIP.push({'name' : "Pag-IBIG", 'row': '8', 'col': '3'})
                                                                                                                PAYSLIP.push({'name' : deductions[`deduc${id}`].pbig, 'row': '8', 'col': '4'})
                                                                                                            } else {
                                                                                                                PAYSLIP.push({'name' : "SSS", 'row': '6', 'col': '3'})
                                                                                                                PAYSLIP.push({'name' : 0, 'row': '6', 'col': '4'})
                                                                                                                PAYSLIP.push({'name' : "PhilHealth", 'row': '7', 'col': '3'})
                                                                                                                PAYSLIP.push({'name' : 0, 'row': '7', 'col': '4'})
                                                                                                                PAYSLIP.push({'name' : "Pag-IBIG", 'row': '8', 'col': '3'})
                                                                                                                PAYSLIP.push({'name' : 0, 'row': '8', 'col': '4'})

                                                                                                                details.push({"SSS" : {"value" : 0, "op" : "-"}});
                                                                                                                details.push({"PHILHEALTH" : {"value" : 0, "op" : "-"}});
                                                                                                                details.push({"PAG-IBIG" : {"value" : 0, "op" : "-"}});
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

                                                                                                            details.push({"ADJUSTMENT" : {"value" : adjustment, "op" : "-"}});
                                                                                                            details.push({"CASH ADVANCE" :{"value" : CA, "op" : "-"}});
                                                                                                            details.push({"CHARGES" : {"value" : charges, "op" : "-"}});
                                                                                                            details.push({"SSS LOAN" : {"value" : sss_loan, "op" : "-"}});
                                                                                                            details.push({"PAG-IBIG LOAN" :{"value" : pbig_loan, "op" : "-"}});
                                                                                                            details.push({"COMPANY LOAN" : {"value" : company_loan, "op" : "-"}});
                                                                                                            
                                                                                                            details.push({"TOTAL DEDUCTIONS" : {"value" : total_deductions.toLocaleString(), "highlight" : "", "op" : "-"}});

                                                                                                            PAYSLIP.push({'name' : "Total Deductions", 'row': '15', 'col': '3', 'bold' : true})
                                                                                                            PAYSLIP.push({'name' : total_deductions.toLocaleString(), 'row': '15', 'col': '4', 'bold' : true})


                                                                                                            PAYSLIP.push({'name' : "Total Earnings", 'row': '15', 'col': '1', 'bold' : true})
                                                                                                            PAYSLIP.push({'name' : earned.toLocaleString(), 'row': '15', 'col': '2', 'bold' : true})
                                                                                                            net = net - total_deductions;

                                                                                                            if (sched != 'None') {
                                                                                                                $.ajax({
                                                                                                                    type: 'POST',
                                                                                                                    url: '../php/determine_period.php',
                                                                                                                    data: {
                                                                                                                        id: id,
                                                                                                                    }, success: function(res) {

                                                                                                                        let amount = 0;
                                                                                                                        let penalty = 0;

                                                                                                                        if (sched[0].pay_sched == 'twice-monthly') {
                                                                                                                        
                                                                                                                            for (let i = 0; i < allowanceResponseBody.length; i++) {

                                                                                                                                if (allowanceResponseBody[i].detail == 'twice monthly') { //twice monthly allowance
                                                                                                                                    amount += parseInt(allowanceResponseBody[i].amount);
                                                                                                                                } else {
                                                                                                                                    if (res == 'second-half') {
                                                                                                                                        amount += parseInt(allowanceResponseBody[i].amount);
                                                                                                                                    }
                                                                                                                                }
        
                                                                                                                                let allowanceID = parseInt(allowanceResponseBody[i].id);
        
                                                                                                                                if (allowancePenalty != 'None') {
                                                                                                                                    
                                                                                                                                    for (let k = 0; k < allowancePenalty.length; k++) {
                                                                                                                                        
                                                                                                                                        if (parseInt(allowancePenalty[k].allowance) == allowanceID) {
                                                                                                                                            
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
                                                                                                                        } else {
                                                                                                                            for (let i = 0; i < allowanceResponseBody.length; i++) {
                                                                                                                                console.log("ALLO 960");
                                                                                                                                console.log(allowanceResponseBody[i].amount);
        
                                                                                                                                if (allowanceResponseBody[i].detail == 'monthly') {
                                                                                                                                    amount += parseInt(allowanceResponseBody[i].amount);
                                                                                                                                }
        
                                                                                                                                let allowanceID = parseInt(allowanceResponseBody[i].id);
        
                                                                                                                                if (allowancePenalty != 'None') {
                                                                                                                                    for (let k = 0; k < allowancePenalty.length; k++) {
                                                                                                                                        if (parseInt(allowancePenalty[k].allowance) == allowanceID) {
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

                                                                                                                        details.push({"ALLOWANCE (total)" : {"value" : amount.toLocaleString(), "op" : "+"}});
                                                                                                                        details.push({"ALLOWANCE PENALTY" : {"value" : penalty.toFixed(2), "op" : "-"}});

                                                                                                                        net = net + amount;

                                                                                                                        PAYSLIP.push({'name' : "Allowance", 'row': '16', 'col': '1', 'bold' : true})
                                                                                                                        PAYSLIP.push({'name' : amount.toLocaleString(), 'row': '16', 'col': '2', 'bold' : true})

                                                                                                                        PAYSLIP.push({'name' : "Net Earnings", 'row': '17', 'col': '1', 'span' : '3', 'align' : 'right', 'bold' : true, 'margin' : '15px'})
                                                                                                                        PAYSLIP.push({'name' : net.toLocaleString(), 'row': '17', 'col': '2', 'bold' : true})

                                                                                                                        details.push({"NET" : {"value" : net.toLocaleString(), "highlight" : ""}});

                                                                                                                        PAYSLIP.push({'name' : "Signature", 'row': '18', 'col': '1', 'span' : '2', 'align' : 'center', 'border':'2px solid rgba(0,0,0,.6)'})

                                                                                                                        PAYSLIPS.push(PAYSLIP);
                                                                                                                        PAYSLIP = [];

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

                                                                                                                        let x = 0;
                                                                                                                        for (let i = 0; i < ALLDetails.length; i++) {
                                                                                                                            if (typeof ALLDetails[i] === 'object') {
                                                                                                                                x += 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        
                                                                                                                        $("#available-payslip").html(`Available: ${x}`);

                                                                                                                    
                                                                                                                    }
                                                                                                                })

                                                                                                            }
                                                                                                           
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                            }
                                                                                        )
                                                                                    }
                                                                                );
                                                                            }

                                                                    } else {
                                                                        //no holiday
                                                                        details = [];

                                                                        let d = new Date(from);
                                                                        let d2 = new Date(to);
                                                                        let m = months[d.getMonth()];
                                                                        let day = d.getDate();
                                                                        let day_2 = d2.getDate();
                                                                        let year = d.getFullYear();
                                                                        
                                                                        details.push({"RATE" : rate});
                                                                        details.push({"RATE TYPE" : rateType.toUpperCase()});
                                                                        details.push({"WORKING DAYS" : $(`#cal${id}`).val()});

                                                                        PAYSLIP.push({'name' : COMPANY_NAME, 'row': '1', 'col': '1', 'span' : '4', 'align': 'center', 'bold' : true, 'size' : '20'})
                                                                        PAYSLIP.push({'name' : `${m} ${day}-${day_2}, ${year}`, 'row': '2', 'col': '2', 'span': '3', 'align': 'right'})
                                                                        PAYSLIP.push({'name' : 'Name:', 'row': '3', 'col': '1'})
                                                                        PAYSLIP.push({'name' :  name, 'row': '3', 'col': '2', 'span': '3', 'align': 'left'})
                                                                        PAYSLIP.push({'name' : 'COMPENSATIONS', 'row': '5', 'col': '1', 'span' : '2', 'align': 'center', 'bold' : true})
                                                                        PAYSLIP.push({'name' : 'DEDUCTIONS', 'row': '5', 'col': '2', 'span' : '2', 'align': 'center', 'bold' : true})
                                                                        PAYSLIP.push({'name' : 'Basic', 'row': '6', 'col': '1'})

                                                                        
                                                                        
                                                                        let secondHalf = false;

                                                                        let numOfLeave = 0;
                                                                        let days_worked = 0;

                                                                        for (let i = 0; i < trail.length; i++) {
                                                                            ot_total += parseFloat(trail[i].ot_total);
                                                                            ut_total += parseFloat(trail[i].ut_total);
                                                                            ot_mins += parseFloat(trail[i].ot_mins);
                                                                            ut_mins += parseFloat(trail[i].ut_mins);

                                                                            days_worked += 1;
                                                                            
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
                                                                                    days_worked -= 0.5;
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
                                                                       
                                                                        var absent;
                                                                        rate = parseInt(rate);
                                                                        if (rateType == 'hourly') {
                                                                            rate = rate * parseInt(hour_perday);

                                                                        } else if (rateType == 'monthly') {
                                                                            rate = rate * 12;
                                                                            rate = rate / 365;
                                                                        }

                                                                        let basic = days_worked * rate;
                                                                        
                                                                        PAYSLIP.push({'name' : basic.toLocaleString(), 'row': '6', 'col': '2'})

                                                                        absent = (parseInt($(`#cal${id}`).val()) - parseInt(days_worked)) * rate;

                                                                        let earned = 0;
                                                                        let net = 0;
                                                                        let total_deductions = 0;

                                                                        if (PAYDeductions.includes("absences")) {
                                                                            if (absent > 0) {
                                                                                earned = salaryRate - absent;
                                                                            }
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

                                                                        if (ot_pay == 'eligible') {

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

                                                                        
                                                                        if (holiday_pay == 'eligible') {
                                                                            earned = earned + 0;

                                                                            details.push({"HOLIDAYS (total)" : {"value" : 0, "op" : "+"}});

                                                                            PAYSLIP.push({'name' : "Holiday", 'row': '10', 'col': '1'})
                                                                            PAYSLIP.push({'name' : holidayPay.toLocaleString(), 'row': '10', 'col': '2'})
                                                                        } else {
                                                                            details.push({"HOLIDAYS (total)" : {"value" : 0, "op" : "+"}});
                                                                            PAYSLIP.push({'name' : "Holiday", 'row': '10', 'col': '1'})
                                                                            PAYSLIP.push({'name' : 0, 'row': '10', 'col': '2'})
                                                                        }

                                                                        if (ot_pay == 'eligible') {
                                                                            earned = earned + ot_total;

                                                                            details.push({"OVERTIME (total)" : {"value" : ot_total.toFixed(2), "op" : "+"}});

                                                                            PAYSLIP.push({'name' : "Overtime", 'row': '11', 'col': '1'})
                                                                            PAYSLIP.push({'name' : ot_total.toFixed(2), 'row': '11', 'col': '2'})
                                                                      
                                                                        } else {
                                                                            details.push({"OVERTIME (total)" : {"value" : 0, "op" : "+"}});
                                                                            PAYSLIP.push({'name' : "Overtime", 'row': '11', 'col': '1'})
                                                                            PAYSLIP.push({'name' : 0, 'row': '11', 'col': '2'})
                                                                        }

                                                                     
                                                                        net = earned;

                                                                        details.push({"EARNED" : {"value" : earned.toLocaleString(), "highlight" : "", "op" : "+"}});

                                                                        let sss_contri = 0;
                                                                        let pbig_contri = 0;
                                                                        let phil_contri = 0;

                                                                        let s = salaryRate * 2;
                                                                        if (SSS != 'undefined' && SSS != null) {
                                                                            for (let i = 0; i < SSS.length; i++) {
                                                                                if (SSS[i][2] == 'Over') {
                                                                                    if (s >= SSS[i][1]) {
                                                                                    sss_contri = SSS[i][6];
                                                                                    break;
                                                                                    }
                                                                                } else {
                                                                                    if (s >= SSS[i][1] && s <= SSS[i][2]) {
                                                                                    sss_contri = SSS[i][6];
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
                                                                            total_deductions = total_deductions + parseFloat(deductions[`deduc${id}`].sss);
                                                                            total_deductions = total_deductions + parseFloat(deductions[`deduc${id}`].phil);
                                                                            total_deductions = total_deductions + parseFloat(deductions[`deduc${id}`].pbig);

                                                                            details.push({"SSS" : {"value" : deductions[`deduc${id}`].sss, "op" : "-"}});
                                                                            details.push({"PHILHEALTH" : {"value" : deductions[`deduc${id}`].phil, "op" : "-"}});
                                                                            details.push({"PAG-IBIG" : {"value" : deductions[`deduc${id}`].pbig, "op" : "-"}});

                                                                            PAYSLIP.push({'name' : "SSS", 'row': '6', 'col': '3'})
                                                                            PAYSLIP.push({'name' : deductions[`deduc${id}`].sss, 'row': '6', 'col': '4'})
                                                                            PAYSLIP.push({'name' : "PhilHealth", 'row': '7', 'col': '3'})
                                                                            PAYSLIP.push({'name' : deductions[`deduc${id}`].phil, 'row': '7', 'col': '4'})
                                                                            PAYSLIP.push({'name' : "Pag-IBIG", 'row': '8', 'col': '3'})
                                                                            PAYSLIP.push({'name' : deductions[`deduc${id}`].pbig, 'row': '6', 'col': '4'})
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
                                                                            $.ajax({
                                                                                type: 'POST',
                                                                                url: '../php/determine_period.php',
                                                                                data: {
                                                                                    id: id,
                                                                                }, success: function(res) {

                                                                                    let amount = 0;
                                                                                    let penalty = 0;

                                                                                    if (sched[0].pay_sched == 'twice-monthly') {
                                                                        
                                                                                        //class has allowance
                                                                                        if (allowanceResponseBody  != 'None') {
                                                                                    

                                                                                            for (let i = 0; i < allowanceResponseBody.length; i++) {
                                                                                                console.log("ALLO 1428");
                                                                                                console.log(allowanceResponseBody[i].amount);
                                                                                                if (allowanceResponseBody[i].detail == 'twice monthly') { //twice monthly allowance
                                                                                                    amount += parseInt(allowanceResponseBody[i].amount);
                                                                                                } else {
                                                                                                    if (res == 'second-half') {
                                                                                                        amount += parseInt(allowanceResponseBody[i].amount);
                                                                                                    }
                                                                                                }
    
                                                                                                
                                                                                                let allowanceID = parseInt(allowanceResponseBody[i].id);
        
                                                                                                if (allowancePenalty != 'None') {
                                                                                                    
                                                                                                    for (let k = 0; k < allowancePenalty.length; k++) {
                                                                                                        
                                                                                                        if (parseInt(allowancePenalty[k].allowance) == allowanceID) {
                                                                                                            
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
                                                                                    } else if (sched[0].pay_sched == 'monthly') {
                                                                                        if (allowanceResponseBody != 'None') {
                                                                                            for (let i = 0; i < allowanceResponseBody.length; i++) {
                                                                                                console.log("ALLO 1573");
                                                                                                console.log(allowanceResponseBody[i].amount);
        
                                                                                                if (allowanceResponseBody[i].detail == 'monthly') {
                                                                                                    amount += parseInt(allowanceResponseBody[i].amount);
                                                                                                }
        
                                                                                                let allowanceID = parseInt(allowanceResponseBody[i].id);
        
                                                                                                if (allowancePenalty != 'None') {
                                                                                                    for (let k = 0; k < allowancePenalty.length; k++) {
                                                                                                        if (parseInt(allowancePenalty[k].allowance) == allowanceID) {
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

                                                                                    details.push({"ALLOWANCE (total)" : {"value" : amount.toLocaleString(), "op" : "+"}});
                                                                                    details.push({"ALLOWANCE PENALTY" : {"value" : penalty.toFixed(2), "op" : "-"}});

                                                                                    net = net + amount;

                                                                                    PAYSLIP.push({'name' : "Allowance", 'row': '16', 'col': '1', 'bold' : true})
                                                                                    PAYSLIP.push({'name' : amount.toLocaleString(), 'row': '16', 'col': '2', 'bold' : true})

                                                                                    PAYSLIP.push({'name' : "Net Earnings", 'row': '17', 'col': '1', 'span' : '3', 'align' : 'right', 'bold' : true, 'margin' : '15px'})
                                                                                    PAYSLIP.push({'name' : net.toLocaleString(), 'row': '17', 'col': '2', 'bold' : true})

                                                                                    PAYSLIP.push({'name' : "Signature", 'row': '18', 'col': '1', 'span' : '2', 'align' : 'center', 'border':'2px solid rgba(0,0,0,.6)'})

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
                                                                                    
                                                                                    console.log(ALLDetails[id]);

                                                                                    let x = 0;
                                                                                    for (let i = 0; i < ALLDetails.length; i++) {
                                                                                        if (typeof ALLDetails[i] === 'object') {
                                                                                            x += 1;
                                                                                        }
                                                                                    }

                                                                                    console.log(PAYSLIPS);
                                                                                    console.log(ALLDetails);

                                                                                    
                                                                                    $("#available-payslip").html(`Available: ${x}`);


                                                                                }
                                                                            });

                                                                        } else {
                                                                            errorNotification("Please update your settings.", "warning");
                                                                        }
    
                                                                    }
                                                                    
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


function createTableFromObject(obj) {
    // Create table element
    
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
    try {
        $("#pages").remove();
    } catch (err) {
        console.log("");
    }

    document.body.insertAdjacentHTML("afterbegin", `
    <div class="pages" id="pages" style="display:none;">
    </div>`);

    PAYSLIPS.forEach(function(index) {
        var table = createTableFromObject(index);
        document.getElementById("pages").appendChild(table);
    })

    window.print();
}


$(".payroll").on("click", function(event){
    event.stopImmediatePropagation();

    if (PAYSCHED != null || PAYSCHED !== 'undefined') {
        if (PAYSCHED == 'twice-monthly') {
            document.body.insertAdjacentHTML("afterbegin", `
                <div class="pop-up-window">
                    <div class="window-content pt-5">
                        <p class="text-center text-white" style="font-size:20px;">PAYROLL</p>
                        <hr>
                        <div style="display:flex;flex-direction:column;min-width:20vw;color:#fff;">
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

            $(".pop-up-window").click(function(){
                $(this).remove();
            })
            $(".window-content").click(function(event){
                event.stopImmediatePropagation();
            })

            $("input[type='button']").click(function(event){
                event.stopImmediatePropagation();
                if ($("#from").val() !== '' && $("#to").val() !== '') {
                    from = $("#from").val();
                    to = $("#to").val();
                    $(".pop-up-window").remove();
                    proceed();
                } else {
                    errorNotification("Please select date to proceed.", "warning");
                }
            })
            
        } else {
            proceed();
        }
    }

    function proceed() {
        $.ajax({
            type: 'POST',
            url: '../php/staffs.php',
            success: function(res){
             
                let content = "";
                let responseBody;
                let staffs_len
                try {
                    res = JSON.parse(res);
    
                    responseBody = res;
                    staffs_len = res.length;
                    
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
                            <td><button class="action-button mr-1 compute-salary" data-id="${res[i].serialnumber}">COMPUTE</button>
                            
                            <button class="action-button mr-1 payslip${res[i].serialnumber} view-details" data-class="${res[i].class}" data-id="${res[i].serialnumber}" data-name="${res[i].name}" data-position="${res[i].position}" style="background:orange;display:none;">DETAILS</button>
                            <button class="action-button trail mr-1" data-id="${res[i].serialnumber}">TRAIL</button>
                            
                        </tr>`;
                    }
                    
                } catch(err) {
                    console.log(err);
                }
    
                document.body.insertAdjacentHTML("afterbegin", `
                <div class="pop-up-window">
                    <div class="window-content pt-5">
                        <p class="text-center text-white" style="font-size:20px;">PAYROLL</p>
                        <div class="payroll-header-buttons" style="display:flex;justify-content:space-between;align-items:end;"><div style="color:#fff;display:flex;"><button class="action-button add-holiday mr-2">ADD HOLIDAY</button><button class="action-button remove-holiday mr-2">REMOVE HOLIDAY</button><button class="action-button contribution-tables">CONTRIBUTIONS</button></div>
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
                    </div>
                </div>`);

                $(".add-working-days").click(function(event){
                    event.stopImmediatePropagation();

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
                        <div class="tlo-wrapper pt-5" style="min-width:400px;">
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

                    $(".third-layer-overlay").click(function(event){
                        $(this).remove();
                    })

                    $(".tlo-wrapper").click(function(event){
                        event.stopImmediatePropagation();
                    })
                })

                $("input[type='checkbox']").change(function(event){
                    let snum = $(this).parent("label").data("s");

                    if ($(`#net-pay${snum}`).html() === '0') {
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

                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toLocaleString(), 'highlight' : '', 'op' : '-'};
                                ALLDetails[parseInt(snum)][12]['SSS'] = {'value' : D[`d${snum}`].sss, 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};
                                
                            }
                            if ($(this).attr("id").includes("phil")) {
                                let ded = parseFloat(D[`d${snum}`].phil);
                                net = net - ded;
                                
                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                td = td + ded;
                                
                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toLocaleString(), 'highlight' : '', 'op' : '-'};                 
                                deductions[`deduc${snum}`]['phil'] = D[`d${snum}`].phil;
                                ALLDetails[parseInt(snum)][13]['PHILHEALTH'] = {'value' : D[`d${snum}`].phil, 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};
                            }
                            if ($(this).attr("id").includes("pbig")) {
                                let ded = parseFloat(D[`d${snum}`].pbig);
                                net = net - ded;
                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                td = td + ded;
                                
                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toLocaleString(), 'highlight' : '', 'op' : '-'};
                                deductions[`deduc${snum}`]['pbig'] = D[`d${snum}`].pbig;
                                ALLDetails[parseInt(snum)][14]['PAG-IBIG'] = {'value' : D[`d${snum}`].pbig, 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};
                            }
                            
                        } else {
                            if ($(this).attr("id").includes("sss")) {
                                let ded = parseFloat(deductions[`deduc${snum}`].sss);
                                net = net + ded;
                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                td = td - ded;
                                
                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toLocaleString(), 'highlight' : '', 'op' : '-'};
                                deductions[`deduc${snum}`]['sss'] = 0;
                                ALLDetails[parseInt(snum)][12]['SSS'] = {'value' : deductions[`deduc${snum}`].sss, 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};
                            }
                            if ($(this).attr("id").includes("phil")) {
                                
                                let ded = parseFloat(deductions[`deduc${snum}`].phil);
                                
                                net = net + ded;
                                $(`#net-pay${snum}`).html(net.toLocaleString());
                                td = td - ded;
                                
                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toLocaleString(), 'highlight' : '', 'op' : '-'};
                                deductions[`deduc${snum}`]['phil'] = 0;
                                ALLDetails[parseInt(snum)][13]['PHILHEALTH'] = {'value' : deductions[`deduc${snum}`].phil, 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};
                            }
                            if ($(this).attr("id").includes("pbig")) {
                                
                                let ded = parseFloat(deductions[`deduc${snum}`].pbig);
                                td = td - ded;
                                
                                ALLDetails[parseInt(snum)][21]['TOTAL DEDUCTIONS'] = {'value' : td.toLocaleString(), 'highlight' : '', 'op' : '-'};
                                net = net + ded;
                                $(`#net-pay${snum}`).html(net.toLocaleString());

                                deductions[`deduc${snum}`]['pbig'] = 0;
                                ALLDetails[parseInt(snum)][14]['PAG-IBIG'] = {'value' : deductions[`deduc${snum}`].pbig, 'op' : '-'};
                                ALLDetails[parseInt(snum)][24]['NET'] = {'value' : net.toLocaleString(), 'highlight' : ''};
                            }
                        }
                    }

                    

                    
                })
    
                $(".trail").click(function(event){
                    event.stopImmediatePropagation();
                    let serial = $(this).data("id");
                    $.ajax({
                        type: 'POST',
                        url: '../php/fetch_employee_trail.php',
                        data : {
                            serial: serial,
                        },
                        success: function(res) {
                            let content = "";
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
                                <div class="tlo-wrapper pt-5" style="min-width:500px;">
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
                                </div>
                            </div>
                            `);
                            $(".third-layer-overlay").click(function(event){
                                $(this).remove();
                            })
    
                            $(".tlo-wrapper").click(function(event){
                                event.stopImmediatePropagation();
                            })
    
                        }
                    })
                    
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
                            <div class="tlo-wrapper pt-5" style="min-width:500px;">
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
        
                        $(".third-layer-overlay").click(function(){
                            $(this).remove();
                        })
                        
                        $(".tlo-wrapper").click(function(event){
                            event.stopImmediatePropagation();
                        })
    
                    } else {
                        errorNotification("Cannot process your request.", "danger");
                    }
    
                    
                })
    
                //CONTRIBUTION TABLES
                $(".contribution-tables").on("click", function(event){
                    event.stopImmediatePropagation();
                    let help = "";
                    help += `
                    <svg class="help" style="margin-top:-3px;margin-left:5px;cursor:pointer;" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-question-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
                    </svg>
                    <span class="tip" style="display:none;position:absolute;top:-200%;left:20%;padding:10px;z-index:1000;background:var(--teal);box-shadow:0 0 5px rgba(0,0,0,.5);border-radius:4px 4px 4px 0;color:#fff;">This will be applied to all employee.</span>`;

                    let philVal = "";
                    let pbigVal = "";
                    if (PAGIBIG != 'undefined' && PAGIBIG != null) {
                        pbigVal = PAGIBIG;
                    }
                    if (PHILHEALTH != 'undefined' && PHILHEALTH != null) {
                        philVal = PHILHEALTH;
                    }
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="third-layer-overlay">
                        <div class="tlo-wrapper pt-5">
                            <p class="text-white text-center" style="font-size:20px;">CONTRIBUTIONS</p>
                            <br>
                            <hr>
                            <div class="contribution-tables-wrapper">
                                <span>SSS (Excel file):</span>
                                <input type="file" id="sss-excel-file"/>
                                <span style="position:relative;">PhilHealth: ${help}</span>
                                <input type="text" id="phil-contri" value="${philVal}" placeholder="Fixed or Percentage"/>
                                <span style="position:relative;">Pag-IBIG: ${help}</span>
                                <input type="text" id="pbig-contri" value="${pbigVal}" placeholder="Fixed or Percentage"/>
                                <br>
                                <input type="button" value="ADD CONTRIBUTIONS"/>
                            </div>
                        </div>
                    </div>
                    `);

                    $("svg").on("mouseover", function(event){
                        $(this).parent("span").children("span.tip").show();
                     })
                     $("svg").on("mouseout", function(event){
                        $(this).parent("span").children("span.tip").hide();
                     })

                    document.getElementById('sss-excel-file').addEventListener('change', function(event) {
                        var file = event.target.files[0];
                        var reader = new FileReader();
                        
                        reader.onload = function(event) {
                          var data = new Uint8Array(event.target.result);
                          var workbook = XLSX.read(data, {type: 'array'});
                          
                          // Assuming the first sheet is the one you want to read
                          var sheet = workbook.Sheets[workbook.SheetNames[0]];
                          
                          // Convert the sheet to JSON format
                          var jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    
                          SSS = jsonData;
                          
                        };
                        
                        reader.readAsArrayBuffer(file);
                    });

                    $("input[type='button']").click(function(event){
                        event.stopImmediatePropagation();


                        
                        if ($("#phil-contri").val() !== '') {
                            PHILHEALTH = $("#phil-contri").val();
                        } else {
                            PHILHEALTH = undefined;
                        }

                        if ($("#pbig-contri").val() !== ''){
                            PAGIBIG = $("#pbig-contri").val();
                        } else {
                            PAGIBIG = undefined;
                        }
                        
                        $(".third-layer-overlay").remove();

                        successNotification("Contributions added.", "success");
                        
  
                    })

                    $(".third-layer-overlay").click(function(event){
                        $(this).remove();
                    })

                    $(".tlo-wrapper").click(function(event){
                        event.stopImmediatePropagation();
                    })
                })
    
    
                $(".add-deductions").on("click", function(event){
                    event.stopImmediatePropagation();
    
                    let serialID = $(this).data("id");
    
    
                    if (deductions.hasOwnProperty(`deduc${serialID}`)) {
                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="third-layer-overlay">
                            <div class="tlo-wrapper pt-5">
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
                            <div class="tlo-wrapper pt-5">
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
    
                    $(".tlo-wrapper").click(function(event){
                        event.stopImmediatePropagation();
                    })
    
                    $(".third-layer-overlay").click(function(){
                        $(this).remove();
                    })
                })
    
                $(".remove-holiday").on("click", function(event){
                    event.stopImmediatePropagation();
    
                    console.log(CLASSES);
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
                                    <div class="tlo-wrapper pt-5">
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
    
                            $(".tlo-wrapper").click(function(event){
                                event.stopImmediatePropagation();
                            })
    
                            $(".third-layer-overlay").click(function(){
                                $(this).remove();
                            })
    
                            
                        }
                    })
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
                                    <div class="tlo-wrapper pt-5">
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
    
                            $(".tlo-wrapper").click(function(event){
                                event.stopImmediatePropagation();
                            })
    
                            $(".third-layer-overlay").click(function(){
                                $(this).remove();
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
                        
                        $(this).remove();
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
    
     
                    // for (let i = 0; i < details[`det${id}`].length; i++) {
                    //     for (let key in details[`det${id}`][i]) {
                    //         if (details[`det${id}`][i].hasOwnProperty(key)) {
                    //             let value = details[`det${id}`][i][key];
                    //             if (details[`det${id}`][i][key].hasOwnProperty('value')) {
                    //                 try {      
                    //                     value = parseFloat(details[`det${id}`][i][key].value);
                    //                     value = value.toLocaleString();
                    //                 } catch (err) {
                    //                     value = details[`det${id}`][i][key].value;
                    //                 }
                    //             }
                    //             if (details[`det${id}`][i][key].hasOwnProperty('highlight')) {
                    //                 content += `
                    //                 <tr style="background:rgba(255,255,255,0.2);color: #000;border-bottom:1px solid rgba(0,0,0,0.1);">
                    //                     <td>${key}</td>
                    //                     <td>${value}</td>
                    //                 </tr>`;
                    //             } else {
                    //                 content += `
                    //                 <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                    //                     <td>${key}</td>
                    //                     <td>${value}</td>
                    //                 </tr>`;
                    //             }
                    //         }
                    //     }
                    //}
                    
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="third-layer-overlay">
                        <div class="tlo-wrapper pt-5">
                            <p class="text-white text-center" style="font-size:20px;">${name}</p>
                            <p class="text-white text-center"  style="font-size:13px;margin-top:-20px;">${position}</p>
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
                            <div style="text-align:center;">
                                <input type="button" data-details='{"name":"${reportArr[0]}", "serial":"${reportArr[1]}", "class": "${reportArr[2]}", "class_name":"${reportArr[3]}", "rate": "${reportArr[4]}", "rate_type": "${reportArr[5]}", "working_days": "${reportArr[6]}", "days_worked": "${reportArr[7]}", "salary_rate": "${reportArr[8]}", "absent":"${reportArr[9]}", "basic": "${reportArr[10]}", "ut_total": "${reportArr[11]}", "tardiness" : "${reportArr[12]}", "holiday": "${reportArr[13]}", "ot_total" : "${reportArr[14]}", "earnings" : "${reportArr[15]}", "sss" : "${reportArr[16]}", "phil" : "${reportArr[17]}", "pbig": "${reportArr[18]}", "adjustment": "${reportArr[19]}", "cash_advance": "${reportArr[20]}", "charges" : "${reportArr[21]}", "sss_loan": "${reportArr[22]}", "pbig_loan": "${reportArr[23]}", "company_loan" : "${reportArr[24]}", "total_deductions": "${reportArr[25]}", "allowance": "${reportArr[26]}", "allowance_penalty": "${reportArr[27]}", "net": "${reportArr[28]}" }' style="width:80%;background:var(--teal);color:#fff !important;" class="paid" value="PAID"/>
                            </div>
                        </div>
                    </div>`);
    
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
    
                    $(".third-layer-overlay").on("click", function(event){
                        event.stopImmediatePropagation();
                        $(this).remove();
                    })
    
                    $(".tlo-wrapper").on("click", function(event){
                        event.stopImmediatePropagation();
                    })
                })
    
                $(".pop-up-window").on("click", function(event){
                    event.stopImmediatePropagation();
                    ALLDetails = [];
                    PAYSLIPS = [];
                    try {
                        document.getElementById("pages").innerHTML = "";
                    } catch (err) {
                        console.log(err);
                    }
                    
                    $(this).remove();
                })
    
                $(".window-content").on("click", function(event){
                    event.stopImmediatePropagation();
                })
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

                for (let i = 0; i < res.length ; i++) {
                    ops += `
                    <option value="${res[i].id}">${res[i].class_name}</option>
                    `;
                }

                document.body.insertAdjacentHTML("afterbegin", `
                <div class="pop-up-window">
                    <div class="window-content pt-5">
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

                            <div class="fingerprint-login d-flex align-items-center justify-content-center pt-2 pb-4">
                                <div style="width:25%;padding:5px;margin-right:30px;">
                                    <img src="../src/images/fingerprint_img.png" style="width:100%;"/>
                                </div>
                                <p class="text-white" style="font-size:20px;">Scan staff<br> Fingerprint</p>
                            </div>

                            <input disabled type="submit" onclick="addStaff()" value="Add Staff" style="background:var(--lg);"/>
                        </form>
                    </div>
                </div>`);

                $(".pop-up-window").on("click", function(event){
                    event.stopImmediatePropagation();
                    $(this).remove();
                })

                $(".window-content").on("click", function(event){
                    event.stopImmediatePropagation();
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
         
            let content = ""; 
            document.body.insertAdjacentHTML("afterbegin", `
            <div class="pop-up-window">
                <div class="window-content">
                    <p class="text-center text-white" style="font-size:20px;">Employees (<span id="num-of-staffs"></span>)</p>
                    <div class="table-container" style="max-height:60vh;overflow:auto;max-width:80vw;">
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

            $(".pop-up-window").on("click", function(event){
                $(this).remove();
            })

            $(".window-content").on("click", function(event){
                event.stopImmediatePropagation();
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
                    <td style="display:grid;grid-template-columns: auto auto auto;column-gap:5px;">
                        <button class="action-button employee-profile" data-details='{"serial": "${data[i].serialnumber}", "name": "${data[i].name}", "age" : "${data[i].age}", "phone": "${data[i].contact_number}", "class": "${CLASSES[data[i].class]}", "pos": "${data[i].position}", "dept" : "${data[i].department}", "employed" : "${data[i].date_employed}" }'>PROFILE</button>
                        <button class="action-button open" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-name="${data[i].name}" data-dept="${data[i].department}" data-pos="${data[i].position}">LEAVE</button>
                        <button class="action-button add-deductions" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-name="${data[i].name}" data-dept="${data[i].department}" data-pos="${data[i].position}">DEDUCTIONS</button>
                    </td>
                </tr>`;
            }
           
            document.getElementById("tbody").insertAdjacentHTML("afterbegin", `${content}`);


            $("#num-of-staffs").html(data.length);


            $(".employee-profile").click(function(event){
                event.stopImmediatePropagation();
                let details = $(this).data("details");

                $.ajax({
                    type: 'POST',
                    url: '../php/get_photo.php',
                    data: {
                        serial: details.serial,
                    }, success: function(res) {

                        let imgSrc;
                        if (res != 'none') {
                            imgSrc = "data:image/jpeg;base64," + res;
                        } else {
                            imgSrc = "https://placehold.jp/20c997/ffffff/250x200.png?text=Photo";
                        }

                        document.body.insertAdjacentHTML("afterbegin", `
                            <div class="third-layer-overlay">
                                <div class="tlo-wrapper pt-5 text-white" style="max-height:60vh;overflow:auto;max-width:50vw;min-width:35vw">
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
                                                <span>Department:  ${details.dept}</span>
                                                <span>Date Employed:  ${details.employed}</span>
                                                <div style="margin-top:10px;"></div>
                                                <span><button class="action-button">Records</button></span>
                                            </div>
                                        </div>
                                        <hr>
                                    </div>
                                </div>
                            </div>`);
            
                            $(".third-layer-overlay").click(function(event){
                                $(this).remove();
                            })
                            $(".tlo-wrapper").click(function(event){
                                event.stopImmediatePropagation();
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
                    <div class="tlo-wrapper pt-5"  style="max-height:60vh;overflow:auto;max-width:30vw;min-width:30vw;">
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
                        <div class="folo-wrapper pt-5" style="min-width:20vw;">
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

                    $(".folo-wrapper").on("click", function(event){
                        event.stopImmediatePropagation();
                    })

                    $(".fourth-layer-overlay").on("click", function(event){
                        $(this).remove();
                    })
                })

                $("#cancel-leave").click(function(event){
                    event.stopImmediatePropagation();
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="fourth-layer-overlay">
                        <div class="folo-wrapper pt-5" style="min-width:20vw;">
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

                    $(".folo-wrapper").on("click", function(event){
                        event.stopImmediatePropagation();
                    })

                    $(".fourth-layer-overlay").on("click", function(event){
                        $(this).remove();
                    })
                })

                $(".third-layer-overlay").on("click", function(event){
                    $(this).remove();
                })

                $(".tlo-wrapper").on("click", function(event){
                    event.stopImmediatePropagation();
                })

            })

            $(".add-deductions").on("click", function(event){
                event.stopImmediatePropagation();
                let snumber = $(this).data("snumber");
                let id = $(this).data("id");
                let name = $(this).data("name");
                let pos = $(this).data("pos");
                let dept = $(this).data("dept");
                
                OPEN(snumber, id, name, dept, pos);
            })
            

            $(".view-records").on("click", function(event){
                event.stopImmediatePropagation();

                let content = "";

                $.ajax({
                    type: 'POST',
                    url: '../php/fetch_records.php',
                    data: {
                        serialnumber: `${$(this).data("snumber")}`,
                    },
                    success: function(res){

                        try {
                            res = JSON.parse(res);

                            for (let i = 0; i < res.length; i++) {
                                content += `                                                    
                                <tr>
                                    <td>${res[i].name}</td>
                                    <td>${parseFloat(res[i].hours_worked).toFixed(2)} hrs</td>
                                    <td>${res[i].start_time}</td>
                                    <td>${res[i].end_time}</td>
                                    <td>${res[i].ot_total}</td>
                                    <td>${res[i].ut_total}</td>
                                    <td>${res[i].date}</td>
                                </tr>`;
                            }

                            document.body.insertAdjacentHTML("afterbegin", `
                            <div class="third-layer-overlay">
                                <div class="tlo-wrapper pt-5">
                                    <p class="text-white text-center" style="font-size:20px;">RECORDS</p>
                                    <hr>
                                    <div class="table-container" style="max-height:60vh;overflow:auto;max-width:50vw;min-width:25vw;">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <td>NAME</td>
                                                    <td>HOURS WORKED</td>
                                                    <td>START TIME</td>
                                                    <td>END TIME</td>
                                                    <td>OT (TOTAL)</td>
                                                    <td>UT (TOTAL)</td>
                                                    <td>DATE</td>
                                                </tr>
                                            </thead>
                                            <tbody id="tbody">
                                                ${content}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>`);

                            $(".third-layer-overlay").on("click", function(event){
                                $(this).remove();
                            })

                            $(".tlo-wrapper").on("click", function(event){
                                event.stopImmediatePropagation();
                            })

                        } catch(err){
                            errorNotification("No records.", "warning");
                        }
                        
                    }
                })
                
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
                <div class="window-content pt-5">
                    <div style="display: flex;align-items: center;margin-top:10px;margin-bottom:30px;">
                        <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                        <div style="flex:1;display:grid;place-items:center;color:#fff;font-size:20px;">COMPANY SETUP</div>
                        <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                    </div>
                    <form style="width:100%;" id="companySettingsForm">
                        <div class="company-details-wrapper">
                            <div>
                                <p class="text-center text-white">PAY SCHEDULE</p>
                                <div>
                                    <select id="payroll-sched" name="pay_sched" required>
                                        ${ops}
                                    </select>

                                    ${inputs}
                                </div>
                            </div>
                            <div>
                                <p class="text-center text-white">COMPANY DETAILS</p>
                                <div>
                                    <span>Company name: (required)</span>
                                    <input type="text" name="compname" value="${compname}"  autocomplete="off" placeholder="Enter company name"/>
                                    <span>Company address: (optional)</span>
                                    <input type="text" name="compadd" value="${compadd}" placeholder="Enter company address"/>
                                </div>
                            </div>
                            <div>
                                <p class="text-center text-white">EMPLOYEES CLASSIFICATION</p>
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
                            <div>
                                <p class="text-center text-white">HOLIDAYS RATE</p>
                                <div>
                                    <input type="button" id="add-holiday"  value="ADD"/>
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
                            day1: formDataObject.day1,
                            day2: formDataObject.day2,
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

                                // Extract hours and minutes
                                const hours = time.getHours();
                                const minutes = time.getMinutes();

                                // Determine AM or PM
                                const period = hours >= 12 ? 'PM' : 'AM';

                                // Convert hours to 12-hour format
                                const displayHours = hours % 12 || 12;

                                // Format the time string
                                const formattedTime = `${displayHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;

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
                                    <td>${res[i].rate} (${res[i].rate_type})</td>
                                    <td>${res[i].ot_pay}</td>
                                    <td>${res[i].holi_pay}</td>
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
                            <div class="tlo-wrapper pt-5">
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
                                                <td>CLOCK IN SCHEDULE</td>
                                                <td>RATE</td>
                                                <td>OT PAY</td>
                                                <td>HOLIDAY PAY</td>
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

                        $(".delete-row").on("click", function(event){
                            event.stopImmediatePropagation();
                            let id = $(this).data("id");

                            $.ajax({
                                type: 'POST',
                                url: '../php/delete_class.php',
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
                            document.body.insertAdjacentHTML("afterbegin", `
                            <div class="fourth-layer-overlay" style="overflow:auto;">
                                <div class="folo-wrapper pt-5" style="min-width:20vw;">
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
                                        <span>CLOCK IN SCHEDULE:</span>
                                        <input type="time" name="clock_in"/>
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
                                            <div style="flex:2;display:grid;place-items:center;color:#fff;">COMPENSATIONS</div>
                                            <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                                        </div>
                                        <span>OT PAY:</span>
                                        
                                        <select name="ot_pay">
                                            <option value="eligible">Eligible</option>
                                            <option value="not-eligible">Not Eligible</option>
                                        </select>
                                        <span>HOLIDAY PAY:</span>
                                        <select name="holi_pay">
                                            <option value="eligible">Eligible</option>
                                            <option value="not-eligible">Not Eligible</option>
                                        </select>
                                        <div style="display: flex;align-items: center;margin-top:10px;margin-bottom:10px;">
                                            <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                                            <div style="flex:2;display:grid;place-items:center;color:#fff;">DEDUCTIONS</div>
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
                                            rate: formDataObject.rate,
                                            rate_type: formDataObject.rate_type,
                                            ot_pay: formDataObject.ot_pay,
                                            holi_pay: formDataObject.holi_pay,
                                            deductions: formDataObject.deductions

                                        }, success: function(res){
                                            try {
                                                res = JSON.parse(res);
                                                if (res.message == 'success') {
                                                    successNotification("New class added.", "success");
                                                    $(".fourth-layer-overlay").remove();
                                                }

                                            } catch(err) {
                                                console.log(err);
                                            }
                                        }
                                    })
                                }
                            })

                            $(".folo-wrapper").on("click", function(event){
                                event.stopImmediatePropagation();
                            })
                        
                            $(".fourth-layer-overlay").on("click", function(event){
                                event.stopImmediatePropagation();
                                $(this).remove();
                            })
                        })
                    
                        $(".tlo-wrapper").on("click", function(event){
                            event.stopImmediatePropagation();
                        })
                    
                        $(".third-layer-overlay").on("click", function(event){
                            event.stopImmediatePropagation();
                            $(this).remove();
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
                                let CLASSNAME = CLASSES[`${res[i].class}`];
                                let str = res[i].detail;
                                str = str.charAt(0).toUpperCase() + str.slice(1);
                                tbody += `
                                <tr id="row${res[i].id}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>${res[i].allowance_name}</td>
                                    <td>${res[i].amount}</td>
                                    <td>${str}</td>
                                    <td>${CLASSNAME}</td>
                                    <td><input type="button" class="delete-row" data-id="${res[i].id}" value="DELETE"></td>
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
                            <div class="tlo-wrapper pt-5">
                                <p class="text-white text-center" style="font-size:20px;">ALLOWANCE</p>
                                <button id="add" style="padding: 5px 15px;
                                border-radius: 4px;
                                background: var(--teal);
                                color: #fff;
                                border: none;
                                font-size: 15px;">ADD ALLOWANCE</button>
                                <hr>
                                <div class="table-container" style="max-height:60vh;overflow:auto;max-width:30vw;min-width:25vw;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>NAME</td>
                                                <td>AMOUNT</td>
                                                <td>DETAIL</td>
                                                <td>CLASS</td>
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
                                url: '../php/delete_allowance.php',
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
                                            ops += `
                                            <option value="${res[i].id}">${res[i].class_name}</option>
                                            `;
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
                                            <div class="folo-wrapper pt-5" style="min-width:20vw;">
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
                                                    <span>SELECT CLASS:</span>
                                                    <select name="class">
                                                        ${ops}
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

                                            if (!isNotEmpty) {
                                                errorNotification("Input fields must be filled out.", "warning");
                                            } else {
                                                $.ajax({
                                                    type: 'POST',
                                                    url: '../php/add_allowance.php',
                                                    data: {
                                                        name: formDataObject.name,
                                                        amount: formDataObject.amount,
                                                        type: formDataObject.type,
                                                        class: formDataObject.class,
                                                        
                                                    }, success: function(res){
                                                      
                                                        try {
                                                            res = JSON.parse(res);
                                                        
                                                            if (res.message == 'success') {
                                                                successNotification("Allowance added.", "success");
                                                                $(".fourth-layer-overlay").remove();
                                                            }
                                                            
                                                        } catch(err) {
                                                            console.log(err);
                                                        }
                                                    }
                                                })
                                            }
                                        })

                                        $(".folo-wrapper").on("click", function(event){
                                            event.stopImmediatePropagation();
                                        })
                                    
                                        $(".fourth-layer-overlay").on("click", function(event){
                                            event.stopImmediatePropagation();
                                            $(this).remove();
                                        })

                                    } catch (err) {
                                        errorNotification("Add at least one class.", "warning");
                                    }
                                } 
                            })

                            
                        })
                    
                        $(".tlo-wrapper").on("click", function(event){
                            event.stopImmediatePropagation();
                        })
                    
                        $(".third-layer-overlay").on("click", function(event){
                            event.stopImmediatePropagation();
                            $(this).remove();
                        })
                    }
                })
            })

            $(".window-content").on("click", function(event){
                event.stopImmediatePropagation();
            })

            $(".pop-up-window").on("click", function(event){
                $(this).remove();
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
                                let CLASSNAME = CLASSES[`${res[i].class}`];

                                let strArr = res[i].type.split("|");
                            
                                tbody += `
                                <tr id="row${res[i].id}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>${res[i].allowance_name}</td>
                                    <td>${strArr[0]} (${strArr[1]} mins)</td>
                                    <td>${res[i].deduction}</td>
                                    <td>${CLASSNAME}</td>
                                    <td><input type="button" class="delete-row" data-id="${res[i].id}" value="DELETE"></td>
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
                            <div class="tlo-wrapper pt-5">
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
                                                <td>CLASS</td>
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
                                url: '../php/delete_penalty.php',
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
                                                } catch (err) {
                                                    console.log(err);
                                                }

                                                for (let i = 0; i < res.length; i++) {
                                                    allowanceOps += `
                                                    <option value="${res[i].id}|${res[i].allowance_name}">${res[i].allowance_name}</option>`;
                                                }

                                                document.body.insertAdjacentHTML("afterbegin", `
                                                <div class="fourth-layer-overlay">
                                                    <div class="folo-wrapper pt-5" style="min-width:20vw;">
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

                                                            <span>SELECT CLASS:</span>
                                                            <select name="class">
                                                                ${ops}
                                                            </select>

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

                                                    let opValue = formDataObject.allowance.split("|");
                                                    formDataObject['allowance_name'] = opValue[1];
                                                    formDataObject['allowance_id'] = opValue[0];

                                                    if (!isNotEmpty) {
                                                        errorNotification("Fields must be filled out.", "warning");
                                                    } else {
                                                        $.ajax({
                                                            type: 'POST',
                                                            url: '../php/add_allowance_penalty.php',
                                                            data: {
                                                                allowance_name: formDataObject.allowance_name,
                                                                allowance_id: formDataObject.allowance_id,
                                                                deduction: formDataObject.deduction,
                                                                type: formDataObject.type,
                                                                class: formDataObject.class,
                                                                
                                                            }, success: function(res){
                                                             
                                                                try {
                                                                    res = JSON.parse(res);
                                                                    
                                                                    if (res.message == 'success') {
                                                                        successNotification("Penalty added.", "success");
                                                                        $(".fourth-layer-overlay").remove();
                                                                    }
                                                                    
                                                                } catch(err) {
                                                                    console.log(err);
                                                                }
                                                            }
                                                        })
                                                    }
                                                    
                                                })

                                                $(".folo-wrapper").on("click", function(event){
                                                    event.stopImmediatePropagation();
                                                })
                                            
                                                $(".fourth-layer-overlay").on("click", function(event){
                                                    event.stopImmediatePropagation();
                                                    $(this).remove();
                                                })
                                            }
                                        })

                                        

                                    } catch (err) {
                                        errorNotification("Add at least one class.", "warning");
                                    }
                                }
                            });

                        })
                    
                        $(".tlo-wrapper").on("click", function(event){
                            event.stopImmediatePropagation();
                        })
                    
                        $(".third-layer-overlay").on("click", function(event){
                            event.stopImmediatePropagation();
                            $(this).remove();
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
                            <div class="tlo-wrapper pt-5">
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
                                            ops += `
                                            <option value="${res[i].id}">
                                                ${res[i].class_name}
                                            </option>
                                            `;
                                        }

                                        document.body.insertAdjacentHTML("afterbegin", `
                                        <div class="fourth-layer-overlay">
                                            <div class="folo-wrapper pt-5" style="min-width:20vw;">
                                                <p class="text-white text-center" style="font-size:20px;">ADD HOLIDAY</p>
                                                <hr>
                                                <form id="addHolidayForm">
                                                    <span>HOLIDAY:</span>
                                                    <input type="text" placeholder="Enter holiday" name="holiday">

                                                    <span>RATE IF WORKED (percentage):</span>
                                                    <input type="number" placeholder="Enter rate if worked" name="worked" />

                                                    <span>RATE IF DID NOT WORK (percentage):</span>
                                                    <input type="number" placeholder="Enter rate if did not work" name="didnotwork" />

                                                    <span>SELECT CLASS: (Hold CTRL to select multiple)</span>
                                                    <select name="class" multiple>
                                                        ${ops}
                                                    </select>
                                                    

                                                    <span>EXCLUDE IF:</span>
                                                    <select name="holiday_policy">
                                                        <option value="abh">Absent before holiday</option>
                                                        <option value="aah">Absent after holiday</option>
                                                        <option value="abaah">Absent before and after holiday</option>
                                                    </select>

                                                    <br>
                                                    <input type="submit" value="ADD HOLIDAY RATE"/>
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

                                        $(".folo-wrapper").on("click", function(event){
                                            event.stopImmediatePropagation();
                                        })
                                    
                                        $(".fourth-layer-overlay").on("click", function(event){
                                            event.stopImmediatePropagation();
                                            $(this).remove();
                                        })

                                    } catch (err) {
                                        errorNotification("Add at least one class.", "warning");
                                    }
                                }
                            });

                            
                        })
                    
                        $(".tlo-wrapper").on("click", function(event){
                            event.stopImmediatePropagation();
                        })
                    
                        $(".third-layer-overlay").on("click", function(event){
                            event.stopImmediatePropagation();
                            $(this).remove();
                        })
                    }
                });
                
            })

            
            
        }
    })

    
})

function OPEN(snumber, id, name, age, position) {
    $.ajax({
        type: 'POST',
        data: {
            serial: snumber,
        },
        url: '../php/fetch_staff.php',
        success: function(res){
            console.log(res);
            try {
                let data = JSON.parse(res);
                

                document.body.insertAdjacentHTML("afterbegin", `
                <div class="third-layer-overlay">
                    <div class="tlo-wrapper pt-5">
                        <p class="text-white text-center" style="font-size:20px;">${name}</p>
                        <p class="text-white text-center" style="font-size:13px;margin-top:-20px;">${age} | ${position}</p>
                        <hr>
                        <form style="width:100%;" id="staffSettings">
                            <div class="tlo-content">
                                <div>
                                    <span>CHARGES:</span>
                                    <input type="number" name="charges" value="${data.charges}" placeholder="Charges"/>
                                    <span>ADJUSTMENT:</span>
                                    <input type="number" name="adjustment" value="${data.adjustment}" placeholder="Adjustment"/>
                                    <span>CASH ADVANCE:</span>
                                    <input type="number" name="cashad" value="${data.cash_advance}" placeholder="Cash advance"/>
                                </div>
                                <div>
                                    <span>SSS LOAN:</span>
                                    <input type="number" name="sssloan" value="${data.sss_loan}" placeholder="SSS loan"/>
                                    <span>PAG-IBIG LOAN:</span>
                                    <input type="number" name="pbigloan" value="${data.pag_ibig_loan}" placeholder="Pag-IBIG loan"/>
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
                   
                    let data = new FormData(document.getElementById("staffSettings"));
                    var formDataObject = {};
                    data.forEach(function(value, key){
                        formDataObject[key] = value;
                    });
            
                    $.ajax({
                        type: 'POST',
                        url: '../php/update_staff_settings.php',
                        data: {
                            id: id,
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
                            }
                        }
                    })
                })
            
                $(".tlo-wrapper").on("click", function(event){
                    event.stopImmediatePropagation();
                })
            
                $(".third-layer-overlay").on("click", function(event){
                    event.stopImmediatePropagation();
                    $(this).remove();
                })
                
            } catch(err){
                
            }
        }
    })
}


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
    formData.append('serialnumber', 20);
    formData.append('class', formDataObject.class);
    formData.append('phone', formDataObject.phone);
    formData.append('date_employed', formDataObject.employed);
    formData.append('file', formDataObject.file);
    
    if (isNotEmpty) {
        $.ajax({
            type: 'POST',
            url: '../php/add_staff.php',
            contentType: false,
            processData: false,
            data: formData,

            success: function(res){
                console.log(res);
                if (res == 'success') {
                    //websocket.send(128);

                    $(".pop-up-window").remove();
                    $("input[type='text'], input[type='password'], input[type='number']").val('');
                    successNotification("New employee added.", "success");
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

