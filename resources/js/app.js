import axios from 'axios';
import Noty from 'noty';
import { initAdmin } from './admin'
import order from '../../app/models/order';
import moment from 'moment';

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



let statuses = document.querySelectorAll('.status_line');
let hiddenInput = document.querySelector('#hiddenInput');
let orderData = hiddenInput ? hiddenInput.value : null;
let parsedOrder = JSON.parse(orderData); // Rename orderData to parsedOrder
let time = document.createElement('small');

function updateStatus(order) {
  statuses.forEach((status) => {
      status.classList.remove('step-completed');
      status.classList.remove('current');
  });
  let stepCompleted = true;
  statuses.forEach((status) => {
     let dataProp = status.dataset.status;
     if(stepCompleted) {
          status.classList.add('step-completed');
     }
     if(dataProp === order.status) {
          stepCompleted = false;
          time.innerText = moment(order.updatedAt).format('hh:mm A');
          status.appendChild(time);
         if(status.nextElementSibling) {
          status.nextElementSibling.classList.add('current');
         }
     }
  });

}

updateStatus(parsedOrder);

// Socket
let socket = io()
// Join
if(order) {
  socket.emit('join', `order_${order._id}`)
}
let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')) {
  initAdmin(socket)
  socket.emit('join', 'adminRoom')
}

socket.on('orderUpdated', (data) => {
  const updatedOrder = { ...order }
  updatedOrder.updatedAt = moment().format()
  updatedOrder.status = data.status
  updateStatus(updatedOrder)
  new Noty({
      type: 'success',
      timeout: 1000,
      text: 'Order updated',
      progressBar: false,
  }).show();
})