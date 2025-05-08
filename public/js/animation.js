// ===== TOGGLE DARK/LIGHT MODE =====
const toggle = document.querySelector('.toggle');
const toggleBall = document.querySelector('.toggle-ball');
const itemsToToggle = document.querySelectorAll(
  '.container, .navbar-container, .sidebar, .left-menu-icon, .movie-list-title, .menu-list-item, .profile-container, .dropdown-menu'
);

function toggleTheme() {
  document.body.classList.toggle('light-mode');

  itemsToToggle.forEach(item => {
    item.classList.toggle('active');
  });

  toggleBall.classList.toggle('toggle-ball-move');
  toggleBall.classList.toggle('active');

  const isLightMode = document.body.classList.contains('light-mode');
  localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  localStorage.setItem('darkMode', !isLightMode); // legacy
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const legacyDarkMode = localStorage.getItem('darkMode') === 'true';

  if (savedTheme === 'light' || (savedTheme === null && legacyDarkMode === false)) {
    document.body.classList.add('light-mode');
    toggleBall.classList.add('toggle-ball-move');
    itemsToToggle.forEach(item => item.classList.remove('active'));
  } else {
    document.body.classList.remove('light-mode');
    toggleBall.classList.remove('toggle-ball-move');
    if (legacyDarkMode) {
      itemsToToggle.forEach(item => item.classList.add('active'));
      toggleBall.classList.add('active');
    }
  }
}

toggle.addEventListener('click', toggleTheme);
document.addEventListener('DOMContentLoaded', initializeTheme);

// ===== DROPDOWN MENU =====
function toggleDropdown() {
  const dropdown = document.getElementById('dropdownMenu');
  dropdown.classList.toggle('show');
}

window.onclick = function (event) {
  if (!event.target.matches('.profile-trigger') && !event.target.closest('.profile-trigger')) {
    const dropdowns = document.getElementsByClassName("dropdown-menu");
    for (let i = 0; i < dropdowns.length; i++) {
      dropdowns[i].classList.remove('show');
    }
  }
};

// ===== API CONFIGURATION =====
// Xóa API key hardcode để tăng bảo mật
const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const urls = {
  movieSearch: '/api/movies/search',
  autocomplete: '/api/autocomplete',
  interstellarDetails: '/api/movies/details/tt0816692',
  interstellarRating: '/api/movies/rating/tt0816692'
};

// ===== FETCH INTERSTELLAR INFO =====
async function fetchInterstellarDetails() {
  try {
    const response = await fetch(urls.interstellarDetails, options);
    if (!response.ok) throw new Error("Không thể lấy thông tin phim");
    const result = await response.json();

    // Hiển thị thông tin phim
    const titleElement = document.getElementById('title');
    const plotElement = document.getElementById('plot');
    const genresElement = document.getElementById('genres');
    
    if (titleElement) titleElement.textContent = result.title || 'Không có dữ liệu';
    if (plotElement) plotElement.textContent = result.plot || 'Không có mô tả';
    if (genresElement) genresElement.textContent = result.genres?.join(', ') || 'Không có thể loại';
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết phim:', error.message);
  }
}

// ===== FETCH INTERSTELLAR RATING =====
async function fetchInterstellarRating() {
  try {
    const response = await fetch(urls.interstellarRating, options);
    if (!response.ok) throw new Error("Không thể lấy điểm đánh giá");
    const result = await response.json();

    // Hiển thị rating
    const ratingElement = document.getElementById('rating');
    if (ratingElement) ratingElement.textContent = result.rating || 'Không có điểm';
  } catch (error) {
    console.error('Lỗi khi lấy rating:', error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchInterstellarDetails();
  fetchInterstellarRating();
});

document.getElementById('searchInput').addEventListener('keyup', function (e) {
  if (e.key === 'Enter') {
      document.getElementById('searchIcon').click();
  }
});

// ===== SEARCH FUNCTIONALITY =====
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');

async function searchMovies(query) {
  try {
    const response = await fetch(`/api/movies/${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Lỗi tìm kiếm");
    return await response.json();
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

function renderSearchResults(results) {
  searchResults.innerHTML = '';
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item">Không tìm thấy phim</div>';
    searchResults.style.display = 'block';
    return;
  }

  results.forEach(movie => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    
    // Thêm poster nếu có
    if (movie.poster) {
      const poster = document.createElement('img');
      poster.src = movie.poster;
      poster.className = 'search-result-poster';
      poster.alt = movie.title;
      item.appendChild(poster);
    }
    
    const info = document.createElement('div');
    info.className = 'search-result-info';
    
    const title = document.createElement('div');
    title.className = 'search-result-title';
    title.textContent = movie.title;
    
    const year = document.createElement('div');
    year.className = 'search-result-year';
    year.textContent = movie.year;
    
    info.appendChild(title);
    info.appendChild(year);
    item.appendChild(info);
    
    item.addEventListener('click', () => {
      showMovieDetails(movie.id);
      searchResults.style.display = 'none';
    });
    
    searchResults.appendChild(item);
  });

  searchResults.style.display = 'block';
}

// Xử lý sự kiện tìm kiếm
searchButton.addEventListener('click', async () => {
  const query = searchInput.value.trim();
  if (query.length < 2) return;
  
  const results = await searchMovies(query);
  renderSearchResults(results);
});

searchInput.addEventListener('keyup', async (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query.length < 2) return;
    
    const results = await searchMovies(query);
    renderSearchResults(results);
  }
});

// Đóng kết quả khi click bên ngoài
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    searchResults.style.display = 'none';
  }
});

let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const query = searchInput.value.trim();
    if (query.length >= 2) {
      const results = await searchMovies(query);
      renderSearchResults(results);
    }
  }, 300);
});

function showMovieDetails(movieId) {
  window.location.href = `/movie.html?id=${movieId}`;
}

