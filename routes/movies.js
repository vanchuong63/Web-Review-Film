const express = require('express');
const router = express.Router();

// API lấy danh sách phim mới
router.get('/new-releases', async (req, res) => {
    try {
        const response = await fetch(
            'https://api.themoviedb.org/3/movie/now_playing?language=vi-VN&page=1',
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                    'accept': 'application/json'
                }
            }
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Lỗi lấy phim mới:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API lấy chi tiết phim
router.get('/detail/:id', async (req, res) => {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${req.params.id}?language=vi-VN`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                    'accept': 'application/json'
                }
            }
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Lỗi lấy chi tiết phim:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API tìm kiếm phim
router.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });
    }

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=vi-VN&page=1`, 
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                    'accept': 'application/json'
                }
            }
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Lỗi tìm kiếm phim:', error);
        res.status(500).json({ error: 'Lỗi server khi tìm kiếm phim' });
    }
});

// API lấy danh sách phim theo bộ lọc
router.get('/discover/movie', async (req, res) => {
    try {
        const { page, sort_by, with_genres, primary_release_year } = req.query;
        const url = `https://api.themoviedb.org/3/discover/movie?page=${page}&sort_by=${sort_by}${with_genres ? `&with_genres=${with_genres}` : ''}${primary_release_year ? `&primary_release_year=${primary_release_year}` : ''}&language=vi-VN`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                'accept': 'application/json'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Lỗi lấy danh sách phim:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API lấy danh sách thể loại phim
router.get('/genre/movie/list', async (req, res) => {
    try {
        const response = await fetch(
            'https://api.themoviedb.org/3/genre/movie/list?language=vi-VN',
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                    'accept': 'application/json'
                }
            }
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Lỗi lấy danh sách thể loại:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});
module.exports = router;