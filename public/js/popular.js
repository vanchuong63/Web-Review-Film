document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1';
    loadMovieList('popularMovies', apiUrl, 'Đang tải phim phổ biến...');
});