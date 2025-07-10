const axios = require('axios');

console.log('Testing basic HTTP request...');

async function simpleTest() {
  try {
    const response = await axios.get('http://localhost:3000/api/workout-plans');
    console.log('Success! Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

simpleTest();
