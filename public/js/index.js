/* eslint-disable */
// Remove the import of leaflet - it should only be loaded in the browser
import { login } from './login';
import { displayMap } from './mapbox';
import { showAlert } from './alert';
console.log('Hello World');
// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
} 