import axios from 'axios';
import Noty from 'noty';
import { initAdmin } from './admin'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter'); // Selecting the first element

function updateCart(pizza) {
  axios.post('/update-cart', pizza).then(res => {
      console.log(res);
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: 'success',
        text: 'Item added to cart',
        timeout: 1000,
        theme: 'mint'
      }).show();
    })
    .catch(err => {
      console.error('Error updating cart:', err);
      new Noty({
        type: 'error',
        text: 'Failed to add item to cart. Please try again later.',
        timeout: 1000,
        theme: 'mint'
      }).show();
    });
}

addToCart.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
  });
});

// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
  setTimeout(() => {
    alertMsg.remove()
  }, 2000)
}

initAdmin()
