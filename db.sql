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
  roles_idRol INT NOT NULL,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (roles_idRol) REFERENCES roles(idRol)
);

CREATE TABLE categorias (
  idCategoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
);

CREATE TABLE tipoProveedor (
  idTipoProveedor INT AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(50) NOT NULL
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
  tipoProveedor_idTipoProveedor INT NOT NULL,
  CONSTRAINT fk_proveedor_tipo FOREIGN KEY (tipoProveedor_idTipoProveedor) REFERENCES tipoProveedor(idTipoProveedor)
);

CREATE TABLE productos (
  idProducto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precioCompra DECIMAL(10,2) NOT NULL,
  precioVenta DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  proveedores_idProveedor INT NOT NULL,
  categorias_idCategoria INT NOT NULL,
  CONSTRAINT fk_producto_proveedor FOREIGN KEY (proveedores_idProveedor) REFERENCES proveedores(idProveedor),
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categorias_idCategoria) REFERENCES categorias(idCategoria)
);

CREATE TABLE ventas (
  idVenta INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('completada','anulada','pendiente') NOT NULL,
  usuarios_idUsuario INT NOT NULL,
  CONSTRAINT fk_venta_usuario FOREIGN KEY (usuarios_idUsuario) REFERENCES usuarios(idUsuario)
);

CREATE TABLE detalleVentas (
  idDetalleVenta INT AUTO_INCREMENT PRIMARY KEY,
  fechaVenta DATE NOT NULL,
  cantidad INT NOT NULL,
  precioUnitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precioUnitario) STORED,
  ventas_idVenta INT NOT NULL,
  productos_idProducto INT NOT NULL,
  CONSTRAINT fk_detalleVenta_venta FOREIGN KEY (ventas_idVenta) REFERENCES ventas(idVenta),
  CONSTRAINT fk_detalleVenta_producto FOREIGN KEY (productos_idProducto) REFERENCES productos(idProducto)
);

CREATE TABLE compras (
  idCompra INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('completada','anulada','pendiente') NOT NULL,
  empleados_idEmpleado INT NOT NULL,
  proveedores_idProveedor INT NOT NULL,
  CONSTRAINT fk_compra_usuario FOREIGN KEY (empleados_idEmpleado) REFERENCES usuarios(idUsuario),
  CONSTRAINT fk_compra_proveedor FOREIGN KEY (proveedores_idProveedor) REFERENCES proveedores(idProveedor)
);

CREATE TABLE detalleCompras (
  idDetalle INT AUTO_INCREMENT PRIMARY KEY,
  fechaCompra DATE NOT NULL,
  cantidad INT NOT NULL,
  precioUnitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precioUnitario) STORED,
  compras_idCompra INT NOT NULL,
  productos_idProducto INT NOT NULL,
  CONSTRAINT fk_detalleCompra_compra FOREIGN KEY (compras_idCompra) REFERENCES compras(idCompra),
  CONSTRAINT fk_detalleCompra_producto FOREIGN KEY (productos_idProducto) REFERENCES productos(idProducto)
);

CREATE TABLE salarios (
  idSalario INT AUTO_INCREMENT PRIMARY KEY,
  salarioBase DECIMAL(10,2) NOT NULL,
  bonificacion DECIMAL(10,2) NOT NULL,
  deduccion DECIMAL(10,2) NOT NULL,
  usuarios_idUsuario INT NOT NULL,
  CONSTRAINT fk_salario_usuario FOREIGN KEY (usuarios_idUsuario) REFERENCES usuarios(idUsuario)
);

CREATE TABLE metodosPago (
  idMetodosPago INT AUTO_INCREMENT PRIMARY KEY,
  opcionesPago ENUM('efectivo','tarjeta','transferencia','otro') NOT NULL,
  ventas_idVenta INT,
  compras_idCompra INT,
  CONSTRAINT fk_metodoPago_venta FOREIGN KEY (ventas_idVenta) REFERENCES ventas(idVenta),
  CONSTRAINT fk_metodoPago_compra FOREIGN KEY (compras_idCompra) REFERENCES compras(idCompra)
);