document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1';
    loadMovieList('topRatedMovies', apiUrl, 'Đang tải phim đánh giá cao...');
}); 