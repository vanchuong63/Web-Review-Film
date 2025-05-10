// Movie Page JavaScript using TMDB API
document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const API_KEY = ''; // TMDB API key được cấu hình từ server
    const API_URL = '/api/tmdb'; // Proxy qua server để tránh lộ API key
    const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
    const PLACEHOLDER_IMG = 'https://via.placeholder.com/500x750?text=No+Image+Available';
    
    // Elements
    const movieGrid = document.getElementById('movieGrid');
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
    
    // Load movie genres
    async function loadGenres() {
        try {
            const response = await fetch(`${API_URL}/genre/movie/list?language=en-US`);
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
    
    // Apply filters and load movies
    async function applyFilters() {
        showLoading();
        
        const sortBy = sortBySelect.value;
        const genreId = genreSelect.value;
        const year = yearSelect.value;
        
        try {
            let url = `${API_URL}/discover/movie?page=${currentPage}&sort_by=${sortBy}`;
            
            if (genreId) {
                url += `&with_genres=${genreId}`;
            }
            
            if (year) {
                url += `&primary_release_year=${year}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                displayMovies(data.results);
                totalPages = data.total_pages > 500 ? 500 : data.total_pages; // TMDB limits to 500 pages
                updatePagination();
            } else {
                movieGrid.innerHTML = '<div class="no-results">No movies found matching your criteria</div>';
            }
        } catch (error) {
            console.error('Error loading movies:', error);
            movieGrid.innerHTML = '<div class="error">Failed to load movies. Please try again later.</div>';
        }
    }
    
    // Display movies in the grid
    function displayMovies(movies) {
        movieGrid.innerHTML = '';
        
        movies.forEach(movie => {
            const { id, title, poster_path, vote_average, release_date, genre_ids } = movie;
            
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.dataset.id = id;
            
            const releaseYear = release_date ? release_date.split('-')[0] : 'N/A';
            const posterUrl = poster_path ? `${IMG_PATH}${poster_path}` : PLACEHOLDER_IMG;
            
            // Convert genre IDs to names
            const movieGenres = genre_ids
                .map(genreId => {
                    const genre = genres.find(g => g.id === genreId);
                    return genre ? genre.name : null;
                })
                .filter(genreName => genreName !== null)
                .slice(0, 3); // Limit to 3 genres
            
            // Create genre chips HTML
            const genresHTML = movieGenres.length > 0 
                ? `
                    <div class="movie-genres">
                        ${movieGenres.map(genre => `<span class="movie-genre">${genre}</span>`).join('')}
                    </div>
                ` 
                : '';
            
            movieCard.innerHTML = `
                <img src="${posterUrl}" alt="${title}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${title}</h3>
                    <div class="movie-year">${releaseYear}</div>
                    ${genresHTML}
                    <div class="movie-rating">
                        <i class="fas fa-star"></i>
                        <span>${vote_average.toFixed(1)}</span>
                    </div>
                </div>
            `;
            
            // Add click event to view movie details
            movieCard.addEventListener('click', () => {
                window.location.href = `/movie-detail.html?id=${id}`;
            });
            
            movieGrid.appendChild(movieCard);
        });
    }
    
    // Show loading indicator
    function showLoading() {
        movieGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading movies...</p>
            </div>
        `;
    }
    
    // Update pagination controls
    function updatePagination() {
        currentPageEl.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    // Fetch new releases (upcoming movies)
    async function fetchNewReleases() {
        try {
            // Get current date
            const today = new Date();
            const currentDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
            // Get date 3 months in the future
            const futureDate = new Date();
            futureDate.setMonth(today.getMonth() + 3);
            const futureDateStr = futureDate.toISOString().split('T')[0];
            
            // Upcoming movies endpoint with date range filter
            const url = `${API_URL}/discover/movie?sort_by=release_date.asc&with_release_type=2|3&release_date.gte=${currentDate}&release_date.lte=${futureDateStr}&language=en-US`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            return data.results || [];
        } catch (error) {
            console.error('Error fetching new releases:', error);
            return [];
        }
    }

    // Display new releases in a container
    async function displayNewReleases(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading new releases...</p>
            </div>
        `;
        
        try {
            const movies = await fetchNewReleases();
            
            if (movies.length === 0) {
                container.innerHTML = '<p>No upcoming movies found</p>';
                return;
            }
            
            const movieList = document.createElement('div');
            movieList.className = 'movie-list';
            
            movies.slice(0, 7).forEach(movie => {
                const { id, title, poster_path, overview, release_date } = movie;
                const posterUrl = poster_path ? `${IMG_PATH}${poster_path}` : PLACEHOLDER_IMG;
                const releaseDate = release_date ? new Date(release_date).toLocaleDateString() : 'Coming Soon';
                
                const movieItem = document.createElement('div');
                movieItem.className = 'movie-list-item';
                
                movieItem.innerHTML = `
                    <img class="movie-list-item-img" src="${posterUrl}" alt="${title}">
                    <span class="movie-list-item-title">${title}</span>
                    <p class="movie-list-item-desc">Release Date: ${releaseDate}</p>
                    <button class="movie-list-item-button">Watch</button>
                `;
                
                // Add click event to view movie details
                movieItem.querySelector('.movie-list-item-button').addEventListener('click', () => {
                    window.location.href = `/movie-detail.html?id=${id}`;
                });
                
                movieList.appendChild(movieItem);
            });
            
            container.innerHTML = '';
            container.appendChild(movieList);
            
            // Add arrow for scrolling
            const arrow = document.createElement('i');
            arrow.className = 'fas fa-chevron-right arrow';
            container.appendChild(arrow);
            
            // Handle arrow click for horizontal scrolling
            arrow.addEventListener('click', () => {
                movieList.style.transform = 'translateX(-100%)';
            });
        } catch (error) {
            console.error('Error displaying new releases:', error);
            container.innerHTML = '<p>Failed to load upcoming movies. Please try again later.</p>';
        }
    }
    
    // Initialize the page
    initialize();
    
    // Expose function to global scope so it can be called from other scripts
    window.displayNewReleases = displayNewReleases;
}); 
console.log('Fetching from URL:', url);
console.log('API Response:', data);