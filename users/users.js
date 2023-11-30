//---------------[AUTH]---------------
url_login = 'https://hops.icc.ru:4502/login';
url_user = 'https://hops.icc.ru:4502/user';

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
            location.replace('https://hops.icc.ru/');
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
        location.replace('https://hops.icc.ru/authorization/sign_in.html');
    }
});
//------------------------------------
//---------------[HTML]---------------
table = document.getElementById('table'); //Получение html элемента таблицы
popup_div = document.getElementById('popup_div'); //Див всплывающего popup'а
popup_div_2 = document.getElementById('popup_div_2'); //Див второго всплывающего popup'а
popup_back_div = document.getElementById('popup_back_div') //Див затемнения
//------------------------------------
arr_users = []; //Массив пользователей
article_users = {
    "jwt": localStorage.getItem('token'),
    "method": "select",
    "method_type": "users info"
}

createTable();

function createTable() {
    axios.post(url_user, article_users).then(res_users => {
        console.log(res_users.data);
        arr_users = res_users.data.users
        html = "";
        tds = "";
        tds += `
        <td class='tdh' style='width: 100px;'>
            <text>Логин</text>
        </td>
        <td class='tdh' style='width: 100px;'>
            <text>ФИО</text>
        </td>
        <td class='tdh' style='width: 100px;'>
            <text>Доступ</text>
        </td>`;
        html += "<tr>" + tds + "</tr>";
        table.innerHTML = html;
        html = "";
        tds = "";
        for (i in arr_users) {
            tds = "";
            tds += "<td class='td'>" + arr_users[i].login + "</td>";
            tds += "<td class='td'>" + arr_users[i].surname + " " + arr_users[i].name + " " + arr_users[i].middle_name + "</td>";
            tds += "<td class='td'>" + (arr_users[i].lvl_access == 1 ? "Пользователь" : "Админ") + "</td>";
            if (arr_users[i].approved == 1) {
                color_tr = "#c4fcb4";
            } else {
                color_tr = "#ff8989";
            }
            html += `<tr onclick='open_user_info(event, ${i})' style='background-color: ${color_tr}'>` + tds + "</tr>";
        }
        table.innerHTML = table.innerHTML + html;
    });
}

function open_user_info(event, i) {
    popup_back_div.innerHTML = `<div class="popup_back" id="popup_back"></div>`;
    popup_div.innerHTML = `
    <div class="popup" id="popup">
        <div class="exit">
            <div><h1>Информация о пользователе</h1></div>
            <div class="exit_div" onclick='closePopup(event)'>
                <h1>X</h1>
            </div>
        </div>
        <div class="event_info">
            <div>
                <table>
                    <tr>
                        <td><text>Фамилия: </text></td>
                        <td><textarea class="input_date" cols="40" rows="1" id="input_surname"/></textarea></td>
                    </tr>
                    <tr>
                        <td><text>Имя: </text></td>
                        <td><textarea class="input_date" cols="40" rows="1" id="input_name"/></textarea></td>
                    </tr>
                    <tr>
                        <td><text>Отчество: </text></td>
                        <td><textarea class="input_date" cols="40" rows="1" id="input_middle_name"/></textarea></td>
                    </tr>
                    <tr>
                        <td><text>email: </text></td>
                        <td><textarea class="input_date" cols="40" rows="1" id="input_email"/></textarea></td>
                    </tr>
                    <tr>
                        <td><text>login: </text></td>
                        <td><textarea class="input_date" cols="40" rows="1" id="input_login"/></textarea></td>
                    </tr>
                    <tr>
                        <td><text>Номер телефона: </text></td>
                        <td><textarea class="input_date" cols="40" rows="1" id="input_number"/></textarea></td>
                    </tr>
                    <tr>
                        <td><text>Уровень доступа: </text></td>
                        <td>
                            <select class="input_date" id="input_lvl_access">
                                <option value="1">Пользователь</option>
                                <option value="2">Администратор</option>
                            </select>
                        </td>
                    </tr>
                </table>
                <div class="button_div">
                    <button 
                        onclick="${arr_users[i].approved ? "disApproveBook(event, " + i + ")" : "approveBook(event, " + i + ")"}" 
                        class="button_book" 
                        style="${arr_users[i].approved ? "background-color: #d95a3e;" : "background-color: #50d067;"}">
                        ${arr_users[i].approved ? "Снять одобрение" : "Одобрить"}
                    </button>
                    <button onclick="saveBook(event, ${i})" class="button_book">Сохранить</button>
                    <button onclick="cancelBook(event, ${i})" class="button_book" style="background-color: #d95a3e;">Удалить</button>
                </div>
            </div>
        </div>
    </div>`;
    event.stopPropagation();
    input_surname = document.getElementById('input_surname');
    input_surname.value = arr_users[i].surname;
    input_name = document.getElementById('input_name');
    input_name.value = arr_users[i].name;
    input_middle_name = document.getElementById('input_middle_name');
    input_middle_name.value = arr_users[i].middle_name;
    input_email = document.getElementById('input_email');
    input_email.value = arr_users[i].email;
    input_login = document.getElementById('input_login');
    input_login.value = arr_users[i].login;
    input_number = document.getElementById('input_number');
    input_number.value = arr_users[i].number;
    input_lvl_access = document.getElementById('input_lvl_access');
    input_lvl_access.value = arr_users[i].lvl_access;
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

function approveBook(event, i) {
    input_surname = document.getElementById('input_surname');
    input_name = document.getElementById('input_name');
    input_middle_name = document.getElementById('input_middle_name');
    input_email = document.getElementById('input_email');
    input_login = document.getElementById('input_login');
    input_number = document.getElementById('input_number');
    input_lvl_access = document.getElementById('input_lvl_access');
    article_update = {
        "jwt": localStorage.getItem('token'),
        "method": "update",
        "user": {
            "id": arr_users[i].id,
            "login": input_login.value,
            "email": input_email.value,
            "surname": input_surname.value,
            "name": input_name.value,
            "middle_name": input_middle_name.value,
            "number": input_number.value,
            "approved": 1,
            "lvl_access": input_lvl_access.value
        }
    };
    axios.post(url_user, article_update).then(res => {
        console.log(res);
        table.innerHTML = ""; //Обнуляем таблицу
        createTable(); //Перерисовывание таблицу
        closePopup(event);
    });
}

function cancelBook(event, i) {
    article_delete = {
        "jwt": localStorage.getItem('token'),
        "method": "delete",
        "user": {
            "id": arr_users[i].id
        }
    }
    axios.post(url_user, article_delete).then(res => {
        console.log(res);
        table.innerHTML = ""; //Обнуляем таблицу
        createTable(); //Перерисовывание таблицу
        closePopup(event);
    });
}

function saveBook(event, i) {
    input_surname = document.getElementById('input_surname');
    input_name = document.getElementById('input_name');
    input_middle_name = document.getElementById('input_middle_name');
    input_email = document.getElementById('input_email');
    input_login = document.getElementById('input_login');
    input_number = document.getElementById('input_number');
    input_lvl_access = document.getElementById('input_lvl_access');
    article_update = {
        "jwt": localStorage.getItem('token'),
        "method": "update",
        "user": {
            "id": arr_users[i].id,
            "login": input_login.value,
            "email": input_email.value,
            "surname": input_surname.value,
            "name": input_name.value,
            "middle_name": input_middle_name.value,
            "number": input_number.value,
            "approved": arr_users[i].approved,
            "lvl_access": input_lvl_access.value
        }
    };
    axios.post(url_user, article_update).then(res => {
        console.log(res);
        table.innerHTML = ""; //Обнуляем таблицу
        createTable(); //Перерисовывание таблицу
        closePopup(event);
    });
}

function disApproveBook(event, i) {
    input_surname = document.getElementById('input_surname');
    input_name = document.getElementById('input_name');
    input_middle_name = document.getElementById('input_middle_name');
    input_email = document.getElementById('input_email');
    input_login = document.getElementById('input_login');
    input_number = document.getElementById('input_number');
    input_lvl_access = document.getElementById('input_lvl_access');
    article_update = {
        "jwt": localStorage.getItem('token'),
        "method": "update",
        "user": {
            "id": arr_users[i].id,
            "login": input_login.value,
            "email": input_email.value,
            "surname": input_surname.value,
            "name": input_name.value,
            "middle_name": input_middle_name.value,
            "number": input_number.value,
            "approved": 0,
            "lvl_access": input_lvl_access.value
        }
    };
    axios.post(url_user, article_update).then(res => {
        console.log(res);
        table.innerHTML = ""; //Обнуляем таблицу
        createTable(); //Перерисовывание таблицу
        closePopup(event);
    });
}