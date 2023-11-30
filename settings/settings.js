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
            window.onload('https://hops.icc.ru/');
        }
    } else {
        delete localStorage.token;
        delete localStorage.first_name;
        delete localStorage.last_name;
        delete localStorage.middle_name;
        inp_name = document.getElementById('inp_name');
        inp_name.innerHTML = `Войти`;
    }
});
//------------------------------------