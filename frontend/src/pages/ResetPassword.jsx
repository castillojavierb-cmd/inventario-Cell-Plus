import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!password || !confirmar) {
      setError("Complete todos los campos");
      return;
    }

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:3000/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token,
            password
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setMensaje("Contraseña actualizada correctamente");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        className="w-[450px] bg-white/20 dark:bg-slate-900/30 backdrop-blur-5xl border border-white/20 rounded-3xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Nueva contraseña
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
            Nueva contraseña
          </label>

          <div className="flex items-center border rounded-lg px-3 py-2 bg- mb-4">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none ml-2"
            />
          </div>

          <label className="text-gray-800 block mb-2">
            Confirmar contraseña
          </label>

          <div className="flex items-center border rounded-lg px-3 py-2 bg-">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="w-full outline-none ml-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className=" mt-6 w-full py-3 rounded-xl font-semibold text-gray-800 dark:text-gray-100 bg-white/50 dark:bg-slate-800/40 backdrop-blur-5xl border border-white/30 shadow-lg hover:opacity-70 transition ">
            {loading ? "Actualizando..." : "Guardar contraseña"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ResetPassword;