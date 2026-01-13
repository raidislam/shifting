import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router/dom";
import router from './route/route.jsx';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthProvider from './context/AuthContext/AuthProvider.jsx';
import "leaflet/dist/leaflet.css";
import { Toaster } from "react-hot-toast";
AOS.init();

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <Toaster position="top-right" />
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
