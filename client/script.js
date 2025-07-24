// script.js mejorado

// Asegura que exista un carrito global (puede venir de otro script o localStorage)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ================ MERCADO PAGO ================
// Declaración única de 'mp'
const mp = new MercadoPago('APP_USR-1328639708216666-062611-b443dfeafa2b4ed7c16ba1124848db7a-1886217295', {
  locale: 'es-UY'
});

// Función de checkout con Mercado Pago
async function checkoutMercadoPago() {
  console.log('🛒 Iniciando checkout MercadoPago...');
  console.log('Carrito actual:', cart);

  // Validaciones del carrito
  if (!Array.isArray(cart) || cart.length === 0) {
    return alert('El carrito está vacío');
  }
  const invalid = cart.filter(item => !item.name || typeof item.price !== 'number');
  if (invalid.length > 0) {
    console.error('❌ Items inválidos:', invalid);
    return alert('Hay productos sin nombre o precio en el carrito');
  }

  const btn = document.getElementById('mercadopagoBtn');
  const originalText = btn.textContent;
  btn.textContent = 'Procesando...';
  btn.disabled = true;

  try {
    // Enviar petición al backend
    const response = await fetch(`${window.location.origin}/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart })
    });

    console.log('📥 Estado:', response.status);
    if (!response.ok) {
      const text = await response.text();
      console.error('❌ HTTP Error:', response.status, text);
      let err;
      try { err = JSON.parse(text); } catch { err = { error: text }; }
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta:', data);
    if (!data.id) throw new Error('No se recibió ID de preferencia');

    // Abrir checkout
    mp.checkout({ preference: { id: data.id }, autoOpen: true, redirectMode: 'web' });

  } catch (error) {
    console.error('💥 Error en checkout:', error);
    alert(`Error al iniciar pago: ${error.message}`);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// Para debug manual del carrito
function debugCart() {
  console.group('🔍 DEBUG carrito');
  console.log('Tipo:', typeof cart);
  console.log('Es array:', Array.isArray(cart));
  console.log('Longitud:', cart.length);
  console.log('Contenido:', cart);
  console.groupEnd();
}

// Opcional: Probar conexión al servidor al cargar (requiere endpoint /test)
// window.addEventListener('DOMContentLoaded', testServer);

// Función de prueba al servidor (opcional)
async function testServer() {
  try {
    const res = await fetch(`${window.location.origin}/test`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true }) });
    const data = await res.json();
    console.log('✅ Test servidor:', data);
  } catch (err) {
    console.error('❌ Falló test servidor:', err);
  }
}
