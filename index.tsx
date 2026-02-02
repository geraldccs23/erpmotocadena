
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("No se encontró el elemento root para montar la aplicación.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Error fatal durante el renderizado inicial:", err);
    rootElement.innerHTML = `
      <div style="background: black; color: #f59e0b; font-family: sans-serif; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 20px;">
        <div>
          <h1 style="font-size: 24px; margin-bottom: 10px;">ERROR DE IGNICIÓN</h1>
          <p style="color: #52525b;">Hubo un problema al arrancar el ERP. Revisa la consola para más detalles.</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; background: #f59e0b; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer;">REINTENTAR</button>
        </div>
      </div>
    `;
  }
}
