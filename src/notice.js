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
                            let content = "";
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
                                                    <button class="action-button solve" data-name="${res[i].name}" data-pos="${res[i].position}" data-dept="${res[i].department}" data-serialnumber="${res[i].serialnumber}" data-date="${res[i].date}">RESOLVE</button>
                                                </td>
                                            </tr>
                                        `;
                                    }
                                    
                                } catch(err){
                                    console.log(err);
                                }
    
                                document.body.insertAdjacentHTML("afterbegin", `
                                <div class="pop-up-window">
                                    <div class="window-content">
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
    
                                            const year = dateObject.getFullYear();
                                            const month = dateObject.getMonth() + 1; // Adding 1 to get the correct month
                                            const day = dateObject.getDate();
    
                                            // Format the date string
                                            const dateString = `${year}-0${month}-0${day}`;
    
                                            var totalHoursWorked;
                                            var timeOut;

    
                                            document.body.insertAdjacentHTML("afterbegin", `
                                            <div class="third-layer-overlay">
                                                <div class="tlo-wrapper pt-5" style="min-width:400px;color:#fff;">
                                                    <p class="text-white text-center" style="font-size:20px;">RESOLVE NOTICE</p>
                                                    <hr>
                                                    <form style="width:100%;display:flex;flex-direction:column;" id="noticeForm">
                                                        <span id="hr" class="text-center">(hours worked)</span>
                                                        <br>
                                                        <span>FROM:</span>
                                                        <input type="text" value="${timeString}" readonly/>
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
    
                                                const startTimestamp = new Date(res).getTime();
                                                const endTimestamp = new Date(timeOut).getTime();
    
                                                // Calculate the difference between the two timestamps in milliseconds
     

                                                var elapsedTime = endTimestamp - startTimestamp;

                                                // Calculate total hours worked
                                                totalHoursWorked = elapsedTime / (1000 * 60 * 60);
                                                $("#hr").html(totalHoursWorked.toFixed(2) + " hrs");

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
                                                        name: name,
                                                        pos: pos,
                                                        dept: dept,
                                                        status: "OUT",
                                                        timein: res,
                                                        timeout: timeOut,
                                                        date: date,

                                                    },success: function(res){
                                                        console.log("attendance: " + res);
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
                                                                    console.log("delete: " + res);
                                                                    console.log(res);
                                                                }
                                                            })
                                                            
                                                            
                                                        }
                                                    }
                                                })
    
                                            })
    
                                            $(".third-layer-overlay").on("click", function(event){
                                                $(this).remove();
                                            })
                
                                            $(".tlo-wrapper").on("click", function(event){
                                                event.stopImmediatePropagation();
                                            })
                                        }
                                    })
                                    
                                    
                                })
    
                                $(".pop-up-window").on("click", function(event){
                                    $(this).remove();
                                })
    
                                $(".window-content").on("click", function(event){
                                    event.stopImmediatePropagation();
                                })
                            }
                        })
    
                        
                    })
                }
            }
        })
    }
    

   

    
});