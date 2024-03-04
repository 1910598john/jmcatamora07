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
                <input type="number" placeholder="Rate" name="rate" autocomplete="off">

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
                                    <td>STATUS<td>
                                    
                                    <td>TOTAL HOURS</td>
                                    <td>DAYS WORKED</td>
                                    <td>RATE</td>
                                    <td>ADJUSTMENT</td>
                                    <td>CHARGES</td>
                                    <td>CASH ADV.</td>
                                    <td>SSS LOAN</td>
                                    <td>Pag-IBIG LOAN</td>
                                    <td>COMPANY LOAN</td>
                                    <td>ALLOWANCE</td>
                                    <td>ACTION</td>
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
                    <td>${data[i].status}<td>
                    <td>${totalHours} hrs</td>
                    <td>${data[i].days_worked}</td>
                    <td>${data[i].rate}</td>
                    <td>${data[i].adjustment}</td>
                    <td>${data[i].charges}</td>
                    <td>${data[i].cash_advance}</td>
                    <td>${data[i].sss_loan}</td>
                    <td>${data[i].pag_ibig_loan}</td>
                    <td>${data[i].company_loan}</td>
                    <td>${data[i].allowance}</td>
                    <td><button class="action-button" data-id="${data[i].id}" data-snumber="${data[i].serialnumber}" data-name="${data[i].name}">OPEN</button></td>
                </tr>`;
            }

           
            document.getElementById("tbody").insertAdjacentHTML("afterbegin", `${content}`);
            $("#num-of-staffs").html(data.length);

            $(".action-button").on("click", function(event){
                event.stopImmediatePropagation();
                let snumber = $(this).data("snumber");
                let id = $(this).data("id");
                let name = $(this).data("name");
                
                OPEN(snumber, id, name);
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
            <form style="width:100%;">
                <div class="company-details-wrapper">
                    <div>
                        <p class="text-center text-white">RATES</p>
                        <div>
                            <span>:</span>
                            <input type="number" placeholder="Rate" />
                            <span>:</span>
                            <input type="number" placeholder="Rate" />
                        </div>
                    </div>
                    <div>
                        <p class="text-center text-white">COMPENSATIONS</p>
                        <div>
                            <span>Holidays:</span>
                            <input type="button" value="ADD HOLIDAY"/>
                        </div>
                    </div>
                    <div class="deductions">
                        <p class="text-center text-white">DEDUCTIONS</p>
                        <div>
                            <span>SSS:</span>
                            <input type="number" placeholder="SSS deduction"/>
                            <span>PhilHealth:</span>
                            <input type="number" placeholder="PhilHealth deduction"/>
                            <span>Pag-IBIG:</span>
                            <input type="number" placeholder="Pag-IBIG deduction"/>
                            <br>
                            <input type="submit" value="UPDATE"/>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>`);

    $(".window-content").on("click", function(event){
        event.stopImmediatePropagation();
    })

    $(".pop-up-window").on("click", function(event){
        $(this).remove();
    })
})

function OPEN(snumber, id, name) {
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
                        <hr>
                        <form style="width:100%;" id="staffSettings">
                            <div class="tlo-content">
                                <div>
                                    <span>ALLOWANCE:</span>
                                    <input type="number" name="allowance" value="${data.allowance}" placeholder="Allowance"/>
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
                            allowance: formDataObject.allowance,
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

