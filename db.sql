CREATE DATABASE control_inventario CHARACTER SET utf8mb3;
USE control_inventario;

CREATE TABLE roles (
  idRol INT AUTO_INCREMENT PRIMARY KEY,
  rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
  idUsuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(45) NOT NULL,
  apellido VARCHAR(45) NOT NULL,
  cedula VARCHAR(20) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  roles_id INT NOT NULL,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (roles_id) REFERENCES roles(idRol)
);

CREATE TABLE categorias (
  idCategoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
);

CREATE TABLE proveedores (
  idProveedor INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  direccion TEXT NOT NULL,
  ciudad VARCHAR(50) NOT NULL,
  nombreContacto VARCHAR(45) NOT NULL,
  telefonoContacto VARCHAR(15) NOT NULL,
  correoContacto VARCHAR(100) NOT NULL,
  estado ENUM('activo','inactivo') NOT NULL,
  categoria_id INT,
  CONSTRAINT fk_proveedor_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(idCategoria)
);

CREATE TABLE productos (
  idProducto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precioCompra DECIMAL(10,2) NOT NULL,
  precioVenta DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  urlImagen VARCHAR(2048),
  proveedor_id INT,
  categoria_id INT,
  CONSTRAINT fk_producto_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores (idProveedor),
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (idCategoria)
);

CREATE TABLE ventas (
  idVenta INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) GENERATED ALWAYS AS (subtotal * 0.19) STORED,
  total DECIMAL(10,2) GENERATED ALWAYS AS (subtotal + iva) STORED,
  estado ENUM('completada','anulada','pendiente') NOT NULL DEFAULT 'pendiente',
  metodoPago ENUM('efectivo','tarjeta','transferencia','otro') NOT NULL DEFAULT 'efectivo',
  usuarios_id INT NOT NULL,
  CONSTRAINT fk_venta_usuario FOREIGN KEY (usuarios_id) REFERENCES usuarios(idUsuario)
);

CREATE TABLE detalleVentas (
  idDetalleVenta INT AUTO_INCREMENT PRIMARY KEY,
  ventas_id INT NOT NULL,
  productos_id INT NOT NULL,
  cantidad INT NOT NULL,
  precioUnitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_detalleVenta_venta FOREIGN KEY (ventas_id) REFERENCES ventas(idVenta),
  CONSTRAINT fk_detalleVenta_producto FOREIGN KEY (productos_id) REFERENCES productos(idProducto)
);

CREATE TABLE compras (
  idCompra INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL DEFAULT NOW(),
  subtotal DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) GENERATED ALWAYS AS (subtotal * 0.19) STORED,
  total DECIMAL(10,2) GENERATED ALWAYS AS (subtotal + iva) STORED,
  estado ENUM('completada','anulada','pendiente') NOT NULL DEFAULT 'pendiente',
  metodoPago ENUM('efectivo','tarjeta','transferencia','otro') NOT NULL DEFAULT 'efectivo',
  empleados_id INT NOT NULL,
  proveedores_id INT NOT NULL,
  CONSTRAINT fk_compra_usuario FOREIGN KEY (empleados_id) REFERENCES usuarios(idUsuario),
  CONSTRAINT fk_compra_proveedor FOREIGN KEY (proveedores_id) REFERENCES proveedores(idProveedor)
);

CREATE TABLE detalleCompras (
  idDetalleCompra INT AUTO_INCREMENT PRIMARY KEY,
  compras_id INT NOT NULL,
  productos_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precioUnitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_detalleCompra_compra FOREIGN KEY (compras_id) REFERENCES compras(idCompra),
  CONSTRAINT fk_detalleCompra_producto FOREIGN KEY (productos_id) REFERENCES productos(idProducto)
);

CREATE TABLE salarios (
  idSalario INT AUTO_INCREMENT PRIMARY KEY,
  cargo ENUM('vendedor', 'encargado', 'auxiliar de almacén') NOT NULL DEFAULT 'vendedor',
  salarioBase DECIMAL(10,2) NOT NULL,
  bonificacion DECIMAL(10,2) NOT NULL,
  deduccion DECIMAL(10,2) NOT NULL,
  usuarios_id INT NOT NULL,
  CONSTRAINT fk_salario_usuario FOREIGN KEY (usuarios_id) REFERENCES usuarios(idUsuario)
);