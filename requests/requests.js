//---------------[AUTH]---------------
url_login = 'https://mypew.ru:4502/login';
url_user = 'https://mypew.ru:4502/user';

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
        } else {
            alert('Для просмотра страницы недостаточно прав!');
            location.replace('https://hops.mypew.ru/');
        }
    } else {
        delete localStorage.token;
        delete localStorage.first_name;
        delete localStorage.last_name;
        delete localStorage.middle_name;
        delete localStorage.phone_number;
        inp_name = document.getElementById('inp_name');
        inp_name.innerHTML = `Войти`;
        alert('Время сессии истекло, авторизируйтесь повторно!');
        location.replace('https://hops.mypew.ru/authorization/sign_in.html');
    }
});
//------------------------------------
//---------------[HTML]---------------
table = document.getElementById('table'); //Получение html элемента таблицы
input_start_date = document.getElementById('input_start_date'); //Инпут даты с которой показывать МП
popup_div = document.getElementById('popup_div'); //Див всплывающего popup'а
popup_div_2 = document.getElementById('popup_div_2'); //Див второго всплывающего popup'а
popup_back_div = document.getElementById('popup_back_div') //Див затемнения
//------------------------------------
arr_event_type = []; //Массив типов мероприятий
arr_number_hall = []; //Массив номеров залов
url_type = 'https://mypew.ru:4502/event_type';
axios.get(url_type).then(res => {
    arr_event_type = res.data;
    url_hall = 'https://mypew.ru:4502/hall';
    axios.get(url_hall).then(res => {
        arr_number_hall = res.data;
        createTable(new Date(), true);
    });
});
data = []; //Ответ сервера
number_table = ""; //Номер зала для фильтра
event_type_table = ""; //Вид мероприятия для фильтра

async function createTable(day, upd) {
    dtz = new Date(day); //День для запроса
    html = "";
    tds = "";
    select = `<option value=""></option>`;
    for (i in arr_number_hall) {
        select += `<option value="${arr_number_hall[i].number}">${arr_number_hall[i].number}</option>`;
    }
    tds += `<td class='tdh' style='width: 100px;'>
    <table class='table_in'>
        <tr>
            <td>Номер зала</td>
        </tr>
        <tr>
            <td><select class="input_date" id="input_number_table">${select}</select></td>
        </tr>
    </table>
    </td>`;
    tds += `<td class='tdh' style='width: 300px;'>
    <table class='table_in'>
        <tr>
            <td>Дата</td>
        </tr>
        <tr>
            <td>Отображать с <input class="input_date" type="date" value="${dtz.toJSON().substr(0, 10)}" id="input_start_date"/></td>
        </tr>
    </table>
    </td>`;
    select = `<select class="input_date" id="input_event_type_table">`;
    select += `<option value=""></option>`;
    for (i in arr_event_type) {
        select += `<option value="${arr_event_type[i].name}">${arr_event_type[i].name}</option>`;
    }
    select += `</select>`;
    tds += `<td class='tdh' style='width: 70px;'><table class='table_in'><tr><td>Тип</td></tr><tr><td>${select}</td></tr></table></td>`;
    tds += `<td class='tdh' >Название</td>`;
    html += "<tr>" + tds + "</tr>";
    table.innerHTML = html;
    st_dt = dtz.toLocaleDateString(); //Начальный день
    url_request = `https://mypew.ru:4502/request`;
    article_request = { "jwt": localStorage.getItem('token'), "method": "select", "date_start": st_dt };
    if (upd) {
        await axios.post(url_request, article_request).then(res => {
            data = res.data;
            console.log(res.data);
        });
    }
    html = "";
    tds = "";
    for (i in data) {
        if (number_table != "" && number_table != data[i].number_hall) { //Фильтры
            continue;
        }
        if (event_type_table != "" && event_type_table != data[i].event_type) {
            continue;
        }
        tds = "";
        tds += "<td class='td'>" + data[i].number_hall + "</td>";
        tds += "<td class='td'>" + data[i].date + "</td>";
        tds += "<td class='td'>" + data[i].event_type + "</td>";
        tds += "<td class='td'>" + data[i].event_name + "</td>";
        if (data[i].approved == 1) {
            color_tr = "#c4fcb4";
        } else {
            color_tr = "#ff8989";
        }
        html += `<tr onclick='open_event_info(event, ${i})' style='background-color: ${color_tr}'>` + tds + "</tr>";
    }
    table.innerHTML = table.innerHTML + html;
    input_start_date = document.getElementById('input_start_date');
    input_start_date.addEventListener('change', changeInputDate);
    input_number_table = document.getElementById('input_number_table');
    input_number_table.value = number_table;
    input_number_table.addEventListener('change', changeNumberTable);
    input_event_type_table = document.getElementById('input_event_type_table');
    input_event_type_table.value = event_type_table;
    input_event_type_table.addEventListener('change', changeEventTypeTable);
};

function changeInputDate() {
    input_start_date.removeEventListener('change', changeInputDate)
    table.innerHTML = ""; //Обнуляем таблицу
    start_day = input_start_date.value; //Находим начальную дату
    createTable(start_day, true); //Перерисовывание таблицу
}

function changeNumberTable() {
    input_number_table.removeEventListener('change', changeNumberTable)
    table.innerHTML = ""; //Обнуляем таблицу
    number_table = input_number_table.value; //Находим номер зала сортировки
    start_day = input_start_date.value; //Находим начальную дату
    createTable(start_day, false); //Перерисовывание таблицу
}

function changeEventTypeTable() {
    input_event_type_table.removeEventListener('change', changeNumberTable)
    table.innerHTML = ""; //Обнуляем таблицу
    event_type_table = input_event_type_table.value; //Находим тип мероприятия
    start_day = input_start_date.value; //Находим начальную дату
    createTable(start_day, false); //Перерисовывание таблицу
}

function open_event_info(event, i) {
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
    arr_nested_activities = data[i].event_nested;
    list_nested_activities = "";
    if (arr_nested_activities.length != 0) {
        list_nested_activities = `<tr><td class="up_cell"><text>Вложенные мероприятия:</text></td><td>`;
        for (j in arr_nested_activities) {
            list_nested_activities += `<text>${arr_nested_activities[j].time_start}-${arr_nested_activities[j].time_end} ${arr_nested_activities[j].event_name}</text><br>`;
        }
        list_nested_activities += `</td></tr>`;
    }
    popup_back_div.innerHTML = `<div class="popup_back" id="popup_back"></div>`;
    popup_div.innerHTML = `
    <div class="popup" id="popup">
        <div class="exit">
            <div><h1>Описание мероприятия</h1></div>
            <div class="exit_div" onclick='closePopup(event)'>
                <h1>X</h1>
            </div>
        </div>
        <div class="event_info">
            <div>
                <table>
                    <tr>
                        <td><text>Номер зала: </text></td>
                        <td>${select_hall}</td>
                    </tr>
                    <tr>
                        <td><text>Дата проведения: </text></td>
                        <td><input class="input_date" type="date" value="${data[i].date}" id="input_date"/></td>
                    </tr>
                    <tr>
                        <td><text>Время начала: </text></td>
                        <td><input class="input_date" type="time" value="${data[i].time.substr(0, 5)}" id="input_start_time"/></td>
                    </tr>
                    <tr>
                        <td><text>Время окончания: </text></td>
                        <td><input class="input_date" type="time" value="${data[i].time.length > 5 ? data[i].time.substr(6, 5) : ""}" id="input_start_time"/></td>
                    </tr>
                    <tr>
                        <td><text>Тип мероприятия: </text></td>
                        <td>${select}</td>
                    </tr>
                    <tr>
                        <td><text>Название мероприятия: </text></td>
                        <td><textarea class="input_date" cols="40" rows="3" id="input_event_name"/></textarea></td>
                    </tr>
                    <tr>
                        <td><text>Спикер: </text></td>
                        <td><input class="input_date" style="width: 100%;" type="text" id="input_speaker" value="${data[i].speaker_fio ? data[i].speaker_fio : ""}"/></td>
                    </tr>
                    <tr>
                        <td><text>Описание мероприятия:</text></td>
                        <td><textarea class="input_date" cols="40" rows="5" id="input_description"/></textarea></td>
                    </tr>
                    <tr>
                        <td><text>ФИО ответственного: </text></td>
                        <td><input class="input_date" style="width: 100%;" type="text" id="input_responsible" value="${data[i].fio}"/></td>
                    </tr>
                    <tr>
                        <td><text>Телефон: </text></td>
                        <td><input class="input_date" style="width: 100%;" type="text" id="input_phone_number" value="${data[i].phone_number}"/></td>
                    </tr>
                    <tr>
                        <td><text>Цвет мероприятия:</text></td>
                        <td><input type="color" class="input_date" id="input_color" value="#${data[i].color}"/></td>
                    </tr>
                    ${list_nested_activities}
                </table>
                <div class="button_div">
                    <button 
                        onclick="${data[i].approved ? "disApproveBook(event, " + i + ")" : "approveBook(event, " + i + ")"}" 
                        class="button_book" 
                        style="${data[i].approved ? "background-color: #d95a3e;" : "background-color: #50d067;"}">
                        ${data[i].approved ? "Снять одобрение" : "Одобрить"}
                    </button>
                    <button onclick="saveBook(event, ${i})" class="button_book">Сохранить</button>
                    <button onclick="cancelBook(event, ${i})" class="button_book" style="background-color: #d95a3e;">Удалить</button>
                </div>
            </div>
        </div>
    </div>`;
    event.stopPropagation();
    input_number = document.getElementById('input_number');
    input_number.value = data[i].number_hall;
    input_event_type = document.getElementById('input_event_type');
    input_event_type.value = data[i].event_type;
    input_event_name = document.getElementById('input_event_name');
    input_event_name.value = data[i].event_name;
    input_description = document.getElementById('input_description');
    input_description.value = (data[i].event_description ? data[i].event_description : "");
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

function closePopup(event) {
    event.stopPropagation();
    popup_div.innerHTML = "";
    arr_nested_activities = [];
    popup_back_div.innerHTML = '';
}

function closePopup2(event) {
    event.stopPropagation();
    popup_div_2.innerHTML = "";
}

function approveBook(event, i) {
    url_update = 'https://mypew.ru:4502/request';
    input_number = document.getElementById('input_number');
    input_date = document.getElementById('input_date');
    input_start_time = document.getElementById('input_start_time');
    input_event_type = document.getElementById('input_event_type');
    input_event_name = document.getElementById('input_event_name');
    input_speaker = document.getElementById('input_speaker');
    input_description = document.getElementById('input_description');
    input_responsible = document.getElementById('input_responsible');
    input_phone_number = document.getElementById('input_phone_number');
    input_color = document.getElementById('input_color');
    console.log(arr_nested_activities);
    for (j in arr_nested_activities) {
        arr_nested_activities[j].approved = 1;
    }
    article_update = {
        "jwt": localStorage.getItem('token'),
        "method": "update",
        "request": {
            "id": data[i].id,
            "number_hall": input_number.value,
            "event_name": input_event_name.value,
            "date": input_date.value,
            "time": input_start_time.value,
            "fio": input_responsible.value,
            "phone_number": input_phone_number.value,
            "color": input_color.value.substr(1, 8),
            "event_type": input_event_type.value,
            "approved": 1,
            "speaker_fio": input_speaker.value,
            "event_description": input_description.value,
            "event_nested": arr_nested_activities
        }
    };
    axios.post(url_update, article_update).then(res => {
        console.log(res);
        table.innerHTML = ""; //Обнуляем таблицу
        start_day = input_start_date.value; //Находим начальную дату
        createTable(start_day, true); //Перерисовывание таблицу
        closePopup(event);
    });
}

function cancelBook(event, i) {
    url_delete = 'https://mypew.ru:4502/request';
    article_delete = {
        "jwt": localStorage.getItem('token'),
        "method": "delete",
        "request": {
            "id": data[i].id
        }
    }
    axios.post(url_delete, article_delete).then(res => {
        console.log(article_delete);
        console.log(res);
        table.innerHTML = ""; //Обнуляем таблицу
        start_day = input_start_date.value; //Находим начальную дату
        createTable(start_day, true); //Перерисовывание таблицу
        closePopup(event);
    });
}

function saveBook(event, i) {
    url_update = 'https://mypew.ru:4502/request';
    input_number = document.getElementById('input_number');
    input_date = document.getElementById('input_date');
    input_start_time = document.getElementById('input_start_time');
    input_event_type = document.getElementById('input_event_type');
    input_event_name = document.getElementById('input_event_name');
    input_speaker = document.getElementById('input_speaker');
    input_description = document.getElementById('input_description');
    input_responsible = document.getElementById('input_responsible');
    input_phone_number = document.getElementById('input_phone_number');
    input_color = document.getElementById('input_color');
    article_update = {
        "jwt": localStorage.getItem('token'),
        "method": "update",
        "request": {
            "id": data[i].id,
            "number_hall": input_number.value,
            "event_name": input_event_name.value,
            "date": input_date.value,
            "time": input_start_time.value,
            "fio": input_responsible.value,
            "phone_number": input_phone_number.value,
            "color": input_color.value.substr(1, 8),
            "event_type": input_event_type.value,
            "approved": data[i].approved,
            "speaker_fio": input_speaker.value,
            "event_description": input_description.value,
            "event_nested": arr_nested_activities
        }
    };
    axios.post(url_update, article_update).then(res => {
        console.log(res);
        table.innerHTML = ""; //Обнуляем таблицу
        start_day = input_start_date.value; //Находим начальную дату
        createTable(start_day, true); //Перерисовывание таблицу
        closePopup(event);
    });
}

function disApproveBook(event, i) {
    url_update = 'https://mypew.ru:4502/request';
    input_number = document.getElementById('input_number');
    input_date = document.getElementById('input_date');
    input_start_time = document.getElementById('input_start_time');
    input_event_type = document.getElementById('input_event_type');
    input_event_name = document.getElementById('input_event_name');
    input_speaker = document.getElementById('input_speaker');
    input_description = document.getElementById('input_description');
    input_responsible = document.getElementById('input_responsible');
    input_phone_number = document.getElementById('input_phone_number');
    input_color = document.getElementById('input_color');
    article_update = {
        "jwt": localStorage.getItem('token'),
        "method": "update",
        "request": {
            "id": data[i].id,
            "number_hall": input_number.value,
            "event_name": input_event_name.value,
            "date": input_date.value,
            "time": input_start_time.value,
            "fio": input_responsible.value,
            "phone_number": input_phone_number.value,
            "color": input_color.value.substr(1, 8),
            "event_type": input_event_type.value,
            "approved": 0,
            "speaker_fio": input_speaker.value,
            "event_description": input_description.value,
            "event_nested": arr_nested_activities
        }
    };
    axios.post(url_update, article_update).then(res => {
        console.log(res);
        table.innerHTML = ""; //Обнуляем таблицу
        start_day = input_start_date.value; //Находим начальную дату
        createTable(start_day, true); //Перерисовывание таблицу
        closePopup(event);
    });
}