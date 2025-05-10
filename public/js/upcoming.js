document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1';
    loadMovieList('upcomingMovies', apiUrl, 'Đang tải phim sắp chiếu...');
}); 