// Define months array
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var gateway = `ws://192.168.10.147/management`;
var websocket;
var SERIAL_NUMBER;
var timeout;

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
})


var salary_details;


function computeSalary(id, responseBody) {
    $.ajax({
        type: 'POST',
        url: '../php/fetch_company_settings.php',
        success: function(res){
            try{
                res = JSON.parse(res);
                let settings = res;
                let staff_data;

                let ot_total = 0;
                let ut_total = 0;
                

                $.ajax({
                    type: 'POST',
                    url: '../php/fetch_ut_and_ot.php',
                    data: {
                        serialnumber: id,
                    },
                    success: function(res){
                        try {
                            res = JSON.parse(res);
                            for (let i = 0; i < res.length; i++) {
                                ot_total += parseFloat(res[i].ot_total);
                                ut_total += parseFloat(res[i].ut_total);
                            }

                        } catch(err){
                            console.log(err);
                        }

                        $.ajax({
                            type: 'POST',
                            url: '../php/fetch_holidays.php',
                            success: function(res){

                                let holidays_total = 0;

                                if (responseBody != null) {
                                    var foundItem = responseBody.find(item => item.serialnumber === `${id}`);
                                    
                                    staff_data = foundItem;
                                    
                                    let calendarWorkingDays = parseInt($(`#cal${id}`).val());
                                    let rate = parseInt(staff_data.rate);


                                    try {
                                        res = JSON.parse(res);
    
                                        for (let i = 0; i < res.length; i++) {
                                            let percentage = parseFloat(res[i].percentage) / 100;
                                            holidays_total += (rate * percentage);
                                        }
    
                                        console.log("HOLIDAYS TOTALLL: " + holidays_total);
                                        
                                        
                                    } catch(err) {
                                        console.log(err);
                                    }



                                    let total_hours = parseFloat(staff_data.total_hours);

                                    let salary_rate = calendarWorkingDays * rate;
                                    let days_worked = total_hours /  8;
                                    
                                    let basic = days_worked * rate;
                                    basic = basic.toFixed(2);
                                    let absent = salary_rate - basic;

                                    let grossPay = 0;
                                    grossPay = salary_rate - absent;
                                    grossPay = grossPay - ut_total;
                                    basic = grossPay;
                                    grossPay = grossPay + holidays_total;
                                    grossPay = grossPay + ot_total;
                            
                                    $(`#gross-pay${id}`).html(grossPay.toLocaleString());

                                    let allowance = settings[0].allowance;
                                    let sss_deduction = settings[0].sss_deduction;
                                    let ph = settings[0].philhealth_deduction;
                                    let pbig = settings[0].pag_ibig_deduction;
                                    let adjustment = staff_data.adjustment;
                                    let CA = staff_data.cash_advance;
                                    let charges = staff_data.charges;
                                    let sss_loan = staff_data.sss_loan;
                                    let pbig_loan = staff_data.pag_ibig_loan;
                                    let company_loan = staff_data.company_loan;

                                    let netPay = 0;
                                    let allowance_deduction;

                                    if ($(`#allowance-deduc`).val() === '') {
                                        allowance_deduction = 0;
                                    } else {
                                        let percentDeduc = parseFloat($(`#allowance-deduc`).val());
                                        let absent_days = calendarWorkingDays - days_worked;
                                        let deduc = absent_days * percentDeduc;
                                        percentDeduc = deduc / 100;
                                        
                                        allowance_deduction = allowance * percentDeduc;
                                    }

                                    allowance = allowance - allowance_deduction;

                                    netPay = grossPay;
                                    netPay = netPay - sss_deduction;
                                    netPay = netPay - ph;
                                    netPay = netPay - pbig;
                                    netPay = netPay - adjustment;
                                    netPay = netPay - CA;
                                    netPay = netPay - charges;
                                    netPay = netPay - sss_loan;
                                    netPay = netPay - pbig_loan;
                                    netPay = netPay - company_loan;
                                    netPay = netPay + allowance;
                                    
                                    $(`#net-pay${id}`).html(netPay.toLocaleString());

                                    salary_details = {
                                        allowance_deduction: allowance_deduction,
                                        netPay: netPay,
                                        grossPay: grossPay,
                                        salary_rate: salary_rate,
                                        rate: rate,
                                        calendarWorkingDays: calendarWorkingDays,
                                        days_worked: days_worked,
                                        total_hours: total_hours,
                                        absent: absent,
                                        holidays_total: holidays_total,
                                        ot_total: ot_total,
                                        ut_total: ut_total,
                                        sss_deduction: sss_deduction,
                                        philhealth_deduction: ph,
                                        pag_ibig_deduction: pbig,
                                        adjustment: adjustment,
                                        cash_advance: CA,
                                        charges: charges,
                                        sss_loan: sss_loan,
                                        pbig_loan: pbig_loan,
                                        company_loan: company_loan,
                                        allowance: allowance
                                    };
                                }
                                
                            }
                        })
                    }
                })
                
                
                
            } catch(err){
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
                console.log(res);
                responseBody = res;
                staffs_len = res.length;
                
                for (let i = 0; i < res.length; i++) {
                    content += `
                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                        <td>${res[i].name}</td>
                        <td>${res[i].position}</td>
                        <td>${res[i].department}</td>
                        <td>${res[i].rate}</td>
                        <td>${res[i].total_hours}</td>
                        <td><input type="number" id="cal${res[i].serialnumber}" style="margin-bottom:-1px;" placeholder="Enter calendar working days"/></td>
                        <td id="gross-pay${res[i].serialnumber}">0</td>
                        <td id="net-pay${res[i].serialnumber}">0</td>
                        <td><button class="action-button mr-1 compute-salary" data-id="${res[i].serialnumber}">COMPUTE SALARY</button>
                        <button class="action-button mr-1 payslip${res[i].serialnumber} generate-payslip" data-id="${res[i].serialnumber}" style="background:orange;display:none;">GENERATE PAYSLIP</button>
                        <button class="action-button view-details" data-id="${res[i].serialnumber}" data-name="${res[i].name}" data-age="${res[i].age}" data-position="${res[i].position}">VIEW DETAILS</button></td>
                    </tr>`;
                }
                
            } catch(err) {
                console.log(err);
            }

            document.body.insertAdjacentHTML("afterbegin", `
            <div class="pop-up-window">
                <div class="window-content pt-5">
                    <p class="text-center text-white" style="font-size:20px;">PAYROLL</p>
                    <div class="payroll-header-buttons" style="display:flex;justify-content:space-between;"><div style="color:#fff;display:flex;flex-direction:column;">Allowance deduc. (per day): <input type="number" id="allowance-deduc" style="margin-bottom:-1px;" placeholder="Enter percentage"/></div><div style="color:#fff;display:flex;flex-direction:column;">No. of Employees: <span class="text-center">${staffs_len}</span></div></div>
                    <hr>
                    <div class="table-container" style="max-height:60vh;overflow:auto;max-width:70vw;">
                        <table>
                            <thead>
                                <tr>
                                    <td>NAME OF EMPLOYEE</td>
                                    <td>POSITION</td>
                                    <td>DEPARTMENT</td>
                                    <td>DAILY RATE</td>
                                    <td>TOTAL HOURS</td>
                                    <td>CALENDAR WORKING DAYS</td>
                                    <td>GROSS PAY</td>
                                    <td>NET PAY</td>
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

            $(".compute-salary").on("click", function(event){
                event.stopImmediatePropagation();
                let id = $(this).data("id");

                
                if ($(`#cal${id}`).val() === '') {
                    errorNotification("Please enter calendar working days.", "warning");
                }

                else {
                    computeSalary(id, responseBody);
                    $(this).remove();
                    $(`.payslip${id}`).css("display", "inline");
                }
            })

            $(".generate-payslip").on("click", function(event){
                event.stopImmediatePropagation();
                alert('test');
            })

            $(".view-details").on("click", function(event){
                event.stopImmediatePropagation();
                let id = $(this).data("id");
                let name = $(this).data("name");
                let position = $(this).data("position");
                let age = $(this).data("age");

                if ($(`#cal${id}`).val() === '') {
                    errorNotification("Please enter calendar working days.", "warning");
                } else {
                    computeSalary(id, responseBody);
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="third-layer-overlay">
                        <div class="tlo-wrapper pt-5">
                            <p class="text-white text-center" style="font-size:20px;">${name}</p>
                            <p class="text-white text-center"  style="font-size:13px;margin-top:-20px;">${age} | ${position}</p>
                            <div class="payroll-header-buttons" style="display:flex;justify-content:space-between;"><button class="action-button m-1 view-holidays">VIEW HOLIDAYS</button></div>
                            <hr>
                            <div class="table-container" style="max-height:40vh;overflow:auto;max-width:60vw;min-width:30vw;">
                                <table>
                                    <thead>
                                        <tr>
                                            <td>NAME</td>
                                            <td>VALUE</td>
                                        </tr>
                                    </thead>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>DAILY RATE</td>
                                        <td>${parseFloat(salary_details.rate).toLocaleString()}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>SALARY RATE</td>
                                        <td>${parseFloat(salary_details.salary_rate).toLocaleString()}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>CALENDAR WORKING DAYS</td>
                                        <td>${salary_details.calendarWorkingDays}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>TOTAL HOURS</td>
                                        <td>${salary_details.total_hours}</td>
                                    </tr>
                                    
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>DAYS WORKED</td>
                                        <td>${parseFloat(salary_details.days_worked).toFixed(2)}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>ABSENT (TOTAL)</td>
                                        <td>- ${salary_details.absent}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>UT (TOTAL)</td>
                                        <td>- ${salary_details.ut_total}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>HOLIDAYS (TOTAL)</td>
                                        <td>+ ${salary_details.holidays_total}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>OT (TOTAL)</td>
                                        <td>+ ${salary_details.ot_total}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);background:#fff;">
                                        <td style="color:var(--dark-teal) !important;">GROSS PAY</td>
                                        <td style="color:var(--dark-teal) !important;">${parseFloat(salary_details.grossPay).toLocaleString()}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>SSS DEDUC.</td>
                                        <td>- ${salary_details.sss_deduction}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>PhilHealth DEDUC.</td>
                                        <td>- ${salary_details.philhealth_deduction}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>Pag-IBIG DEDUC.</td>
                                        <td>- ${salary_details.pag_ibig_deduction}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>ADJUSTMENT</td>
                                        <td>- ${salary_details.adjustment}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>CASH ADVANCE</td>
                                        <td>- ${salary_details.cash_advance}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>CHARGES</td>
                                        <td>- ${salary_details.charges}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>SSS LOAN</td>
                                        <td>- ${salary_details.sss_loan}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>Pag-IBIG LOAN</td>
                                        <td>- ${salary_details.pbig_loan}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>COMPANY LOAN</td>
                                        <td>- ${salary_details.company_loan}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>ALLOWANCE</td>
                                        <td>+ ${salary_details.allowance}</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);background:#fff;">
                                        <td style="color:var(--dark-teal) !important;">NET PAY</td>
                                        <td style="color:var(--dark-teal) !important;">${parseFloat(salary_details.netPay).toLocaleString()}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>`);

                    $(".view-holidays").on("click", function(event){
                        event.stopImmediatePropagation();
                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="fourth-layer-overlay">
                            <div class="folo-wrapper pt-5" style="min-width:20vw;">
                                <p class="text-white text-center" style="font-size:20px;">HOLIDAYS</p>
                                <hr>
                                <div class="table-container" style="max-height:60vh;overflow:auto;max-width:30vw;min-width:25vw;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>DATE</td>
                                                <td>PERCENTAGE<td>
                                            </tr>
                                        </thead>
                                        <tbody id="tbody">
                                            
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>`);

                        let container = document.getElementById("tbody");


                        $.ajax({
                            type: 'GET',
                            url: '../php/fetch_holidays.php',
                            success: function(res){
                                try{
                                    let data = JSON.parse(res);
                                    let content = "";

                                    while (container.firstChild) {
                                        container.removeChild(container.firstChild);
                                    }

                                    for (let i = 0; i < data.length; i++) {
                                        let date = new Date(data[i].holiday_date);
                                        let day = date.getDate();
                                        let month = date.getMonth(); // Note: Months are zero-based in JavaScript
                                        let year = date.getFullYear();

                                        // Formatted date string
                                        let formattedDate = `${months[month]} ${day}, ${year}`;
                                        content += `
                                        <tr class="holi-row-${data[i].id}">
                                            <td>${formattedDate}</td>
                                            <td>${data[i].percentage}%</td>
                                            <td>
                                            </td>
                                        </tr>`;
                                    }

                                    container.insertAdjacentHTML("afterbegin", `${content}`);

                                } catch(err){
                                    container.insertAdjacentHTML("afterbegin", `
                                    <tr>
                                        <td colspan="4" class="text-center p-5 text-white">No holiday</td>
                                    </tr>`);
                                }
                            }
                        });

                        $(".fourth-layer-overlay").on("click", function(event){
                            event.stopImmediatePropagation();
                            $(this).remove();
                        })
    
                        $(".folo-wrapper").on("click", function(event){
                            event.stopImmediatePropagation();
                        })
                    })

                    $(".third-layer-overlay").on("click", function(event){
                        event.stopImmediatePropagation();
                        $(this).remove();
                    })

                    $(".tlo-wrapper").on("click", function(event){
                        event.stopImmediatePropagation();
                    })

                }

                
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
    document.body.insertAdjacentHTML("afterbegin", `
    <div class="pop-up-window">
        <div class="window-content pt-5">
            <p class="text-center text-white" style="font-size:20px;">Register Employee</p>

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
                <input type="number" placeholder="Daily Rate" name="rate" autocomplete="off">

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
                    <div class="table-container" style="max-height:60vh;overflow:auto;max-width:70vw;">
                        <table>
                            <thead>
                                <tr>
                                    <td>NAME</td>
                                    <td>STATUS</td>
                                    <td>TOTAL HOURS</td>
                                    <td>DAYS PRESENT</td>
                                    <td>DAILY RATE</td>
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
                    <td>${data[i].status}</td>
                    <td>${totalHours} hrs</td>
                    <td>${data[i].days_worked} day(s)</td>
                    <td>${data[i].rate}</td>
                    <td>${data[i].adjustment}</td>
                    <td>${data[i].charges}</td>
                    <td>${data[i].cash_advance}</td>
                    <td>${data[i].sss_loan}</td>
                    <td>${data[i].pag_ibig_loan}</td>
                    <td>${data[i].company_loan}</td>
                    <td style="display:grid;grid-template-columns: auto auto auto;column-gap:5px;">
                        <button class="action-button add-deductions" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-name="${data[i].name}" data-age="${data[i].age}" data-pos="${data[i].position}">DEDUCTIONS</button>
                        <button class="action-button view-records" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}">RECORDS</button>
                    </td>
                </tr>`;
            }

           
            document.getElementById("tbody").insertAdjacentHTML("afterbegin", `${content}`);
            $("#num-of-staffs").html(data.length);

            $(".add-deductions").on("click", function(event){
                event.stopImmediatePropagation();
                let snumber = $(this).data("snumber");
                let id = $(this).data("id");
                let name = $(this).data("name");
                let pos = $(this).data("pos");
                let age = $(this).data("age");
                
                OPEN(snumber, id, name, age, pos);
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
    document.body.insertAdjacentHTML("afterbegin", `
    <div class="pop-up-window">
        <div class="window-content pt-5">
            <div style="display: flex;align-items: center;margin-top:10px;margin-bottom:10px;">
                <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
                <div style="flex:1;display:grid;place-items:center;color:#fff;font-size:20px;">PAYROLL SETTINGS</div>
                <div style="flex:1;height:1px;background:rgba(0,0,0,0.1);"></div>
            </div>
            <form style="width:100%;" id="companySettingsForm">
                <div class="company-details-wrapper">
                    <div>
                        <p class="text-center text-white">DEDUCTIONS</p>
                        <div>
                            <span>SSS:</span>
                            <input type="number" placeholder="SSS deduction" name="sss"/>
                            <span>PhilHealth:</span>
                            <input type="number" placeholder="PhilHealth deduction" name="phil"/>
                            <span>Pag-IBIG:</span>
                            <input type="number" placeholder="Pag-IBIG deduction" name="pbig"/>
                            <br>
                        </div>
                    </div>
                    <div>
                        <p class="text-center text-white">COMPENSATIONS</p>
                        <div>
                            <span>Allowance:</span>
                            <input type="number" placeholder="Allowance" name="allowance"/>
                            <span>Holidays:</span>
                            <input type="button" id="add-holiday" value="ADD HOLIDAY"/>
                        </div>
                    </div>
                    <div class="deductions">
                        <input type="submit" value="UPDATE" style="width:100%;"/>
                    </div>
                </div>
            </form>
        </div>
    </div>`);

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

        $.ajax({
            type: 'POST',
            url: '../php/update_company_settings.php',
            data: {
                allowance: formDataObject.allowance,
                sss: formDataObject.sss,
                phil: formDataObject.phil,
                pbig: formDataObject.pbig

            }, success: function(res){
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
    })

    $("#add-holiday").on("click", function(event){
        event.stopImmediatePropagation();
        document.body.insertAdjacentHTML("afterbegin", `
        <div class="third-layer-overlay">
            <div class="tlo-wrapper pt-5">
                <p class="text-white text-center" style="font-size:20px;">HOLIDAYS</p>
                <button id="add" style="padding: 5px 15px;
                border-radius: 4px;
                background: var(--teal);
                color: #fff;
                border: none;
                font-size: 15px;">ADD</button>
                <hr>
                <div class="table-container" style="max-height:60vh;overflow:auto;max-width:30vw;min-width:25vw;">
                    <table>
                        <thead>
                            <tr>
                                <td>DATE</td>
                                <td>PERCENTAGE<td>
                                <td>ACTION</td>
                            </tr>
                        </thead>
                        <tbody id="tbody">
                            
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`);

        let container = document.getElementById("tbody");
        var deleted = false;

        $.ajax({
            type: 'GET',
            url: '../php/fetch_holidays.php',
            success: function(res){
                try{
                    let data = JSON.parse(res);
                    let content = "";

                    while (container.firstChild) {
                        container.removeChild(container.firstChild);
                    }

                    for (let i = 0; i < data.length; i++) {
                        let date = new Date(data[i].holiday_date);
                        let day = date.getDate();
                        let month = date.getMonth(); // Note: Months are zero-based in JavaScript
                        let year = date.getFullYear();

                        // Formatted date string
                        let formattedDate = `${months[month]} ${day}, ${year}`;
                        content += `
                        <tr class="holi-row-${data[i].id}">
                            <td>${formattedDate}</td>
                            <td>${data[i].percentage}%</td>
                            <td>
                                
                            </td>
                            <td>
                                <button data-id="${data[i].id}" id="delete" class="text-right" style="padding: 5px 15px;
                                border-radius: 4px;
                                background: var(--teal);
                                color: #fff;
                                border: none;
                                font-size: 15px;">DELETE</button>
                            </td>
                        </tr>`;
                    }

                    container.insertAdjacentHTML("afterbegin", `${content}`);
                    deleted = true;

                    $("#delete").on("click", function(event){
                        event.stopImmediatePropagation();
                        let id = $(this).data("id");

                        $.ajax({
                            type: 'POST',
                            url: '../php/delete_holiday.php',
                            data: {
                                id: id,
                            }, success: function(res){
                                console.log(res);
                                if (res == 'deleted') {
                                    $(`.holi-row-${id}`).remove();
                                }
                            }
                        })
                    })

                } catch(err){
                    container.insertAdjacentHTML("afterbegin", `
                    <tr>
                        <td colspan="4" class="text-center p-5">No holiday</td>
                    </tr>`);
                }
                
            }
        })

        $("#add").on("click", function(event){
            event.stopImmediatePropagation();
            document.body.insertAdjacentHTML("afterbegin", `
            <div class="fourth-layer-overlay">
                <div class="folo-wrapper pt-5" style="min-width:20vw;">
                    <p class="text-white text-center" style="font-size:20px;">ADD HOLIDAY</p>
                    <hr>
                    <form id="addHolidayForm">
                        <div style="display:flex;flex-direction:column;color:#fff;">
                            <span>SELECT DATE:</span>
                            <input type="date" name="date" required>
                            <span>PERCENTAGE:  <span id="percentage">0%</span></span>
                            <input type="number" name="percentage" placeholder="Percentage" required>
                            <input type="submit" value="ADD" style="width:100%;margin-top:10px;"/>
                        </div>
                    </form>
                </div>
            </div>`);

            $("input[type='submit']").on("click", function(event){
                
                event.preventDefault();
                event.stopImmediatePropagation();
                
                let data = new FormData(document.getElementById("addHolidayForm"));
                var formDataObject = {};
                let isNotEmpty = true;
                data.forEach(function(value, key){
                    formDataObject[key] = value;
                    if (value === '') {
                        isNotEmpty = false;
                    }
                });

                if (isNotEmpty)  {
                    $.ajax({
                        type: 'POST',
                        url: '../php/add_holiday.php',
                        data: {
                            date: formDataObject.date,
                            percentage: formDataObject.percentage
                        }, success: function(res){
                            console.log(res);
                            try{
                                res = JSON.parse(res);
                                if (res.message == 'success') {
                                    let date = new Date(formDataObject.date);
                                    let day = date.getDate();
                                    let month = date.getMonth(); // Note: Months are zero-based in JavaScript
                                    let year = date.getFullYear();
    
                                    // Formatted date string
                                    let formattedDate = `${months[month]} ${day}, ${year}`;
                                    
                                    if (!deleted) {
                                        while (container.firstChild) {
                                            container.removeChild(container.firstChild);
                                        }
                                        deleted = true;
                                    }
                                   
    
                                    container.insertAdjacentHTML("afterbegin", `
                                        <tr class="holi-row-${res.id}">
                                            <td>${formattedDate}</td>
                                            <td>${formDataObject.percentage}%</td>
                                            <td>
                                                
                                            </td>
                                            <td>
                                                <button data-id="${res.id}" class="text-right" style="padding: 5px 15px;
                                                border-radius: 4px;
                                                background: var(--teal);
                                                color: #fff;
                                                border: none;
                                                font-size: 15px;">DELETE</button>
                                            </td>
                                        </tr>
                                    `);
                                    $(".fourth-layer-overlay").remove();
                                }
                            } catch(err){
                                console.log(err);
                            }
                            
                        }
                    })
                } else {
                    errorNotification("Input fields must be filled out.", "warning");
                }

                
            })

            $("input[type='number']").on("keyup", function(event){
                event.stopImmediatePropagation();
                $("#percentage").html(" (" + $("input[type='number']").val() + "%)");
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
    })

    $(".window-content").on("click", function(event){
        event.stopImmediatePropagation();
    })

    $(".pop-up-window").on("click", function(event){
        $(this).remove();
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
                rate: formDataObject.rate,
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

