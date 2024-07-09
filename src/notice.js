var close_icon = `
<div class="close-window" style="position:absolute;right:-40px;top:-40px;cursor:pointer;">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#fff" class="bi bi-x-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
</div>`;

var BRANCH;

let num_of_notice = 0;
let ot_app = 0;
let missed_out = 0;
let early_app = 0;

var current_user;

$(document).ready(function() {
    $.ajax({
        type: 'POST',
        url: '../php/get_user_name.php',
        success: function(res) {
            current_user = res;
        }
    })

    $.ajax({
        type: 'GET',
        url: '../php/checksameday.php',
        success: function(res){
            res = JSON.parse(res);

            if (res.message.includes('not')) {
                $.ajax({
                    type: 'POST',
                    url: '../php/check_status_for_notice.php',
                    data: {
                        date: res.date,
                    }, success: function(res){
                        try {
                            res = JSON.parse(res);
                  
                            res = JSON.stringify(res);
                            
                            $.ajax({
                                type: 'POST',
                                url: '../php/add_notice.php',
                                data: {
                                    data: res,
                                },
                                success: function(res){
                                    //checkNotice();
                                }
                            })

                        } catch(err) {
                            console.log(err);
                        }
                    }
                })
            }
        }
    })

    $.ajax({
        type: 'POST',
        url: '../php/fetch_machines.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
                BRANCH = res;
            } catch (err) {
                console.log(err);
            }
        }
    })

    
    $.ajax({
        type: 'GET',
        url: '../php/check_notice.php',
        success: function(res){
            let noticeCount = parseInt(res);

            num_of_notice += noticeCount;
            missed_out += noticeCount;

            $.ajax({
                type: 'POST',
                url: '../php/fetch_ot_approvals.php',
                success: function(res) {
                    try {
                        res = JSON.parse(res);
                        ot_app += res.length;
                        num_of_notice += res.length;
                    } catch(err) {
                        console.log(err);
                    }

                    $.ajax({
                        type: 'POST',
                        url: '../php/fetch_early_in_approvals.php',
                        success: function(res) {
                            let res2;
                            try {
                                res2 = JSON.parse(res);
                                num_of_notice += res2.length;
                                early_app += res2.length;
                            } catch (err) {
                                console.log(err);
                            }

                            if (num_of_notice > 0) {

                                document.body.insertAdjacentHTML("afterbegin", `
                                <div id="notice" style="position:fixed;bottom:30px;right:40px;z-index:2;color:orange;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                                    </svg>
                                    <span class="tooltiptext">Notice!</span>
                                </div>`);
                                
                                setTimeout(() => {
                                    $(".tooltiptext").css("visibility", "hidden");
                                }, 5000);
    
                                $("#notice").click(function(event){
                                    event.stopImmediatePropagation();

                                    document.body.insertAdjacentHTML("afterbegin", `
                                    <div class="pop-up-window">
                                        <div class="window-content" style="position:relative;padding-bottom:50px;">
                                            ${close_icon}
                                            <p class="text-center text-white" style="font-size:20px;">NOTICE</p>
                                            <br>
                                            <div class="notice-divs" style="min-width:20vw;">
                                                <div class="missed-out" style="border-top:1px solid rgba(0,0,0,0.1);">Missed time out <span id="missed-out">0</span></div>
                                                <div class="ot-app">Overtime approval <span id="ot-app">0</span></div>
                                                <div class="early-in-app">Early in approval <span id="early-in-app">0</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    `);
    
                                    $("#missed-out").html(missed_out);
                                    $("#ot-app").html(ot_app);
                                    $("#early-in-app").html(early_app);


                                    $(".close-window").click(function(event){
                                        $(".pop-up-window").remove();
                                    })

                                    $(".early-in-app").click(function(event){
                                        event.stopImmediatePropagation();
                                        $(".pop-up-window").remove();

                                        let content = "";
                                        try {
                                            for (let i = 0; i < res2.length; i++) {

                                                const dateObject2 = new Date(res2[i].timed_in);
    
                                                const hours2 = dateObject2.getHours();
                                                const minutes2 = dateObject2.getMinutes();
                                                const seconds2 = dateObject2.getSeconds();
    
    
                                                const meridian2 = hours2 >= 12 ? 'PM' : 'AM';
    
                                                // Convert hours to 12-hour format
                                                const hours122 = hours2 % 12 || 12; // 0 should be represented as 12 in 12-hour format
    
                                                const timeIn12HourFormat = `${hours122}:${minutes2} ${meridian2}`;
    
                                                let br;
                                                for (let k = 0; k < BRANCH.length; k++) {
                                                    if (BRANCH[k].machine_id == res2[i].branch) {
                                                        br = BRANCH[k].branch_name;
                                                    }
                                                }
    
                                                content += `
                                                <tr id="row${i}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                    <td>${res2[i].name}</td>
                                                    <td>${timeIn12HourFormat}</td>
                                                    <td>${res2[i].early_in_mins} (mins)</td>
                                                    <td>${res2[i].pay}</td>
                                                    <td>${res2[i].date}</td>
                                                    <td>${br}</td>
                                                    <td>
                                                        <button data-branch="${res2[i].branch}" data-indx="${i}" data-id="${res2[i].id}" data-snumber="${res2[i].serialnumber}" data-sid="${res2[i].row_id}" class="action-button approve" data-name="${res2[i].name}">Approve</button>
                                                        <button data-branch="${res2[i].branch}" data-indx="${i}" data-id="${res2[i].id}" data-snumber="${res2[i].serialnumber}" data-sid="${res2[i].row_id}" class="action-button ml-2 dismiss" data-name="${res2[i].name}">Dismiss</button>
                                                    </td>
                                                </tr>`;
                                            }
                                        } catch (err) {
                                            content += `<tr>
                                            <td colspan="7" style="text-align:center;padding:10px 0;">No item</td>
                                            </tr>`;
                                        }
                                        

                                        document.body.insertAdjacentHTML("afterbegin", `
                                        <div class="pop-up-window">
                                            <div class="window-content" style="position:relative;">
                                                ${close_icon}
                                                <p class="text-center text-white" style="font-size:20px;">EARLY IN APPROVALS<br><span style="color:orange;font-size:15px;">Note: This will be added to overtime pay.</span></p>
                                                <br>
                                                
                                                <div class="table-container" style="min-width:35vw;max-height:60vh;overflow:auto;max-width:70vw;">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <td>NAME</td>
                                                                <td>TIMED IN</td>
                                                                <td>MINUTES EARLY</td>
                                                                <td>EARLY IN PAY</td>
                                                                <td>DATE</td>
                                                                <td>BRANCH</td>
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

                                        $(".approve").click(function(event){
                                            event.stopImmediatePropagation();
                                            let idx = $(this).data("indx");
                                            let id = $(this).data("id");
                                            let serial = $(this).data("snumber");
                                            let branch = $(this).data("branch");

                                            let name = $(this).data("name");

                                            $.ajax({
                                                type: 'POST',
                                                url: '../php/approve_early_in.php',
                                                data: {
                                                    branch: branch,
                                                    serial: serial,
                                                    id: id
                                                },success:function(res) {
                                                    if (res == 'approved') {
                                                        $(`#row${idx}`).remove();
                                                        successNotification("Approved.", "success");

                                                        $.ajax({
                                                            type: 'POST',
                                                            url: '../php/add_log.php',
                                                            data: {
                                                                log: `Approved ${name} early in pay.`,
                                                                branch: branch,
                                                                user: current_user
                                                            },success: function(log_res) {
                                                                
                                                            }
                                                        })

                                                    }
                                                }
                                            })
                                        })

                                        $(".close-window").click(function(event){
                                            $(".pop-up-window").remove();
                                        })

                                        $(".dismiss").click(function(event){
                                            event.stopImmediatePropagation();
                                            let idx = $(this).data("indx");
                                            let id = $(this).data("id");
                                            let serial = $(this).data("snumber");
                                            let branch = $(this).data("branch");

                                            let name = $(this).data("name");

                                            $.ajax({
                                                type: 'POST',
                                                url: '../php/dismiss_early_in.php',
                                                data: {
                                                    branch: branch,
                                                    serial: serial,
                                                    id: id
                                                },success:function(res) {
                                                    if (res == 'dismissed') {
                                                        $(`#row${idx}`).remove();
                                                        successNotification("Dismissed.", "success");

                                                        $.ajax({
                                                            type: 'POST',
                                                            url: '../php/add_log.php',
                                                            data: {
                                                                log: `Dismissed ${name} early in pay.`,
                                                                branch: branch,
                                                                user: current_user
                                                            },success: function(log_res) {
                                                                
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        })
                                        
                                    })

                                    $(".ot-app").click(function(event){
                                        event.stopImmediatePropagation();
                                        $(".pop-up-window").remove();

                                        $.ajax({
                                            type: 'POST',
                                            url: '../php/fetch_ot_approvals.php',
                                            success: function(res) {
                                                let content = "";
                                                try {
                                                    res = JSON.parse(res);
                                                    
                                                    for (let i = 0; i < res.length; i++) {


                                                        const dateObject = new Date(res[i].timed_out);
                                                        const dateObject2 = new Date(res[i].timed_in);
                                                        // Get hours, minutes, and seconds
                                                        const hours = dateObject.getHours();
                                                        const minutes = dateObject.getMinutes();
                                                        const seconds = dateObject.getSeconds();

                                                        const hours2 = dateObject2.getHours();
                                                        const minutes2 = dateObject2.getMinutes();
                                                        const seconds2 = dateObject2.getSeconds();

                                                        // Format the time string
                                                        const timeString = `${hours}:${minutes}:${seconds}`;

                                                        const meridian = hours >= 12 ? 'PM' : 'AM';

                                                        // Convert hours to 12-hour format
                                                        const hours12 = hours % 12 || 12; // 0 should be represented as 12 in 12-hour format


                                                        const timeString2 = `${hours2}:${minutes2}:${seconds2}`;

                                                        const meridian2 = hours2 >= 12 ? 'PM' : 'AM';

                                                        // Convert hours to 12-hour format
                                                        const hours122 = hours2 % 12 || 12; // 0 should be represented as 12 in 12-hour format

                                                        // Combine hours, minutes, and meridian into desired format
                                                        const timeOut12HourFormat = `${hours12}:${minutes} ${meridian}`;
                                                        const timeIn12HourFormat = `${hours122}:${minutes2} ${meridian2}`;
                                                        let br;
                                                        for (let k = 0; k < BRANCH.length; k++) {
                                                            if (BRANCH[k].machine_id == res[i].branch) {
                                                                br = BRANCH[k].branch_name;
                                                            }
                                                        }
                                                        
                                                        content += `
                                                        <tr id="row${i}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                                                            <td>${res[i].name}</td>
                                                            <td>${timeIn12HourFormat}</td>
                                                            <td>${timeOut12HourFormat}</td>
                                                            <td>${res[i].ot_mins} (mins)</td>
                                                            <td>${res[i].ot_pay}</td>
                                                            <td>${res[i].date}</td>
                                                            <td>${br}</td>
                                                            <td>
                                                                <button data-branch="${res[i].branch}" data-indx="${i}" data-id="${res[i].id}" data-snumber="${res[i].serialnumber}" data-sid="${res[i].row_id}" class="action-button approve" data-name="${res[i].name}">Approve</button>
                                                                <button data-branch="${res[i].branch}" data-indx="${i}" data-id="${res[i].id}" data-snumber="${res[i].serialnumber}" data-sid="${res[i].row_id}" class="action-button ml-2 dismiss" data-name="${res[i].name}">Dismiss</button>
                                                            </td>
                                                        </tr>`;
                                                    }
                                                } catch (err) {
                                                    content += `<tr>
                                                        <td colspan="8" style="text-align:center;padding:10px 0;">No item</td>
                                                    </tr>`;
                                                }

                                                document.body.insertAdjacentHTML("afterbegin", `
                                                <div class="pop-up-window">
                                                    <div class="window-content" style="position:relative;">
                                                        ${close_icon}
                                                        <p class="text-center text-white" style="font-size:20px;">OVERTIME APPROVALS</p>
                                                        <div class="table-container" style="max-height:60vh;overflow:auto;max-width:70vw;">
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <td>NAME</td>
                            
                                                                        
                                                                        <td>TIMED IN</td>
                                                                        <td>TIMED OUT</td>
                                                                        <td>OVERTIME</td>
                                                                        <td>OVERTIME PAY</td>
                                                                        <td>DATE</td>
                                                                        <td>BRANCH</td>
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

                                                $(".approve").click(function(event){
                                                    event.stopImmediatePropagation();
                                                    let rowID = $(this).data("sid");
                                                    let id = $(this).data("id");
                                                    let snumber = $(this).data("snumber");
                                                    let index = $(this).data("indx");
                                                    let branch = $(this).data("branch");

                                                    let name = $(this).data("name");
    
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/approve_overtime.php',
                                                        data: {
                                                            sid: rowID,
                                                            id: id,
                                                            serial: snumber,
                                                            branch: branch
                                                        }, success: function(res2) {
                                                            if (res2 == 'approved') {
                                                                successNotification("Overtime approved.", "success");
                                                                $(`#row${index}`).remove();

                                                                $.ajax({
                                                                    type: 'POST',
                                                                    url: '../php/add_log.php',
                                                                    data: {
                                                                        log: `Approved ${name} overtime pay.`,
                                                                        branch: branch,
                                                                        user: current_user
                                                                    },success: function(log_res) {
                                                                        
                                                                    }
                                                                })
                                                                
                                                                res.splice(parseInt(index), 1);
                                                                if (res.length == 0) {
                                                                    $("#ot-approval").remove();
                                                                }
                                                            }
                                                        }
                                                    })
                                                })
    
                                                $(".dismiss").click(function(event){
                                                    event.stopImmediatePropagation();
                                                    let rowID = $(this).data("sid");
                                                    let id = $(this).data("id");
                                                    let snumber = $(this).data("snumber");
                                                    let index = $(this).data("indx");
                                                    let branch = $(this).data("branch");

                                                    let name = $(this).data("name");
    
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: '../php/approve_overtime.php',
                                                        data: {
                                                            sid: rowID,
                                                            id: id,
                                                            serial: snumber,
                                                            dismissed: 'dismissed',
                                                            branch: branch
                                                        
                                                        }, success: function(res2) {
                                                            if (res2 == 'approved') {
                                                                successNotification("Dismissed.", "success");
                                                                $(`#row${index}`).remove();

                                                                $.ajax({
                                                                    type: 'POST',
                                                                    url: '../php/add_log.php',
                                                                    data: {
                                                                        log: `Dismissed ${name} overtime pay.`,
                                                                        branch: branch,
                                                                        user: current_user
                                                                    },success: function(log_res) {
                                                                        
                                                                    }
                                                                })
                                                                
                                                                res.splice(parseInt(index), 1);
                                                                if (res.length == 0) {
                                                                    $("#ot-approval").remove();
                                                                }
                                                            }
                                                        }
                                                    })
                                                })
    
                                                $(".close-window").click(function(event){
                                                    event.stopImmediatePropagation();
                                                    $(".pop-up-window").remove();
                                                })
                                            }
                                        })
                                        

                                        
                                        

                                        

                                        
                                    })

                                    $(".missed-out").click(function(event){
                                        event.stopImmediatePropagation();
                                        $(".pop-up-window").remove();
                                        let content = "";
                    
                                        $.ajax({
                                            type: 'GET',
                                            url: '../php/fetch_notice.php',
                                            success: function(res){
                                                try {
                                                    res = JSON.parse(res);

                                                    for (let i = 0; i < res.length; i++) {
                                                        let br;
                                                        for (let k = 0; k < BRANCH.length; k++) {
                                                            if (res[i].branch == BRANCH[k].machine_id) {
                                                                br = BRANCH[k].branch_name;
                                                                break;
                                                            }
                                                        }

                                                        content += `
                                                            <tr id="notice-row${res[i].serialnumber}" style="border-bottom: 1px solid rgba(0,0,0,0.1);">
                                                                <td>${res[i].name}</td>
                                                                <td>${res[i].contact_number}</td>
                                                                
                                                                <td>${res[i].date}</td>
                                                                <td>${br}</td>
                                                                <td class="text-center">
                                                                    <button class="action-button solve" data-branch="${res[i].branch}" data-class="${res[i].class}" data-name="${res[i].name}" data-pos="${res[i].position}" data-dept="${res[i].department}" data-serialnumber="${res[i].serialnumber}" data-date="${res[i].date}">RESOLVE</button>
                                                                </td>
                                                            </tr>
                                                        `;
                                                    }
                                                    
                                                } catch(err){
                                                    content += `
                                                    <tr>
                                                        <td colspan="5" style="text-align:center;padding:10px 0;">No item</td>
                                                    </tr>
                                                    `;
                                                }
                    
                                                document.body.insertAdjacentHTML("afterbegin", `
                                                <div class="pop-up-window">
                                                    <div class="window-content" style="position:relative;">
                                                        ${close_icon}
                                                        <p class="text-center text-white" style="font-size:20px;">MISSED TIME OUT</p>
                                                        <div class="table-container" style="min-width:30vw;max-height:60vh;overflow:auto;max-width:70vw;">
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <td>NAME</td>
                                                                        <td>CONTACT</td>
                                                                        
                                                                        <td>DATE</td>
                                                                        <td>BRANCH</td>
                                                                        
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
                    
                                                $(".solve").on("click", function(event){
                                                    event.stopImmediatePropagation();
                                                    let date = $(this).data("date");
                                                    let serialnumber = $(this).data("serialnumber");
                                                    let name = $(this).data("name");
                                                    let pos = $(this).data("pos");
                                                    let dept = $(this).data("dept");
                                                    let branch = $(this).data("branch");
                                                    let _class = $(this).data("class");

                                                    $.ajax({
                                                        type: 'POST',
                                                        url: "../php/get_time_in.php",
                                                        data: {
                                                            date: date,
                                                            serial: serialnumber,
                                                            branch: branch
                                                        }, success: function(res){
                                                            const dateObject = new Date(res);
                    
                                                            // Get hours, minutes, and seconds
                                                            const hours = dateObject.getHours();
                                                            const minutes = dateObject.getMinutes();
                                                            const seconds = dateObject.getSeconds();
                    
                                                            // Format the time string
                                                            const timeString = `${hours}:${minutes}:${seconds}`;

                                                            const meridian = hours >= 12 ? 'PM' : 'AM';

                                                            // Convert hours to 12-hour format
                                                            const hours12 = hours % 12 || 12; // 0 should be represented as 12 in 12-hour format

                                                            // Combine hours, minutes, and meridian into desired format
                                                            const timeIn12HourFormat = `${hours12}:${minutes}:${seconds} ${meridian}`;
                    
                                                            const year = dateObject.getFullYear();
                                                            const month = dateObject.getMonth() + 1; // Adding 1 to get the correct month
                                                            const day = dateObject.getDate();
                    
                                                            // Format the date string
                                                            const dateString = `${year}-0${month}-0${day}`;
                    
                                                            var totalHoursWorked;
                                                            var timeOut;

                    
                                                            document.body.insertAdjacentHTML("afterbegin", `
                                                            <div class="third-layer-overlay">
                                                                <div class="tlo-wrapper pt-5" style="min-width:400px;color:#fff;position:relative;">
                                                                    ${close_icon}
                                                                    <p class="text-white text-center" style="font-size:20px;">RESOLVE NOTICE</p>
                                                                    <hr>
                                                                    <form style="width:100%;display:flex;flex-direction:column;" id="noticeForm">
                                                                        
                                                                        <br>
                                                                        <span>TIME IN:</span>
                                                                        <input type="text" value="${timeIn12HourFormat}" readonly/>
                                                                        <span>ENTER TIME OUT:</span>
                                                                        <input type="time" name="time"/>
                                                                        <br>
                                                                        <input type="submit" value="RESOLVE"/>
                                                                    </form>
                                                                </div>
                                                            </div>`);
                    
                                                            $("input[type='time']").on("change", function(event){
                                                                event.stopImmediatePropagation();
                                                                timeOut = date + ` ${$(this).val()}:00`;
                    
                                                                // const startTimestamp = new Date(res).getTime();
                                                                // const endTimestamp = new Date(timeOut).getTime();
                    
                                                                // // Calculate the difference between the two timestamps in milliseconds
                    

                                                                // var elapsedTime = endTimestamp - startTimestamp;

                                                                // // Calculate total hours worked
                                                                // totalHoursWorked = elapsedTime / (1000 * 60 * 60);
                                                                // $("#hr").html(totalHoursWorked.toFixed(2) + " hrs");

                                                            })
                    
                                                            $("input[type='submit']").on("click", function(event){
                                                                event.preventDefault();
                                                                event.stopImmediatePropagation();
                    
                                                                let data = new FormData(document.getElementById("noticeForm"));
                                                                var formDataObject = {};
                                                                data.forEach(function(value, key){
                                                                    formDataObject[key] = value;
                                                                });
                    
                                                                $.ajax({
                                                                    type: 'POST',
                                                                    url: '../php/attendance.php',
                                                                    data: {
                                                                        serialnumber: serialnumber,
                                                                        class: _class,
                                                                        name: name,
                                                                        pos: pos,
                                                                        dept: dept,
                                                                        status: "OUT",
                                                                        timein: res,
                                                                        timeout: timeOut,
                                                                        date: date,
                                                                        branch: branch
                                                                    },success: function(res2){
                                                                        console.log(res2);
                                                                        if (res2 == 'success') {
                                                                            successNotification("Missed time out resolved.", "success");
                                                                            $(".third-layer-overlay").remove();
                                                                            $(`#notice-row${serialnumber}`).remove();
                                                                            $.ajax({
                                                                                type: 'POST',
                                                                                url: '../php/delete_notice.php',
                                                                                data: {
                                                                                    serial: serialnumber,
                                                                                    branch: branch
                                                                                }, success: function(res){
                                                                                    if (res.includes("success")) {
                                                                                        setTimeout(() => {
                                                                                            location.reload();
                                                                                        }, 1500);
                                                                                    }
                                                                                }
                                                                            })
                                                                        }
                                                                    }
                                                                })
                                                            })

                                                            $(".close-window").on("click", function(event){
                                                                $(".third-layer-overlay").remove();
                                                            })
                                                        }
                                                    })
                                                })
                    
                                                $(".close-window").on("click", function(event){
                                                    $(".pop-up-window").remove();
                                                })
                                            }
                                        })
                                    })


                                })
                                
                            }


                        }
                    })
                }
            });
            
        }
    })
 
    
    
});