// Importa a biblioteca central do React
import React from 'react';

// Importa a ferramenta responsavel por conectar o React ao documento HTML do navegador (DOM)
import ReactDOM from 'react-dom/client';

// Importa o componente principal da aplicacao que criamos no arquivo App.jsx
import App from './App';

// Importa o arquivo de estilos visuais (cores, tamanhos, fontes)
import './index.css';

// Localiza a tag <div id="root"></div> no arquivo index.html e injeta o componente App dentro dela
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
