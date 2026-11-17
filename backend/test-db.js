const mongoose = require('mongoose');
require('dotenv').config();

console.log('Intentando conectar a MongoDB Atlas...');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🟢 ¡CONECTADO CON ÉXITO A MONGODB ATLAS!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('🔴 Error de conexión:', err.message);
    process.exit(1);
  });