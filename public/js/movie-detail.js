// Movie Detail Page JavaScript using TMDB API
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.movie-detail-container');
    
    // Lấy movie ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Không tìm thấy ID phim.</p>
            </div>
        `;
        return;
    }

    // Hiển thị loading state
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tải thông tin phim...</p>
        </div>
    `;

    // Lấy thông tin phim
    const movieSettings = {
        async: true,
        crossDomain: true,
        url: `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NTc0OWNlMjA1M2Q4NDI1MmNjMDg5ZTViMWY3NDM2NCIsIm5iZiI6MTc0NjczMTc3OS4wMTgsInN1YiI6IjY4MWQwMzAzODc4M2IzZGIxN2MxZGU0MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.YYhUbrQDjf5c_G-wXAwc06KObIRamJm8VpWUQ-2FRGQ'
        }
    };

    // Lấy videos của phim
    const videoSettings = {
        async: true,
        crossDomain: true,
        url: `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NTc0OWNlMjA1M2Q4NDI1MmNjMDg5ZTViMWY3NDM2NCIsIm5iZiI6MTc0NjczMTc3OS4wMTgsInN1YiI6IjY4MWQwMzAzODc4M2IzZGIxN2MxZGU0MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.YYhUbrQDjf5c_G-wXAwc06KObIRamJm8VpWUQ-2FRGQ'
        }
    };

    // Lấy thông tin phim và videos cùng lúc
    Promise.all([
        $.ajax(movieSettings),
        $.ajax(videoSettings)
    ])
    .then(function([movie, videos]) {
        const backdropPath = movie.backdrop_path 
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : '';
        const posterPath = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'img/default-movie.jpg';
        
        const releaseDate = new Date(movie.release_date).toLocaleDateString('vi-VN');
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const runtime = movie.runtime ? `${movie.runtime} phút` : 'N/A';
        
        const genres = movie.genres ? movie.genres.map(genre => 
            `<span class="genre-tag">${genre.name}</span>`
        ).join('') : 'N/A';

        // Tìm trailer
        const trailer = videos.results.find(video => 
            video.type.toLowerCase() === 'trailer' && 
            video.site.toLowerCase() === 'youtube'
        );

        container.innerHTML = `
            <div class="movie-backdrop" style="background-image: url('${backdropPath}')"></div>
            <div class="movie-detail-content">
                <div class="movie-poster">
                    <img src="${posterPath}" alt="${movie.title}" loading="lazy">
                </div>
                <div class="movie-info">
                    <h1 class="movie-title">${movie.title}</h1>
                    <div class="movie-meta">
                        <span><i class="far fa-calendar-alt"></i> ${releaseDate}</span>
                        <span><i class="far fa-clock"></i> ${runtime}</span>
                        <span><i class="fas fa-star"></i> ${rating}</span>
                    </div>
                    <div class="movie-genres">
                        ${genres}
                    </div>
                    <div class="movie-overview">
                        <h3>Tổng quan</h3>
                        <p>${movie.overview || 'Không có mô tả.'}</p>
                    </div>
                    <div class="movie-actions">
                        <button class="watch-button">
                            <i class="fas fa-play"></i> Xem phim
                        </button>
                        ${trailer ? `
                            <button class="trailer-button" data-trailer="${trailer.key}">
                                <i class="fas fa-film"></i> Xem trailer
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div id="trailerModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <div id="trailerContainer"></div>
                </div>
            </div>
        `;

        // Xử lý sự kiện click nút trailer
        if (trailer) {
            const trailerBtn = container.querySelector('.trailer-button');
            const modal = container.querySelector('#trailerModal');
            const closeBtn = container.querySelector('.close');
            const trailerContainer = container.querySelector('#trailerContainer');

            trailerBtn.addEventListener('click', () => {
                modal.style.display = "block";
                setTimeout(() => modal.classList.add('show'), 10);
                trailerContainer.innerHTML = `
                    <iframe
                        src="https://www.youtube.com/embed/${trailer.key}?autoplay=1"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                `;
            });

            const closeModal = () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = "none";
                    trailerContainer.innerHTML = '';
                }, 300);
            };

            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                }
            });

            // Thêm xử lý phím ESC để đóng modal
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && modal.style.display === "block") {
                    closeModal();
                }
            });
        }

        // Thêm hiệu ứng fade in cho nội dung
        setTimeout(() => {
            document.querySelector('.movie-detail-content').style.opacity = '1';
        }, 100);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Lỗi khi tải thông tin phim:', errorThrown);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Không thể tải thông tin phim. Vui lòng thử lại sau.</p>
                <button onclick="window.location.reload()" class="retry-button">
                    <i class="fas fa-redo"></i> Thử lại
                </button>
            </div>
        `;
    });
}); 