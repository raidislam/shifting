import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/home/Home";
import AuthLayouts from "../layouts/AuthLayouts";
import Auth from "../pages/auth/login/Login";
import LoginPage from "../pages/auth/login/Login";
import RegistrationPage from "../pages/auth/registration/Registration";
import PrivateRoute from "../routes/PrivateRoute";


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
      },
      {
        path: 'register',
        Component: RegistrationPage
      },
      // {
      //   path: 'auth',
      //   Component: <PrivateRoute><Auth /></PrivateRoute>
      // }
    ]
  }
]);

export default router