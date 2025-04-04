// ===== TOGGLE DARK MODE =====
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

  // Lưu trạng thái Dark Mode vào localStorage
  const isDarkMode = document.querySelector('.container').classList.contains('active');
  localStorage.setItem('darkMode', isDarkMode);
});

// Khôi phục trạng thái Dark Mode khi tải trang
if (localStorage.getItem('darkMode') === 'true') {
  items.forEach(item => {
    item.classList.add('active');
  });
  toggleBall.classList.add('active');
}

// ===== DROPDOWN MENU =====
const profileDropdown = document.querySelector('.profile-dropdown');
const dropdownMenu = document.querySelector('.dropdown-menu');

// Mở/đóng dropdown khi click
profileDropdown.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('show');
});

// Đóng dropdown khi click ra ngoài
document.addEventListener('click', () => {
  dropdownMenu.classList.remove('show');
});

// Ngăn dropdown đóng khi click vào menu
dropdownMenu.addEventListener('click', (e) => {
  e.stopPropagation();
}); 