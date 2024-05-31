// Define months array
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// var gateway = `ws://192.168.10.147/register`;
// var websocket;
// var SERIAL_NUMBER;
var timeout;
// var MACHINEID;

// function initWebSocket() {
//     websocket = new WebSocket(gateway);
//     websocket.onopen = onOpen;
//     websocket.onclose = onClose;
//     websocket.onmessage = onMessage;
// }

// function onOpen(event) {
//     console.log('Connection opened');
// }

// function onClose(event) {
//     console.log('Connection closed');
//     setTimeout(initWebSocket, 1000);
// }

// function onMessage(event) {
//     try{
//         let data = JSON.parse(event.data);
//         if (data.message == "registered") {
//             errorNotification("You are already registered.", "danger");
//         } else if (data.message == 'success') {
//             MACHINEID = data.uniqueID;
//             SERIAL_NUMBER = data.id;
//             $("input").removeAttr("readonly");
//             $("input").removeAttr("disabled");
            
//             successNotification("Fingerprint confirmed.", "success");
//         } 
//     } 
//     catch( err) {
//         console.log("");
//     }
//     if (event.data == 'confirm') {
//         successNotification("Confirm fingerprint.", "success");
//     } 
//     else if (event.data == 'did not match') {
//         errorNotification("Fingerprint didn't match.", "warning");
//     }
//     else if (event.data == 'failed fingerprint') {
//         console.log(event.data);
//         errorNotification("Failed to identify the fingerprint.", "warning");
//         errorNotification("Please try again.", "warning");
//     }
// }

$(document).ready(function(){
    //initWebSocket();

    document.body.insertAdjacentHTML("afterbegin", `
    <div id="notifications" class="notifications">
    </div>`)
    
    // try{
    //     $.ajax({
    //         type: 'GET',
    //         url: '../php/check_table.php',
    //         success: function(res){
    //             try {
    //                 res = parseInt(res);
    //                 if (typeof res === 'number' && !isNaN(res)) {
    //                     SERIAL_NUMBER = parseInt(res) + 1;
    //                     websocket.send(res);
    //                 }
    //             } catch(err){
    //                 console.log("");
    //             }
    //         }
    //      })
    //} catch(err){
    //     console.log("");
    //}
})

function registerAdmin(){
    event.preventDefault();

    let data = new FormData(document.getElementById("registrationForm"));
    var formDataObject = {};
    var generatedNumber;

    let minNum = 900000;
    let maxNum = 999999;
    generatedNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    let isNotEmpty = true;
    data.forEach(function(value, key){
        formDataObject[key] = value;
        if (value === '') {
            isNotEmpty = false;
        }
    });

    formDataObject["company_id"] = generatedNumber;
    if ((formDataObject.password === formDataObject.confirm) && isNotEmpty) {
        $.ajax({
            type: 'POST',
            url: '../php/register.php',
            data : {
                name: formDataObject.name,
                username: formDataObject.username,
                password: formDataObject.password,
                serialnumber: formDataObject.serialnumber,
                machine: formDataObject.machine,
                companyid: formDataObject.company_id,
                id: formDataObject.registered_id,
            },
            success: function(res){
                
                if (res == 'success') {
                    //websocket.send(128);
                    $("input[type='text'], input[type='password'], input[type='number']").val('');
                    successNotification("Registration success.", "success");
                    
                    setTimeout(() => {
                        window.open('../', '_self');
                    }, 2000);
                } else if (res == 'username exists') {
                    errorNotification("Username already exists.", "danger");
                }
            }
        })
        
    } else {
        if (isNotEmpty) {
            errorNotification("Confirm password does not match.", "danger");
        } else {
            errorNotification("Fields must be filled out.", "danger")
        }
    }

    // $.ajax({
    //     type: 'POST',
    //     url: '../php/check_machine_id.php',
    //     data: {
    //         machine: MACHINEID,
    //     }, 
    //     success: function(res){
           
    //         formDataObject["registered_id"] = SERIAL_NUMBER;
    //         formDataObject["serialnumber"] = SERIAL_NUMBER;
    //         formDataObject["machine"] = MACHINEID;
            
    //         let isNotEmpty = true;
    //         data.forEach(function(value, key){
    //             formDataObject[key] = value;
    //             if (value === '') {
    //                 isNotEmpty = false;
    //             }
    //         });

    //         if (res == 'does exists') {
    //             if ((formDataObject.password === formDataObject.confirm) && isNotEmpty) {
                    
    //                 $.ajax({
    //                     type: 'POST',
    //                     url: '../php/register.php',
    //                     data : {
    //                         name: formDataObject.name,
    //                         username: formDataObject.username,
    //                         password: formDataObject.password,
    //                         serialnumber: formDataObject.serialnumber,
    //                         machine: formDataObject.machine,
    //                         id: formDataObject.registered_id,
    //                     },
    //                     success: function(res){
                            
    //                         if (res == 'success') {
    //                             websocket.send(128);
    //                             $("input[type='text'], input[type='password'], input[type='number']").val('');
    //                             successNotification("Registration success.", "success");
                                
    //                             setTimeout(() => {
    //                                 window.open('../', '_self');
    //                             }, 2000);
            
    //                         }
    //                     }
    //                 })
                    
    //             } else {
    //                 if (isNotEmpty) {
    //                     errorNotification("Confirm password does not match.", "danger");
    //                 } else {
    //                     errorNotification("Fields must be filled out.", "danger")
    //                 }
    //             }

    //         } else {
                
    //         }
    //         console.log(formDataObject);
    //         console.log(generatedNumber);
    //     }
    // })
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


