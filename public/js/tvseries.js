document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.themoviedb.org/3/tv/popular?language=en-US&page=1';
    loadMovieList('tvSeries', apiUrl, 'Đang tải TV series...', true);
}); 