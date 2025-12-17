/**
 * server.js
 * Entry point for BrahminBazaar backend (Railway-ready)
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import DB connector and models
const {
  connectDB,
  Product,
  User,
  Order,
  OrderItem,
  SellerApp
} = require('./db'); // if db/index.js → './db'

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

/* =======================
   Middleware
======================= */
app.use(cors({
  origin: '*', // later restrict to your domain
}));
app.use(express.json());

/* =======================
   Health Check (IMPORTANT)
======================= */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

/* =======================
   PRODUCT ROUTES
======================= */

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();

    // Map DB → frontend structure
    const frontendProducts = products.map(p => ({
      id: p.id,                 // numeric ID
      title: p.name,
      basePrice: p.price,
      category: p.category,
      img: p.imageUrl,
      varieties: p.varieties,
      tagline: p.tagline,
      isLiquid: p.isLiquid
    }));

    res.json(frontendProducts);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// UPDATE product
app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const dataToUpdate = {
      name: req.body.title,
      price: req.body.basePrice,
      category: req.body.category,
      imageUrl: req.body.img,
      tagline: req.body.tagline,
      isLiquid: req.body.isLiquid
    };

    const [updated] = await Product.update(dataToUpdate, {
      where: { id: productId }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findByPk(productId);
    res.json(updatedProduct);

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

/* =======================
   SELLER APPLICATION
======================= */

app.post('/api/sellers', async (req, res) => {
  try {
    const seller = await SellerApp.create(req.body);
    res.status(201).json(seller);
  } catch (error) {
    console.error('Seller create error:', error);
    res.status(500).json({ message: 'Failed to create seller application' });
  }
});

/* =======================
   SERVER STARTUP
======================= */

(async () => {
  try {
    await connectDB(); // connect + sync DB

    app.listen(PORT, () => {
      console.log('----------------------------------');
      console.log(`Server running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
      console.log('----------------------------------');
    });

  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
})();
