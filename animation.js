// ===== TOGGLE DARK/LIGHT MODE =====
const toggle = document.querySelector('.toggle');
const toggleBall = document.querySelector('.toggle-ball');
const itemsToToggle = document.querySelectorAll(
  '.container, .navbar-container, .sidebar, .left-menu-icon, .movie-list-title, .menu-list-item, .profile-container, .dropdown-menu'
);

function toggleTheme() {
  // Toggle light-mode class on body
  document.body.classList.toggle('light-mode');

  // Toggle active class for legacy dark mode elements
  itemsToToggle.forEach(item => {
    item.classList.toggle('active');
  });

  // Toggle toggle ball position
  toggleBall.classList.toggle('toggle-ball-move');
  toggleBall.classList.toggle('active');

  // Save theme preference to localStorage
  const isLightMode = document.body.classList.contains('light-mode');
  localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  localStorage.setItem('darkMode', !isLightMode); // Legacy support
}

// Initialize theme on page load
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const legacyDarkMode = localStorage.getItem('darkMode') === 'true';

  if (savedTheme === 'light' || (savedTheme === null && legacyDarkMode === false)) {
    document.body.classList.add('light-mode');
    toggleBall.classList.add('toggle-ball-move');
    itemsToToggle.forEach(item => {
      item.classList.remove('active'); // Ensure active class is removed for light mode
    });
  } else {
    document.body.classList.remove('light-mode');
    toggleBall.classList.remove('toggle-ball-move');
    if (legacyDarkMode) {
      itemsToToggle.forEach(item => {
        item.classList.add('active');
      });
      toggleBall.classList.add('active');
    }
  }
}

// Event listener for toggle button
toggle.addEventListener('click', toggleTheme);

// Initialize theme when page loads
document.addEventListener('DOMContentLoaded', initializeTheme);

// ===== DROPDOWN MENU =====
function toggleDropdown() {
  const dropdown = document.getElementById('dropdownMenu');
  dropdown.classList.toggle('show');
}

// Close the dropdown if clicked outside
window.onclick = function (event) {
  if (!event.target.matches('.profile-trigger') && !event.target.closest('.profile-trigger')) {
    const dropdowns = document.getElementsByClassName("dropdown-menu");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}