// Polyfill for plotly.js which expects Node.js globals in browser environments
if (typeof global === 'undefined') {
  (window as any).global = window;
}

import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { FileProvider } from './context/FileContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <FileProvider>
    <App />
  </FileProvider>,
)