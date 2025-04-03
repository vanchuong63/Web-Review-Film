
const toggle = document.querySelector('.toggle');
const toggleBall = document.querySelector('.toggle-ball');
const items = document.querySelectorAll(
  '.container,.navbar-container,.sidebar,.left-menu-icon,.movie-list-title'
);

toggle.addEventListener('click', () => {
 
  items.forEach(item => {
    item.classList.toggle('active');
  });
  toggleBall.classList.toggle('active');
  
 
  const isDarkMode = document.body.classList.contains('active');
  localStorage.setItem('darkMode', isDarkMode);
});


const isDarkMode = localStorage.getItem('darkMode') === 'true';     