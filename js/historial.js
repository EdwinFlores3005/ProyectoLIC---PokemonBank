// Cargar transacciones del localStorage
function cargarTransacciones() {
  const data = localStorage.getItem("transacciones");
  return data ? JSON.parse(data) : [];
}

// Formatear fecha
function formatearFecha(iso) {
  if (!iso) return "Sin fecha";
  const fecha = new Date(iso);
  return fecha.toLocaleString("es-SV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}


// Crear fila para la tabla
function crearFilaTransaccion(t) {
  const tr = document.createElement("tr");

  const tdFecha = document.createElement("td");
  tdFecha.textContent = formatearFecha(t.fecha);

  const tdTipo = document.createElement("td");
  tdTipo.textContent = t.tipo || "Sin tipo";

  const tdMonto = document.createElement("td");
  tdMonto.classList.add("text-end");
  let textoMonto = `$ ${Number(t.monto || 0).toFixed(2)}`;

  if (t.tipo?.toLowerCase().includes("depósito")) {
    tdMonto.classList.add("text-success");
    textoMonto = `+ $ ${Number(t.monto).toFixed(2)}`;
  }

  if (t.tipo?.toLowerCase().includes("retiro") || t.tipo?.toLowerCase().includes("pago")) {
    tdMonto.classList.add("text-danger");
    textoMonto = `- $ ${Number(t.monto).toFixed(2)}`;
  }

  tdMonto.textContent = textoMonto;

  const tdDetalle = document.createElement("td");
  tdDetalle.textContent = t.detalle || "";

  tr.append(tdFecha, tdTipo, tdMonto, tdDetalle);

  return tr;
}

// Variables para paginación
let transaccionesFiltradas = [];
let paginaActual = 1;
const porPagina = 10;

// Dibujar tabla según la página
function mostrarPagina(pagina) {
  paginaActual = pagina;
  const cuerpo = document.getElementById("tbodyHistorial");
  cuerpo.innerHTML = "";

  if (transaccionesFiltradas.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.classList.add("text-center", "text-muted");
    td.textContent = "No hay transacciones para mostrar.";
    tr.appendChild(td);
    cuerpo.appendChild(tr);
    actualizarPaginacion();
    return;
  }

  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;
  const paginaDatos = transaccionesFiltradas.slice(inicio, fin);

  paginaDatos.forEach((t) => cuerpo.appendChild(crearFilaTransaccion(t)));

  actualizarPaginacion();
}

// Crear paginación dinámicamente
function actualizarPaginacion() {
  const totalPaginas = Math.ceil(transaccionesFiltradas.length / porPagina);
  const paginacion = document.querySelector(".pagination");
  paginacion.innerHTML = "";

  // Botón anterior
  const liAnterior = document.createElement("li");
  liAnterior.className = `page-item ${paginaActual === 1 ? "disabled" : ""}`;
  liAnterior.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
  liAnterior.onclick = () => paginaActual > 1 && mostrarPagina(paginaActual - 1);
  paginacion.appendChild(liAnterior);

  // Botones numéricos
  for (let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${paginaActual === i ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.onclick = () => mostrarPagina(i);
    paginacion.appendChild(li);
  }

  // Botón siguiente
  const liSiguiente = document.createElement("li");
  liSiguiente.className = `page-item ${paginaActual === totalPaginas ? "disabled" : ""}`;
  liSiguiente.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
  liSiguiente.onclick = () => paginaActual < totalPaginas && mostrarPagina(paginaActual + 1);
  paginacion.appendChild(liSiguiente);
}

// Aplicar filtros
function aplicarFiltros() {
  const todas = cargarTransacciones();

  const tipo = document.getElementById("filtroTipo").value;
  const desde = document.getElementById("filtroDesde").value;
  const hasta = document.getElementById("filtroHasta").value;

  const fechaDesde = desde ? new Date(desde + "T00:00:00") : null;
  const fechaHasta = hasta ? new Date(hasta + "T23:59:59") : null;

  transaccionesFiltradas = todas.filter((t) => {
    const fechaT = t.fecha ? new Date(t.fecha) : null;

    if (tipo) {
      const tipoLower = (t.tipo || "").toLowerCase();

      if (tipo === "deposito" && !tipoLower.includes("depósito")) {
        return false;
      }
      if (tipo === "retiro" && !tipoLower.includes("retiro")) {
        return false;
      }
      if (tipo === "pago" && !tipoLower.includes("pago")) {
        return false;
      }
    }
    if (fechaDesde && fechaT < fechaDesde) return false;
    if (fechaHasta && fechaT > fechaHasta) return false;

    return true;
  });

  // Orden de más reciente a más antigua
  transaccionesFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  mostrarPagina(1);
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  transaccionesFiltradas = cargarTransacciones();

  // Ordenar inicialmente
  transaccionesFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  mostrarPagina(1);

  document.getElementById("btnBuscar").addEventListener("click", aplicarFiltros);
});


