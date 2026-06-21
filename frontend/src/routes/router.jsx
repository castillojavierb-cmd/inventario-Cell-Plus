import { createBrowserRouter } from "react-router-dom";
import Layout from "../layouts/Layout";
import Dashboard from "../pages/Dashboard";
import Inventario from "../pages/Inventario";
import Sales from "../pages/Sales";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <Dashboard />
      },
      {
        path: "/inventario",
        element: <Inventario />
      },
      {
        path: "/sales",
        element: <Sales />
      }
    ]
  }
]);