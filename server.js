require('dotenv').config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

// Khởi tạo ứng dụng Express
const app = express();

// Cài đặt middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ các file tĩnh
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/content', express.static(path.join(__dirname, 'user-content')));

// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// API headers cho TMDB
const tmdbHeaders = {
  'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
  'Content-Type': 'application/json;charset=utf-8'
};

// Route API tìm kiếm phim
app.get('/api/movies/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    console.log(`Searching for: "${keyword}"`);
    
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: { 
        api_key: TMDB_API_KEY,
        query: keyword,
        language: 'vi-VN',
        include_adult: false
      },
      headers: tmdbHeaders
    });
    
    const results = response.data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      rating: movie.vote_average,
      overview: movie.overview
    }));
    
    console.log(`Found ${results.length} results for "${keyword}"`);
    res.json(results);
  } catch (err) {
    console.error('API Error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch movie data',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Route API chi tiết phim
app.get('/api/movie/details/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'vi-VN',
        append_to_response: 'credits,videos'
      },
      headers: tmdbHeaders
    });
    
    const movie = {
      id: response.data.id,
      title: response.data.title,
      original_title: response.data.original_title,
      overview: response.data.overview,
      poster: response.data.poster_path ? `https://image.tmdb.org/t/p/w500${response.data.poster_path}` : null,
      backdrop: response.data.backdrop_path ? `https://image.tmdb.org/t/p/original${response.data.backdrop_path}` : null,
      release_date: response.data.release_date,
      genres: response.data.genres.map(g => g.name),
      runtime: response.data.runtime,
      vote_average: response.data.vote_average,
      vote_count: response.data.vote_count,
      cast: response.data.credits?.cast?.slice(0, 10).map(actor => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profile: actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : null
      })),
      videos: response.data.videos?.results
        .filter(video => video.site === 'YouTube')
        .map(video => ({
          key: video.key,
          name: video.name,
          type: video.type
        }))
    };
    
    res.json(movie);
  } catch (err) {
    console.error('API Error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch movie details',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Route API đánh giá phim
app.get('/api/movie/rating/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    const response = await axios.get(`https://imdb236.p.rapidapi.com/imdb/${id}/rating`, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'imdb236.p.rapidapi.com'
      }
    });
    
    res.json(response.data || {});
  } catch (err) {
    console.error('API Error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch movie rating',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// API Test Route
app.get('/api/test', async (req, res) => {
  try {
    const response = await axios.get('https://imdb236.p.rapidapi.com/search', {
      params: { 
        query: 'avatar',  // từ khóa cố định để test
        type: 'movie'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'imdb236.p.rapidapi.com'
      }
    });
    
    res.json({
      results: response.data.results || [],
      apiKey: process.env.RAPIDAPI_KEY ? process.env.RAPIDAPI_KEY.substring(0, 5) + '...' : 'missing',
      apiHost: 'imdb236.p.rapidapi.com'
    });
  } catch (err) {
    console.error('API Test Error:', err.message);
    res.status(500).json({ 
      error: 'API Test Failed',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Phục vụ file index.html cho tất cả các route khác
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/movies/:keyword`);
});