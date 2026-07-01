import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Inventario = () => {
    /** Estado para productos */
    const [productos, setProductos] = useState([]);

    const [open, setOpen] = useState(false);
    const [categoria, setCategoria] = useState("Categoría");

    /** Estado para formulario */
    const [form, setForm] = useState({
        nombre: "",
        categoria: "",
        cantidad: "",
        precio: ""
    });

    /** Estado para edición */
    const [editando, setEditando] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchProductos = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user) {
                return;
            }

            const res = await fetch(
                `https://inventario-cell-plus-production-9224.up.railway.app/api/productos?usuario_id=${user.id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const data = await res.json();

            if (Array.isArray(data)) {
                setProductos(data);
            }

        } catch (error) {
            console.error("Error al cargar:", error);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    useEffect(() => {
        const actualizar = () => fetchProductos(); // tu función que consulta la API
        window.addEventListener("productosActualizados", actualizar);

        return () => window.removeEventListener("productosActualizados", actualizar);
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem("user"));

        if (!form.nombre || !form.categoria || !form.cantidad || !form.precio) {
            toast("Campos incompletos", { icon: "⚠️" });
            return;
        }

        // Validación para que no guarden cantidades negativas manualmente
        if (Number(form.cantidad) < 0) {
            toast.error("La cantidad no puede ser negativa");
            return;
        }

        try {
            const config = {
                method: editando ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    ...form,
                    cantidad: Number(form.cantidad),
                    precio: Number(form.precio),
                    usuario_id: user.id
                })
            };

            const url = editando
                ? `https://inventario-cell-plus-production-9224.up.railway.app/api/productos/${editando}`
                : "https://inventario-cell-plus-production-9224.up.railway.app/api/productos";

            const res = await fetch(url, config);

            if (!res.ok) throw new Error("Error en la operación");

            toast.success(editando ? "Producto actualizado" : "Producto agregado");
            setForm({ nombre: "", categoria: "", cantidad: "", precio: "" });
            setEditando(null);
            fetchProductos();

        } catch (error) {
            console.error("ERROR:", error);
            toast.error("Error al procesar producto");
        }
    };

    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        const guardadas = JSON.parse(localStorage.getItem("categorias")) || [];
        setCategorias(guardadas);
    }, []);

    const editarProducto = (producto) => {
        setForm({
            nombre: producto.nombre,
            categoria: producto.categoria,
            cantidad: producto.cantidad,
            precio: producto.precio
        });
        setEditando(producto.id);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">📦 Inventario</h1>

            <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                    className="p-2 rounded-2xl border border-white/30 bg-white/50 dark:bg-slate-800/60 backdrop-blur-5xl shadow-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 text-lg"
                />

                <div className="relative w-full">
                    {/* Botón principal */}
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="w-full p-3 rounded-2xl border border-white/30 bg-white/50 dark:bg-slate-800/60 backdrop-blur-5xl shadow-lg text-gray-500 dark:text-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 text-left"
                    >
                        {form.categoria || "Categoría"}
                    </button>

                    {/* Lista personalizada */}
                    {open && (
                        <ul className="absolute mt-3 w-full rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-lg text-gray-800 dark:text-gray-100 z-10">
                            <li
                                onClick={() => { setForm({ ...form, categoria: "Celulares" }); setOpen(false); }}
                                className="cursor-pointer p-2 hover:bg-white/20 dark:hover:bg-slate-700/40"
                            >
                                Celulares
                            </li>
                            {categorias.filter(cat => cat.nombre !== "Celulares").map((cat, index) => (
                                <li
                                    key={index}
                                    onClick={() => { setForm({ ...form, categoria: cat.nombre }); setOpen(false); }}
                                    className="cursor-pointer p-2 hover:bg-white/20 dark:hover:bg-slate-700/40"
                                >
                                    {cat.nombre}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <input
                    name="cantidad"
                    type="number"
                    min="0"
                    value={form.cantidad}
                    onChange={handleChange}
                    placeholder="Cantidad"
                    className="p-2 rounded-2xl border border-white/30 bg-white/50 dark:bg-slate-800/60 backdrop-blur-5xl shadow-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 text-lg"
                />

                <input
                    name="precio"
                    type="number"
                    min="0"
                    value={form.precio}
                    onChange={handleChange}
                    placeholder="Precio"
                    className="p-2 rounded-2xl border border-white/30 bg-white/50 dark:bg-slate-800/60 backdrop-blur-5xl shadow-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 text-lg"
                />

                <button type="submit" className="col-span-2 md:col-span-4 bg-white/20 dark:bg-slate-900/60 backdrop-blur-5xl border border-white/20 text-gray-800 dark:text-white font-semibold p-3 rounded-2xl shadow-lg hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all">
                    {editando ? "✏️ Actualizar Producto" : "➕ Agregar Producto"}
                </button>
            </form>

            <div
                className="bg-white/20 dark:bg-slate-900/60 backdrop-blur-5xl border border-white/20 rounded-3xl shadow-xl p-6">
                <h2 className="mb-4 text-gray-800 dark:text-white font-bold">Productos</h2>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-800 dark:text-white border-b">
                            <th className="py-2">Nombre</th>
                            <th>Categoría</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Accion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(productos) && productos.map((p) => (
                            <tr key={p.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700 animate-fadeIn">
                                <td className="py-2 dark:text-white">{p.nombre}</td>
                                <td className="dark:text-gray-100">{p.categoria}</td>
                                <td>
                                    <span className={`px-2 py-1 rounded text-white text-sm font-bold
                                        ${p.cantidad === 0
                                            ? "bg-red-600"
                                            : p.cantidad > 6
                                                ? "bg-green-600"
                                                : "bg-yellow-500"}`}>
                                        {p.cantidad}
                                    </span>
                                </td>
                                <td className="dark:text-white">${Number(p.precio).toLocaleString()}</td>
                                <td className="space-x-2">
                                    <button onClick={() => editarProducto(p)} className="text-blue-500 hover:underline">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventario;