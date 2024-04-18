// Define months array
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var gateway = `ws://192.168.10.147/login`;
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
    try {
        let data = JSON.parse(event.data);

        console.log(data);
    
        if (data.message == 'registered') {
            let id = data.id;
      
            $.ajax({
                type: 'POST',
                url: './php/fingerprintlogin.php',
                data: {
                    id: id,
                }, success: function(res){
                    let data = JSON.parse(res);

                    $.ajax({
                        type: 'POST',
                        url: './php/login.php',
                        data : {
                            username: data[0].username,
                            password: data[0].password
                        },
                        success: function(res){
                            if (res == 'success') {
                                $("input[type='text'], input[type='password'], input[type='number']").val('');
                                successNotification("You have successfully logged in.", "success");
                                setTimeout(() => {
                                    window.open("./home/", "_self");
                                }, 1000);
                                
                            } else {
                                errorNotification("Wrong credentials.", "danger");
                            }
                        }
                    })
                }
            })
        } 

    } catch(err){
        console.log("");
    }
    

    console.log(event.data);
    
}

$(document).ready(function(){
    initWebSocket();

    document.body.insertAdjacentHTML("afterbegin", `
    <div id="notifications" class="notifications">
    </div>`);

    
})


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

function loginAdmin(){
    event.preventDefault();

    let data = new FormData(document.getElementById("loginForm"));
    var formDataObject = {};
    let isNotEmpty = true;
    data.forEach(function(value, key){
        formDataObject[key] = value;
        if (value === '') {
            isNotEmpty = false;
        }
    });

    if (isNotEmpty){
        $.ajax({
            type: 'POST',
            url: './php/login.php',
            data : {
                username: formDataObject.username,
                password: formDataObject.password
            },
            success: function(res){
                console.log(res);
                if (res == 'success') {
                    $("input[type='text'], input[type='password'], input[type='number']").val('');
                    successNotification("You have successfully logged in.", "success");
                    setTimeout(() => {
                        window.open("./home/", "_self");
                    }, 1000);
                    
                } else {
                    errorNotification("Wrong credentials.", "danger");
                }
            }
        })
    } else {
        errorNotification('Fields must be filled out.', 'danger');
    }

}


