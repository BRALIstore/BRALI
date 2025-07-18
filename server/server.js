const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

// Token de Mercado Pago
const MP_TOKEN = 'APP_USR-1328639708216666-062611-b443dfeafa2b4ed7c16ba1124848db7a-1886217295';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Crear preferencia de Mercado Pago
app.post('/create-preference', async (req, res) => {
  const { cart } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: 'Carrito vacío' });
  }

  const items = cart.map(producto => {
    const precioConRecargo = parseFloat((producto.price * 1.10).toFixed(2)); // suma 10%
    return {
      title: producto.name,
      unit_price: precioConRecargo,
      quantity: producto.quantity,
      currency_id: 'UYU'
    };
  });

  try {
    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      {
        items,
        back_urls: {
          success: 'https://brali.com/success',
          failure: 'https://brali.com/failure',
          pending: 'https://brali.com/pending'
        },
        auto_return: 'approved'
      },
      {
        headers: {
          Authorization: `Bearer ${MP_TOKEN}`
        }
      }
    );

    res.json({ preferenceId: response.data.id });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Error al crear preferencia' });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
