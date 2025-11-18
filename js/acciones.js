// Funciones para LocalStorage

function cargarUsuario() {
  const data = localStorage.getItem("usuario");
  return data ? JSON.parse(data) : null;
}

function guardarUsuario(usuario) {
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

function cargarTransacciones() {
  const data = localStorage.getItem("transacciones");
  return data ? JSON.parse(data) : [];
}

function guardarTransacciones(lista) {
  localStorage.setItem("transacciones", JSON.stringify(lista));
}

// Registra una nueva transacción en el historial
function registrarTransaccion(tipo, monto, detalle) {
  const usuario = cargarUsuario();
  if (!usuario) return;

  const transacciones = cargarTransacciones();

  const nueva = {
    fecha: new Date().toISOString(),
    tipo: tipo,
    monto: Number(monto),
    detalle: detalle || "",
    saldoDespues: usuario.saldo
  };

  transacciones.push(nueva);
  guardarTransacciones(transacciones);
}


// Inicialización de la pantalla

function actualizarSaldoEnPantalla() {
  const usuario = cargarUsuario();
  if (!usuario) return;

  const saldoSpan = document.getElementById("saldoActual");
  const nombreSpan = document.getElementById("nombreUsuario");
  const cuentaSpan = document.getElementById("numeroCuenta");

  // Actualizar saldo
  if (saldoSpan) {
    saldoSpan.textContent = `$ ${usuario.saldo.toFixed(2)}`;
  }

  if (nombreSpan) {
    nombreSpan.textContent = usuario.nombre;
  }

  if (cuentaSpan) {
    cuentaSpan.textContent = usuario.cuenta;
  }
}


function verificarSesion() {
  const usuario = cargarUsuario();

  // Si no hay usuario en localStorage, regreso al login
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }
}

// Depositar dinero
function manejarDeposito() {
  const usuario = cargarUsuario();
  if (!usuario) return;

  Swal.fire({
    title: "Depositar",
    text: "Ingresa el monto a depositar",
    input: "number",
    inputAttributes: {
      min: "1",
      step: "0.01"
    },
    showCancelButton: true,
    confirmButtonText: "Depositar",
    cancelButtonText: "Cancelar",
    preConfirm: (valor) => {
      const monto = parseFloat(valor);
      if (isNaN(monto) || monto <= 0) {
        Swal.showValidationMessage("Ingresa un monto válido mayor a 0");
        return;
      }
      return monto;
    }
  }).then((resultado) => {
    if (!resultado.isConfirmed) return;

    const monto = resultado.value;

    usuario.saldo += monto;
    guardarUsuario(usuario);

    registrarTransaccion("Depósito", monto, "Depósito en cajero web");

    actualizarSaldoEnPantalla();

    Swal.fire("Listo", "Depósito realizado correctamente", "success");
  });
}


// Retirar dinero
function manejarRetiro() {
  const usuario = cargarUsuario();
  if (!usuario) return;

  Swal.fire({
    title: "Retirar",
    text: "Ingresa el monto a retirar",
    input: "number",
    inputAttributes: {
      min: "1",
      step: "0.01"
    },
    showCancelButton: true,
    confirmButtonText: "Retirar",
    cancelButtonText: "Cancelar",
    preConfirm: (valor) => {
      const monto = parseFloat(valor);
      if (isNaN(monto) || monto <= 0) {
        Swal.showValidationMessage("Ingresa un monto válido mayor a 0");
        return;
      }
      if (monto > usuario.saldo) {
        Swal.showValidationMessage("No tienes saldo suficiente para este retiro");
        return;
      }
      return monto;
    }
  }).then((resultado) => {
    if (!resultado.isConfirmed) return;

    const monto = resultado.value;

    usuario.saldo -= monto;
    guardarUsuario(usuario);

    registrarTransaccion("Retiro", monto, "Retiro en cajero web");

    actualizarSaldoEnPantalla();

    Swal.fire("Listo", "Retiro realizado correctamente", "success");
  });
}


// Pago de servicios (agua, luz, internet, etc.)
function manejarPagoServicios() {
  const usuario = cargarUsuario();
  if (!usuario) return;

  Swal.fire({
    title: "Pago de servicios",
    html: `
      <div class="mb-2 text-start">
        <label for="servicio" class="form-label">Servicio</label>
        <select id="servicio" class="form-select">
          <option value="">Selecciona un servicio</option>
          <option value="Energía eléctrica">Energía eléctrica</option>
          <option value="Internet">Internet</option>
          <option value="Telefonía">Telefonía</option>
          <option value="Agua potable">Agua potable</option>
        </select>
      </div>
      <div class="text-start">
        <label for="montoServicio" class="form-label">Monto a pagar</label>
        <input type="number" id="montoServicio" class="form-control" min="1" step="0.01" />
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Pagar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const servicio = document.getElementById("servicio").value;
      const montoStr = document.getElementById("montoServicio").value;
      const monto = parseFloat(montoStr);

      if (!servicio) {
        Swal.showValidationMessage("Selecciona un servicio");
        return;
      }
      if (isNaN(monto) || monto <= 0) {
        Swal.showValidationMessage("Ingresa un monto válido mayor a 0");
        return;
      }
      if (monto > usuario.saldo) {
        Swal.showValidationMessage("No tienes saldo suficiente para este pago");
        return;
      }

      return { servicio, monto };
    }
  }).then((resultado) => {
    if (!resultado.isConfirmed) return;

    const { servicio, monto } = resultado.value;

    usuario.saldo -= monto;
    guardarUsuario(usuario);

    registrarTransaccion("Pago de servicio", monto, servicio);

    actualizarSaldoEnPantalla();

    Swal.fire("Listo", `Pago de ${servicio} realizado correctamente`, "success");
  });
}


// Eventos cuando carga la página

document.addEventListener("DOMContentLoaded", () => {
  verificarSesion();
  actualizarSaldoEnPantalla();

  const btnDepositar = document.getElementById("btnDepositar");
  const btnRetirar = document.getElementById("btnRetirar");
  const btnPagarServicios = document.getElementById("btnPagarServicios");

  if (btnDepositar) {
    btnDepositar.addEventListener("click", (e) => {
      e.preventDefault();
      manejarDeposito();
    });
  }

  if (btnRetirar) {
    btnRetirar.addEventListener("click", (e) => {
      e.preventDefault();
      manejarRetiro();
    });
  }

  if (btnPagarServicios) {
    btnPagarServicios.addEventListener("click", (e) => {
      e.preventDefault();
      manejarPagoServicios();
    });
  }
});




