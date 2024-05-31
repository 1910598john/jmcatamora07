var gateway = `ws://192.168.10.147/register`;
var websocket;
var timeout;
var MACHINEID = 'Waiting to scan..';

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

$(document).ready(function() {
    initWebSocket();
}) 

function onMessage(event) {
    if (event.data.includes("machine")) {
        MACHINEID = event.data.replace(/machine/g, '');
        $("#machine-text").val(MACHINEID);
    }
}

var close_icon = `
<div class="close-window" style="position:absolute;right:-40px;top:-40px;cursor:pointer;">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#fff" class="bi bi-x-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
</div>`;

var current_file;
$(".contribution").click(function(event){
    event.stopImmediatePropagation();
    $.ajax({
        type: 'POST',
        url: '../php/fetch_sss_file.php',
        success: function(res) {
            let files = "";
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
                        current_file = jsonData;
                    }

                    files += `
                    <div style="display:flex;justify-content:space-between;margin:5px 0;">${res[i].name} <span>${res[i].status}</span></div>`;
                }

                console.log(current_file);
            } catch (err) {
                console.log(err);
            }

            $.ajax({
                type: 'POST',
                url: '../php/fetch_contributions.php',
                success: function(res) {
                    let phil;
                    let phil_first_half;
                    let pbig;
                    let pbig_first_half;
                    let sss_first_half;
                    try {
                        res = JSON.parse(res);

                        phil = res.phil;
                        phil_first_half = res.phil_first_half;
                        pbig = res.pbig;
                        pbig_first_half = res.pbig_first_half;
                        sss_first_half = res.sss_first_half;

                    } catch (err) {
                        phil = "";
                        phil_first_half = ""
                        pbig = "";
                        pbig_first_half = "";
                        sss_first_half = "";
                    }

                    let sss_fhi = "";
                    let phil_fhi = "";
                    let pbig_fhi = "";
                    
                    if (PAYSCHED == 'twice-monthly') {
                        sss_fhi = `
                        <hr>
                        <div style="display:flex;flex-direction:column;">
                            <span>First half deduction:</span>
                            <input type="number" id="sss_fh" value="${sss_first_half}" placeholder="Enter amount"/>
                        </div>`;

                        phil_fhi = `
                        <span style="text-align:left;">First half deduction:</span>
                        <input type="number" id="phil_fh" value="${phil_first_half}" placeholder="Enter amount"/>
                        `;

                        pbig_fhi = `
                        <span style="text-align:left;">First half deduction:</span>
                        <input type="number" id="pbig_fh" value="${pbig_first_half}" placeholder="Enter amount"/>`;
                    }
                    

                    document.body.insertAdjacentHTML("afterbegin", `
                    <div class="pop-up-window">
                        <div class="window-content pt-5" style="position:relative;">
                            ${close_icon}
                            <p class="text-center text-white" style="font-size:20px;">CONTRIBUTIONS</p>
                            <hr>
                            <div style="min-width:35vw;display:grid;grid-template-columns:auto auto;color:#fff;grid-column-gap:20px;">
                                <div style="border:1px solid rgba(0,0,0,0.1);padding:10px;">
                                    <p class="text-center">SSS</p><br>
                                    <button class="action-button" onclick="document.getElementById('fileInput').click();">Upload current</button>
                                
                                    <input style="display:none;" id="fileInput" type="file" accept=".xls,.xlsx">
                                    <div style="min-height:150px;max-height:150px;border:1px solid rgba(255,255,255,0.3);margin-top:10px;overflow:auto;padding:5px;">
                                        ${files}
                                    </div>
                                    
                                    ${sss_fhi}
                                </div>
                                <div style="text-align:center;">
                                    <div style="border:1px solid rgba(0,0,0,0.1);padding:10px;">
                                        <span>PhilHealth</span>
                                        <br>
                                        <div style="display:flex;flex-direction:column;">
                                            <span style="text-align:left;">Contribution:</span>
                                            <input type="text" id="phil" value="${phil}" placeholder="Fixed or percentage"/>
                                            ${phil_fhi}
                                        </div>
                                    </div>
                                    <br>
                                    <div style="border:1px solid rgba(0,0,0,0.1);padding:10px;">
                                        <span>Pag-IBIG</span>
                                        <br>
                                        <div style="display:flex;flex-direction:column;">
                                            <span style="text-align:left;">Contribution:</span>
                                            <input type="text" id="pbig" value="${pbig}" placeholder="Fixed or percentage"/>
                                            ${pbig_fhi}
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <button class="action-button update" style="width:100% !important;">UPDATE</button>
                        </div>
                    </div>`);

                    $("#fileInput").on("change", function(event){
                        uploadExcel();
                    })

                    function uploadExcel() {
                        const fileInput = document.getElementById('fileInput');
                        const file = fileInput.files[0];
                    
                        if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                    
                            fetch('../php/upload_sss.php', {
                                method: 'POST',
                                body: formData
                            })
                            .then(response => {
                                if (response.ok) {
                                    successNotification("File uploaded.", "success");
                                    setTimeout(() => {
                                        location.reload();
                                    }, 1000);
                                } else {
                                    console.error('Failed to upload Excel file');
                                }
                            })
                            .catch(error => {
                                console.error('Error occurred while uploading Excel file:', error);
                            });
                        }
                    }

                    $("button.update").click(function(event){
                        event.stopImmediatePropagation();
                        $.ajax({
                            type: 'POST',
                            url: '../php/update_contri.php',
                            data: {
                                sss_fh: $("#sss_fh").val(),
                                phil: $("#phil").val(),
                                phil_fh: $("#phil_fh").val(),
                                pbig: $("#pbig").val(),
                                pbig_fh: $("#pbig_fh").val()
                            }, success: function(res) {
                                successNotification("Contributions updated.", "success");
                                $(".pop-up-window").remove();
                            }
                        })
                    })

                    $(".close-window").click(function(event){
                        event.stopImmediatePropagation();
                        $(".pop-up-window").remove();
                    })

                }
            })
            
            
           
        }
    })

    
})


$(".users").click(function(event){
    event.stopImmediatePropagation();
    let content = "";

    $.ajax({
        type: 'POST',
        url: '../php/fetch_com_users.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
                for (let i = 0; i < res.length; i++) {
                    let permissions = JSON.parse(res[i].permission);
                    let txt = "";
                    for (let i = 0; i < permissions.length; i++) {
                        txt += `${permissions[i]}`;
                        if (permissions[i + 1]) {
                            txt += `, `;
                        }
                    }
                    content += `
                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                        <td>${res[i].name}</td>
                        <td>${res[i].username}</td>
                        <td>${txt}</td>
                    </tr>`;
                }
            } catch (err) {
                content += `
                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                        <td colspan="2" style="text-align;center;padding: 10px 0;">No item</td>
                    </tr>`;
            }

            document.body.insertAdjacentHTML("afterbegin", `
            <div class="pop-up-window">
                <div class="window-content pt-5" style="position:relative;min-width:25vw;">
                    ${close_icon}
                    <p class="text-center text-white" style="font-size:20px;">USERS (${COMPANY_NAME})</p>
                    <button class="action-button add-user">Add user</button>
                    <hr>
                    <div style="max-height:250px;overflow:auto;">
                        <table>
                            <thead>
                                <tr>
                                    <td>NAME</td>
                                    <td>USER ID</td>
                                    <td>PERMISSIONS</td>
                                </tr>
                            </thead>
                            ${content}
                        </table>
                    </div>
                </div>
            </div>`);

            $(".add-user").click(function(event){
                event.stopImmediatePropagation();
                document.body.insertAdjacentHTML("afterbegin", `
                <div class="third-layer-overlay">
                    <div class="tlo-wrapper pt-5" style="min-width:400px;position:relative;">
                        ${close_icon}
                        <p class="text-white text-center" style="font-size:20px;">ADD USER</p>
                        <hr>
                        <div style="display:flex;flex-direction:column;color:#fff;">
                            <span>Name:</span>
                            <form id="addUserForm">
                            <input type="text" placeholder="Enter name" name="name"/>
                            <span>Username: (login details)</span>
                            <input type="text" placeholder="Enter username" name="username"/>
                            <span>Password: (login details)</span>
                            <input type="password" placeholder="Enter password" name="password"/>
                            <span>Permissions: (HOLD CTRL to select multiple)</span>
                            <select name="permission" multiple>
                                <option value="view machines">Add branch</option>
                                <option value="add staff">Add staff</option>
                                <option value="edit staff">Edit staff</option>
                                <option value="logs">Logs</option>
                                <option value="payroll">Payroll</option>
                                <option value="view staffs">View staffs</option>
                            </select>
                            </form>
                            <br>
                            <input type="button" value="ADD USER"/>
                        </div>
                    </div>
                </div>`);

                $("input[type='button']").click(function(event){
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    let data = new FormData(document.getElementById("addUserForm"));
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

                    let arr = [];
                    if (typeof formDataObject.permission !== 'object') {
                        arr.push(formDataObject.permission);
                        formDataObject['permission'] = arr;
                    }

                    if (!isNotEmpty) {
                        errorNotification("Fields must be filled out.", "warning");
                    } else {
                        $.ajax({
                            type: 'POST',
                            url: '../php/add_user.php',
                            data: {
                                name: formDataObject.name,
                                username: formDataObject.username,
                                password: formDataObject.password,
                                permission: JSON.stringify(formDataObject.permission)
                            },success: function(res) {
                                if (res == 'success') {
                                    successNotification("User added successfully.", "success");
                                    $(".third-layer-overlay").remove();
                                } else if (res == 'username exists') {
                                    errorNotification("Username already exists.", "danger");
                                }
                            }
                        });
                    }
                })

                $(".close-window").click(function(event){
                    event.stopImmediatePropagation();
                    $(".third-layer-overlay").remove();
                })

            })

            $(".close-window").click(function(event){
                event.stopImmediatePropagation();
                $(".pop-up-window").remove();
            })
        }
    })
    
})

$(".view-machines").click(function(event){
    event.stopImmediatePropagation();
    let content = "";

    $.ajax({
        type: 'POST',
        url: '../php/fetch_machines.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
                for (let i = 0; i < res.length; i++) {
                    content += `
                    <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                        <td>${res[i].branch_name}</td>
                        <td>${res[i].machine_id}</td>
                    </tr>`;
                }

            } catch(err) {
                content += `
                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
                    <td colspan="2" style="text-align:center;padding:10px 0;">No item.</td>
                </tr>`;
            }

            document.body.insertAdjacentHTML("afterbegin", `
            <div class="pop-up-window">
                <div class="window-content pt-5" style="position:relative;min-width:25vw;">
                    ${close_icon}
                    <p class="text-center text-white" style="font-size:20px;">BRANCH (${COMPANY_NAME})</p>
                    <button class="action-button add-branch">Add branch</button>
                    <hr>
                    <div style="max-height:250px;overflow:auto;">
                        <table>
                            <thead>
                                <tr>
                                    <td>BRANCH</td>
                                    <td>MACHINE ID</td>
                                </tr>
                            </thead>
                            ${content}
                        </table>
                    </div>
                </div>
            </div>`);

            $(".close-window").click(function(event){
                event.stopImmediatePropagation();
                $(".pop-up-window").remove();
            })

            $(".add-branch").click(function(event){
                event.stopImmediatePropagation();
                document.body.insertAdjacentHTML("afterbegin", `
                <div class="third-layer-overlay">
                    <div class="tlo-wrapper pt-5" style="min-width:400px;position:relative;">
                        ${close_icon}
                        <p class="text-white text-center" style="font-size:20px;">ADD BRANCH</p>
                        <hr>
                        <div style="display:flex;flex-direction:column;color:#fff;">
                            <form id="addBranchForm">
                            <span>BRANCH NAME:</span>
                            <input type="text" placeholder="Enter name" name="name"/>
                            <span>SCAN MACHINE:</span>
                            <input type="text" value="${MACHINEID}" id="machine-text" readonly placeholder="Waiting to scan.." name="machine"/>
                            </form>
                            <br>
                            <input type="button" value="ADD BRANCH"/>
                        </div>
                    </div>
                </div>`);

                $("input[type='button']").click(function(event){
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    let data = new FormData(document.getElementById("addBranchForm"));
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
                        url: '../php/add_machine.php',
                        data: {
                            machine: '3209586263',//formDataObject.machine,
                            branch: formDataObject.name
                        }, success: function(res) {
                            if (res == 'success') {
                                successNotification("New branch created successfully.", "success");
                                $(".third-layer-overlay").remove();
                            } else if (res == 'branch exists') {
                                errorNotification("Branch already exists.", "danger");
                            }
                        }
                    })

                })

                $(".close-window").click(function(event){
                    event.stopImmediatePropagation();
                    $(".third-layer-overlay").remove();
                })

            });
        }
    });
})