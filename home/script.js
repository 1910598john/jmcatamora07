// Define months array
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var gateway = `ws://192.168.10.147/attendance`;
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
    console.log(event.data);
    try{
        let data = JSON.parse(event.data);
        let id = data.id;
        if (data.message == 'registered') {
            $.ajax({
                type: 'POST',
                url: '../php/is_employee.php',
                data: {
                    id: id,
                }, 
                success: function(res){
                    try{
                        let data = JSON.parse(res);
                        let name = data[0].name;
                        let pos = data[0].position;
                        let department = data[0].department;
                        let status = data[0].status;
                        let _class = data[0].class;
                        
                        if (status == 'Not set' || status == 'NOT SET') {
                            $.ajax({
                                type: 'POST',
                                url: '../php/attendance.php',
                                data: {
                                    serialnumber: id,
                                    name: name,
                                    pos: pos,
                                    dept: department,
                                    status: "IN",
                                    class: _class,
                                },success: function(res){
                                    console.log(res);
                                    if (res.includes('success')) {
                                        setTimeout(() => {
                                            location.reload();
                                        }, 1000);
                                    }
                                }
                            })

                        } else {
                            
                            if (status == 'IN') {
                                $.ajax({
                                    type: 'POST',
                                    url: '../php/attendance.php',
                                    data: {
                                        serialnumber: id,
                                        name: name,
                                        pos: pos,
                                        dept: department,
                                        status: "OUT",
                                        class: _class,
                                        
                                    },success: function(res){
                                        console.log(res);
                                        if (res.includes('success')) {
                                            setTimeout(() => {
                                                location.reload();
                                            }, 1000);
                                        }
                                    }
                                })
                            } else {
                                $.ajax({
                                    type: 'POST',
                                    url: '../php/attendance.php',
                                    data: {
                                        serialnumber: id,
                                        name: name,
                                        pos: pos,
                                        dept: department,
                                        status: "IN",
                                        class: _class,
                                        
                                    },success: function(res){
                                        console.log(res);
                                        if (res.includes('success')) {
                                            setTimeout(() => {
                                                location.reload();
                                            }, 1000);
                                        }
                                    }
                                })
                            }
                           
                        }


                    } catch(err) {
                        console.log(err);
                    }
                    
                }
            })
        } 
    } catch(err) {
        console.log(err);
    }

    if (event.data == 'failed fingerprint') {
        console.log(event.data);
        errorNotification("Failed to identify the fingerprint.", "warning");
        errorNotification("Please try again.", "warning");
    } else if (event.data == 'did not match') {
        errorNotification("Fingerprint not recognised.", "warning");
    }

    console.log(event.data);

}

$(document).ready(function(){
    var currentTime = new Date();

    // Get the current date components
    var month = months[currentTime.getMonth()];
    var day = currentTime.getDate();
    var weekday = currentTime.getDay();
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
    $("#current-day").html(days[weekday]);

    document.body.insertAdjacentHTML("afterbegin", `
    <div id="notifications" class="notifications">
    </div>`);

    $.ajax({
        type: 'POST',
        url: '../php/staffs_on_leave.php',
        success: function(res) {

        }
    })

    displayCurrentTime();
    initWebSocket();
    
})

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

    setTimeout(() => {
        $(".notification").remove();
    }, 5000);
}


function displayCurrentTime(){
    setTimeout(() => {
        var currentTime = new Date();

        // Get the current date components
        var month = months[currentTime.getMonth()];
        var day = currentTime.getDate();
        var weekday = currentTime.getDay();
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
        $("#current-day").html(days[weekday]);

        setTimeout(() => {
            displayCurrentTime();
        }, 1000);

    }, 1000)
}

