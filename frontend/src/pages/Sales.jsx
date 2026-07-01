import { useEffect, useState } from "react";

export default function Sales() {
  const [busqueda, setBusqueda] = useState("");
  const [ventas, setVentas] = useState([]);

  // 🔥 Cargar ventas desde backend
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      fetch("https://inventario-cell-plus-production-9224.up.railway.app/api/movimientos", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setVentas(data);
          } else if (data && data.movimientos && Array.isArray(data.movimientos)) {
            setVentas(data.movimientos);
          } else {
            setVentas([]);
          }
        })
        .catch(err => {
          console.error("ERROR FETCH:", err);
          setVentas([]);
        });
    } catch (error) {
      console.error("Error al leer usuario:", error);
    }
  }, []);

  // 📅 Formatear fecha para búsqueda
  const formatearFechaBusqueda = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return ""; // Evita fechas inválidas
    return d.toLocaleString("es-CO", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // 🔍 Filtrar ventas
  const ventasFiltradas = Array.isArray(ventas)
    ? ventas.filter((v) => {
        const textoBusqueda = busqueda.toLowerCase().trim();
        const producto = String(v.producto || "").toLowerCase();
        const fechaLegible = v.fecha ? formatearFechaBusqueda(v.fecha).toLowerCase() : "";
        return producto.includes(textoBusqueda) || fechaLegible.includes(textoBusqueda);
      })
    : [];

  // ✨ Resaltar texto buscado
  const resaltarTexto = (texto) => {
    const textoSeguro = String(texto || "");
    if (!busqueda.trim()) return textoSeguro;
    
    // Escapar caracteres para que el buscador no rompa con "(" o "*"
    const busquedaEscapada = busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const partes = textoSeguro.split(new RegExp(`(${busquedaEscapada})`, "gi"));
    
    return partes.map((parte, i) =>
      parte.toLowerCase() === busqueda.toLowerCase().trim() ? (
        <span key={i} className="bg-yellow-300 text-black px-1 rounded">{parte}</span>
      ) : (parte)
    );
  };

  // 💰 CÁLCULO DE INGRESOS (Solo de hoy)
  const hoy = new Date().toLocaleDateString();
  const totalIngresosHoy = ventas.reduce((acc, v) => {
    const esHoy = new Date(v.fecha).toLocaleDateString() === hoy;
    // Aseguramos que precio y cantidad sean números para evitar NaN
    const subtotal = (Number(v.precio) || 0) * (Number(v.cantidad) || 0);
    return esHoy ? acc + subtotal : acc;
  }, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Historial de Ventas
        </h2>

        {/* 🔍 Buscador */}
        <div className="relative">
          <span className="absolute inset-y-0 left-2 flex items-center text-gray-900 "></span>
          <input
            type="text"
            
            placeholder="🔍 Buscar producto o fecha..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 pr-4 py-2 w-72 bg-white/50 dark:bg-slate-800/60 backdrop-blur-5xl border border-white/50 rounded-2xl shadow-lg text-gray-800 dark:text-gray-100 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"/>
        </div>

        {/* 💰 Botón de Ingresos */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-full shadow-md w-fit transition-all hover:scale-[1.02] bg-green-400 dark:bg-green-420 text-black">
          <span className="text-lg font-bold whitespace-nowrap">
            Ventas del Día
          </span>
          <span className="text-xl font-bold font-mono">
            $ {totalIngresosHoy.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 📊 Tabla */}
      <div
  className="bg-white/20 dark:bg-slate-900/60 backdrop-blur-5xl border border-white/20 rounded-3xl shadow-xl p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-800 dark:text-gray-100 border-b">
              <th className="pb-3 text-left w-1/2">Producto</th>
              <th className="pb-3 text-center w-1/6">Cant.</th>
              <th className="pb-3 text-center w-1/6">Precio</th>
              <th className="pb-3 text-center w-1/6">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.length > 0 ? (
              [...ventasFiltradas].reverse().map((venta, i) => (
                <tr key={i} className="border-b dark:border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="py-3 text-left dark:text-white">{resaltarTexto(venta.producto)}</td>
                  <td className="py-3 text-center dark:text-white">{venta.cantidad}</td>
                  <td className="py-3 text-center dark:text-white">${Number(venta.precio || 0).toLocaleString()}</td>
                  <td className="py-4 text-center whitespace-nowrap dark:text-white">
                    {venta.fecha ? resaltarTexto(formatearFechaBusqueda(venta.fecha)) : "---"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-10 text-center text-gray-500">No se encontraron ventas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}