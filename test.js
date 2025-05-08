const axios = require('axios');

async function testTMDBAPI() {
  const apiKey = '95749ce2053d84252cc089e5b1f74364';
  const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWiOiI5NTc0OWNlMjA1M2Q4NDI1MmNjMDg5ZTViMWY3NDM2NCIsInN1YiI6IjYzNDI2N2ZkZGExZWZiMDA5MDQ1ZjZiMTYiLjRNWQwMzA0wMTgsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ-2FRGQ';

  try {
    console.log('Testing TMDB API connection...');
    
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: apiKey,
        query: 'avatar',
        language: 'vi-VN'
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
    
    console.log('API Response:');
    console.log(`Total results: ${response.data.total_results}`);
    console.log('First movie:', JSON.stringify(response.data.results[0], null, 2));
    
    return true;
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

// Thực thi test
testTMDBAPI().then(success => {
  console.log('Test completed, API working:', success);
});