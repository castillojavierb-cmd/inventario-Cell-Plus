import { useState } from "react";
import { User, Mail, Lock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  /**
   * Login Component
   * ----------------
   * Permite al usuario ingresar credenciales y acceder al sistema.
   * Valida usuario y contraseña contra la API.
   * Incluye registro de nuevos usuarios y manejo de errores.
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Debe ingresar correo y contraseña");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://inventario-cell-plus-production-9224.up.railway.app/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem("token", data.token);
      // ✅  Guardar sesión en localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Redirigir al sistema
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {

    if (!email.trim() || !password.trim()) {
      alert("Debe ingresar correo y contraseña");
      return;
    }

    try {
      const res = await fetch("https://inventario-cell-plus-production-9224.up.railway.app/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      alert("Cuenta creada correctamente ✅");

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(207, 206, 206, 0.73), rgba(105, 103, 103, 0.7)), url('/wallpaper.png')"
      }}
    >

      {/* CARD */}
      <div
        className=" w-[900px] h-[500px] bg-white/20 backdrop-blur-5xl border border-white/20 rounded-3xl shadow-2xl flex overflow-hidden">

        {/* LADO IZQUIERDO (IMAGEN) */}
        <div className="w-1/2 bg-blue-800 flex items-center justify-center">
          <img
            src="/img.png" // pon aquí tu imagen
            alt="login"
            className="h-125"
          />
        </div>

        {/* LADO DERECHO (FORMULARIO) */}

        <form onSubmit={handleLogin}
          className="w-1/2 p-10 flex flex-col justify-center">

          {/* TÍTULO */}
          <div className="flex items-center gap-2 mb-6">
            <User className="text-blue-900" />
            <h2 className="text-2xl font-bold text-gray-900">
              Iniciar sesión
            </h2>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <label className="text-sm text-gray-800">Email</label>
          <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
            <Mail size={18} className="text-gray-800" />
            <input
              type="email"
              placeholder="usuario@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none ml-2"
            />
          </div>
          {/* PASSWORD */}
          <label className="text-sm text-gray-800">Contraseña</label>
          <div className="flex items-center border rounded-lg px-3 py-2 mb-2">
            <Lock size={18} className="text-gray-800" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none ml-2"
            />

          </div>


          {/* OLVIDASTE */}
          <p
            onClick={() => navigate("/forgot-password")}
            className="text-blue-800 text-sm text-right mb-4 cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </p>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-semibold text-gray-800 dark:text-gray-100 bg-white/50 dark:bg-slate-800/40 backdrop-blur-5xl border border-white/30 shadow-lg hover:opacity-70 transition">
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          {/* REGISTRO */}
          <p className="text-center text-sm mt-6 text-gray-900">
            ¿No tienes cuenta?
          </p>
          <p
            onClick={handleRegister}
            className="text-center text-blue-800 font-semibold cursor-pointer"
          >
            Crear cuenta
          </p>
        </form>
      </div>
    </div>

  );
};

export default Login;