let productos = [
  { nombre: "Pollo", precio: 25 },
  { nombre: "Café Latte", precio: 10 },
  { nombre: "Café Americano", precio: 8 }
];

let pedido = [];
let ventas = [];
let PIN_ADMIN = "1234";

// ELEMENTOS
const listaProductos = document.getElementById("listaProductos");
const pedidoDiv = document.getElementById("pedido");
const totalSpan = document.getElementById("total");
const cambioSpan = document.getElementById("cambio");
const pagaCon = document.getElementById("pagaCon");

// RENDER PRODUCTOS
function renderProductos() {
  listaProductos.innerHTML = "";

  productos.forEach((p, index) => {
    const div = document.createElement("div");
    div.classList.add("producto");

    div.innerHTML = `
      <span>${p.nombre} - Bs. ${p.precio}</span>
      <button onclick="agregar(${index})">+</button>
    `;

    listaProductos.appendChild(div);
  });
}

// AGREGAR PRODUCTO
function agregar(index) {
  pedido.push(productos[index]);
  renderPedido();
}

// RENDER PEDIDO
function renderPedido() {
  if (pedido.length === 0) {
    pedidoDiv.innerHTML = "<p>No hay productos.</p>";
    totalSpan.innerText = "Bs. 0";
    return;
  }

  let html = "";
  let total = 0;

  pedido.forEach((p, i) => {
    html += `<p>${p.nombre} - Bs. ${p.precio}</p>`;
    total += p.precio;
  });

  pedidoDiv.innerHTML = html;
  totalSpan.innerText = "Bs. " + total;

  calcularCambio();
}

// CALCULAR CAMBIO
pagaCon.addEventListener("input", calcularCambio);

function calcularCambio() {
  let total = calcularTotal();
  let pago = Number(pagaCon.value);

  let cambio = pago - total;

  if (cambio >= 0) {
    cambioSpan.innerText = "Bs. " + cambio;
  } else {
    cambioSpan.innerText = "Bs. 0";
  }
}

// TOTAL
function calcularTotal() {
  return pedido.reduce((sum, p) => sum + p.precio, 0);
}

// COBRAR
document.getElementById("btnCobrar").addEventListener("click", () => {
  if (pedido.length === 0) return;

  let total = calcularTotal();

  ventas.push({
    productos: [...pedido],
    total: total,
    fecha: new Date().toLocaleString()
  });

  alert("Venta registrada ✔");

  pedido = [];
  pagaCon.value = "";
  renderPedido();
});

// CANCELAR
document.getElementById("btnCancelar").addEventListener("click", () => {
  pedido = [];
  pagaCon.value = "";
  renderPedido();
});

// ADMIN
document.getElementById("btnAdmin").addEventListener("click", () => {
  document.getElementById("adminModal").style.display = "block";
});

document.getElementById("cerrarAdmin").addEventListener("click", () => {
  document.getElementById("adminModal").style.display = "none";
});

document.getElementById("entrarAdmin").addEventListener("click", () => {
  let pin = document.getElementById("pin").value;

  if (pin === PIN_ADMIN) {
    alert("Acceso correcto ✔ (aquí luego editaremos productos)");
  } else {
    alert("PIN incorrecto ❌");
  }
});

// REPORTE
document.getElementById("btnReporte").addEventListener("click", () => {
  let totalDia = ventas.reduce((sum, v) => sum + v.total, 0);

  document.getElementById("reporteContenido").innerHTML = `
    <p>Ventas: ${ventas.length}</p>
    <p>Total del día: Bs. ${totalDia}</p>
  `;

  document.getElementById("reporteModal").style.display = "block";
});

document.getElementById("cerrarReporte").addEventListener("click", () => {
  document.getElementById("reporteModal").style.display = "none";
});

// INICIAR
renderProductos();
renderPedido();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}