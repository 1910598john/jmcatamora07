// Define months array
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var gateway = `ws://192.168.10.147/management`;
var websocket;
var SERIAL_NUMBER;
var timeout;
var details = [];

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
                            
                            var name, pos, department, adjustment, CA, charges, sss_loan, pbig_loan, company_loan, days_worked;

                            name = responseBody.name;
                            pos = responseBody.position;
                            department = responseBody.department;
                            adjustment = responseBody.adjustment;
                            CA = responseBody.cash_advance;
                            charges = responseBody.charges;
                            sss_loan = responseBody.sss_loan;
                            pbig_loan = responseBody.pag_ibig_loan;
                            company_loan = responseBody.company_loan;
                            days_worked = responseBody.days_worked;

                            $.ajax({
                                type: 'POST',
                                url: '../php/fetch_company_settings.php',
                                success: function(sched){
                                    try {
                                        sched = JSON.parse(sched);
                                    } catch (err) {
                                        sched = 'None';
                                    }

                                    $.ajax({
                                        type: 'POST',
                                        url: '../php/fetch_staffs_trail.php',
                                        data: {
                                            serialnumber: responseBody.serialnumber,
                                        },
        
                                        success: function(trail){
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
                                                                            
                                                                            for (let i = 0; i < holidays.length; i++) {
                                                                                let date = holidays[i].date;
                                                                                startFetching(holidays[i].name, responseBody.class, date);
                                                                            }

                                                                        } else {
        
                                                                            days_worked = parseFloat(days_worked);
                                                                            
                                                                            let secondHalf = false;

                                                                            for (let i = 0; i < trail.length; i++) {
                                                                                ot_total += parseFloat(trail[i].ot_total);
                                                                                ut_total += parseFloat(trail[i].ut_total);
                                                                                ot_mins += parseFloat(trail[i].ot_mins);
                                                                                ut_mins += parseFloat(trail[i].ut_mins);
                                                                                
                                                                                let HOURPERDAY = parseInt(hour_perday);
                                                                                HOURPERDAY = HOURPERDAY / 2;
                                                                                
                                                                                let OnLeave = false;

                                                                                if (parseInt(trail[i].leave_status) == 1) {
                                                                                    OnLeave = true;
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
                                                                            let salaryRate = rate * parseInt($(`#cal${id}`).val());
                                                                            

                                                                           
                                                                            let basic = rate * parseInt(days_worked);
                                                                            let absent = salaryRate - basic;
                                                            
        
                                                                            let earned = 0;
                                                                            let net = 0;
                                                                            let total_deductions = 0;
                                                                            earned = salaryRate - absent;

                                                                            if (ot_pay == 'eligible') {

                                                                                if (PAYDeductions.includes('undertime')) {
                                                                                    earned = earned - ut_total;
                                                                                }
                                                                               
                                                                            }
                                                                            
                                                                            earned = earned + 0;

                                                                            if (ot_pay == 'eligible') {
                                                                                earned = earned + ot_total;
                                                                            }
        
                                                                            console.log("EARNED: " + earned.toLocaleString());
        
                                                                            net = earned;
        
                                                                            if (deductions.hasOwnProperty(`deduc${id}`)) {
                                                                                total_deductions = total_deductions + parseFloat(deductions[`deduc${id}`].sss);
                                                                                total_deductions = total_deductions + parseFloat(deductions[`deduc${id}`].phil);
                                                                                total_deductions = total_deductions + parseFloat(deductions[`deduc${id}`].pbig);
                                                                            }
                                                                            
                                                                            total_deductions = total_deductions + parseInt(adjustment);
                                                                            total_deductions = total_deductions + parseInt(CA);
                                                                            total_deductions = total_deductions + parseInt(charges);
                                                                            total_deductions = total_deductions + parseInt(sss_loan);
                                                                            total_deductions = total_deductions + parseInt(pbig_loan);
                                                                            total_deductions = total_deductions + parseInt(company_loan);
        
                                                                            net = net - total_deductions;
                                                                            console.log("TOTAL DEDUCTIONS: " + total_deductions);

                                                                            if (sched != 'None') {
                                                                            
                                                                                let amount = 0;
                                                                                let penalty = 0;
                                                                                
                                                                                if (sched[0].pay_sched == 'twice-monthly') {
                                                                                    let firstHalfSched = sched[0].day1;
                                                                                    let secondHalfSched = sched[0].day2;

                                                                                    for (let i = 0; i < allowanceResponseBody.length; i++) {

                                                                                        if (allowanceResponseBody[i].detail == 'twice monthly') { //twice monthly allowance
                                                                                            amount += parseInt(allowanceResponseBody[i].amount);
                                                                                        }

                                                                                        if (secondHalf) {
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

                                                                                    

                                                                                } else if (sched[0].pay_sched == 'monthly') {
                                                                                    for (let i = 0; i < allowanceResponseBody.length; i++) {
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

                                                                                net = net + amount;

                                                                                if (deductions.hasOwnProperty(`deduc${id}`)) {
                                                                                    if (ot_pay == 'eligible') {
                                                                                        details[`det${id}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${id}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent}, {'UNDERTIME (Total)': ut_total}, {'BASIC' : basic}, {'HOLIDAY (Total)' : 0}, {'OVERTIME (Total)' : ot_total}, {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': deductions[`deduc${id}`].sss}, {'PhilHealth' : deductions[`deduc${id}`].phil}, {'Pag-IBIG' : deductions[`deduc${id}`].pbig}, {'ADJUSTMENT' : adjustment}, {'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount}, {'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                    } else {
                                                                                        details[`det${id}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${id}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent}, {'BASIC' : basic}, {'HOLIDAY (Total)' : 0},  {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': deductions[`deduc${id}`].sss}, {'PhilHealth' : deductions[`deduc${id}`].phil}, {'Pag-IBIG' : deductions[`deduc${id}`].pbig}, {'ADJUSTMENT' : adjustment}, {'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount}, {'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                    }
                                                                                } else {
                                                                                    if (ot_pay == 'eligible') {
                                                                                        details[`det${id}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${id}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent}, {'UNDERTIME (Total)': ut_total}, {'BASIC' : basic}, {'HOLIDAY (Total)' : 0}, {'OVERTIME (Total)' : ot_total}, {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': 0}, {'PhilHealth' : 0}, {'Pag-IBIG' : 0}, {'ADJUSTMENT' : adjustment},{ 'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount}, {'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                    } else {
                                                                                        details[`det${id}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${id}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent},  {'BASIC' : basic}, {'HOLIDAY (Total)' : 0},  {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': 0}, {'PhilHealth' : 0}, {'Pag-IBIG' : 0}, {'ADJUSTMENT' : adjustment},{ 'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount}, {'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                    }
                                                                                    
                                                                                }
                                                                                
                                                                                $(`#gross-pay${id}`).html(earned.toLocaleString());
                                                                                $(`#net-pay${id}`).html(net.toLocaleString());

                                                                                console.log(details);

                                                                            } else {
                                                                                errorNotification("Please update your settings.", "warning");
                                                                            }
                                                                            
                                                                            console.log("OT MINS: " + ot_mins);
                                                                            console.log("UT MINS: " + ut_mins);
                                                                            console.log("LATE: (minutes)" + late_mins);
        
                                                                            //////////////
        
                                                                        }
                        
                                                                        async function startFetching(id, _class, date) {
                                                                            await fetchHolidays(id, _class, date);
                                                                        }
                        
                                                                        async function fetchHolidays(id, _class, date) {
                                                                            
                                                                            $.ajax({
                                                                                type: 'POST',
                                                                                url: '../php/fetchCompanyHolidays.php',
                                                                                data: {
                                                                                    id: id,
                                                                                    class: _class,
                
                                                                                }, success: function(h) {
                                                                                    console.log('holidays for this class');
                                                                                
                                                                                    try {
                                                                                        h = JSON.parse(h);
                                                                                        let excluded = false;
                        
                                                                                        let promise;
                                                                                        
                                                                                        if (h.exclusion == 'abh') {

                                                                                            let DATE = new Date(date);
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
                                                                                                        type: h.exclusion,
                                                                                                        date: `${dateString}`,
                                                                                                        serial: responseBody.serialnumber
                                                                                                        
                                                                                                    }, success: function(res1){
                                                                                                        resolve(res1);
                                                                                                    }
                                                                                                })
                                                                                            })
                                                                                        
                                                                                        } else if (h.exclusion == 'aah') {
                        
                                                                                            let DATE = new Date(date);
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
                                                                                                        type: h.exclusion,
                                                                                                        date: `${dateString}`,
                                                                                                        serial: responseBody.serialnumber
                                                                                                        
                                                                                                    }, success: function(res1){
                                                                                                        resolve(res1);
                                                                                                    }
                                                                                                })
                                                                                            })
                                                                                            
                                                                                        } else if (h.exclusion == 'abaah') {
                                                                                            
                                                                                            let DATE = new Date(date);
                                                                                            let DATE2 = new Date(date);
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
                                                                                                        type: h.exclusion,
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
                                                                                                

                                                                                                if (!value.includes("worked")) {
                                                                                                    excluded = true;
                                                                                                }

                                                                                                days_worked = parseFloat(days_worked);
                                                                            
                                                                                                    let secondHalf = false;

                                                                                                    for (let i = 0; i < trail.length; i++) {
                                                                                                        ot_total += parseFloat(trail[i].ot_total);
                                                                                                        ut_total += parseFloat(trail[i].ut_total);
                                                                                                        ot_mins += parseFloat(trail[i].ot_mins);
                                                                                                        ut_mins += parseFloat(trail[i].ut_mins);
                                                                                                        
                                                                                                        let HOURPERDAY = parseInt(hour_perday);
                                                                                                        HOURPERDAY = HOURPERDAY / 2;
                                                                                                        
                                                                                                        let OnLeave = false;

                                                                                                        if (parseInt(trail[i].leave_status) == 1) {
                                                                                                            OnLeave = true;
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
                                
                                                                                                    let salaryRate = rate * parseInt($(`#cal${_class}`).val());
                                                                                                    
                                                                                                    let basic = rate * parseInt(days_worked);
                                                                                                    let absent = salaryRate - basic;
                                                                                                    // console.log("WORKING DAYS: " + $(`#cal${_class}`).val());
                                                                                                    // console.log("DAYS WORKED: " + days_worked);
                                                                                                    // console.log("RATE: " + rate);
                                                                                                    // console.log("SALARY RATE: " + salaryRate);
                                                                                                    // console.log("ABSENT: " + absent);
                                                                                                    // console.log("UNDERTIME TOTAL: " + ut_total);
                                                                                                    // console.log("BASIC: " + basic);
                                                                                                    // console.log("HOLIDAY: " + 0);
                                                                                                    // console.log("OVERTIME TOTAL: " + ot_total);
                                
                                                                                                    let earned = 0;
                                                                                                    let net = 0;
                                                                                                    let holidayPay = 0;
                                                                                                    let total_deductions = 0;
                                                                                                    
                                                                                                        if (holiday_pay == 'eligible') {

                                                                                                            for (let x = 0; x < holidays.length; x++) {
                                                                                                                console.log(x + "x");
                                                                                                                $.ajax({
                                                                                                                    type: 'POST',
                                                                                                                    url: '../php/fetch_class_holidays.php',
                                                                                                                    data: {
                                                                                                                        id: holidays[x].name,
                                                                                                                    }, success: function(res) {
                                                                                                                        
                                                                                                                        try {
                                                                                                                            res = JSON.parse(res);
                                                                                                                           
                                                                                                                            $.ajax({
                                                                                                                                type: 'POST',
                                                                                                                                url: '../php/workedOnHoliday.php',
                                                                                                                                data: {
                                                                                                                                    date: date,
                                                                                                                                    snumber: responseBody.serialnumber,

                                                                                                                                }, success: function(resp) {
                                                                                                                                    let worked = false;
                                                                                                                                    

                                                                                                                                    if (resp.includes("worked")) {
                                                                                                                                        worked = true;
                                                                                                                                    }

                                                                                                                                    if (worked) {
                                                                                                                                        let percentage = parseInt(res[0].worked);
                                                                                                                                        
                                                                                                                                        percentage = percentage / 100;
                                                                                                                                        holidayPay = holidayPay + (parseInt(rate) * percentage);
                                                                                                                                    } else {
                                                                                                                                        let percentage = parseInt(res[0].didnotwork);
                                                                                                                                        
                                                                                                                                        percentage = percentage / 100;
                                                                                                                                        holidayPay = holidayPay + (parseInt(rate) * percentage);
                                                                                                                                    }

                                                                                                                                    earned = salaryRate - absent;

                                                                                                                                    if (ot_pay == 'eligible') {
                                                                                                                                        if (PAYDeductions.includes('undertime')) {
                                                                                                                                            earned = earned - ut_total;
                                                                                                                                        }
                                                                                                                                        
                                                                                                                                    }

                                                                                                                                    if (excluded) {
                                                                                                                                        holidayPay = 0;
                                                                                                                                    }

                                                                                                                                    console.log(holidayPay);

                                                                                                                                    earned = earned + holidayPay;

                                                                                                                                    if (ot_pay == 'eligible') {
                                                                                                                                        earned = earned + ot_total;
                                                                                                                                    }

                                                                                                                                    // console.log("EARNED: " + earned.toLocaleString());
                                                                
                                                                                                                                    net = earned;
                                                                
                                                                                                                                    if (deductions.hasOwnProperty(`deduc${_class}`)) {
                                                                                                                                        total_deductions = total_deductions + parseFloat(deductions[`deduc${_class}`].sss);
                                                                                                                                        total_deductions = total_deductions + parseFloat(deductions[`deduc${_class}`].phil);
                                                                                                                                        total_deductions = total_deductions + parseFloat(deductions[`deduc${_class}`].pbig);
                                                                                                                                    }
                                                                                                                                    
                                                                                                                                    total_deductions = total_deductions + parseInt(adjustment);
                                                                                                                                    total_deductions = total_deductions + parseInt(CA);
                                                                                                                                    total_deductions = total_deductions + parseInt(charges);
                                                                                                                                    total_deductions = total_deductions + parseInt(sss_loan);
                                                                                                                                    total_deductions = total_deductions + parseInt(pbig_loan);
                                                                                                                                    total_deductions = total_deductions + parseInt(company_loan);
                                                                
                                                                                                                                    net = net - total_deductions;
                                                                                                                                    // console.log("TOTAL DEDUCTIONS: " + total_deductions);

                                                                                                                                    if (sched != 'None') {
                                                                                                                                    
                                                                                                                                        let amount = 0;
                                                                                                                                        let penalty = 0;
                                                                                                                                        
                                                                                                                                        
                                                                                                                                        if (sched[0].pay_sched == 'twice-monthly') {
                                                                                                                                            let firstHalfSched = sched[0].day1;
                                                                                                                                            let secondHalfSched = sched[0].day2;

                                                                                                                                            for (let i = 0; i < allowanceResponseBody.length; i++) {

                                                                                                                                                if (allowanceResponseBody[i].detail == 'twice monthly') { //twice monthly allowance
                                                                                                                                                    amount += parseInt(allowanceResponseBody[i].amount);
                                                                                                                                                }

                                                                                                                                                if (secondHalf) {
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
                                                                                                                                                                    let numOfAbsent = parseInt($(`#cal${_class}`).val()) - days_worked;
                                                            
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
                                                                                                                                                                    let numOfAbsent = parseInt($(`#cal${_class}`).val()) - days_worked;
                                                            
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

                                                                                                                                            

                                                                                                                                        } else if (sched[0].pay_sched == 'monthly') {
                                                                                                                                            for (let i = 0; i < allowanceResponseBody.length; i++) {
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
                                                                                                                                                                    let numOfAbsent = parseInt($(`#cal${_class}`).val()) - days_worked;
                                                            
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
                                                                                                                                                                    let numOfAbsent = parseInt($(`#cal${_class}`).val()) - days_worked;
                                                            
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

                                                                                                                                        net = net + amount;
                                                                                                                                        
                                                                                                                                        // console.log("NET PAY: " + net.toLocaleString());
                                                                                                                                        if (deductions.hasOwnProperty(`deduc${_class}`)) {
                                                                                                                                            if (ot_pay == 'eligible') {
                                                                                                                                                details[`det${_class}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${_class}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent}, {'UNDERTIME (Total)': ut_total}, {'BASIC' : basic}, {'HOLIDAY (Total)' : holidayPay}, {'OVERTIME (Total)' : ot_total}, {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': deductions[`deduc${_class}`].sss}, {'PhilHealth' : deductions[`deduc${_class}`].phil} ,{'Pag-IBIG' : deductions[`deduc${_class}`].pbig}, {'ADJUSTMENT' : adjustment}, {'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount},{ 'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                                                                            } else {
                                                                                                                                                details[`det${_class}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${_class}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent}, {'BASIC' : basic}, {'HOLIDAY (Total)' : holidayPay},  {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': deductions[`deduc${_class}`].sss}, {'PhilHealth' : deductions[`deduc${_class}`].phil} ,{'Pag-IBIG' : deductions[`deduc${_class}`].pbig}, {'ADJUSTMENT' : adjustment}, {'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount},{ 'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                                                                            }
                                                                                                                                            
                                                                                                                                        } else {
                                                                                                                                            if (ot_pay == 'eligible') {
                                                                                                                                                details[`det${_class}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${_class}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent}, {'UNDERTIME (Total)': ut_total}, {'BASIC' : basic}, {'HOLIDAY (Total)' : holidayPay}, {'OVERTIME (Total)' : ot_total}, {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': 0}, {'PhilHealth' : 0}, {'Pag-IBIG' : 0}, {'ADJUSTMENT' : adjustment}, {'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount}, {'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                                                                            } else {
                                                                                                                                                details[`det${_class}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${_class}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent}, {'BASIC' : basic}, {'HOLIDAY (Total)' : holidayPay},  {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': 0}, {'PhilHealth' : 0}, {'Pag-IBIG' : 0}, {'ADJUSTMENT' : adjustment}, {'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount}, {'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                                                                            }
                                                                                                                                        }

                                                                                                                                        console.log(details);
                                                                                                                                        

                                                                                                                                        $(`#gross-pay${_class}`).html(earned.toLocaleString());
                                                                                                                                        $(`#net-pay${_class}`).html(net.toLocaleString());

                                                                                                                                    }
                                                                                                                                }
                                                                                                                            })

                                                                                                                        } catch (err) {
                                                                                                                            console.log(err);
                                                                                                                        }
                                                                                                                    }
                                                                                                                })
                                                                                                            }

                                                                                                        } else {
                                                                                                            
                                                                                                            earned = salaryRate - absent;

                                                                                                            if (ot_pay == 'eligible') {
                                                                                                                if (PAYDeductions.includes('undertime')) {
                                                                                                                    earned = earned - ut_total;
                                                                                                                }
                                                                                                            }

                                                                                                            earned = earned + holidayPay;

                                                                                                            if (ot_pay == 'eligible') {
                                                                                                                earned = earned + ot_total;
                                                                                                            }

                                                                                                            // console.log("EARNED: " + earned.toLocaleString());
                                        
                                                                                                            net = earned;
                                        
                                                                                                            if (deductions.hasOwnProperty(`deduc${_class}`)) {
                                                                                                                total_deductions = total_deductions + parseFloat(deductions[`deduc${_class}`].sss);
                                                                                                                total_deductions = total_deductions + parseFloat(deductions[`deduc${_class}`].phil);
                                                                                                                total_deductions = total_deductions + parseFloat(deductions[`deduc${_class}`].pbig);
                                                                                                            }
                                                                                                            
                                                                                                            total_deductions = total_deductions + parseInt(adjustment);
                                                                                                            total_deductions = total_deductions + parseInt(CA);
                                                                                                            total_deductions = total_deductions + parseInt(charges);
                                                                                                            total_deductions = total_deductions + parseInt(sss_loan);
                                                                                                            total_deductions = total_deductions + parseInt(pbig_loan);
                                                                                                            total_deductions = total_deductions + parseInt(company_loan);
                                        
                                                                                                            net = net - total_deductions;
                                                                                                            // console.log("TOTAL DEDUCTIONS: " + total_deductions);

                                                                                                            if (sched != 'None') {
                                                                                                            
                                                                                                                let amount = 0;
                                                                                                                let penalty = 0;
                                                                                                                
                                                                                                                
                                                                                                                if (sched[0].pay_sched == 'twice-monthly') {
                                                                                                                    let firstHalfSched = sched[0].day1;
                                                                                                                    let secondHalfSched = sched[0].day2;

                                                                                                                    for (let i = 0; i < allowanceResponseBody.length; i++) {

                                                                                                                        if (allowanceResponseBody[i].detail == 'twice monthly') { //twice monthly allowance
                                                                                                                            amount += parseInt(allowanceResponseBody[i].amount);
                                                                                                                        }

                                                                                                                        if (secondHalf) {
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
                                                                                                                                            let numOfAbsent = parseInt($(`#cal${_class}`).val()) - days_worked;
                                    
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
                                                                                                                                            let numOfAbsent = parseInt($(`#cal${_class}`).val()) - days_worked;
                                    
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

                                                                                                                    

                                                                                                                } else if (sched[0].pay_sched == 'monthly') {
                                                                                                                    for (let i = 0; i < allowanceResponseBody.length; i++) {
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
                                                                                                                                            let numOfAbsent = parseInt($(`#cal${_class}`).val()) - days_worked;
                                    
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
                                                                                                                                            let numOfAbsent = parseInt($(`#cal${_class}`).val()) - days_worked;
                                    
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

                                                                                                                net = net + amount;
                                                                                                                
                                                                                                                // console.log("NET PAY: " + net.toLocaleString());
                                                                                                                if (deductions.hasOwnProperty(`deduc${_class}`)) {
                                                                                                                    if (ot_pay == 'eligible') {
                                                                                                                        details[`det${_class}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${_class}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent}, {'UNDERTIME (Total)': ut_total}, {'BASIC' : basic}, {'HOLIDAY (Total)' : holidayPay}, {'OVERTIME (Total)' : ot_total}, {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': deductions[`deduc${_class}`].sss}, {'PhilHealth' : deductions[`deduc${_class}`].phil} ,{'Pag-IBIG' : deductions[`deduc${_class}`].pbig}, {'ADJUSTMENT' : adjustment}, {'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount},{ 'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                                                    } else {
                                                                                                                        details[`det${_class}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${_class}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent}, , {'BASIC' : basic}, {'HOLIDAY (Total)' : holidayPay}, {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': deductions[`deduc${_class}`].sss}, {'PhilHealth' : deductions[`deduc${_class}`].phil} ,{'Pag-IBIG' : deductions[`deduc${_class}`].pbig}, {'ADJUSTMENT' : adjustment}, {'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount},{ 'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                                                    }
                                                                                                                    
                                                                                                                } else {
                                                                                                                    if (ot_pay == 'eligible') {
                                                                                                                        details[`det${_class}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${_class}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent}, {'UNDERTIME (Total)': ut_total}, {'BASIC' : basic}, {'HOLIDAY (Total)' : holidayPay}, {'OVERTIME (Total)' : ot_total}, {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': 0}, {'PhilHealth' : 0}, {'Pag-IBIG' : 0}, {'ADJUSTMENT' : adjustment}, {'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount}, {'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                                                    } else {
                                                                                                                        details[`det${_class}`] = [{'RATE': rate}, {'RATE TYPE' : rateType}, {'WORKING DAYS': $(`#cal${_class}`).val()}, {'SALARY RATE': salaryRate}, {'DAYS WORKED' : days_worked}, {'ABSENT (Total)': absent},  {'BASIC' : basic}, {'HOLIDAY (Total)' : holidayPay}, {'EARNED' : {'value' : earned, 'highlight' : ''}}, {'SSS': 0}, {'PhilHealth' : 0}, {'Pag-IBIG' : 0}, {'ADJUSTMENT' : adjustment}, {'CASH ADVANCE' : CA}, {'CHARGES' : charges}, {'SSS LOAN' : sss_loan}, {'Pag-IBIG LOAN' : pbig_loan}, {'COMPANY LOAN' : company_loan}, {'TOTAL DEDUCTIONS' : {'value' : total_deductions, 'highlight' : ''}}, {'ALLOWANCE' : amount}, {'ALLOWANCE PENALTY' : penalty}, {'NET PAY' : {'value': net, 'highlight': ''}}];
                                                                                                                    }
                                                                                                                    
                                                                                                                }

                                                                                                                console.log(details);
                                                                                                                

                                                                                                                $(`#gross-pay${_class}`).html(earned.toLocaleString());
                                                                                                                $(`#net-pay${_class}`).html(net.toLocaleString());
                                                                                                        }
                                                                                                    }

                                                                                            }
                                                                                            
                                                                                        )
                                                                                        
                                                                                    } catch (err) {
                                                                                        console.log(err);
                                                                                    }
                                                                                }
                                                                            })
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
                                    })
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

//
$(".payroll").on("click", function(event){
    event.stopImmediatePropagation();

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
                        <td id="net-pay${res[i].serialnumber}">0</td>
                        <td id="paid${res[i].serialnumber}">Not paid</td>
                        <td><button class="action-button mr-1 compute-salary" data-id="${res[i].serialnumber}">COMPUTE SALARY</button>
                        <button class="action-button mr-1 payslip${res[i].serialnumber} view-details" data-id="${res[i].serialnumber}" data-name="${res[i].name}" data-position="${res[i].position}" style="background:orange;display:none;">VIEW DETAILS</button>
                        <button class="action-button add-deductions" data-id="${res[i].serialnumber}">ADD DEDUCTIONS</button></td>
                    </tr>`;
                }
                
            } catch(err) {
                console.log(err);
            }

            document.body.insertAdjacentHTML("afterbegin", `
            <div class="pop-up-window">
                <div class="window-content pt-5">
                    <p class="text-center text-white" style="font-size:20px;">PAYROLL</p>
                    <div class="payroll-header-buttons" style="display:flex;justify-content:space-between;align-items:end;"><div style="color:#fff;display:flex;"><button class="action-button add-holiday mr-2">ADD HOLIDAY</button><button class="action-button remove-holiday mr-2">REMOVE HOLIDAY</button><button class="action-button contribution-tables">CONTRIBUTION TABLES</button></div><div style="color:#fff;display:flex;flex-direction:column;">No. of Employees: <span class="text-center">${staffs_len}</span></div></div>
                    <hr>
                    <div class="table-container" style="max-height:60vh;overflow:auto;max-width:70vw;min-width:50vw;">
                        <table>
                            <thead>
                                <tr>
                                    <td>NAME OF EMPLOYEE</td>
                                    <td>WORKING DAYS</td>
                                    <td>EARNED</td>
                                    <td>NET PAY</td>
                                    <td>STATUS</td>
                                    <td class="text-center">ACTION</td>
                                </tr>
                            </thead>
                            <tbody id="tbody">
                                ${content}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`);

            //CONTRIBUTION TABLES
            $(".contribution-tables").on("click", function(event){
                event.stopImmediatePropagation();
                document.body.insertAdjacentHTML("afterbegin", `
                <div class="third-layer-overlay">
                    <div class="tlo-wrapper pt-5">
                        <p class="text-white text-center" style="font-size:20px;">CONTRIBUTION TABLES</p>
                        <br>
                        <hr>
                        <div class="contribution-tables-wrapper">
                            <div>
                                <p>SSS</p>
                                <div class="sss">
                                    <img src="../src/images/sss_thumbnail.PNG" style="width:100%;height:100%;object-fit:contain;"/>
                                </div>
                            </div>
                            <div>
                                <p>PhilHealth</p>
                                <div class="phil">
                                    <img src="../src/images/phil_thumbnail.PNG" style="width:100%;height:100%;object-fit:contain;"/>
                                </div>
                            </div>
                            <div>
                                <p>Pag-IBIG</p>
                                <div class="pbig">
                                    <img src="../src/images/pbig_thumbnail.PNG" style="width:100%;height:100%;object-fit:contain;"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `);

                $(".sss").on("click", function(event){
                    event.stopImmediatePropagation();
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="fourth-layer-overlay">
                        <div class="folo-wrapper pt-5">
                            <p class="text-white text-center" style="font-size:20px;">SSS CONTRIBUTION TABLE</p>
                            <br>
                            <hr>
                            <div style="min-width:70vw;max-height:80vh;min-height:70vh;overflow:auto;background:rgba(0,0,0,0.3);">
                                <p id="iframe-notice" style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);color:#fff;font-size:20px;">Please wait a moment..</p>
                                <iframe src="../src/images/sss.pdf" style="width:100%;height:70vh;border:none;" title="SSS Contribution table"></iframe>
                            </div>
                        </div>
                    </div>`);

                    $("iframe").on("load", function(event){
                        $("#iframe-notice").remove();
                    })

                    $(".fourth-layer-overlay").click(function(event){
                        $(this).remove();
                    })

                    $(".folo-wrapper").on("click", function(event){
                        event.stopImmediatePropagation();
                    })
                })

                $(".phil").on("click", function(event){
                    event.stopImmediatePropagation();
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="fourth-layer-overlay">
                        <div class="folo-wrapper pt-5">
                            <p class="text-white text-center" style="font-size:20px;">PHILHEALTH CONTRIBUTION TABLE</p>
                            <br>
                            <hr>
                            <div style="min-width:70vw;max-height:80vh;min-height:70vh;overflow:auto;background:rgba(0,0,0,0.3);">
                                <p id="iframe-notice" style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);color:#fff;font-size:20px;">Please wait a moment..</p>
                                <iframe src="../src/images/phil.pdf" style="width:100%;height:70vh;border:none;" title="SSS Contribution table"></iframe>
                            </div>
                        </div>
                    </div>`);

                    $("iframe").on("load", function(event){
                        $("#iframe-notice").remove();
                    })

                    $(".fourth-layer-overlay").click(function(event){
                        $(this).remove();
                    })

                    $(".folo-wrapper").on("click", function(event){
                        event.stopImmediatePropagation();
                    })
                })

                $(".pbig").on("click", function(event){
                    event.stopImmediatePropagation();
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="fourth-layer-overlay">
                        <div class="folo-wrapper pt-5">
                            <p class="text-white text-center" style="font-size:20px;">PAG-IBIG CONTRIBUTION TABLE</p>
                            <br>
                            <span style="margin-bottom:-10px;">Source: <span style="text-decoration:underline;color:blue;">https://pagibiginquiries.online/pag-ibig-contribution-table/</span></span>
                            <hr>
                            <div style="min-width:70vw;max-height:80vh;min-height:70vh;overflow:auto;background:var(--teal);">
                                <p id="iframe-notice" style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);color:#fff;font-size:20px;">Please wait a moment..</p>
                                <iframe src="https://pagibiginquiries.online/pag-ibig-contribution-table/" style="width:100%;height:70vh;border:none;" title="SSS Contribution table"></iframe>
                            </div>
                        </div>
                    </div>`);

                    $("iframe").on("load", function(event){
                        $("#iframe-notice").remove();
                    })

                    $(".fourth-layer-overlay").click(function(event){
                        $(this).remove();
                    })

                    $(".folo-wrapper").on("click", function(event){
                        event.stopImmediatePropagation();
                    })
                })

                $(".tlo-wrapper").click(function(event){
                    event.stopImmediatePropagation();
                })
                $(".third-layer-overlay").click(function(event){
                    $(this).remove();
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
                                <span>SSS:</span>
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

                let ops = "";

                $.ajax({
                    type: 'POST',
                    url: '../php/fetchHolidaysDate.php',
                    success: function(res){
                        try {
                            res = JSON.parse(res);
                            console.log(res);

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
                                        console.log(res);
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
                                <option value="${res[i].id}">${res[i].holiday_name}</option>
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
                                    url: '../php/add_holidaypay.php',
                                    data: {
                                        holiday: formDataObject.holiday,
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
                let name = $(this).data("name");
                let position = $(this).data("position");

                let content = "";

                console.log(deductions[`deduc${id}`])

                
                for (let i = 0; i < details[`det${id}`].length; i++) {
                    for (let key in details[`det${id}`][i]) {
                        if (details[`det${id}`][i].hasOwnProperty(key)) {
                            let value = details[`det${id}`][i][key];
                            if (details[`det${id}`][i][key].hasOwnProperty('value')) {
                                try {
                                   
                                    value = parseFloat(details[`det${id}`][i][key].value);
                                   
                                    
                                    value = value.toLocaleString();
                                } catch (err) {
                                    value = details[`det${id}`][i][key].value;
                                }
                            }
                            if (details[`det${id}`][i][key].hasOwnProperty('highlight')) {
                                content += `
                                <tr style="background:rgba(255,255,255,0.2);color: #000;border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>${key}</td>
                                    <td>${value}</td>
                                </tr>`;
                            } else {
                                content += `
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>${key}</td>
                                    <td>${value}</td>
                                </tr>`;
                            }
                        }
                    }

                }
                
                document.body.insertAdjacentHTML("afterbegin", `
                <div class="third-layer-overlay">
                    <div class="tlo-wrapper pt-5">
                        <p class="text-white text-center" style="font-size:20px;">${name}</p>
                        <p class="text-white text-center"  style="font-size:13px;margin-top:-20px;">${position}</p>
                        <hr>
                        <div class="table-container" style="max-height:40vh;overflow:auto;max-width:60vw;min-width:30vw;">
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
                            <input type="button" data-name="${name}" data-id="${id}" style="width:80%;background:var(--teal);color:#fff !important;" class="paid" value="PAID"/>
                        </div>
                    </div>
                </div>`);

                $(".paid").click(function(event){
                    event.stopImmediatePropagation();
                    let name = $(this).data("name");
                    let id = $(this).data("id");

                    $.ajax({
                        type: 'POST',
                        url: '../php/employee_paid.php',
                        data: {
                            id: id,
                        },
                        success: function(res) {
                            
                            if (res.includes("paid")) {
                                successNotification(`${name} is paid.`, "success");
                                $(`#paid${id}`).html("Paid");
                                $(".third-layer-overlay").remove();
                            }
                        }
                    })

                    
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
                $(this).remove();
            })

            $(".window-content").on("click", function(event){
                event.stopImmediatePropagation();
            })
        }
    })


    
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
                        
                        <form id="registerStaffForm">
                            <input type="text" placeholder="Name" name="name" autocomplete="off">
                            <input type="number" placeholder="Age" name="age" autocomplete="off">
                            <input type="text" placeholder="Phone number" name="phone" autocomplete="off">
                            <input type="text" placeholder="Position" name="position" autocomplete="off">
                            <input type="text" placeholder="Department" name="department" autocomplete="off">
                            
                            <span>SELECT CLASS:</span>
                            <select name="class">
                                ${ops}
                            </select>

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
                        <button class="action-button open" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-name="${data[i].name}" data-dept="${data[i].department}" data-pos="${data[i].position}">OPEN</button>
                        <button class="action-button add-deductions" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-name="${data[i].name}" data-dept="${data[i].department}" data-pos="${data[i].position}">ADD DEDUCTIONS</button>
                    </td>
                </tr>`;
            }

            // <button class="action-button add-deductions" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-name="${data[i].name}" data-age="${data[i].age}" data-pos="${data[i].position}">DEDUCTIONS</button>
            // <button class="action-button view-records" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}">RECORDS</button>
            // <button class="action-button view-records" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}">REQUESTED LEAVE</button>
           
            document.getElementById("tbody").insertAdjacentHTML("afterbegin", `${content}`);
            $("#num-of-staffs").html(data.length);


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
            

            // $(".view-records").on("click", function(event){
            //     event.stopImmediatePropagation();

            //     let content = "";

            //     $.ajax({
            //         type: 'POST',
            //         url: '../php/fetch_records.php',
            //         data: {
            //             serialnumber: `${$(this).data("snumber")}`,
            //         },
            //         success: function(res){

            //             try {
            //                 res = JSON.parse(res);

            //                 for (let i = 0; i < res.length; i++) {
            //                     content += `                                                    
            //                     <tr>
            //                         <td>${res[i].name}</td>
            //                         <td>${parseFloat(res[i].hours_worked).toFixed(2)} hrs</td>
            //                         <td>${res[i].start_time}</td>
            //                         <td>${res[i].end_time}</td>
            //                         <td>${res[i].ot_total}</td>
            //                         <td>${res[i].ut_total}</td>
            //                         <td>${res[i].date}</td>
            //                     </tr>`;
            //                 }

            //                 document.body.insertAdjacentHTML("afterbegin", `
            //                 <div class="third-layer-overlay">
            //                     <div class="tlo-wrapper pt-5">
            //                         <p class="text-white text-center" style="font-size:20px;">RECORDS</p>
            //                         <hr>
            //                         <div class="table-container" style="max-height:60vh;overflow:auto;max-width:50vw;min-width:25vw;">
            //                             <table>
            //                                 <thead>
            //                                     <tr>
            //                                         <td>NAME</td>
            //                                         <td>HOURS WORKED</td>
            //                                         <td>START TIME</td>
            //                                         <td>END TIME</td>
            //                                         <td>OT (TOTAL)</td>
            //                                         <td>UT (TOTAL)</td>
            //                                         <td>DATE</td>
            //                                     </tr>
            //                                 </thead>
            //                                 <tbody id="tbody">
            //                                     ${content}
            //                                 </tbody>
            //                             </table>
            //                         </div>
            //                     </div>
            //                 </div>`);

            //                 $(".third-layer-overlay").on("click", function(event){
            //                     $(this).remove();
            //                 })

            //                 $(".tlo-wrapper").on("click", function(event){
            //                     event.stopImmediatePropagation();
            //                 })

            //             } catch(err){
            //                 errorNotification("No records.", "warning");
            //             }
                        
            //         }
            //     })
                
            // })

        }
    })
})

$(".settings").on("click", function(event){
    event.stopImmediatePropagation();
    $.ajax({
        type: 'POST',
        url: '../php/fetch_company_settings.php',
        success: function(res) {
            console.log("PAY SCHED");
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
                                    <input type="text" name="compname" value="${compname}" placeholder="Enter company name"/>
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
                            console.log(res);
                            if (res == 'success') {
                                successNotification("Payroll settings updated.", "success");
                                
                                $(".pop-up-window").remove();
                                try {
                                    $(".must").remove();
            
                                } catch(err){
                                    console.log("");
                                }
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
                                    console.log(res);
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
                                    console.log(res);
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
                                            <span class="tip" style="display:none;position:absolute;top:-250%;left:40%;padding:10px;z-index:1000;background:var(--teal);box-shadow:0 0 5px rgba(0,0,0,.5);border-radius:4px 4px 4px 0;color:#fff;">Monthly allowance will be added every 2nd half.</span>`;
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
                                                        console.log(res);
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

                                let str = res[i].type;
                                str = str.charAt(0).toUpperCase() + str.slice(1);

                                tbody += `
                                <tr id="row${res[i].id}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>${res[i].allowance_name}</td>
                                    <td>${str}</td>
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
                                    console.log(res);
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
                                                                console.log(res);
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
                                        classes += CLASSES[stringArray[x]] + ", ";
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
                                    console.log(res);
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
                                            for (let x = 0; x < formDataObject.class.length; x++) {
                                                employeeClass += formDataObject.class[x] + " ";
                                            }

                                            formDataObject.class = employeeClass;

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
                                                        console.log(res);
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
            id: id,
            serialnumber: snumber,
        },
        url: '../php/fetch_staff_settings.php',
        success: function(res){
            try {
                let data = JSON.parse(res);
                data = data[0];

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
        if (value === '') {
            isNotEmpty = false;
        }
    });

    formDataObject["serialnumber"] = SERIAL_NUMBER;
    
    if (isNotEmpty) {
        $.ajax({
            type: 'POST',
            url: '../php/add_staff.php',
            data : {
                name: formDataObject.name,
                age: formDataObject.age,
                position: formDataObject.position,
                department: formDataObject.department,
                serialnumber: formDataObject.serialnumber,
                class: formDataObject.class,
                phone: formDataObject.phone,

            },
            success: function(res){
                console.log(res);
                if (res == 'success') {
                    websocket.send(128);

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

