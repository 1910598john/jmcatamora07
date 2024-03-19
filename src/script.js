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

                            
                            
                            let className, in_sched, holiday_pay, hour_perday, ot_pay, rate, rateType;

                            className =  res.class_name;
                            holiday_pay = res.holi_pay;
                            ot_pay = res.ot_pay;
                            hour_perday = res.hour_perday;
                            rate = res.rate;
                            rateType = res.rate_type;
                            
                            let name, pos, department, adjustment, CA, charges, sss_loan, pbig_loan, company_loan, days_worked;

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
                                url: '../php/fetch_staffs_trail.php',
                                data: {
                                    serialnumber: responseBody.serialnumber,
                                },

                                success: function(res){
                                    try {
                                        res = JSON.parse(res);

                                        let ot_total = 0;
                                        let ut_total = 0;
                                        let ot_mins = 0;
                                        let ut_mins = 0;
                                        let late_mins = 0;
                                        
                                        for (let i = 0; i < res.length; i++) {
                                            ot_total += parseFloat(res[i].ot_total);
                                            ut_total += parseFloat(res[i].ut_total);
                                            ot_mins += parseFloat(res[i].ot_mins);
                                            ut_mins += parseFloat(res[i].ut_mins);

                                            late_mins += parseInt(res[i].late_mins);
                                        }

                                        let salaryRate = rate * parseInt($(`#cal${id}`).val());
                                        let basic = rate * parseInt(days_worked);
                                        let absent = salaryRate - basic;

                                        console.log("RATE: " + rate);
                                        console.log("SALARY RATE: " + salaryRate);
                                        console.log("BASIC: " + basic);
                                        console.log("ABSENT: " + absent);
                                        
                                        console.log("OT TOTAL: " + ot_total);
                                        console.log("UT TOTAL: " + ut_total);
                                        console.log("OT MINS: " + ot_mins);
                                        console.log("UT MINS: " + ut_mins);
                                        console.log("LATE: (minutes)" + late_mins);
                                        
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
                    <div class="payroll-header-buttons" style="display:flex;justify-content:space-between;"><div style="color:#fff;display:flex;flex-direction:column;">Add holiday</div><div style="color:#fff;display:flex;flex-direction:column;">No. of Employees: <span class="text-center">${staffs_len}</span></div></div>
                    <hr>
                    <div class="table-container" style="max-height:60vh;overflow:auto;max-width:70vw;">
                        <table>
                            <thead>
                                <tr>
                                    <td>NAME OF EMPLOYEE</td>
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
                    computeSalary(id);
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
                    computeSalary(id);
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
                                <p class="text-white text-center" style="font-size:20px;">HOLIDAYS RATE</p>
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

                var offdays;
                var restdays;
                var leave_start;
                var leave_end;
                var paid_leave;

                $.ajax({
                    type: 'POST',
                    url: '../php/fetch_offdays.php',
                    data: {
                        serial: snumber,
                    },
                    success: function(res) {
                        offdays = res;
                    }
                })

                $.ajax({
                    type: 'POST',
                    url: '../php/fetch_restdays.php',
                    data: {
                        serial: snumber,
                    },
                    success: function(res) {
                         restdays = res;
                    }
                })

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
                            paid_leave = parseInt(res[0].paid_leave);

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
                                        <td>OFF DAY</td>
                                        <td id="offdays"></td>
                                        <td style="display:grid;grid-template-columns: auto auto;column-gap:5px;">
                                            <input type="button" id="add-off" value="ADD DAY"/>
                                            <input type="button" id="edit-off" value="REMOVE"/>
                                            
                                        </td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>REST DAY</td>
                                        <td id="restdays"></td>
                                        <td style="display:grid;grid-template-columns: auto auto;column-gap:5px;">
                                            <input type="button" id="add-rest" value="ADD DAY"/>
                                            <input type="button" id="edit-rest" value="REMOVE"/>
                                        </td>
                                    </tr>
                                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                        <td>REQUEST LEAVE</td>
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
                    

                    if (offdays != 'none') {
                        let val = "";
                        if (offdays.includes("monday")) {
                            val += "Monday ";
                        }
                        if (offdays.includes("tuesday")) {
                            val += "Tuesday ";
                        }
                        if (offdays.includes("wednesday")) {
                            val += "Wednesday ";
                        }
                        if (offdays.includes("thursday")) {
                            val += "Thursday ";
                        }
                         if (offdays.includes("friday")) {
                            val += "Friday ";
                        } 
                        if (offdays.includes("saturday")) {
                            val += "Saturday ";
                        } 
                        if (offdays.includes("sunday")) {
                            val += "Sunday ";
                        } 
                        if (offdays === 'None') {
                            $("#offdays").html("None");
                        } else {
                            $("#offdays").html(val);
                        }
                        

                    } 

                    $("#restdays").html("None");

                    if (restdays != 'none') {
                        let val2 = "";
                        if (restdays.includes("monday")) {
                            val2 += "Monday ";
                        }
                        if (restdays.includes("tuesday")) {
                            val2 += "Tuesday ";
                        }
                        if (restdays.includes("wednesday")) {
                            val2 += "Wednesday ";
                        }
                        if (restdays.includes("thursday")) {
                            val2 += "Thursday ";
                        }
                         if (restdays.includes("friday")) {
                            val2 += "Friday ";
                        } 
                        if (restdays.includes("saturday")) {
                            val2 += "Saturday ";
                        } 
                        if (restdays.includes("sunday")) {
                            val2 += "Sunday ";
                        } 
                        if (restdays === 'None') {
                            $("#restdays").html("None");
                        } else {
                            $("#restdays").html(val2);
                        }

                    } 

                    if (leave_start != undefined || leave_start != null) {
                        if (paid_leave == 0) {
                            $("#leave").html(`${leave_start} - ${leave_end} (not paid)`);
                        } else {
                            $("#leave").html(`${leave_start} - ${leave_end} (paid leave)`);
                        }
                        
                    } else {
                        $("#leave").html("None");
                    }

                }, 200);

                $("#edit-off").click(function(event){
                    event.stopImmediatePropagation();
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="fourth-layer-overlay">
                        <div class="folo-wrapper pt-5" style="min-width:20vw;">
                            <p class="text-white text-center" style="font-size:20px;">REMOVE DAY (OFF)</p>
                            <hr>
                            <form id="removeOffDayForm">
                                <span>SELECT DAY:</span>
                                <select id="day-select" name="day">
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                </select>
                                <br>
                                <input type="submit" data-id="${snumber}" value="UPDATE"/>
                            </form>
                        </div>
                    </div>`);

                    $("input[type='submit']").click(function(event){
                        event.preventDefault();
                        let data = new FormData(document.getElementById("removeOffDayForm"));
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
                            url: '../php/remove_off.php',
                            data: {
                                serial: snumber,
                                day: formDataObject.day,
                            }, success: function(res){
                                
                                try {
                                    
                                    if (res.includes('success')) {
                                        successNotification("Removed selected day off.", "success");
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
                    $(".fourth-layer-overlay").on("click", function(){
                        $(this).remove();
                    })
                })

                $("#add-off").click(function(event){
                    event.stopImmediatePropagation();
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="fourth-layer-overlay">
                        <div class="folo-wrapper pt-5" style="min-width:20vw;">
                            <p class="text-white text-center" style="font-size:20px;">ADD DAY (OFF)</p>
                            <hr>
                            <form id="addOffDayForm">
                                <span>SELECT DAY:</span>
                                <select id="day-select" name="day">
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                </select>
                                <br>
                                <input type="submit" value="UPDATE"/>
                            </form>
                        </div>
                    </div>`);

                    $("input[type='submit']").click(function(event){
                        event.preventDefault();
                        let data = new FormData(document.getElementById("addOffDayForm"));
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
                            url: '../php/add_off.php',
                            data: {
                                serial: snumber,
                                day: formDataObject.day,
                            }, success: function(res){
                              
                                try {
                                 
                                    if (res.includes('success')) {
                                        successNotification("Off day added.", "success");
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
                    $(".fourth-layer-overlay").on("click", function(){
                        $(this).remove();
                    })
                })

                $("#add-rest").click(function(event){
                    event.stopImmediatePropagation();
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="fourth-layer-overlay">
                        <div class="folo-wrapper pt-5" style="min-width:20vw;">
                            <p class="text-white text-center" style="font-size:20px;">ADD DAY (REST)</p>
                            <hr>
                            <form id="addRestDayForm">
                                <span>SELECT DAY:</span>
                                <select id="day-select" name="day">
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                </select>
                                <br>
                                <input type="submit" value="UPDATE"/>
                            </form>
                        </div>
                    </div>`);

                    $("input[type='submit']").click(function(event){
                        event.preventDefault();
                        let data = new FormData(document.getElementById("addRestDayForm"));
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
                            url: '../php/add_rest.php',
                            data: {
                                serial: snumber,
                                day: formDataObject.day,
                            }, success: function(res){
                              
                                try {
                                 
                                    if (res.includes('success')) {
                                        successNotification("Rest day added.", "success");
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

                    $(".fourth-layer-overlay").on("click", function(){
                        $(this).remove();
                    })
                })

                $("#edit-rest").click(function(event){
                    event.stopImmediatePropagation();
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="fourth-layer-overlay">
                        <div class="folo-wrapper pt-5" style="min-width:20vw;">
                            <p class="text-white text-center" style="font-size:20px;">REMOVE DAY (REST)</p>
                            <hr>
                            <form id="removeRestDayForm">
                                <span>SELECT DAY:</span>
                                <select id="day-select" name="day">
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                </select>
                                <br>
                                <input type="submit" value="UPDATE"/>
                            </form>
                        </div>
                    </div>`);

                    $("input[type='submit']").click(function(event){
                        event.preventDefault();
                        let data = new FormData(document.getElementById("removeRestDayForm"));
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
                            url: '../php/remove_rest.php',
                            data: {
                                serial: snumber,
                                day: formDataObject.day,
                            }, success: function(res){
                              
                                try {
                                 
                                    if (res.includes('success')) {
                                        successNotification("Removed selected rest day.", "success");
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
                               
                                <span style="display:flex;align-items:center;">
                                    <input type="checkbox" id="pd" name="paid_leave" value="paid" style="margin: 0 10px;width:17px;height:17px;cursor:pointer;">
                                    <label for="pd" style="margin-top:7px;cursor:pointer;"> Paid leave</label><br>
                                </span>
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
                            <select id="payroll-sched" name="pay_sched">
                                <option value="twice-monthly">Twice monthly</option>
                                <option value="monthly">Monthly</option>
                            </select>

                            <span class="twice-mon-sched">Day of the month (1st half):</span>
                            <input class="twice-mon-sched" name="day1" type="number" placeholder="1st half"/>
                            <span class="twice-mon-sched">Day of the month (2nd half):</span>
                            <input class="twice-mon-sched" type="number" name="day2" placeholder="2nd half"/>
                            
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
                    <div>
                        <p class="text-center text-white">OFF AND REST DAY RATE</p>
                        <div>
                            <input type="button" id="add-odrd"  value="ADD"/>
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

        $.ajax({
            type: 'POST',
            url: '../php/update_company_settings.php',
            data: {
                pay_sched: formDataObject.pay_sched,
                day1: formDataObject.day1,
                day2: formDataObject.day2,

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
    })

    $("#add-class").on("click", function(event){
        event.stopImmediatePropagation();
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
                                <td>ACTION</td>
                            </tr>
                        </thead>
                        <tbody id="tbody">
                            <tr>
                                <td>Regular Employee</td>
                                <td>8 hrs</td>
                                <td>7:00 AM</td>
                                <td>45 (hourly)</td>
                                <td>Eligible</td>
                                <td>Eligible</td>
                                <td><input type="button" value="DELETE"></td>
                            </tr>
                            <tr>
                                <td>Regular Employee</td>
                                <td>8 hrs</td>
                                <td>7:00 AM</td>
                                <td>450 (daily)</td>
                                <td>Eligible</td>
                                <td>Eligible</td>
                                <td><input type="button" value="DELETE"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`);

        $("#add").on("click", function(event){
            event.stopImmediatePropagation();
            document.body.insertAdjacentHTML("afterbegin", `
            <div class="fourth-layer-overlay">
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
                        url: '../php/add_class.php',
                        data: {
                            class: formDataObject.class,
                            hour: formDataObject.hour,
                            clock_in: formDataObject.clock_in,
                            rate: formDataObject.rate,
                            rate_type: formDataObject.rate_type,
                            ot_pay: formDataObject.ot_pay,
                            holi_pay: formDataObject.holi_pay
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
    })



    $("#add-allowance").on("click", function(event){
        event.stopImmediatePropagation();
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
                            <tr>
                                <td>Meal allowance</td>
                                <td>100</td>
                                <td>Daily</td>
                                <td>Regular</td>
                                <td><input type="button" value="DELETE"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`);

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
                        
                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="fourth-layer-overlay">
                            <div class="folo-wrapper pt-5" style="min-width:20vw;">
                                <p class="text-white text-center" style="font-size:20px;">ADD ALLOWANCE</p>
                                <hr>
                                <form id="addAllowanceForm">
                                    <span>ALLOWANCE NAME:</span>
                                    <input type="text" placeholder="Enter name" name="name"/>
                                    <span>AMOUNT</span>
                                    <input type="number" name="amount" placeholder="Enter amount"/>
                                    <span>ALLOWANCE TYPE:</span>
                                    <select name="type">
                                        <option value="daily">Daily</option>
                                        <option value="every pay">Twice monthly</option>
                                        <option value="monthly">Monthly</option>
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
                        errorNotification("Error fetching classes.", "warning");
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
    })

    $(".window-content").on("click", function(event){
        event.stopImmediatePropagation();
    })

    $(".pop-up-window").on("click", function(event){
        $(this).remove();
    })

    $("#add-penalties").on("click", function(event){
        event.stopImmediatePropagation();
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
                                <td>TYPE</td>
                                <td>DETAIL</td>
                                <td>ALLOWANCE DEDUC.</td>
                                <td>CLASS</td>
                                <td>ACTION</td>
                            </tr>
                        </thead>
                        <tbody id="tbody">
                            <tr>
                                <td>Late</td>
                                <td>About 30 min(s)</td>
                                <td>-50 (Meal allowance)</td>
                                <td>Regular Employee</td>
                                <td><input type="button" value="DELETE"></td>
                            </tr>
                            <tr>
                                <td>Absent</td>
                                <td>Every 1 day(s)</td>
                                <td>-10% (COLA)</td>
                                <td>Regular Employee</td>
                                <td><input type="button" value="DELETE"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`);

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

                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="fourth-layer-overlay">
                            <div class="folo-wrapper pt-5" style="min-width:20vw;">
                                <p class="text-white text-center" style="font-size:20px;">ADD PENALTY</p>
                                <hr>
                                <form id="addPenaltyForm">
                                    <span>SELECT TYPE:</span>
                                    <select id="type-select" name="type">
                                        <option value="late">Late</option>
                                        <option value="absent">Absent</option>
                                    </select>

                                    <span>DETAIL:</span>
                                    <select name="detail">
                                        <option value="">Select detail</option>
                                        <option value="about">About</option>
                                        <option value="every" style="display:none;" class="absent">Every</option>
                                    </select>

                                    <span class="late">TIME (minutes):</span>
                                    <input class="late" type="number" placeholder="Enter minutes" name="minutes">

                                    <span class="absent"  style="display:none;">NUM OF DAYS:</span>
                                    <input class="absent" type="number" placeholder="Enter number of days" name="days"  style="display:none;">

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

                        $("#type-select").on("change", function(event){
                            event.stopImmediatePropagation();
                            if ($(this).val() === "late") {
                                $("option.absent").hide();
                                $("span.absent").hide();
                                $("input.absent").hide();
                                $("span.late").show();
                                $("input.late").show();
                            } else {
                                $("option.absent").show();
                                $("span.late").hide();
                                $("input.late").hide();
                                $("span.absent").show();
                                $("input.absent").show();
                                
                            }
                        })


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

                            
                            $.ajax({
                                type: 'POST',
                                url: '../php/add_allowance_penalty.php',
                                data: {
                                    detail: formDataObject.detail,
                                    mins: formDataObject.minutes,
                                    days: formDataObject.days,
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
                            
                        })

                        $(".folo-wrapper").on("click", function(event){
                            event.stopImmediatePropagation();
                        })
                    
                        $(".fourth-layer-overlay").on("click", function(event){
                            event.stopImmediatePropagation();
                            $(this).remove();
                        })

                    } catch (err) {
                        errorNotification("Error fetching classes.", "warning");
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
    })

    $("#add-holiday").on("click", function(event){
        event.stopImmediatePropagation();
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
                            <tr>
                                <td>Regular</td>
                                <td>200%</td>
                                <td>100%</td>
                                <td>Regular Employee</td>
                                <td>Absent before and after holiday</td>
                                <td><input type="button" value="DELETE"></td>
                            </tr>
                            <tr>
                                <td>Special</td>
                                <td>100%</td>
                                <td>0%</td>
                                <td>Regular Employee</td>
                                <td>Absent before and after holiday</td>
                                <td><input type="button" value="DELETE"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`);

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

                                    <span>SELECT CLASS:</span>
                                    <select name="class">
                                        ${ops}
                                    </select>

                                    <span>EXCLUDE IF EMPLOYEE IS:</span>
                                    <select name="holiday_policy">
                                        <option value="aoh">Absent on holiday</option>
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
                                formDataObject[key] = value;
                                if (value === '') {
                                    isNotEmpty = false;
                                }
                            });

                            if (!isNotEmpty) {

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
                        errorNotification("Error fetching classes.", "warning");
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
    })

    $("#add-odrd").on("click", function(event){
        event.stopImmediatePropagation();
        document.body.insertAdjacentHTML("afterbegin", `
        <div class="third-layer-overlay">
            <div class="tlo-wrapper pt-5">
                <p class="text-white text-center" style="font-size:20px;">OFF AND REST DAY RATE</p>
                <button id="add" style="padding: 5px 15px;
                border-radius: 4px;
                background: var(--teal);
                color: #fff;
                border: none;
                font-size: 15px;">ADD OFF OR REST DAY</button>
                <hr>
                <div class="table-container" style="max-height:60vh;overflow:auto;max-width:40vw;min-width:40vw;">
                    <table>
                        <thead>
                            <tr>
                                <td>NAME</td>
                                <td>WORKED</td>
                                <td>DID NOT WORK</td>
                                <td>CLASS</td>
                                <td>ACTION</td>
                            </tr>
                        </thead>
                        <tbody id="tbody">
                            <tr>
                                <td>REST DAY</td>
                                <td>130%</td>
                                <td>100%</td>
                                <td>Regular Employee</td>
                                <td><input type="button" value="DELETE"></td>
                            </tr>
                            <tr>
                                <td>OFF DAY</td>
                                <td>100%</td>
                                <td>100%</td>
                                <td>Regular Employee</td>
                                <td><input type="button" value="DELETE"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`);

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

                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="fourth-layer-overlay">
                            <div class="folo-wrapper pt-5" style="min-width:20vw;">
                                <p class="text-white text-center" style="font-size:20px;">ADD OFF AND REST DAY POLICY</p>
                                <hr>
                                <form id="addOARDForm">
                                    <span>SELECT TYPE:</span>
                                    <select id="type-select" name="type">
                                        <option value="off">OFF DAY</option>
                                        <option value="rest">REST DAY</option>
                                    </select>

                                    <span>RATE IF WORKED (percentage):</span>
                                    <input type="number" placeholder="Enter rate if worked" name="worked" />

                                    <span>RATE IF DID NOT WORK (percentage):</span>
                                    <input type="number" placeholder="Enter rate if did not work" name="didnotwork" />

                                    <span>SELECT CLASS:</span>
                                    <select name="class">
                                        ${ops}
                                    </select>

                                    <br>
                                    <input type="submit" value="ADD POLICY"/>
                                </form>
                            </div>
                        </div>`);

                        $("input[type='submit']").click(function(event){
                            event.preventDefault();
                            let data = new FormData(document.getElementById("addOARDForm"));
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
                                    url: '../php/add_oard_setting.php',
                                    data: {
                                        type: formDataObject.type,
                                        worked: formDataObject.worked,
                                        didnotwork: formDataObject.didnotwork,
                                        class: formDataObject.class,
                                        
                                    }, success: function(res){
                                        console.log(res);
                                        try {
                                            res = JSON.parse(res);
                                            
                                            if (res.message == 'success') {
                                                if ($("#type-select").val() == 'off') {
                                                    successNotification("Off day rate added.", "success");
                                                } else {
                                                    successNotification("Rest day rate added.", "success");
                                                }
                                                
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

                    } catch(err) {
                        errorNotification("Error fetching classes.", "warning");
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

