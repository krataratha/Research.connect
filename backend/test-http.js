const axios = require('axios');

async function test() {
  try {
    // We need to login as binore to get the token
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'binore@example.com', // wait, what is his email?
      password: 'password123'
    });
    console.log("Login:", loginRes.data);
  } catch (err) {
    console.error(err.message);
  }
}
test();
