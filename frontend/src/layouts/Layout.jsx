// Importaciones necesarias
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ClipboardList,
} from "lucide-react";


/**
 * Layout Component
 * ----------------
 * Componente principal que define la estructura del sistema de inventario.
 * Incluye:
 * - Sidebar con navegación y categorías.
 * - Navbar con menú de usuario y toggle de modo oscuro.
 * - Contenido dinámico renderizado en el área principal.
 *
 * Props:
 * @param children Contenido dinámico que se renderiza dentro del layout.
 * @param busqueda Estado de búsqueda global.
 * @param setBusqueda Función para actualizar la búsqueda global.
 */

const Layout = () => {
  /** Sonido de error */
  const errorSound = new Audio("/sounds/error.wav");

  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");

  /** Estado para modo oscuro */
  const [darkMode, setDarkMode] = useState(false);

  /** Estado para menú de usuario */
  const [openUserMenu, setOpenUserMenu] = useState(false);

  /** Referencia para detectar clicks fuera del menú */
  const menuRef = useRef();

  //Agregar categoria nueva
  const [nuevaCategoria, setNuevaCategoria] = useState("");


  /**
 * Lista de categorías disponibles en el sistema.
 * Cada categoría incluye un nombre y un icono representativo.
 */
  const [categorias, setCategorias] = useState(() => {

    const guardadas = localStorage.getItem("categorias");

    return guardadas ? JSON.parse(guardadas) : [
      { nombre: "Celulares" },
      { nombre: "Smartwatches" },
      { nombre: "Parlantes" },
      { nombre: "Audífonos" },
      { nombre: "Diademas" },
      { nombre: "Teclados" },
      { nombre: "Pads" },
      { nombre: "Cargadores" },
      { nombre: "Power banks" },
      { nombre: "Cables USB" },
      { nombre: "Vidrios templados" },
      { nombre: "Cases" },
      { nombre: "Protectores de cámara" },
      { nombre: "Pendrive" },
      { nombre: "Cable HDMI" },
      { nombre: "Jack 3.5mm" },
      { nombre: "Otros" },
    ];
  });

  // ➕ Agregar categoría desde formulario
  const agregarCategoria = (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;

    const nuevasCategorias = [...categorias, { nombre: nuevaCategoria }];

    // Actualizar estado
    setCategorias(nuevasCategorias);

    // Guardar en localStorage
    localStorage.setItem("categorias", JSON.stringify(nuevasCategorias));

    // Disparar evento para que Dashboard e Inventario se actualicen
    window.dispatchEvent(new Event("productosActualizados"));

    // Limpiar input
    setNuevaCategoria("");

    // Opcional: mostrar alerta de éxito
    toast.success(`Categoría "${nuevaCategoria}" agregada`);
  };


  // ❌ Eliminar categoría y productos ligados
  const eliminarCategoria = (nombre) => {
    errorSound.currentTime = 0;
    errorSound.play();

    toast((t) => (
      <div style={{ textAlign: "center" }}>
        <p className="text-gray-800 dark:text-gray-100 text-lg font-semibold">
          ¿Eliminar categoría <span className="font-bold">"{nombre}"</span> y sus productos?
        </p>
        <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={async () => {
              await fetch(`https://inventario-cell-plus-production-9224.up.railway.app/api/productos/categoria/${encodeURIComponent(nombre)}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
              });

              const nuevasCategorias = categorias.filter((cat) => cat.nombre !== nombre);
              setCategorias(nuevasCategorias);
              localStorage.setItem("categorias", JSON.stringify(nuevasCategorias));

              window.dispatchEvent(new Event("productosActualizados"));

              toast.dismiss(t.id);
              toast.success(`Categoría "${nombre}" eliminada`);
            }}
            className="px-4 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
          >
            Aceptar
          </button>
        </div>
      </div>
    ), {
      style: {
        background: "#ee0b22",
        color: "#0c0c0c",
        padding: "6px 16px",
        borderRadius: "12px",
      }
    });

  };


  // ✅ 2. AQUÍ PEGAS handleLogout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    localStorage.setItem("categorias", JSON.stringify(categorias));
  }, [categorias]);


  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      navigate("/login");
    }
  }, [navigate]);


  /** Cargar tema guardado desde localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved) {
      setDarkMode(saved === "dark");
    } else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(systemDark);
    }
  }, []);;

  /** Aplicar modo oscuro/claro al HTML */
  useEffect(() => {
    const html = document.documentElement;

    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode]);

  /** Cerrar menú si se hace click fuera */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** Reiniciar datos de ventas si cambia el día */
  useEffect(() => {

    const dataGuardada = JSON.parse(localStorage.getItem("ventasData"));
    const hoy = new Date().toDateString();

    if (dataGuardada) {

      if (dataGuardada.fecha === hoy) {

      } else {
        localStorage.setItem("ventasData", JSON.stringify({
          total: 0,
          fecha: hoy
        }));
      }

    } else {
      localStorage.setItem("ventasData", JSON.stringify({
        total: 0,
        fecha: hoy
      }));
    }

  }, []);

  /**
    * Cambia entre modo oscuro y claro.
    */
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <div
      className="flex h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(244, 240, 240, 0.89), rgba(245, 250, 248, 0.56)), url('/wallpaper.png')"
      }}
    >

      {/* SIDEBAR */}
      <aside
        className="w-64 h-screen sticky top-0 bg-white/20 backdrop-blur-5xl dark:bg-slate-900/60 border-r border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex flex-col">
        {/* LOGO */}
        <div className="p-8 border-b dark:border-gray-700 flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-lg text-white">📱</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Cell Plus
            </h1>
            <span className="text-xs text-gray-800 dark:text-gray-100">
              Inventario
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 p-4 overflow-y-auto">

          {/* Dashboard */}
          <NavLink to="/dashboard" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900"
              : "text-gray-800 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`
          }>
            <LayoutDashboard size={20} />
            Productos
          </NavLink>


          {/* CATEGORÍAS DESPLEGABLE */}
          <div className="px-3 py-2 text-gray-800 dark:text-gray-100">
            <details>
              <summary className="cursor-pointer flex items-center gap-3 hover:text-blue-500">
                <Package size={20} />
                Categorías
              </summary>

              {/* Lista de categorías dinámica */}
              <div className="ml-6 mt-2 flex flex-col gap-1 text-sm">
                {categorias.map((cat) => (
                  <div key={cat.nombre} className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 hover:text-blue-500 text-left"
                      onClick={() => setBusqueda(cat.nombre)}
                    >
                      {cat.nombre}
                    </button>
                  </div>
                ))}
              </div>

              {/* 🔹 Formulario para agregar categoría */}
              <form onSubmit={agregarCategoria} className="mt-8 flex flex-col gap-2">
                <input
                  type="text-gray-800"
                  placeholder="Nombre categoría"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className="px-6 py-2 rounded-lg border border-gray-800 dark:text-gray-100 focus:ring focus:ring-blue-800"
                />
                {/* Botón Agregar */}
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Agregar
                </button>
              </form>

              {/* 🔹 Botón para eliminar categoría seleccionada */}
              <button
                onClick={() => eliminarCategoria(busqueda)} // elimina la categoría seleccionada
                disabled={!busqueda} // se desactiva si no hay selección
                className={`mt-2 px-16 py-2 rounded-lg text-white ${busqueda
                  ? "bg-red-500 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"}`}
              >
                Eliminar
              </button>

            </details>
          </div>


          <NavLink to="/inventario" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900"
              : "text-gray-800 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`
          }>
            <ClipboardList size={20} />
            Inventario
          </NavLink>

          {/* Ventas ) */}
          <NavLink to="/sales" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900"
              : "text-gray-800 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`
          }>
            <ShoppingCart size={20} />
            Ventas
          </NavLink>
        </nav>


        {/* Footer */}
        <div className="mt-4 border-t dark:border-gray-100 text-gray-900 dark:text-gray-100  text-center py-3 ">
          © 2026 Cell Plus
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
        <header
          className="bg-white/20 backdrop-blur-5xl border border-white/20 dark:bg-slate-900/60 shadow-xl p-6">
          <div className="flex items-center justify-between w-full">

            {/* Título */}
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              Sistema de Inventario
            </h2>


            {/*  USUARIO */}
            <div className="flex items-center gap-4 relative" ref={menuRef}>

              {/*  Notificación */}
              <div className="relative text-gray-800 dark:text-gray-100 cursor-pointer">
                🔔
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>

              {/*  Botón usuario */}
              <button
                onClick={() => setOpenUserMenu(!openUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <Users size={20} />
                <span>Usuario</span>
              </button>

              {/* Menú desplegable */}
              {openUserMenu && (
                <div
                  className="absolute right-0 top-16 w-48 bg-white/5 dark:bg-white/50 backdrop-blur-5xl rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden">
                  {/* Toggle modo oscuro */}
                  <button
                    onClick={toggleDarkMode}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {darkMode ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600"
                  >
                    🔒 Cerrar Sesión
                  </button>

                </div>
              )}
            </div>

          </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <main
          className=" p-8 overflow-auto bg-transparent" >
          <Outlet context={{ busqueda, setBusqueda }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;