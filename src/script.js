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


//
$(".payroll").on("click", function(event){
    event.stopImmediatePropagation();

    $.ajax({
        type: 'POST',
        url: '../php/staffs.php',
        success: function(res){
            let content = "";
            let responseBody;
            try {
                res = JSON.parse(res);
                console.log(res);
                responseBody = res;
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
                        <td><button class="action-button mr-1 compute-salary" data-id="${res[i].serialnumber}">COMPUTE</button><button class="action-button view-details">VIEW DETAILS</button></td>
                    </tr>`;
                }

            } catch(err) {
                console.log(err);
            }
            document.body.insertAdjacentHTML("afterbegin", `
            <div class="pop-up-window">
                <div class="window-content pt-5">
                    <p class="text-center text-white" style="font-size:20px;">PAYROLL</p>
                    <div class="payroll-header-buttons" style="display:flex;justify-content:space-between;"><button class="action-button m-1">COMPUTE ALL</button></div>
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
                    $.ajax({
                        type: 'POST',
                        url: '../php/fetch_company_settings.php',
                        success: function(res){
                            try{
                                res = JSON.parse(res);
                                let settings = res;
                                let staff_data;

                                $.ajax({
                                    type: 'POST',
                                    url: '../php/fetch_ut_and_ot.php',
                                    data: {
                                        serialnumber: id,
                                    },
                                    success: function(res){
                                        try {
                                            res = JSON.parse(res);
                                            console.log(res);
                                        } catch(err){
                                            console.log(err);
                                        }
                                    }
                                })
                                
                                if (responseBody != null) {
                                    var foundItem = responseBody.find(item => item.serialnumber === `${id}`);
                                    
                                    staff_data = foundItem;
                                    
                                    let calendarWorkingDays = parseInt($(`#cal${id}`).val());

                                }
                                
                            } catch(err){
                                console.log(err);
                            }
                            
                        }
                    })
                }
            })

            $(".view-details").on("click", function(event){
                event.stopImmediatePropagation();
                document.body.insertAdjacentHTML("afterbegin", `
                <div class="third-layer-overlay">
                    <div class="tlo-wrapper pt-5">
                        <p class="text-white text-center" style="font-size:20px;">JUSTINE</p>
                        <p class="text-white text-center"  style="font-size:13px;margin-top:-20px;">23 | Programmer</p>
                        <div class="payroll-header-buttons" style="display:flex;justify-content:space-between;"><button class="action-button m-1">VIEW HOLIDAYS</button></div>
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
                                    <td>395</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>TOTAL HOURS</td>
                                    <td>84.2</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>CALENDAR WORKING DAYS</td>
                                    <td>12</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>DAYS WORKED</td>
                                    <td>10.5</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>HOLIDAYS (TOTAL)</td>
                                    <td>800</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>OT (TOTAL)</td>
                                    <td>100</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>UT (TOTAL)</td>
                                    <td>200</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>SSS DEDUC.</td>
                                    <td>100</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>PhiliHealth DEDUC.</td>
                                    <td>100</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>Pag-IBIG DEDUC.</td>
                                    <td>100</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>ADJUSTMENT</td>
                                    <td>0</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>CASH ADVANCE</td>
                                    <td>2500</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>CHARGES</td>
                                    <td>0</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>SSS LOAN</td>
                                    <td>0</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>Pag-IBIG LOAN</td>
                                    <td>0</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>COMPANY LOAN</td>
                                    <td>0</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                    <td>ALLOWANCE</td>
                                    <td>1200</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>`);
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
            console.log(res);
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
                        <button class="action-button" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}">TRAIL</button>
                        <button class="action-button" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}">RECORDS</button>
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

