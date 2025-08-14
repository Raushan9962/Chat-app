// src/main.jsx
import { Buffer } from 'buffer';
import React from 'react'; // ✅ Needed for JSX
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Sun, Moon, Palette, Zap, Heart, Leaf, Crown, Waves } from "lucide-react";

import App from './App.jsx';
import './index.css'; // ✅ Use index.css if using Tailwind or global styles
 window.Buffer = Buffer;
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
 
);
