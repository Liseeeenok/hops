//---------------[AUTH]---------------
url_login = 'https://mypew.ru:4502/login';
url_user = 'https://mypew.ru:4502/user';
url_base = 'https://hops.mypew.ru/';

article = {
    "jwt": localStorage.getItem('token'),
    "method": "select",
    "method_type": "user info"
};
axios.post(url_user, article).then(res_user => {
    console.log(res_user.data);
    if (res_user.data.token_verify) {
        localStorage.setItem('first_name', res_user.data.user.name);
        localStorage.setItem('last_name', res_user.data.user.surname);
        localStorage.setItem('middle_name', res_user.data.user.middle_name);
        localStorage.setItem('phone_number', res_user.data.user.number);
        inp_name = document.getElementById('inp_name');
        inp_name.innerHTML = `${res_user.data.user.name} ${res_user.data.user.surname}`;
        if (res_user.data.user.lvl_access == 2) {
            requests = document.getElementById('requests');
            requests.href = '/requests/requests.html';
            requests.innerHTML = 'Запросы';
            settings = document.getElementById('settings');
            settings.href = '/settings/settings.html';
            settings.innerHTML = 'Настройки';
            users = document.getElementById('users');
            users.href = '/users/users.html';
            users.innerHTML = 'Пользователи';
        }
    } else {
        delete localStorage.token;
        delete localStorage.first_name;
        delete localStorage.last_name;
        delete localStorage.middle_name;
        delete localStorage.phone_number;
        inp_name = document.getElementById('inp_name');
        inp_name.innerHTML = `Войти`;
    }
});
//------------------------------------
//---------------[HTML]---------------
table = document.getElementById('table'); //Получение html элемента таблицы
input_start_date = document.getElementById('input_start_date'); //Инпут даты с которой показывать МП
popup_div = document.getElementById('popup_div'); //Див всплывающего popup'а
popup_div_2 = document.getElementById('popup_div_2'); //Див второго всплывающего popup'а
loader_div = document.getElementById('loader_div'); //Див лоудера
popup_back_div = document.getElementById('popup_back_div') //Див затемнения
//------------------------------------
//---------------[DATA]---------------
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
arr_event_type = []; //Массив типов мероприятий
url_type = 'https://mypew.ru:4502/event_type'; //Апи для типов МП
axios.get(url_type).then(res => { //Запрос на получение типов МП
    arr_event_type = res.data;
    console.log(arr_event_type);
});
arr_number_hall = []; //Массив номеров залов
url_hall = 'https://mypew.ru:4502/hall'; //Апи для номеров залов
axios.get(url_hall).then(res => { //Запрос на получение
    arr_number_hall = res.data;
});
//------------------------------------
input_start_date.addEventListener('change', () => { //Прослушиваем изменение даты в инпуте
    table.innerHTML = ""; //Обнуляем таблицу
    start_day = input_start_date.value; //Находим начальную дату
    difference_day = 0; //Обнуляем изменение даты
    createTable(start_day, difference_day, count_day); //Перерисовывание таблицу
});
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
    input_start_date.value = `${dt.toJSON().substr(0, 10)}`;
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
    console.log(arr_day)
    tds += "<td style='width: 25px;' onclick='flippingTable(1)'>" + "<image class='navigation_arrows_right' src='https://hops.mypew.ru/images/arrow.png'>" + "</td>";
    html += "<tr>" + tds + "</tr>";
    table.innerHTML = html;
    url = `https://mypew.ru:4502/request?date_start=${st_dt}&date_finish=${end_dt}`;
    axios.get(url).then(res => {
        data = res.data;
        console.log(res.data);
        html = "";
        for (i in data) {
            tds = "";
            tds += "<td></td><td class='td'>" + i + "</td>";
            height_tr = 190; //Высота ячейки
            for (let j = 0; j < count_day; j++) {
                if (data[i][arr_day[j]] != undefined) {
                    count_die = data[i][arr_day[j]].length; //Кол-во плашек в ячейке
                    height_die = Math.max(35, (height_tr / count_die) - 5); //Высота плашек
                    height_die = Math.min(90, height_die); //Высота плашек
                }
                tds += `<td class='td' style="padding: 5px 7px 15px 7px; vertical-align: top;" onclick='open_reg_info(event, ${i}, "${arr_day[j]}")'>`;
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
    loader_div.innerHTML = "";
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

function open_event_info(event, i, day, c) {
    console.log(data[i][day][c])
    arr_nested_activities = data[i][day][c].event_nested;
    list_nested_activities = "";
    if (arr_nested_activities.length != 0) {
        list_nested_activities = `<tr><td class="up_cell"><text>Вложенные мероприятия:</text></td><td>`;
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
}

function open_reg_info(event, i, day) {
    article = {
        "jwt": localStorage.getItem('token'),
        "method": "select",
        "method_type": "user info"
    };
    axios.post(url_user, article).then(res_user => {
        console.log(res_user.data);
        if (!res_user.data.token_verify) {
            delete localStorage.token;
            delete localStorage.first_name;
            delete localStorage.last_name;
            delete localStorage.middle_name;
            delete localStorage.phone_number;
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
            return;
        } else {
            select = `<select class="input_date" id="input_event_type">`;
            for (j in arr_event_type) {
                select += `<option value="${arr_event_type[j].name}">${arr_event_type[j].name}</option>`;
            }
            select += `</select>`;
            select_hall = `<select class="input_date" id="input_number">`;
            for (j in arr_number_hall) {
                select_hall += `<option value="${arr_number_hall[j].number}">${arr_number_hall[j].number}</option>`;
            }
            select_hall += `</select>`;
            popup_back_div.innerHTML = `<div class="popup_back" id="popup_back"></div>`;
            popup_div.innerHTML = `
            <div class="popup" id="popup">
                <div class="exit">
                    <div>
                        <h1>Бронирование залов</h1>
                    </div>
                    <div class="exit_div" onclick='closePopup(event)'>
                        <h1>X</h1>
                    </div>
                </div>
                <div class="event_info">
                    <div>
                        <table>
                            <tr>
                                <td><text>Номер зала<mark>*</mark>: </text>
                            </td>
                            <td>${select_hall}</td>
                        </tr>
                        <tr>
                            <td><text>Дата проведения<mark>*</mark>: </text></td>
                            <td><input class="input_date" type="date" value="${day}" id="input_date"/></td>
                        </tr>
                        <tr>
                            <td><text>Время начала<mark>*</mark>: </text></td>
                            <td><input class="input_date" type="time" value="08:00" id="input_start_time"/></td>
                        </tr>
                        <tr>
                            <td><text>Время окончания: </text></td>
                            <td><input class="input_date" type="time" id="input_end_time"/></td>
                        </tr>
                        <tr>
                            <td><text>Тип мероприятия<mark>*</mark>: </text></td>
                            <td>${select}</td>
                        </tr>
                        <tr>
                            <td><text>Название мероприятия<mark>*</mark>: </text></td>
                            <td><textarea class="input_date" cols="40" rows="3" id="input_event_name"/></textarea></td>
                        </tr>
                        <tr>
                            <td><text>Спикер: </text></td>
                            <td><input class="input_date" style="width: 100%;" type="text" id="input_speaker"/></td>
                        </tr>
                        <tr>
                            <td><text>Описание мероприятия:</text></td>
                            <td><textarea class="input_date" cols="40" rows="5" id="input_description"/></textarea></td>
                        </tr>
                        <tr>
                            <td><text>ФИО ответственного: </text></td>
                            <td><input class="input_date" style="width: 100%;" type="text" id="input_responsible" value="${localStorage.getItem('last_name')} ${localStorage.getItem('first_name')} ${localStorage.getItem('middle_name')}"/></td>
                        </tr>
                        <tr>
                            <td><text>Телефон: </text></td>
                            <td><input class="input_date" style="width: 100%;" type="text" id="input_phone_number" value="${localStorage.getItem('phone_number')}"/></td>
                        </tr>
                        <tr>
                            <td class="up_cell"><text>Вложенные мероприятия:</text></td>
                            <td id="nested_activities"></td>
                        </tr>
                    </table>
                </div>
                <div class="button_div">
                    <button onclick="book(event)" class="button_book">Забронировать</button>
                </div>
            </div>`;
            nested_activities = document.getElementById('nested_activities');
            add_nested_activities = `<div class="die_nested" onclick="addNestedActivities(event)">+ добавить вложенное мероприятие</div>`;
            nested_activities.innerHTML = add_nested_activities;
            input_number = document.getElementById('input_number');
            input_number.value = i;
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
        }
    });
}

function flippingTable(increment) {
    table.innerHTML = "";
    difference_day += increment * count_day;
    createTable(start_day, difference_day, count_day);
}

function closePopup(event) {
    event.stopPropagation();
    popup_div.innerHTML = '';
    arr_nested_activities = [];
    popup_back_div.innerHTML = '';
}

function closePopup2(event) {
    event.stopPropagation();
    popup_div_2.innerHTML = '';
}

function addNestedActivities(event) {
    select = `<select class="input_date" id="input_event_type_2">`;
    for (i in arr_event_type) {
        select += `<option value="${arr_event_type[i].name}">${arr_event_type[i].name}</option>`;
    }
    select += `</select>`;
    popup_div_2.innerHTML = `<div class="popup_back" id="popup_back_2"></div>
    <div class="popup_2" id="popup_2">
        <div class="exit">
            <div><h1>Бронирование залов</h1></div>
            <div class="exit_div" onclick='closePopup2(event)'><h1>X</h1></div>
        </div>
        <div class="event_info">
            <div>
                <table>
                    <tr>
                        <td><text>Время начала<mark>*</mark>: </text></td>
                        <td><input class="input_date" type="time" value="08:00" id="input_start_time_2"/></td>
                    </tr>
                    <tr>
                        <td><text>Время окончания<mark>*</mark>: </text></td>
                        <td><input class="input_date" type="time" id="input_end_time_2"/></td>
                    </tr>
                    <tr>
                        <td><text>Тип мероприятия<mark>*</mark>: </text></td>
                        <td>${select}</td>
                    </tr>
                    <tr>
                        <td><text>Название мероприятия<mark>*</mark>: </text></td>
                        <td><textarea class="input_date" cols="40" rows="3" id="input_event_name_2"/></textarea></td>
                    </tr>
                    <tr>
                        <td><text>Спикер<mark>*</mark>: </text></td>
                        <td><input class="input_date" style="width: 100%;" type="text" id="input_speaker_2"/></td>
                    </tr>
                    <tr>
                        <td><text>Описание мероприятия<mark>*</mark>:</text></td>
                        <td><textarea class="input_date" cols="40" rows="5" id="input_description_2"/></textarea></td>
                    </tr>
                </table>
            </div>
            <div class="button_div">
                <button onclick="book2(event)" class="button_book">Забронировать</button>
            </div>
        </div>
    </div>`;
    event.stopPropagation();
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

function book(event) {
    event.stopPropagation();
    input_number = document.getElementById('input_number');
    input_date = document.getElementById('input_date');
    input_start_time = document.getElementById('input_start_time');
    input_end_time = document.getElementById('input_end_time');
    input_event_type = document.getElementById('input_event_type');
    input_event_name = document.getElementById('input_event_name');
    input_speaker = document.getElementById('input_speaker');
    input_description = document.getElementById('input_description');
    input_responsible = document.getElementById('input_responsible');
    input_phone_number = document.getElementById('input_phone_number');
    if (input_number.value == "" || input_date.value == "" || input_start_time.value == "" || input_event_type.value == "" || input_event_name.value == "") {
        alert('Нужно заполнить все поля отмеченные "*"!');
        return;
    }
    if (input_event_name.value.length > 256) {
        alert('Название должно быть меньше 256 символов!');
        return;
    }
    url_send = `https://mypew.ru:4502/request`;
    send_event = {
        "jwt": localStorage.getItem('token'),
        "method": "insert",
        "request": {
            "number_hall": input_number.value,
            "event_name": input_event_name.value,
            "date": input_date.value,
            "time": input_start_time.value,
            "fio": input_responsible.value,
            "phone_number": input_phone_number.value,
            "event_type": input_event_type.value,
            "speaker_fio": input_speaker.value,
            "event_description": input_description.value,
            "event_nested": arr_nested_activities
        }
    }
    console.log('На сервер отправляется:', send_event);
    axios.post(url_send, send_event).then(res => {
        console.log('book', res);
        closePopup(event);
        if (res.data.status == "Succes") {
            alert('Мероприятие успешно зарегистрировано, ожидайте одобрения!');
        }
    });
}

function book2(event) {
    event.stopPropagation();
    input_start_time_2 = document.getElementById('input_start_time_2');
    input_end_time_2 = document.getElementById('input_end_time_2');
    input_event_type_2 = document.getElementById('input_event_type_2');
    input_event_name_2 = document.getElementById('input_event_name_2');
    input_speaker_2 = document.getElementById('input_speaker_2');
    input_description_2 = document.getElementById('input_description_2');
    if (input_start_time_2.value == "" || input_end_time_2.value == "" || input_event_type_2.value == "" || input_event_name_2.value == "" || input_speaker_2.value == "" || input_description_2.value == "") {
        alert('Нужно заполнить все поля отмеченные "*"!');
        return;
    }
    closePopup2(event);
    backgroun_color = '6f6f6f';
    for (i in arr_event_type) {
        if (arr_event_type[i].name == input_event_type_2.value) {
            background_color = arr_event_type[i].color;
        }
    }
    arr_nested_activities.push({ "time_start": input_start_time_2.value, "time_end": input_end_time_2.value, "event_type": input_event_type_2.value, "event_name": input_event_name_2.value, "speaker_fio": input_speaker_2.value, "event_description": input_description_2.value, "color": background_color });
    html_text = "";
    console.log(arr_nested_activities);
    for (i in arr_nested_activities) {
        html_text += `<div class="die_nested" style="background-color: #${arr_nested_activities[i].color}" onclick="openBook2Edit(event, ${i})">${arr_nested_activities[i].time_start}-${arr_nested_activities[i].time_end} ${arr_nested_activities[i].event_name}</div>`;
    }
    nested_activities.innerHTML = html_text + add_nested_activities;
}

function book2Save(event, index) {
    event.stopPropagation();
    input_start_time_2 = document.getElementById('input_start_time_2');
    input_end_time_2 = document.getElementById('input_end_time_2');
    input_event_type_2 = document.getElementById('input_event_type_2');
    input_event_name_2 = document.getElementById('input_event_name_2');
    input_speaker_2 = document.getElementById('input_speaker_2');
    input_description_2 = document.getElementById('input_description_2');
    if (input_start_time_2.value == "" || input_end_time_2.value == "" || input_event_type_2.value == "" || input_event_name_2.value == "" || input_speaker_2.value == "" || input_description_2.value == "") {
        alert('Нужно заполнить все поля отмеченные "*"!');
        return;
    }
    closePopup2(event);
    backgroun_color = '6f6f6f';
    for (i in arr_event_type) {
        if (arr_event_type[i].name == input_event_type_2.value) {
            background_color = arr_event_type[i].color;
        }
    }
    arr_nested_activities[index] = { "time_start": input_start_time_2.value, "time_end": input_end_time_2.value, "event_type": input_event_type_2.value, "event_name": input_event_name_2.value, "speaker_fio": input_speaker_2.value, "event_description": input_description_2.value, "color": background_color };
    html_text = "";
    console.log(arr_nested_activities);
    for (i in arr_nested_activities) {
        html_text += `<div class="die_nested" style="background-color: #${arr_nested_activities[i].color}" onclick="openBook2Edit(event, ${i})">${arr_nested_activities[i].time_start}-${arr_nested_activities[i].time_end} ${arr_nested_activities[i].event_name}</div>`;
    }
    nested_activities.innerHTML = html_text + add_nested_activities;
}

function book2Del(event, index) {
    event.stopPropagation();
    closePopup2(event);
    arr_nested_activities.splice(index, 1);
    html_text = "";
    console.log(arr_nested_activities);
    for (i in arr_nested_activities) {
        html_text += `<div class="die_nested" style="background-color: #${arr_nested_activities[i].color}" onclick="openBook2Edit(event, ${i})">${arr_nested_activities[i].time_start}-${arr_nested_activities[i].time_end} ${arr_nested_activities[i].event_name}</div>`;
    }
    nested_activities.innerHTML = html_text + add_nested_activities;
}

function openBook2Edit(event, index) {
    event.stopPropagation();
    console.log(index);
    select = `<select class="input_date" id="input_event_type_2">`;
    for (i in arr_event_type) {
        select += `<option value="${arr_event_type[i].name}">${arr_event_type[i].name}</option>`;
    }
    select += `</select>`;
    popup_div_2.innerHTML = `<div class="popup_back" id="popup_back_2"></div>
    <div class="popup_2" id="popup_2">
        <div class="exit">
            <div><h1>Бронирование залов</h1></div>
            <div class="exit_div" onclick='closePopup2(event)'><h1>X</h1></div>
        </div>
        <div class="event_info">
            <div>
                <table>
                    <tr>
                        <td><text>Время начала<mark>*</mark>: </text></td>
                        <td><input class="input_date" type="time" value="${arr_nested_activities[index].time_start}" id="input_start_time_2"/></td>
                    </tr>
                    <tr>
                        <td><text>Время окончания<mark>*</mark>: </text></td>
                        <td><input class="input_date" type="time" value="${arr_nested_activities[index].time_end}" id="input_end_time_2"/></td>
                    </tr>
                    <tr>
                        <td><text>Тип мероприятия<mark>*</mark>: </text></td>
                        <td>${select}</td>
                    </tr>
                    <tr>
                        <td><text>Название мероприятия<mark>*</mark>: </text></td>
                        <td><textarea class="input_date" cols="40" rows="3" id="input_event_name_2"/></textarea></td>
                    </tr>
                    <tr>
                        <td><text>Спикер<mark>*</mark>: </text></td>
                        <td><input class="input_date" style="width: 100%;" type="text" id="input_speaker_2" value="${arr_nested_activities[index].speaker_fio}"/></td>
                    </tr>
                    <tr>
                        <td><text>Описание мероприятия<mark>*</mark>:</text></td>
                        <td><textarea class="input_date" cols="40" rows="5" id="input_description_2"/></textarea></td>
                    </tr>
                </table>
            </div>
            <div class="button_div">
                <button onclick="book2Save(event, ${index})" class="button_book">Сохранить</button>
                <button onclick="book2Del(event, ${index})" class="button_book" style="background-color: #d95a3e;">Удалить</button>
            </div>
        </div>
    </div>`;
    event.stopPropagation();
    input_event_name_2 = document.getElementById('input_event_name_2');
    input_event_name_2.value = arr_nested_activities[index].event_name;
    input_event_type_2 = document.getElementById('input_event_type_2');
    input_event_type_2.value = arr_nested_activities[index].event_type;
    input_description_2 = document.getElementById('input_description_2');
    input_description_2.value = arr_nested_activities[index].event_description;
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

function openBook2Read(event, index) {
    event.stopPropagation();
    console.log(index);
    popup_div_2.innerHTML = `<div class="popup_back" id="popup_back_2"></div>
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

header_logo = document.getElementById('header_logo');
header = document.getElementById('header');
arrow_menu = document.getElementById('arrow_menu');
header_logo.addEventListener('click', (event) => {
    event.stopPropagation();
    header.style.transform = "translateX(-320px)";
    table.style.margin = "5px 2vw 2vw 2vw";
    arrow_menu.style.opacity = '1';
})
arrow_menu.addEventListener('click', (event) => {
    event.stopPropagation();
    arrow_menu.style.opacity = '0';
    header.style.transform = "translateX(0px)";
    table.style.margin = "5px 2vw 2vw calc(2vw + 300px)";
})
