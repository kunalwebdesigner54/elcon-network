const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function testQuery() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const startQuery = Date.now();
  const filter = { type: 'joining' };
  
  const products = await Product.aggregate([
    { $match: filter },
    { 
      $project: {
        type: 1, productCode: 1, productName: 1, category: 1, hsnCode: 1,
        mrp: 1, dpPrice: 1, discount: 1, gst: 1, shipping: 1, bvPoint: 1, levelPoint: 1,
        quantity: 1, reserveAmount: 1, status: 1, description: 1, specifications: 1,
        features: 1, size: 1, color: 1, weight: 1, dimension: 1,
        imageKey: { 
          $cond: { 
            if: { $lt: [{ $strLenCP: { $ifNull: ["$imageKey", ""] } }, 1000] }, 
            then: "$imageKey", 
            else: "" 
          } 
        }
      }
    }
  ]);
  
  console.log('Query finished in:', Date.now() - startQuery, 'ms');
  
  let totalSize = 0;
  for (const p of products) {
    const size = Buffer.byteLength(JSON.stringify(p));
    totalSize += size;
    console.log(p.productName, p.imageKey ? p.imageKey.substring(0, 50) : '');
  }
  console.log('Total Size:', totalSize / 1024 / 1024, 'MB');
  process.exit(0);
}
testQuery();
