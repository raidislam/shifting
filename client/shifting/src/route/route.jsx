import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/home/Home";
import AuthLayouts from "../layouts/AuthLayouts";
import Auth from "../pages/auth/login/Login";
import LoginPage from "../pages/auth/login/Login";


const router = createBrowserRouter([

  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home
      }
    ]
  },
  {
    path: "/",
    Component: AuthLayouts,
    children: [
      {
        path: 'login',
        Component: LoginPage
      }
    ]
  }
]);

export default router