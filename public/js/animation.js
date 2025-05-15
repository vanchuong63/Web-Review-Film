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
document.addEventListener('DOMContentLoaded', function() {
  const profileDropdown = document.querySelector('.profile-dropdown');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (profileDropdown && dropdownMenu) {
    // Toggle dropdown when clicking on profile
    profileDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!profileDropdown.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });
  }
});

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

document.getElementById('searchInput')?.addEventListener('keyup', function (e) {
  if (e.key === 'Enter') {
    const searchIcon = document.getElementById('searchIcon');
    if (searchIcon) searchIcon.click();
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
  if (!searchResults) return;
  
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
if (searchButton) {
  searchButton.addEventListener('click', async () => {
    if (!searchInput) return;
    const query = searchInput.value.trim();
    if (query.length < 2) return;
    
    const results = await searchMovies(query);
    renderSearchResults(results);
  });
}

if (searchInput) {
  searchInput.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query.length < 2) return;
      
      const results = await searchMovies(query);
      renderSearchResults(results);
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
}

// Đóng kết quả khi click bên ngoài
document.addEventListener('click', (e) => {
  if (searchResults && !e.target.closest('.search-container')) {
    searchResults.style.display = 'none';
  }
});

function showMovieDetails(movieId) {
  window.location.href = `/movie-detail.html?id=${movieId}`;
}

// ===== MENU NAVIGATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Lấy tất cả các mục menu
  const menuItems = document.querySelectorAll('.menu-list-item');
  
  // Gắn sự kiện click cho từng mục
  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      const text = this.textContent.trim().toLowerCase();
      
      // Điều hướng dựa trên text của menu item
      switch(text) {
        case 'home':
          window.location.href = 'index.html';
          break;
        case 'movies':
          window.location.href = 'movie.html';
          break;
        case 'series':
          window.location.href = 'series.html';
          break;
        case 'popular':
          // Thêm URL trang Popular khi có
          break;
        case 'trends':
          // Thêm URL trang Trends khi có
          break;
        default:
          break;
      }
    });
  });
});

// ===== MOVIE LIST NAVIGATION =====
function initializeMovieListNavigation(container) {
  if (!container) return;

  // Thêm wrapper cho container để chứa nút điều hướng
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.scrollBehavior = 'smooth';
  
  // Ẩn thanh cuộn ngang
  container.style.cssText += `
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  `;
  // Ẩn thanh cuộn cho Chrome, Safari và Opera
  container.style.cssText += `
    &::-webkit-scrollbar {
      display: none;
    }
  `;
  
  // Thêm nút điều hướng
  const leftArrow = document.createElement('div');
  const rightArrow = document.createElement('div');
  
  leftArrow.className = 'movie-nav-arrow left';
  rightArrow.className = 'movie-nav-arrow right';
  
  leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
  rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
  
  // Style cho container
  container.parentElement.style.position = 'relative';
  
  // Thêm style cho nút
  const arrowStyle = `
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 45px;
    height: 45px;
    background-color: rgba(20, 20, 20, 0.7);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.7);
    color: white;
    opacity: 0;
  `;
  
  leftArrow.style.cssText = arrowStyle + 'left: 20px; display: none;';
  rightArrow.style.cssText = arrowStyle + 'right: 20px;';
  
  // Thêm style hover effect
  container.parentElement.addEventListener('mouseenter', () => {
    if (container.scrollLeft > 0) {
      leftArrow.style.opacity = '1';
    }
    if (container.scrollLeft < container.scrollWidth - container.clientWidth) {
      rightArrow.style.opacity = '1';
    }
  });
  
  container.parentElement.addEventListener('mouseleave', () => {
    leftArrow.style.opacity = '0';
    rightArrow.style.opacity = '0';
  });
  
  container.parentElement.appendChild(leftArrow);
  container.parentElement.appendChild(rightArrow);

  // Xử lý sự kiện click nút phải
  const step = container.clientWidth - 100; // Điều chỉnh khoảng cách scroll
  
  rightArrow.addEventListener('click', () => {
    container.scrollLeft += step;
    leftArrow.style.display = 'flex';
    
    // Kiểm tra nếu đã scroll đến cuối
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      rightArrow.style.opacity = '0';
    }
  });
  
  // Xử lý sự kiện click nút trái
  leftArrow.addEventListener('click', () => {
    container.scrollLeft -= step;
    rightArrow.style.opacity = '1';
    
    // Kiểm tra nếu đã scroll về đầu
    if (container.scrollLeft <= step) {
      leftArrow.style.opacity = '0';
    }
  });
  
  // Xử lý sự kiện scroll
  container.addEventListener('scroll', () => {
    // Hiển thị/ẩn nút trái
    if (container.scrollLeft <= 10) {
      leftArrow.style.opacity = '0';
    } else {
      leftArrow.style.opacity = '1';
    }
    
    // Hiển thị/ẩn nút phải
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      rightArrow.style.opacity = '0';
    } else {
      rightArrow.style.opacity = '1';
    }
  });
}

// Initialize all movie lists when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all movie lists
  const movieLists = document.querySelectorAll('.movie-list');
  console.log('Found movie lists:', movieLists.length);
  
  movieLists.forEach((list, index) => {
    console.log(`Initializing movie list ${index + 1}`);
    initializeMovieListNavigation(list);
  });
});