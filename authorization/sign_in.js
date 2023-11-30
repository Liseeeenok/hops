sign_in = document.getElementById('sign_in');
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
        sign_in.innerHTML = `
        <table>
            <tr>
                <td><label>Старый пароль</label></td>
                <td><input type="password" id="password_old" size="40" class="input"></td>
            </tr>
            <tr>
                <td><label>Новый пароль</label></td>
                <td><input type="password" id="password" size="40" class="input"></td>
            </tr>
        </table>
        <div class="button_div">
            <button type="button" id="change_password" class="button">Сменить пароль</button>
            <button type="button" id="out" class="button" onclick="logOutAcc()">Выйти</button>
        </div>`;
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
        sign_in.innerHTML = `
        <table>
            <tr>
                <td><label>Логин</label></td>
                <td><input type="email" id="email" size="40" class="input"></td>
            </tr>
            <tr>
                <td><label>Пароль</label></td>
                <td><input type="password" id="password" size="40" class="input"></td>
            </tr>
        </table>
        <div class="button_div" id="authorization">
            <div>
                <button type="button" class="button" onclick="logInAcc()">Войти</button>
            </div>
            <div style="display: flex;">
                <button class="button" style="font-size: 14px; border: none;" onclick="registerAcc()">Нет аккаунта? Зарегистрироваться</button>
            </div>
        </div>`;
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

function logOutAcc() {
    delete localStorage.token;
    delete localStorage.first_name;
    delete localStorage.last_name;
    delete localStorage.middle_name;
    delete localStorage.phone_number;
    location.reload();
}

function registerAcc() {
    location.replace('https://hops.icc.ru/register/register.html');
}

async function logInAcc() {
    email = document.getElementById('email');
    password = document.getElementById('password');
    console.log(email.value, password.value);
    article = { "login": email.value, "password": password.value };
    axios.post(url_login, article).then(res_login => {
        console.log(res_login.data);
        if (res_login.data.jwt) {
            article = {
                "jwt": res_login.data.jwt,
                "method": "select",
                "method_type": "user info"
            };
            axios.post(url_user, article).then(res_user => {
                console.log(res_user.data);
                if (res_user.data.token_verify) {
                    localStorage.setItem('token', res_login.data.jwt);
                    location.reload();
                } else {
                    delete localStorage.token;
                    delete localStorage.first_name;
                    delete localStorage.last_name;
                    delete localStorage.middle_name;
                    delete localStorage.phone_number;
                    alert('Логин или пароль неверны!');
                    password.value = "";
                }
            });
        } else {
            alert('Логин или пароль неверны!');
            password.value = "";
        }
    });
}


