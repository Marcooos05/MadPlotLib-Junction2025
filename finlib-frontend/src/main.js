import './style.css'
import '@vaadin/button';
import '@vaadin/text-field';

document.querySelector('#app').innerHTML = `
  <div>
    <h1>FinLib Frontend with Vaadin</h1>
    <vaadin-text-field label="Enter your name" id="nameField"></vaadin-text-field>
    <vaadin-button id="greetButton">Greet</vaadin-button>
    <p id="greeting"></p>
  </div>
`

const button = document.querySelector('#greetButton');
const textField = document.querySelector('#nameField');
const greeting = document.querySelector('#greeting');

button.addEventListener('click', () => {
  const name = textField.value;
  greeting.textContent = `Hello, ${name}!`;
});
