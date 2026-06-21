import { useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import crypto from "crypto";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!email.trim()) {
      setError("Ingrese un correo");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:3000/api/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setMensaje(data.message);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(207, 206, 206, 0.73), rgba(105, 103, 103, 0.7)), url('/wallpaper.png')"
      }}
    >
      <div
        className=" w-[450px] bg-white/20 dark:bg-slate-900/30 backdrop-blur-5xl border border-white/20 rounded-3xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Recuperar contraseña
        </h2>

        {mensaje && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="text-gray-800 block mb-2">
            Correo electrónico
          </label>

          <div className="flex items-center border rounded-lg px-3 py-2 bg-g">
            <Mail size={18} />
            <input
              type="email"
              placeholder="correo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none ml-2"
            />
          </div>

          <button type="submit"
            className=" mt-6 w-full py-3 rounded-xl font-semibold text-gray-800 dark:text-gray-100 bg-white/50 dark:bg-slate-800/40 backdrop-blur-5xl border border-white/30 shadow-lg hover:opacity-70 transition">
            Enviar solicitud
          </button>

        </form>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 w-full text-blue-800 font-semibold ">
          Volver al login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;