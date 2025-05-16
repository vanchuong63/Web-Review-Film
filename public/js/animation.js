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
// Khai báo biến cho thanh tìm kiếm nhỏ
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');

// Xử lý sự kiện cho thanh tìm kiếm nhỏ
if (searchButton) {
    searchButton.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!searchInput) return;
        
        const query = searchInput.value.trim();
        if (query.length < 2) return;
        
        const results = await searchMovies(query);
        renderSearchResults(results, searchResults);
    });
}

if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            const results = await searchMovies(query);
            renderSearchResults(results, searchResults);
        } else {
            searchResults.style.display = 'none';
        }
    });
}

// Xóa hàm renderSearchResults cũ và chỉ giữ một phiên bản
function renderSearchResults(results, container) {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<div class="search-result-item">Không tìm thấy phim</div>';
        container.style.display = 'block';
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
            window.location.href = `/movie-detail.html?id=${movie.id}`;
        });
        
        container.appendChild(item);
    });

    container.style.display = 'block';
}
const mainSearchInput = document.getElementById('mainSearchInput');
const mainSearchButton = document.getElementById('mainSearchButton');
const mainSearchResults = document.getElementById('mainSearchResults');
const mainSearchForm = document.getElementById('main-search-form');

// Thêm xử lý sự kiện input cho thanh tìm kiếm chính
if (mainSearchInput) {
    mainSearchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            const results = await searchMovies(query);
            renderSearchResults(results, mainSearchResults);
        } else {
            mainSearchResults.style.display = 'none';
        }
    });
}

// Định nghĩa lại hàm searchMovies
async function searchMovies(query) {
    try {
        const response = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Lỗi tìm kiếm");
        const data = await response.json();
        
        return data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : null,
            year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
            overview: movie.overview
        }));
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}

// Cập nhật hàm renderSearchResults
function renderSearchResults(results, container) {
    if (!container) {
        console.error('Container không tồn tại');
        return;
    }
    
    container.innerHTML = '';
    container.style.display = 'block'; // Luôn hiển thị container
    
    if (!results || results.length === 0) {
        container.innerHTML = '<div class="search-result-item">Không tìm thấy phim</div>';
        return;
    }

    results.forEach(movie => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        
        const content = `
            ${movie.poster ? `<img src="${movie.poster}" class="search-result-poster" alt="${movie.title}">` : ''}
            <div class="search-result-info">
                <div class="search-result-title">${movie.title}</div>
                <div class="search-result-year">${movie.year}</div>
            </div>
        `;
        
        item.innerHTML = content;
        
        item.addEventListener('click', () => {
            window.location.href = `/movie-detail.html?id=${movie.id}`;
        });
        
        container.appendChild(item);
    });
}

// Thêm xử lý đóng kết quả khi click ngoài
document.addEventListener('click', (e) => {
    if (mainSearchResults && !e.target.closest('.search-container-large')) {
        mainSearchResults.style.display = 'none';
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

// Xử lý tìm kiếm trên trang chủ
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('main-search-form');
    const searchInput = document.getElementById('mainSearchInput');
    const searchResults = document.getElementById('mainSearchResults');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm.length > 0) {
                // Hiển thị loading
                searchResults.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Searching...</p></div>';
                searchResults.classList.add('active');
                
                // Gọi API tìm kiếm
                fetch(`/api/movies/search?query=${encodeURIComponent(searchTerm)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results && data.results.length > 0) {
                            displaySearchResults(data.results);
                        } else {
                            searchResults.innerHTML = '<div class="no-results">No results found</div>';
                        }
                    })
                    .catch(error => {
                        console.error('Search error:', error);
                        searchResults.innerHTML = '<div class="error">An error occurred while searching</div>';
                    });
            }
        });
        
        // Hiển thị kết quả tìm kiếm
        function displaySearchResults(results) {
            searchResults.innerHTML = '';
            searchResults.classList.add('active');
            
            results.slice(0, 10).forEach(movie => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');
                
                const posterPath = movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` 
                    : 'images/placeholder.png';
                
                resultItem.innerHTML = `
                    <div class="search-result-poster">
                        <img src="${posterPath}" alt="${movie.title}">
                    </div>
                    <div class="search-result-info">
                        <h3>${movie.title}</h3>
                        <p>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                    </div>
                `;
                
                resultItem.addEventListener('click', () => {
                    window.location.href = `/movie-detail.html?id=${movie.id}`;
                });
                
                searchResults.appendChild(resultItem);
            });
        }
        
        // Đóng kết quả tìm kiếm khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (!searchForm.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });
        
        // Hiển thị kết quả khi focus vào input và đã có kết quả trước đó
        searchInput.addEventListener('focus', function() {
            if (searchResults.children.length > 0) {
                searchResults.classList.add('active');
            }
        });
    }
});