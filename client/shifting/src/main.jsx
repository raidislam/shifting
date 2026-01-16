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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
AOS.init();

const queryClient = new QueryClient()
createRoot(document.getElementById('root')).render(

  <StrictMode>
    <Toaster position="top-right" />
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
