var close_icon = `
<div class="close-window" style="position:absolute;right:-40px;top:-40px;cursor:pointer;">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#fff" class="bi bi-x-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
</div>`;

$(document).ready(function() {
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
                                    checkNotice();
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

    checkNotice();
    
    function checkNotice() {
        $.ajax({
            type: 'GET',
            url: '../php/check_notice.php',
            success: function(res){
                let noticeCount = parseInt(res);
                if (noticeCount > 0) {
                    document.body.insertAdjacentHTML("afterbegin", `
                    <div id="notice" style="position:fixed;bottom:20px;right:30px;z-index:2;color:orange;">

                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-person-fill-exclamation" viewBox="0 0 16 16">
                            <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                            <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-3.5-2a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5m0 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
                        </svg>
                        <span class="tooltiptext">Notice!</span>
                    </div>`);
    
                    $(".tooltiptext").css("visibility", "visible");
                    setTimeout(() => {
                        $(".tooltiptext").css("visibility", "hidden");
                    }, 5000);
    
    
                    $("#notice").on("click", function(event){
                        event.stopImmediatePropagation();
    
                        let content = "";
    
                        $.ajax({
                            type: 'GET',
                            url: '../php/fetch_notice.php',
                            success: function(res){
                                try {
                                    res = JSON.parse(res);

                                    for (let i = 0; i < res.length; i++) {
                                        content += `
                                            <tr id="notice-row${res[i].serialnumber}" style="border-bottom: 1px solid rgba(0,0,0,0.1);">
                                                <td>${res[i].name}</td>
                                                <td>${res[i].position}</td>
                                                <td>${res[i].department}</td>
                                                <td>${res[i].contact_number}</td>
                                                <td>${res[i].notice_message}</td>
                                                <td>${res[i].date}</td>
                                                <td class="text-center">
                                                    <button class="action-button solve" data-class="${res[i].class}" data-name="${res[i].name}" data-pos="${res[i].position}" data-dept="${res[i].department}" data-serialnumber="${res[i].serialnumber}" data-date="${res[i].date}">RESOLVE</button>
                                                </td>
                                            </tr>
                                        `;
                                    }
                                    
                                } catch(err){
                                    console.log(err);
                                }
    
                                document.body.insertAdjacentHTML("afterbegin", `
                                <div class="pop-up-window">
                                    <div class="window-content" style="position:relative;">
                                        ${close_icon}
                                        <p class="text-center text-white" style="font-size:20px;">NOTICE</p>
                                        <div class="table-container" style="max-height:60vh;overflow:auto;max-width:70vw;">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <td>NAME</td>
                                                        <td>POSITION</td>
                                                        <td>DEPARTMENT</td>
                                                        <td>CONTACT</td>
                                                        <td>NOTICE MESSAGE</td>
                                                        <td>DATE</td>
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
                                    let _class = $(this).data("class");

                                    $.ajax({
                                        type: 'POST',
                                        url: "../php/get_time_in.php",
                                        data: {
                                            date: date,
                                            serial: serialnumber,
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
                                                // timeOut = date + ` ${$(this).val()}:00`;
    
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

                                                    },success: function(res){
                                                        if (res == 'success') {
                                                            successNotification("Missed time out resolved.", "success");
                                                            $(".third-layer-overlay").remove();
                                                            $(`#notice-row${serialnumber}`).remove();
                                                            $.ajax({
                                                                type: 'POST',
                                                                url: '../php/delete_notice.php',
                                                                data: {
                                                                    serial: serialnumber,
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
                }
            }
        })
    }

    $.ajax({
        type: 'POST',
        url: '../php/fetch_ot_approvals.php',
        success: function(res) {
            try {
                res = JSON.parse(res);
               
                document.body.insertAdjacentHTML("afterbegin", `
                <div id="ot-approval" style="position:fixed;bottom:80px;right:30px;z-index:2;color:orange;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-person-fill-check" viewBox="0 0 16 16">
                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                    <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                </svg>
                    <span class="tooltiptext">Approvals!</span>
                </div>`);

                $(".tooltiptext").css("visibility", "visible");
                setTimeout(() => {
                    $(".tooltiptext").css("visibility", "hidden");
                }, 5000);

                $("#ot-approval").click(function(event){
                    event.stopImmediatePropagation();
                    let content = "";
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

                        content += `
                        <tr id="row${i}" style="border-bottom:1px solid rgba(0,0,0,0.1);">
                            <td>${res[i].name}</td>
                            <td>${res[i].position}</td>
                            <td>${res[i].department}</td>
                            <td>${timeIn12HourFormat}</td>
                            <td>${timeOut12HourFormat}</td>
                            <td>${res[i].ot_mins} (mins)</td>
                            <td>${res[i].ot_pay}</td>
                            <td>${res[i].date}</td>
                            <td>
                                <button data-indx="${i}" data-id="${res[i].id}" data-snumber="${res[i].serialnumber}" data-sid="${res[i].row_id}" class="action-button approve">Approve</button>
                                <button data-indx="${i}" data-id="${res[i].id}" data-snumber="${res[i].serialnumber}" data-sid="${res[i].row_id}" class="action-button ml-2 dismiss">Dismiss</button>
                            </td>
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
                                            <td>POSITION</td>
                                            <td>DEPARTMENT</td>
                                            <td>TIMED IN</td>
                                            <td>TIMED OUT</td>
                                            <td>OVERTIME</td>
                                            <td>OVERTIME PAY</td>
                                            <td>DATE</td>
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

                        $.ajax({
                            type: 'POST',
                            url: '../php/approve_overtime.php',
                            data: {
                                sid: rowID,
                                id: id,
                                serial: snumber,
                            }, success: function(res2) {
                                if (res2 == 'approved') {
                                    successNotification("Overtime approved.", "success");
                                    $(`#row${index}`).remove();
                                    
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

                        $.ajax({
                            type: 'POST',
                            url: '../php/approve_overtime.php',
                            data: {
                                sid: rowID,
                                id: id,
                                serial: snumber,
                                dismissed: 'dismissed',
                            
                            }, success: function(res2) {
                                if (res2 == 'approved') {
                                    successNotification("Overtime approved.", "success");
                                    $(`#row${index}`).remove();
                                    
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
                })

            } catch (err) {
                console.log(err);
            }
        }
    })
    
    
});