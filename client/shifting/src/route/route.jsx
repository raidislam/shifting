import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/home/Home";
import AuthLayouts from "../layouts/AuthLayouts";
import Auth from "../pages/auth/login/Login";
import LoginPage from "../pages/auth/login/Login";
import RegistrationPage from "../pages/auth/registration/Registration";
import PrivateRoute from "../routes/PrivateRoute";
import Contact from "../pages/contact/contact";
import Coverage from "../pages/coverage/coverage";
import SendParcel from "../pages/sendParcel/sendparcel";


const router = createBrowserRouter([

  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home
      },
      {
        path: 'contact',
        Component: Contact
      },
      {
        path: 'coverage',
        Component: Coverage,
        loader: () => fetch('./branches.json')
      },
      {
        path: "send-parcel",
        element: <PrivateRoute><SendParcel /></PrivateRoute>,
        loader:()=>fetch('./branches.json')
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