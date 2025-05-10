// Hàm tạo movie/TV item với chức năng click
function createMovieItem(item, isTV = false) {
    const movieItem = document.createElement('div');
    movieItem.className = 'movie-list-item';

    const posterPath = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : 'img/default-movie.jpg';

    const year = item.release_date || item.first_air_date 
        ? new Date(item.release_date || item.first_air_date).getFullYear() 
        : '';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const title = isTV ? item.name : item.title;

    movieItem.innerHTML = `
        <img class="movie-list-item-img" src="${posterPath}" alt="${title}" loading="lazy">
        <div class="movie-list-item-info">
            <span class="movie-list-item-title">${title} ${year ? `(${year})` : ''}</span>
            <div class="movie-list-item-rating">
                <i class="fas fa-star"></i> ${rating}
            </div>
            <button class="movie-list-item-button">Chi tiết</button>
        </div>
    `;

    // Thêm hiệu ứng hover
    movieItem.addEventListener('mouseenter', () => {
        movieItem.style.transform = 'scale(1.05)';
    });

    movieItem.addEventListener('mouseleave', () => {
        movieItem.style.transform = 'scale(1)';
    });

    // Thêm sự kiện click để chuyển đến trang chi tiết
    movieItem.addEventListener('click', () => {
        // Thêm hiệu ứng loading khi click
        movieItem.classList.add('loading');
        setTimeout(() => {
            const detailPage = isTV ? 'tv-detail.html' : 'movie-detail.html';
            window.location.href = `${detailPage}?id=${item.id}`;
        }, 300);
    });

    return movieItem;
}

// Hàm tải và hiển thị danh sách phim/TV series
async function loadMovieList(containerId, apiUrl, loadingText, isTV = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Hiển thị loading
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>${loadingText}</p>
        </div>
    `;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NTc0OWNlMjA1M2Q4NDI1MmNjMDg5ZTViMWY3NDM2NCIsIm5iZiI6MTc0NjczMTc3OS4wMTgsInN1YiI6IjY4MWQwMzAzODc4M2IzZGIxN2MxZGU0MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.YYhUbrQDjf5c_G-wXAwc06KObIRamJm8VpWUQ-2FRGQ'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Clear loading
        container.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            container.innerHTML = '<p class="no-results">Không tìm thấy kết quả.</p>';
            return;
        }

        // Hiển thị items
        data.results.forEach(item => {
            const movieItem = createMovieItem(item, isTV);
            container.appendChild(movieItem);
        });

        // Khởi tạo điều hướng
        if (typeof initializeMovieListNavigation === 'function') {
            initializeMovieListNavigation(container);
        }

    } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Không thể tải dữ liệu</p>
                <button onclick="window.location.reload()" class="retry-button">
                    <i class="fas fa-redo"></i> Thử lại
                </button>
            </div>
        `;
    }
} 