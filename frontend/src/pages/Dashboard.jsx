// Importaciones necesarias
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const Dashboard = () => {

    //  EFECTOS DE SONIDO
    const errorSound = new Audio("/sounds/error.wav");

    //  ESTADOS PRINCIPALES
    const [productos, setProductos] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [ventasHoy, setVentasHoy] = useState(0);
    const [editando, setEditando] = useState(null);
    const [cargandoVenta, setCargandoVenta] = useState(false);

    const [form, setForm] = useState({
        nombre: "",
        categoria: "",
        cantidad: "",
        precio: ""
    });

    //  LÓGICA DE BÚSQUEDA Y FILTRADO
    const { busqueda, setBusqueda } = useOutletContext();
    const texto = (busqueda || "").toLowerCase().trim();

    const resaltarTexto = (textoItem, busqueda) => {
        if (!textoItem) return "";
        if (!busqueda) return textoItem;

        const regex = new RegExp(`(${busqueda})`, "gi");
        const partes = textoItem.toString().split(regex);

        return partes.map((parte, index) =>
            parte.toLowerCase() === busqueda.toLowerCase() ? (
                <span key={index} className="bg-yellow-300 text-black px-1 rounded">
                    {parte}
                </span>
            ) : (
                parte
            )
        );
    };


    //  PERSISTENCIA Y API
    const fetchProductos = () => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            return;
        }

        fetch(`https://inventario-cell-plus-production-9224.up.railway.app/api/productos?usuario_id=${user.id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProductos(data);
                }
            });
    };

    const cargarDatos = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");
            if (!user || !token) {
                return;
            }

            const resProd = await fetch(`https://inventario-cell-plus-production-9224.up.railway.app/api/productos?usuario_id=${user.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
            );

            const dataProd = await resProd.json();

            if (Array.isArray(dataProd)) {
                setProductos(dataProd);
            } else {
                setProductos([]);
            }

            const resMov = await fetch(`https://inventario-cell-plus-production-9224.up.railway.app/api/movimientos?usuario_id=${user.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            const dataMov = await resMov.json();

            if (!Array.isArray(dataMov)) {
                setVentasHoy(0);
                return;
            }

            const hoy = new Date().toLocaleDateString();

            const totalVendidos = dataMov
                .filter(
                    m =>
                        m.tipo === "salida" &&
                        new Date(m.fecha).toLocaleDateString() === hoy
                )
                .reduce((acc, m) => acc + Number(m.cantidad), 0);

            setVentasHoy(totalVendidos);

        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const productosFiltrados = Array.isArray(productos)
        ? productos.filter((producto) =>
            producto.nombre?.toLowerCase().includes(texto) ||
            producto.categoria?.toLowerCase().includes(texto)
        )
        : [];

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch("https://inventario-cell-plus-production-9224.up.railway.app/api/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                cantidad: Number(form.cantidad),
                precio: Number(form.precio)
            })
        });
        limpiarFormulario();
        fetchProductos();
    };

    const editarProducto = (id) => {
        const producto = productos.find(p => p.id === id);
        if (!producto) return;
        setForm({
            nombre: producto.nombre,
            categoria: producto.categoria,
            cantidad: producto.cantidad,
            precio: producto.precio
        });
        setEditando(producto.id);
    };

    const cargarEstadisticas = async () => {
        await cargarDatos();
    };

    const venderProducto = async (producto) => {
        if (cargandoVenta) return;

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || producto.cantidad <= 0) {
                errorSound.play();
                toast.error(!user ? "Inicia sesión" : "Sin stock");
                return;
            }

            // CORRECCIÓN 1: Restar 1 al stock 
            await fetch("https://inventario-cell-plus-production-9224.up.railway.app/api/movimientos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    producto_id: producto.id,
                    cantidad: 1,
                    tipo: "salida"
                })
            });

            toast.success("Venta realizada");
            // CORRECCIÓN 2: Actualizar vista inmediatamente
            await cargarEstadisticas();

        } catch (error) {
            toast.error("Error en la venta");
            errorSound.play();
        }
    };

    const actualizarProducto = async (e) => {
        e.preventDefault();
        await fetch(`https://inventario-cell-plus-production-9224.up.railway.app/api/productos/${editando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                cantidad: Number(form.cantidad),
                precio: Number(form.precio)
            })
        });
        setEditando(null);
        limpiarFormulario();
        fetchProductos();
    };

    const limpiarFormulario = () => {
        setForm({ nombre: "", categoria: "", cantidad: "", precio: "" });
    };

    // USuma el total de los productos
    const totalProductos = Array.isArray(productos)
        ? productos.reduce((acc, item) => acc + Number(item.cantidad), 0)
        : 0;

    const stockBajo = productos.filter(p => p.cantidad < 6).length;

    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        const guardadas = JSON.parse(localStorage.getItem("categorias")) || [];
        setCategorias(guardadas);

        const actualizarCategorias = () => {
            const nuevas = JSON.parse(localStorage.getItem("categorias")) || [];
            setCategorias(nuevas);
        };

        window.addEventListener("productosActualizados", actualizarCategorias);
        return () => window.removeEventListener("productosActualizados", actualizarCategorias);
    }, []);


    return (
        <>
            {/* Buscador centrado */}
            <div className="flex items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mr-8">
                    Bienvenido
                </h1>

                {/* Buscador */}
                <div className="relative w-80 ml-60 rounded-3xl bg-white/50 dark:bg-slate-800/60 backdrop-blur-5xl border border-white/30 shadow-lg">
                    <input
                        type="text"
                        placeholder="🔍 Buscar producto o categoría..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full p-4 pl-12 rounded-3xl bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
                    />
                    {busqueda && (
                        <button
                            onClick={() => setBusqueda("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                        >
                            ❌
                        </button>
                    )}
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                <div className=" bg-white/20 backdrop-blur-5xl border border-white/20 dark:bg-slate-900/60 shadow-xl rounded-3xl p-6 text-lg font-semibold">
                    <p className="text-gray-800 dark:text-gray-100 text-lg ">Total Productos</p>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {totalProductos}
                    </h2>
                </div>


                <div className="bg-white/20 dark:bg-slate-900/60 backdrop-blur-5xl border border-white/20 shadow-xl rounded-3xl p-6 flex flex-row items-center justify-between">
                    {/* Categorías a la izquierda */}
                    <div className="text-left">
                        <p className="text-gray-800 dark:text-gray-100 text-lg font-semibold">
                            Categorías
                        </p>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                            {categorias.length}
                        </h2>
                    </div>


                    {/* Stock Bajo a la derecha */}
                    <div className="text-center">
                        {(() => {
                            if (!productos || productos.length === 0) {}

                            // Agrupar productos por categoría y sumar cantidades
                            const categorias = {};
                            productos.forEach((p) => {
                                if (p.categoria && typeof p.cantidad === "number") {
                                    categorias[p.categoria] = (categorias[p.categoria] || 0) + p.cantidad;
                                }
                            });

                            // Buscar la categoría con menor stock total (< 6)
                            const categoriaBaja = Object.entries(categorias)
                                .filter(([_, cantidad]) => cantidad < 6)
                                .sort((a, b) => a[1] - b[1])[0];

                            if (categoriaBaja) {
                                return (
                                    <>
                                        <p className="text-gray-800 dark:text-gray-100 text-lg font-semibold">
                                            Stock Bajo {" "}
                                            <span className="text-red-500 font-bold">{categoriaBaja[0]}</span>
                                        </p>
                                        <h2 className="text-3xl font-bold text-red-500 ">
                                            {categoriaBaja[1]}
                                        </h2>
                                    </>
                                );
                            }
                        })()}
                    </div>
                </div>


                <div
                    className=" bg-white/20 backdrop-blur-5xl border border-white/20 dark:bg-slate-900/60 shadow-xl rounded-3xl p-6 text-lg font-semibold">
                    <p className="text-gray-800 dark:text-gray-100">Ventas del día</p>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {ventasHoy}
                    </h2>
                </div>
            </div>

            <div
                className=" bg-white/20 dark:bg-slate-900/60 backdrop-blur-5xl border border-white/20 shadow-xl rounded-3xl p-6">

                <h2 className="mb-4 text-black dark:text-white font-semibold">Productos</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-800 dark:text-gray-100 border-b">
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Accion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosFiltrados.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4 text-black dark:text-white font-semibold">Productos no encontrados</td></tr>
                        ) : (
                            productosFiltrados.map((p) => (
                                <tr key={p.id} className="border-b dark:border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td>{resaltarTexto(p.nombre, texto)}</td>
                                    <td>{resaltarTexto(p.categoria, texto)}</td>
                                    <td>{p.cantidad}</td>
                                    <td>${Number(p.precio).toLocaleString()}</td>
                                    <td>
                                        <button onClick={() => venderProducto(p)} className="text-green-500 font-bold">
                                            Vender
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Dashboard;