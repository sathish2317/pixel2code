const contactForm = document.querySelector('#contactForm');
const contactStatus = document.querySelector('#contactStatus');
document.querySelector('#year').textContent = new Date().getFullYear();
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const name = new FormData(contactForm).get('name');
  contactStatus.textContent = `Thank you, ${name}. Your demo message is ready. Connect this form to your server to send it.`;
  contactForm.reset();
});
