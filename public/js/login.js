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

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
            withCredentials: true
        })
        if (res.data.status === 'success') {
            location.reload(true);
        }
    } catch (err) {
        showAlert('error', 'Error logging out! Try again later.')
    }
}