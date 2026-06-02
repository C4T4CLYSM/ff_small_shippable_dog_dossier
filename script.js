const form = document.getElementById('signup');
const successMsg = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        form.querySelector('.form-row').style.display = 'none';
        form.querySelector('.form-note').style.display = 'none';
        successMsg.hidden = false;
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get My Link →';
        alert('Something went wrong — please try again.');
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Get My Link →';
      alert('Something went wrong — please check your connection and try again.');
    }
  });
}
