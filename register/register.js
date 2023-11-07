sign_in = document.getElementById('sign_in');
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
        location.replace('https://hops.mypew.ru/authorization/sign_in.html');
    } else {
        sign_in.innerHTML = `
        <table>
            <tr>
                <td><label>Почта</label></td>
                <td><input type="email" id="email" size="40" class="input"></td>
            </tr>
            <tr>
                <td><label>Фамилия</label></td>
                <td><input type="text" id="surname" size="40" class="input"></td>
            </tr>
            <tr>
                <td><label>Имя</label></td>
                <td><input type="text" id="name" size="40" class="input"></td>
            </tr>
            <tr>
                <td><label>Отчество</label></td>
                <td><input type="text" id="middle_name" size="40" class="input"></td>
            </tr>
            <tr>
                <td><label>Номер телефона</label></td>
                <td><input type="text" id="number" size="40" class="input"></td>
            </tr>
            <tr>
                <td><label>Логин</label></td>
                <td><input type="text" id="login" size="40" class="input"></td>
            </tr>
            <tr>
                <td><label>Пароль</label></td>
                <td><input type="password" id="password" size="40" class="input"></td>
            </tr>
        </table>
        <div class="button_div" id="authorization">
            <div>
                <button type="button" class="button" onclick="registerAcc()">Зарегистрироваться</button>
            </div>
            <div style="display: flex;">
                <button class="button" style="font-size: 14px; border: none;" onclick="logInAcc()">Есть аккаунт? Войти</button>
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
function logInAcc() {
    location.replace('https://hops.mypew.ru/authorization/sign_in.html');
}

function registerAcc() {
    url_register = `https://mypew.ru:4502/registration`;
    email = document.getElementById('email');
    login = document.getElementById('login');
    password = document.getElementById('password');
    surname = document.getElementById('surname');
    inp_name = document.getElementById('name');
    middle_name = document.getElementById('middle_name');
    number = document.getElementById('number');
    article = article = {
        "login": login.value,
        "password": password.value,
        "email": email.value,
        "surname": surname.value,
        "name": inp_name.value,
        "middle_name": middle_name.value,
        "number": number.value
    };
    axios.post(url_register, article).then(res_register => {
        if (res_register.data.status == "Succes") {
            alert('Заявка на регистрацию отправлена, ожидайте ответа администратора');
        } else {
            if (res_register.data.error == "Username is busy") alert('Логин уже занят');
            else alert('Нужно заполнить все поля');
        }
    });
}