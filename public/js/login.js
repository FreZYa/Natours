/* eslint-disable */
// import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
    console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            },
            withCredentials: true  // Tarayıcının cookie'leri almasını sağlar
        });
        
        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            // Kullanıcıyı anasayfaya yönlendir
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

// DOM içeriklerini yalnızca form varsa çalıştır
const loginForm = document.querySelector('.form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    });
}
