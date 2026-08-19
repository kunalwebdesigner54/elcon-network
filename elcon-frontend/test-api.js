import axios from 'axios';

const test = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    console.log("Login token:", response.data.token);

    const locResponse = await axios.get('http://localhost:5000/api/members/locations', {
      headers: { Authorization: `Bearer ${response.data.token}` }
    });

    console.log("Locations response:", locResponse.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
};

test();
