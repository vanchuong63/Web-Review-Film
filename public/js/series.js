// TV Series Page JavaScript using TMDB API
document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const API_KEY = ''; // TMDB API key được cấu hình từ server
    const API_URL = '/api/tmdb'; // Proxy qua server để tránh lộ API key
    const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
    const PLACEHOLDER_IMG = 'https://via.placeholder.com/500x750?text=No+Image+Available';
    
    // Elements
    const seriesGrid = document.getElementById('seriesGrid');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageEl = document.getElementById('currentPage');
    const filterBtn = document.getElementById('filterButton');
    const sortBySelect = document.getElementById('sortBy');
    const genreSelect = document.getElementById('genre');
    const yearSelect = document.getElementById('year');
    
    // State
    let currentPage = 1;
    let totalPages = 1;
    let genres = [];
    
    // Initialize the page
    async function initialize() {
        await loadGenres();
        populateYears();
        applyFilters();
        
        // Add event listeners
        filterBtn.addEventListener('click', () => {
            currentPage = 1;
            applyFilters();
        });
        
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                applyFilters();
            }
        });
        
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                applyFilters();
            }
        });
    }
    
    // Load TV series genres
    async function loadGenres() {
        try {
            const response = await fetch(`${API_URL}/genre/tv/list`);
            const data = await response.json();
            genres = data.genres || [];
            
            // Populate genre dropdown
            genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                genreSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }
    
    // Populate years dropdown (last 50 years)
    function populateYears() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= currentYear - 50; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }
    
    // Apply filters and load TV series
    async function applyFilters() {
        showLoading();
        
        const sortBy = sortBySelect.value;
        const genreId = genreSelect.value;
        const year = yearSelect.value;
        
        try {
            let url = `${API_URL}/discover/tv?page=${currentPage}&sort_by=${sortBy}`;
            
            if (genreId) {
                url += `&with_genres=${genreId}`;
            }
            
            if (year) {
                url += `&first_air_date_year=${year}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                displaySeries(data.results);
                totalPages = data.total_pages > 500 ? 500 : data.total_pages; // TMDB limits to 500 pages
                updatePagination();
            } else {
                seriesGrid.innerHTML = '<div class="no-results">No TV series found matching your criteria</div>';
            }
        } catch (error) {
            console.error('Error loading TV series:', error);
            seriesGrid.innerHTML = '<div class="error">Failed to load TV series. Please try again later.</div>';
        }
    }
    
    // Display TV series in the grid
    function displaySeries(tvShows) {
        seriesGrid.innerHTML = '';
        
        tvShows.forEach(show => {
            const { id, name, poster_path, vote_average, first_air_date, genre_ids } = show;
            
            const seriesCard = document.createElement('div');
            seriesCard.classList.add('movie-card'); // Reusing movie-card styles
            seriesCard.dataset.id = id;
            
            const firstAirYear = first_air_date ? first_air_date.split('-')[0] : 'N/A';
            const posterUrl = poster_path ? `${IMG_PATH}${poster_path}` : PLACEHOLDER_IMG;
            
            // Convert genre IDs to names
            const seriesGenres = genre_ids
                .map(genreId => {
                    const genre = genres.find(g => g.id === genreId);
                    return genre ? genre.name : null;
                })
                .filter(genreName => genreName !== null)
                .slice(0, 3); // Limit to 3 genres
            
            // Create genre chips HTML
            const genresHTML = seriesGenres.length > 0 
                ? `
                    <div class="movie-genres">
                        ${seriesGenres.map(genre => `<span class="movie-genre">${genre}</span>`).join('')}
                    </div>
                ` 
                : '';
            
            seriesCard.innerHTML = `
                <img src="${posterUrl}" alt="${name}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${name}</h3>
                    <div class="movie-year">${firstAirYear}</div>
                    ${genresHTML}
                    <div class="movie-rating">
                        <i class="fas fa-star"></i>
                        <span>${vote_average.toFixed(1)}</span>
                    </div>
                </div>
            `;
            
            // Add click event to view series details
            seriesCard.addEventListener('click', () => {
                window.location.href = `/movie-detail.html?id=${id}&type=tv`;
            });
            
            seriesGrid.appendChild(seriesCard);
        });
    }
    
    // Show loading indicator
    function showLoading() {
        seriesGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading TV series...</p>
            </div>
        `;
    }
    
    // Update pagination controls
    function updatePagination() {
        currentPageEl.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    // Initialize the page
    initialize();
}); 