require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const supabase = require('./lib/supabase');

// Test Supabase connection
(async () => {
  const { data, error } = await supabase
    .from('user')
    .select('id')
    .limit(1);
  if (error) console.error('Supabase test error:', error);
  else console.log('Supabase connected, sample row:', data);
})();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Users endpoint
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase
    .from('user')
    .select('id, username, email, created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// TMDB proxy configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const tmdbHeaders = {
  Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
  'Content-Type': 'application/json;charset=utf-8'
};

// TMDB API proxy
app.get('/api/tmdb/*', async (req, res) => {
  try {
    const endpoint = req.params[0];
    const params = new URLSearchParams(req.query);
    params.append('api_key', TMDB_API_KEY);
    const fullUrl = `${TMDB_BASE_URL}/${endpoint}?${params.toString()}`;
    console.log('Calling TMDB API:', fullUrl);
    const response = await axios.get(fullUrl, { headers: tmdbHeaders });
    res.json(response.data);
  } catch (err) {
    console.error('TMDB API Error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
    res.status(err.response?.status || 500).json({
      error: 'Failed to fetch data from TMDB',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Movie details route
app.get('/api/movie/details/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { api_key: TMDB_API_KEY, language: 'vi-VN', append_to_response: 'credits,videos' },
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
        .map(video => ({ key: video.key, name: video.name, type: video.type }))
    };

    res.json(movie);
  } catch (err) {
    console.error('Movie details error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movie details', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

// Movie rating route
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
    console.error('Movie rating error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movie rating', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

// API test route
app.get('/api/test', async (req, res) => {
  try {
    const response = await axios.get('https://imdb236.p.rapidapi.com/search', {
      params: { query: 'avatar', type: 'movie' },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'imdb236.p.rapidapi.com'
      }
    });

    res.json({ results: response.data.results || [], apiHost: 'imdb236.p.rapidapi.com' });
  } catch (err) {
    console.error('API test error:', err.message);
    res.status(500).json({ error: 'API Test Failed', message: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
  }
});

// Popular movies route
app.get('/api/movies/popular', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: 'vi-VN', page: req.query.page || 1 },
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

    res.json({ results, page: response.data.page, total_pages: response.data.total_pages });
  } catch (err) {
    console.error('Popular movies error:', err.message);
    res.status(500).json({ error: 'Failed to fetch popular movies', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

// Additional movie routes
const movieRoutes = require('./routes/movies');
app.use('/api/movies', movieRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/content', express.static(path.join(__dirname, 'user-content')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});