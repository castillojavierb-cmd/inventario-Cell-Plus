#  Sistema de Inventario con Autenticación

##  Descripción del Proyecto

Aplicación web desarrollada con React y Node.js que permite gestionar productos, ventas e inventario por usuario, utilizando autenticación basada en JWT.

---

##  Funcionalidades Implementadas

###  Autenticación

* Registro de usuarios
* Inicio de sesión (login)
* Generación de token JWT
* Almacenamiento del token en localStorage
* Protección de rutas (no se puede acceder sin login)

---

###  Gestión de Productos

* Crear productos
* Editar productos
* Eliminar productos
* Listar productos por usuario
* Control de stock

---

###  Ventas

* Venta de productos
* Descuento automático de stock
* Registro de movimientos (entradas/salidas)
* Cálculo de ventas del día

---

###  Dashboard

* Total de productos
* Indicador de stock
* Ventas del día
* Búsqueda de productos en tiempo real

---

###  Frontend

* React + Vite
* React Router (rutas protegidas)
* Manejo de estado con useState/useEffect
* Notificaciones con react-hot-toast

---

## 🚧 Funcionalidades por Mejorar

* 🛡️ Mejor manejo de errores (try/catch + validaciones)
* 🔁 Refresco automático del estado después de acciones
* 📉 Validación de stock antes de vender
* 🧾 Historial de ventas más completo
* 🎨 Mejoras visuales en la interfaz

---

## 🚀 Próximos Pasos

3. Validar que el backend siempre devuelva arrays
4. Mejorar ProtectedRoute para mayor seguridad
5. Optimizar flujo de login y navegación
6. Agregar manejo de errores visual para el usuario

---

## ⚙️ Tecnologías Usadas

* Frontend: React + Vite
* Backend: Node.js + Express
* Base de datos: (por definir o usada en el proyecto)
* Autenticación: JWT

---

## 📈 Estado del Proyecto

🟡 En produccion 