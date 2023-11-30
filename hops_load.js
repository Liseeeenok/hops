hops_load = document.getElementById('hops_load');
hops_load.innerHTML = '<table id="table" class="table"></table><div id="popup_back_div"></div><div id="popup_div" class="popup_div"></div><div id="popup_div_2"></div>';
//---------------[HTML]---------------
table = document.getElementById('table'); //Получение html элемента таблицы
//input_start_date = document.getElementById('input_start_date'); //Инпут даты с которой показывать МП
popup_div = document.getElementById('popup_div'); //Див всплывающего popup'а
popup_div_2 = document.getElementById('popup_div_2'); //Див второго всплывающего popup'а
popup_back_div = document.getElementById('popup_back_div') //Див затемнения
//------------------------------------
if (window.innerWidth > 1000) {
    count_day = 5; //Кол-во дней для запроса
} else if (window.innerWidth > 940) {
    count_day = 4; //Кол-во дней для запроса
} else if (window.innerWidth > 767) {
    count_day = 3; //Кол-во дней для запроса
} else {
    count_day = 2; //Кол-во дней для запроса
}
start_day = ""; //Начальный день для импута
difference_day = 0; //Изменение дней для листалок
arr_nested_activities = []; //Массив вложенных мероприятий
createTable(start_day, difference_day, count_day);
function createTable(start_day, difference_day, count_day) { //Функция создания таблицы (день с которого начинать, разница в днях, кол-во дней)
    if (start_day == "") {
        dt = new Date(); //Начальный день
        dtz = new Date(); //День для запроса
    } else {
        dt = new Date(start_day); //Начальный день
        dtz = new Date(start_day); //День для запроса
    }
    dt.setDate(dt.getDate() + difference_day); //Дни с учетом скролла
    dtz.setDate(dtz.getDate() + difference_day);
    st_dt = dtz.toLocaleDateString(); //Начальный день
    dtz.setDate(dtz.getDate() + count_day);
    end_dt = dtz.toLocaleDateString(); //Конечный день
    html = "";
    tds = "";
    arr_day = [];
    tds += "<td class='navigation_arrows' style='width: 25px;' onclick='flippingTable(-1)'>" + "<image class='navigation_arrows_left' src='https://hops.mypew.ru/images/arrow.png'>" + "</td>";
    tds += "<td class='tdh' style='width: 70px;'>" + "Номер зала" + "</td>";
    for (i = 0; i < count_day; i++) {
        tds += "<td class='tdh'><table class='table_in'><tr><td>" + dt.toLocaleDateString() + "</td></tr><tr><td>" + name_day(dt.getDay()) + "</td></tr></table></td>";
        arr_day.push(dt.toLocaleDateString().substr(6, 4) + '-' + dt.toLocaleDateString().substr(3, 2) + '-' + dt.toLocaleDateString().substr(0, 2));
        dt.setDate(dt.getDate() + 1);
    }
    tds += "<td style='width: 25px;' onclick='flippingTable(1)'>" + "<image class='navigation_arrows_right' src='https://hops.mypew.ru/images/arrow.png'>" + "</td>";
    html += "<tr>" + tds + "</tr>";
    table.innerHTML = html;
    url = `https://mypew.ru:4502/request?date_start=${st_dt}&date_finish=${end_dt}`;
    axios.get(url).then(res => {
        data = res.data;
        html = "";
        for (i in data) {
            tds = "";
            tds += "<td></td><td class='td'>" + i + "</td>";
            for (let j = 0; j < count_day; j++) {
                tds += `<td class='td' style="padding: 5px 7px 15px 7px; vertical-align: top;" onclick='open_reg_info(event, ${i}, "${arr_day[j]}")'>`; //open_reg_info
                if (data[i][arr_day[j]] != undefined) {
                    for (c in data[i][arr_day[j]]) {
                        padding = 12;
                        tds += `<div 
                        class='die' 
                        onclick='open_event_info(event, ${i}, "${arr_day[j]}", ${c})'
                        style='background-color: #${data[i][arr_day[j]][c].color};padding: ${padding}px 0px ${padding}px 10px; max-height: 90px; overflow: auto; box-shadow: #6f6f6f 0px 0px 7px 0px; border-style: none;'
                        onmouseover='this.style.boxShadow="0px 0px 10px 0px #${data[i][arr_day[j]][c].color}"; this.style.scale=1.02'
                        onmouseout='this.style.boxShadow="#6f6f6f 0px 0px 7px 0px"; this.style.scale=""'
                        >` + data[i][arr_day[j]][c].time.substr(0, 5) + " " + data[i][arr_day[j]][c].event_name + "</div>";
                    }
                }
                tds += "</td>";
            }
            html += "<tr>" + tds + "</tr>";
        }
        table.innerHTML = table.innerHTML + html;
    });
}

function name_day(i) {
    switch (i) {
        case 1: return 'Понедельник';
        case 2: return 'Вторник';
        case 3: return 'Среда';
        case 4: return 'Четверг';
        case 5: return 'Пятница';
        case 6: return 'Суббота';
        case 0: return 'Воскресенье';
    }
}

function flippingTable(increment) {
    table.innerHTML = "";
    difference_day += increment * count_day;
    createTable(start_day, difference_day, count_day);
}

function open_event_info(event, i, day, c) {
    event.stopPropagation();
    arr_nested_activities = data[i][day][c].event_nested;
    list_nested_activities = "";
    if (arr_nested_activities.length != 0) {
        list_nested_activities = `<tr><td><text>Вложенные мероприятия:</text></td><td>`;
        for (j in arr_nested_activities) {
            list_nested_activities += `<div class="die_nested" style="background-color: #${arr_nested_activities[j].color}" onclick="openBook2Read(event, ${j})">${arr_nested_activities[j].time_start}-${arr_nested_activities[j].time_end} ${arr_nested_activities[j].event_name}</div>`;
        }
        list_nested_activities += `</td></tr>`;
    }
    popup_back_div.innerHTML = `<div class="popup_back" id="popup_back"></div>`;
    popup_div.innerHTML = `
    <div class="popup" id="popup">
        <div class="exit">
            <div>
                <h1>Описание мероприятия</h1>
            </div>
            <div class="exit_div" onclick='closePopup(event)'>
                <h1>X</h1>
            </div>
        </div>
        <div class="event_info">
            <div>
                <table>
                    <tr>
                        <td><text>Номер зала: </text></td>
                        <td class="output_date">${i}</td>
                    </tr>
                    <tr>
                        <td><text>Дата проведения: </text></td>
                        <td class="output_date">${day}</td>
                    </tr>
                    <tr>
                        <td><text>Время начала: </text></td>
                        <td class="output_date">${data[i][day][c].time.substr(0, 5)}</td>
                    </tr>
                    <tr>
                        <td><text>Тип мероприятия: </text></td>
                        <td class="output_date">${data[i][day][c].event_type}</td>
                    </tr>
                    <tr>
                        <td><text>Название мероприятия: </text></td>
                        <td class="output_date">${data[i][day][c].event_name}</td>
                    </tr>
                    <tr>
                        <td><text>Спикер: </text></td>
                        <td class="output_date">${data[i][day][c].speaker_fio}</td>
                    </tr>
                    <tr>
                        <td><text>Описание мероприятия:</text></td>
                        <td class="output_date">${data[i][day][c].event_description}</td>
                    </tr>
                    ${list_nested_activities}
                </table>
            </div>
        </div>
    </div>`;
    popup = document.getElementById('popup');
    popup_back = document.getElementById('popup_back');
    popup.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

function openBook2Read(event, index) {
    event.stopPropagation();
    popup_div_2.innerHTML = `
    <div class="popup_back" id="popup_back_2"></div>
    <div class="popup_2" id="popup_2">
        <div class="exit">
            <div><h1>Описание мероприятия</h1></div>
            <div class="exit_div" onclick='closePopup2(event)'><h1>X</h1></div>
        </div>
        <div class="event_info">
            <div>
                <table>
                    <tr>
                        <td><text>Время начала: </text></td>
                        <td><text>${arr_nested_activities[index].time_start}</text></td>
                    </tr>
                    <tr>
                        <td><text>Время окончания: </text></td>
                        <td><text>${arr_nested_activities[index].time_end}</text></td>
                    </tr>
                    <tr>
                        <td><text>Тип мероприятия: </text></td>
                        <td><text>${arr_nested_activities[index].event_type}</text></td>
                    </tr>
                    <tr>
                        <td><text>Название мероприятия: </text></td>
                        <td><text>${arr_nested_activities[index].event_name}</text></td>
                    </tr>
                    <tr>
                        <td><text>Спикер: </text></td>
                        <td><text>${arr_nested_activities[index].speaker_fio}</text></td>
                    </tr>
                    <tr>
                        <td><text>Описание мероприятия:</text></td>
                        <td><text>${arr_nested_activities[index].event_description}</text></textarea></td>
                    </tr>
                </table>
            </div>
        </div>
    </div>`;
    popup_2 = document.getElementById('popup_2');
    popup_back_2 = document.getElementById('popup_back_2');
    popup_2.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    popup_back_2.addEventListener('click', (event) => {
        event.stopPropagation();
        popup_div_2.innerHTML = "";
    });
}

function closePopup2(event) {
    event.stopPropagation();
    popup_div_2.innerHTML = '';
}

function closePopup(event) {
    event.stopPropagation();
    popup_div.innerHTML = '';
    arr_nested_activities = [];
    popup_back_div.innerHTML = '';
}

function open_reg_info(event, i, day) {
    popup_back_div.innerHTML = `<div class="popup_back" id="popup_back"></div>`;
    popup_div.innerHTML = `<div class="popup" id="popup">
            <div class="exit">
                <div><h1>Бронирование залов</h1></div>
                <div class="exit_div" onclick='closePopup(event)'><h1>X</h1></div>
            </div>
            <div class="event_info">
                <div>
                    <table>
                        <tr>
                            <td><text>Для бронирования зала требуется авторизация</text></td>
                        </tr>
                    </table>
                </div>
                <div class="button_div">
                    <a href="https://hops.mypew.ru/authorization/sign_in.html" class="button_book">Войти</a>
                </div>
            </div>`;
    event.stopPropagation();
    popup = document.getElementById('popup');
    popup_back = document.getElementById('popup_back');
    popup.addEventListener('click', (event) => {
        event.stopPropagation();
    })
    /*
    popup_back.addEventListener('click', (event) => {
        closePopup(event);
    });
    */

};