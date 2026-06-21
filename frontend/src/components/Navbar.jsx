import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    // Aquí puedes poner tu lógica real de logout (limpiar tokens, redirigir, etc.)
    alert("Sesión cerrada ✅");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow">
      <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Sistema de Inventario
      </div>
      <div className="flex items-center space-x-4 relative">
        {/* Notificaciones */}
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Botón Usuario */}
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="text-gray-600 dark:text-gray-300">Usuario</span>
        </button>

        {/* Menú desplegable */}
        {openMenu && (
          <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 animate-fadeIn">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {darkMode ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
            >
              🔒 Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
