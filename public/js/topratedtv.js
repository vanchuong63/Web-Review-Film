document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1';
    loadMovieList('topRatedTvSeries', apiUrl, 'Đang tải TV series đánh giá cao...', true);
}); 