import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

// Layout
import Layout from "./layouts/Layout";

// Páginas
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Sales from "./pages/Sales";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Seguridad
import ProtectedRoute from "./components/ProtectedRoute";

import "./index.css";

function App() {
  const [busqueda, setBusqueda] = useState("");

  return (
    <Routes>

      {/* 🔓 PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />


      {/* 🔁 REDIRECCIÓN AUTOMÁTICA */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* 🔒 PRIVADAS */}
      <Route
        element={
          <ProtectedRoute>
            <Layout busqueda={busqueda} setBusqueda={setBusqueda} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/sales" element={<Sales />} />
      </Route>

    </Routes>
  );
}

export default App;