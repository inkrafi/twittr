document.addEventListener('DOMContentLoaded', () => {

  const formManager = document.getElementById('formManager');
  const userName = document.getElementById('name');
  const userUsername = document.getElementById('username');
  const userPassword = document.getElementById('password');
  const userConfirmPassword = document.getElementById('confirmPassword');

  const instantFeedback = document.getElementById('instantFeedback');

  instantFeedback.style.display = 'none';

  const userManager = new User();

  // custom format tanggal (yyyy-mm-dd)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getMonth()).padStart(2, '0');

  formManager.addEventListener('submit', (event) => {
    event.preventDefault();

    const userData = {
      name: userName.value,
      username: userUsername.value,
      password: userPassword.value,
      confirmPassword: userConfirmPassword.value,
      createdAt: `${year}-${month}-${day}`,
    }

    const result = userManager.saveUser(userData);

    if (result.success) {
      instantFeedback.style.display = 'none';
      return window.location.href = '../login.html';
    } else {
      instantFeedback.style.display = 'flex';
      instantFeedback.textContent = result.error;
    }
  })

}) 