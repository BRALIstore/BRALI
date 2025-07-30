const express = require('express');
const cors = require('cors');
const path = require('path');
const mercadopago = require('mercadopago');

const app = express();

// Instalar SDK v1 y luego:
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

console.log('preferences existe?:', mercadopago.preferences ? 'sí' : 'NO');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Ruta para crear preferencia de pago
app.post('/create-preference', async (req, res) => {
  try {
    const { cart } = req.body;
    if (!Array.isArray(cart) || cart.length === 0)
      return res.status(400).json({ error: 'Carrito vacío o inválido' });

    const items = cart.map(i => {
  const precioConComision = Number(i.price) * 1.10; // Suma 10%
  return {
    title: i.name,
    quantity: Number(i.quantity),
    unit_price: Number(precioConComision.toFixed(2)), // Redondea a 2 decimales
    currency_id: 'UYU'
  };
});


    const response = await mercadopago.preferences.create({ items });
    res.json({ id: response.body.id, init_point: response.body.init_point });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'No se pudo generar la preferencia', message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

