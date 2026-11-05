const form = document.querySelector('#bookingForm');
const panels = [...document.querySelectorAll('.step-panel')];
const progress = [...document.querySelectorAll('.progress-step')];
const backButton = document.querySelector('#backButton');
const nextButton = document.querySelector('#nextButton');
const submitButton = document.querySelector('#submitButton');
const status = document.querySelector('#bookingStatus');
const review = document.querySelector('#bookingReview');
const dateInput = document.querySelector('#bookingDate');
let step = 1;
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
dateInput.min = localToday;
function showStep(next) {
  step = next;
  panels.forEach(panel => panel.classList.toggle('active', Number(panel.dataset.step) === step));
  progress.forEach(item => {
    const number = Number(item.dataset.progress);
    item.classList.toggle('active', number === step);
    item.classList.toggle('done', number < step);
  });
  backButton.hidden = step === 1;
  nextButton.hidden = step === 3;
  submitButton.hidden = step !== 3;
  if (step === 3) {
    const data = new FormData(form);
    review.textContent = `Your selection: ${data.get('service')} · ${data.get('date')} · ${data.get('time')}.`;
  }
}
function validCurrentStep() {
  const panel = panels[step - 1];
  const controls = [...panel.querySelectorAll('input[required]')];
  for (const control of controls) {
    if (control.type === 'radio') {
      const group = panel.querySelectorAll(`input[name="${control.name}"]`);
      if (![...group].some(item => item.checked)) { group[0].setCustomValidity('Please choose an option.'); group[0].reportValidity(); group[0].setCustomValidity(''); return false; }
    } else if (!control.checkValidity()) { control.reportValidity(); return false; }
  }
  return true;
}
nextButton.addEventListener('click', () => { if (validCurrentStep()) showStep(Math.min(3, step + 1)); });
backButton.addEventListener('click', () => showStep(Math.max(1, step - 1)));
form.addEventListener('change', () => { if (step === 3) showStep(3); });
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!validCurrentStep()) return;
  const name = new FormData(form).get('name');
  status.textContent = `Thank you, ${name}. Your demo appointment request is ready. Connect this page to your booking backend to create a real appointment.`;
  status.classList.add('success');
  submitButton.disabled = true;
  submitButton.textContent = 'Demo request complete';
});
