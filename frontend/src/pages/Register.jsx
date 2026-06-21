import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Guardar usuario en localStorage (simulación)
    const user = { email, password };
    localStorage.setItem("registeredUser", JSON.stringify(user));

    alert("Usuario registrado correctamente");

    navigate("/");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Crear Cuenta
        </h2>

        <input
          type="email"
          placeholder="Correo"
          className="w-full mb-4 p-2 border rounded"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-4 p-2 border rounded"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-green-500 text-white p-2 rounded">
          Registrarse
        </button>

        <p className="text-sm mt-4 text-center">
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className="text-blue-500">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;