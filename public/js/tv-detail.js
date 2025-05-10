document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.tv-detail-container');
    
    // Lấy TV series ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const tvId = urlParams.get('id');

    if (!tvId) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Không tìm thấy ID series.</p>
            </div>
        `;
        return;
    }

    // Hiển thị loading state
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tải thông tin series...</p>
        </div>
    `;

    // Lấy thông tin TV series
    const tvSettings = {
        url: `https://api.themoviedb.org/3/tv/${tvId}?language=en-US`,
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NTc0OWNlMjA1M2Q4NDI1MmNjMDg5ZTViMWY3NDM2NCIsIm5iZiI6MTc0NjczMTc3OS4wMTgsInN1YiI6IjY4MWQwMzAzODc4M2IzZGIxN2MxZGU0MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.YYhUbrQDjf5c_G-wXAwc06KObIRamJm8VpWUQ-2FRGQ'
        }
    };

    // Lấy videos của TV series
    const videoSettings = {
        url: `https://api.themoviedb.org/3/tv/${tvId}/videos?language=en-US`,
        method: 'GET',
        headers: tvSettings.headers
    };

    // Lấy thông tin series và videos cùng lúc
    Promise.all([
        fetch(tvSettings.url, tvSettings),
        fetch(videoSettings.url, videoSettings)
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([tv, videos]) => {
        const backdropPath = tv.backdrop_path 
            ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}`
            : '';
        const posterPath = tv.poster_path 
            ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
            : 'img/default-movie.jpg';
        
        const firstAirDate = new Date(tv.first_air_date).toLocaleDateString('vi-VN');
        const rating = tv.vote_average ? tv.vote_average.toFixed(1) : 'N/A';
        const numberOfSeasons = tv.number_of_seasons || 'N/A';
        const numberOfEpisodes = tv.number_of_episodes || 'N/A';
        
        const genres = tv.genres ? tv.genres.map(genre => 
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
                    <img src="${posterPath}" alt="${tv.name}" loading="lazy">
                </div>
                <div class="movie-info">
                    <h1 class="movie-title">${tv.name}</h1>
                    <div class="movie-meta">
                        <span><i class="far fa-calendar-alt"></i> Phát sóng: ${firstAirDate}</span>
                        <span><i class="fas fa-film"></i> Số mùa: ${numberOfSeasons}</span>
                        <span><i class="fas fa-tv"></i> Số tập: ${numberOfEpisodes}</span>
                        <span><i class="fas fa-star"></i> ${rating}</span>
                    </div>
                    <div class="movie-genres">
                        ${genres}
                    </div>
                    <div class="movie-overview">
                        <h3>Tổng quan</h3>
                        <p>${tv.overview || 'Không có mô tả.'}</p>
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
    .catch(error => {
        console.error('Lỗi khi tải thông tin series:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Không thể tải thông tin series. Vui lòng thử lại sau.</p>
                <button onclick="window.location.reload()" class="retry-button">
                    <i class="fas fa-redo"></i> Thử lại
                </button>
            </div>
        `;
    });
}); 