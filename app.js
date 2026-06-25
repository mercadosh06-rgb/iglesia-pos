window.onerror = function() {
  alert("Error detectado en sistema. Recarga la página.");
};
let productos = [
  { nombre: "Pollo", precio: 25, stock: 80, activo: true },
  { nombre: "Latte", precio: 10, stock: 50, activo: true },
  { nombre: "Americano", precio: 8, stock: 50, activo: true }
];

let pedido = [];
let historial = JSON.parse(localStorage.getItem("historial")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let metodoPago = "QR";

// INIT
renderProductos();
renderPedido();
renderPedidos();

// --------------------
// PRODUCTOS
// --------------------
function renderProductos() {
  const div = document.getElementById("listaProductos");
  div.innerHTML = "";

  productos.forEach((p, i) => {

    let agotado = p.stock <= 0;

    div.innerHTML += `
      <div class="producto">
        <div>
          <b>${p.nombre}</b><br>
          Bs ${p.precio}<br>
          ${agotado ? "❌ AGOTADO" : "Stock: " + p.stock}
        </div>

        <button onclick="agregar(${i})" ${agotado ? "disabled" : ""}>
          +
        </button>
      </div>
    `;
  });
}
function agregar(i) {
  if (productos[i].stock <= 0) return;

  productos[i].stock--;

  pedido.push({
    nombre: productos[i].nombre,
    precio: productos[i].precio
  });

  renderProductos();
  renderPedido();
}
function renderPedido() {
  const div = document.getElementById("listaPedido");
  div.innerHTML = "";

  let total = 0;

  pedido.forEach((p, index) => {
    div.innerHTML += `
      <div class="pedido-item">
        <span>${p.nombre}</span>
        <span>Bs ${p.precio}</span>
        <button onclick="quitar(${index})">➖</button>
      </div>
    `;
    total += p.precio;
  });

  document.getElementById("total").innerText = total;
  calcularCambio();
}
function setPago(tipo) {
  metodoPago = tipo;
  calcularCambio();
}

document.getElementById("pagoCliente").addEventListener("input", calcularCambio);

function calcularCambio() {
  let total = calcularTotal();
  let pago = Number(document.getElementById("pagoCliente").value || 0);

  let cambio = pago - total;

  document.getElementById("cambio").innerText =
    cambio > 0 ? cambio : 0;
}

function calcularTotal() {
  return pedido.reduce((sum, p) => sum + p.precio, 0);
}

// --------------------
// CREAR PEDIDO REAL
// --------------------
function crearPedido() {
  if (pedido.length === 0) return;

  let total = calcularTotal();
  let pago = Number(document.getElementById("pagoCliente").value || 0);

  let nuevoPedido = {
    id: Date.now(),
    productos: [...pedido],
    total: total,
    pago: pago,
    cambio: pago - total,
    metodoPago: metodoPago,
    entregado: false,
    fecha: new Date().toLocaleString()
  };

  pedidos.push(nuevoPedido);
  historial.push(nuevoPedido);
localStorage.setItem("historial", JSON.stringify(historial));

  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  pedido = [];
  document.getElementById("pagoCliente").value = "";

  renderPedido();
  renderPedidos();
  actualizarDashboard();
}
function renderPedidos() {
  const div = document.getElementById("pedidosActivos");
  if (!div) return;

  div.innerHTML = "<h2>📋 PEDIDOS PENDIENTES</h2>";

  pedidos
    .filter(p => !p.entregado)
    .forEach(p => {
      div.innerHTML += `
        <div style="border:1px solid #ccc; padding:10px; margin:5px;">
          <b>#${p.id}</b><br>
          ${p.productos.map(x => x.nombre).join(", ")}<br>
          Total: Bs ${p.total}<br>
          <button onclick="entregar(${p.id})">✔ ENTREGADO</button>
        </div>
      `;
    });
}
function entregar(id) {
  let pedido = pedidos.find(p => p.id === id);

  if (!pedido) return;

  pedido.entregado = true;

  renderPedidos();
  renderHistorial();
}
function actualizarDashboard() {
  let total = 0;
  let qr = 0;
  let efectivo = 0;
  let entregados = 0;

  pedidos.forEach(p => {
    total += p.total;

    if (p.metodoPago === "QR") qr += p.total;
    else efectivo += p.total;

    if (p.entregado) entregados++;
  });

  document.getElementById("totalVendido").innerText = "Bs " + total;
  document.getElementById("totalPedidos").innerText = pedidos.length;
  document.getElementById("entregados").innerText = entregados;

  document.getElementById("metodosPago").innerText =
    "QR: Bs " + qr + " | Efectivo: Bs " + efectivo;
}

// actualizar cada vez que cambia algo
setInterval(actualizarDashboard, 1000);
productos.forEach(p => {
  if (p.stock <= 5 && p.stock > 0) {
    console.log(`⚠️ Stock bajo: ${p.nombre}`);
  }
});
function quitar(index) {
  let productoQuitado = pedido[index];

  // devolver stock
  let original = productos.find(p => p.nombre === productoQuitado.nombre);
  if (original) {
    original.stock++;
  }

  // quitar del pedido
  pedido.splice(index, 1);

  renderProductos();
  renderPedido();
}
function cancelarPedido() {
  // devolver stock completo
  pedido.forEach(p => {
    let original = productos.find(x => x.nombre === p.nombre);
    if (original) {
      original.stock++;
    }
  });

  pedido = [];

  document.getElementById("pagoCliente").value = "";

  renderProductos();
  renderPedido();
}
function renderHistorial() {
  let div = document.getElementById("historial");

  if (!div) {
    div = document.createElement("div");
    div.id = "historial";
    document.body.appendChild(div);
  }

  div.innerHTML = "<h2>📜 HISTORIAL</h2>";

  historial.slice().reverse().forEach(h => {
    div.innerHTML += `
      <div style="border:1px solid #ccc; padding:10px; margin:5px;">
        <b>#${h.id}</b><br>
        ${h.fecha}<br>
        Total: Bs ${h.total}<br>
        Pago: ${h.metodoPago}<br>
      </div>
    `;
  });
}
function exportarCSV() {
  let csv = "ID,Fecha,Total,MetodoPago\n";

  historial.forEach(h => {
    csv += `${h.id},${h.fecha},${h.total},${h.metodoPago}\n`;
  });

  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "ventas_iglesia.csv";
  a.click();
}
function renderHistorial() {
  const div = document.getElementById("historial");
  div.innerHTML = "";

  if (historial.length === 0) {
    div.innerHTML = "<p>No hay ventas aún</p>";
    return;
  }

  historial.slice().reverse().forEach(h => {
    div.innerHTML += `
      <div style="border:1px solid #ddd; padding:10px; margin:5px;">
        <b>#${h.id}</b><br>
        📅 ${h.fecha}<br>
        💰 Total: Bs ${h.total}<br>
        💳 ${h.metodoPago}<br>
        📦 Productos: ${h.productos.map(p => p.nombre).join(", ")}
      </div>
    `;
  });
}
function abrirAdmin() {
  document.getElementById("adminPanel").style.display = "block";
}

function validarPin() {
  let pin = document.getElementById("adminPin").value;

  if (pin === "1234") {
    document.getElementById("adminContenido").style.display = "block";
  } else {
    alert("PIN incorrecto ❌");
  }
}
function renderAdminProductos() {
  const div = document.getElementById("adminProductos");
  div.innerHTML = "";

  productos.forEach((p, i) => {
    div.innerHTML += `
      <div style="border:1px solid #ddd; padding:5px; margin:5px;">
        ${p.nombre} <br>
        Precio: <input value="${p.precio}" onchange="editarPrecio(${i}, this.value)">
        Stock: <input value="${p.stock}" onchange="editarStock(${i}, this.value)">
      </div>
    `;
  });
}
function editarPrecio(i, valor) {
  productos[i].precio = Number(valor);
  renderProductos();
}

function editarStock(i, valor) {
  productos[i].stock = Number(valor);
  renderProductos();
}
function agregarProducto() {
  let nombre = document.getElementById("nuevoNombre").value;
  let precio = Number(document.getElementById("nuevoPrecio").value);
  let stock = Number(document.getElementById("nuevoStock").value);

  productos.push({ nombre, precio, stock });

  document.getElementById("nuevoNombre").value = "";
  document.getElementById("nuevoPrecio").value = "";
  document.getElementById("nuevoStock").value = "";

  renderProductos();
  renderAdminProductos();
  
}
function cerrarAdmin() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminContenido").style.display = "none";
  document.getElementById("adminPin").value = "";
}
function verCierre() {
  const div = document.getElementById("cierreCaja");

  let total = 0;
  let qr = 0;
  let efectivo = 0;

  pedidos.forEach(p => {
    total += p.total;

    if (p.metodoPago === "QR") qr += p.total;
    else efectivo += p.total;
  });

  div.innerHTML = `
    <h3>📊 Resumen del día</h3>
    <p>Total vendido: Bs ${total}</p>
    <p>QR: Bs ${qr}</p>
    <p>Efectivo: Bs ${efectivo}</p>
    <p>Total pedidos: ${pedidos.length}</p>
    <p>Entregados: ${pedidos.filter(p => p.entregado).length}</p>
  `;
}
function cerrarDia() {
  let confirmacion = confirm("¿Seguro que quieres cerrar el día?");

  if (!confirmacion) return;

  // guardar historial final
  localStorage.setItem("historial_final_" + Date.now(), JSON.stringify(pedidos));

  // reset del sistema operativo del día
  pedidos = [];
  pedido = [];

  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  renderPedidos();
  renderPedido();
  actualizarDashboard();

  alert("Día cerrado ✔");
}
function activarKiosko() {
  document.documentElement.requestFullscreen();
  document.body.classList.add("kiosko");
}
function sonido() {
  let audio = new Audio("https://actions.google.com/sounds/v1/office/coin_casing_dropping.ogg");
  audio.play();
}
