const axios = require('axios');
const mongoose = require('mongoose');

async function test() {
  try {
    const Product = require('./models/Product');
    await mongoose.connect('mongodb://127.0.0.1:27017/elcon_db');
    
    // Create a product
    let p = await Product.findOne({ productCode: 'TEST1234' });
    if (!p) {
        p = await Product.create({ productCode: 'TEST1234', productName: 'Old', category: 'Health', hsnCode: '111', type: 'repurchase' });
    }
    
    // Test the controller directly
    const { updateProduct } = require('./controllers/productsController');
    const req = { 
        params: { productId: p._id.toString() }, 
        body: { productName: 'New Name' } 
    };
    
    let resData = null;
    let resStatus = 200;
    const res = {
        status: (code) => { resStatus = code; return res; },
        json: (data) => { resData = data; }
    };
    
    await updateProduct(req, res);
    
    console.log('Status:', resStatus);
    console.log('Response:', JSON.stringify(resData, null, 2));
    
    const updated = await Product.findById(p._id);
    console.log('Updated in DB:', updated.productName);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
test();
