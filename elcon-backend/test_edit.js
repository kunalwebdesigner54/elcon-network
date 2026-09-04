const axios = require('axios');

async function test() {
  try {
    console.log('Fetching products...');
    const listRes = await axios.get('http://localhost:5000/api/products');
    const products = listRes.data.products;
    if (products.length === 0) { console.log('No products'); return; }
    
    const p = products.find(p => p.type === 'repurchase') || products[0];
    console.log('Editing product:', p.productName, p.id);
    
    const tokenResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@elcon.com', // or whatever
      password: 'password123'
    }).catch(e => null);
    
    let token = tokenResponse?.data?.token || '';
    
    // Attempt update
    const updateRes = await axios.put('http://localhost:5000/api/products/admin/' + p.id, {
      ...p,
      productName: p.productName + ' Edited'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Update res:', updateRes.status);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
test();
