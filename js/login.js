//Validaciones
const reglasPin = {
    pin: {
        presence: {
            allowEmpty: false,
            message: "^El PIN no puede estar vacío"
        },
        format: {
            pattern: "^[0-9]{4}$",
            message: "^El PIN debe ser de 4 números"
        }
    }
};

function cargarUsuario() {
            return JSON.parse(localStorage.getItem('usuario'));
        }

        function guardarUsuario(data) {
            localStorage.setItem('usuario', JSON.stringify(data));
        }

        function inicializarUsuario() {
            if (!cargarUsuario()) {
                guardarUsuario({
                    nombre: "Ash Ketchum",
                    pin: "1234",
                    cuenta: "0987654321",
                    saldo: 500
                });
                localStorage.setItem("transacciones", JSON.stringify([]));
            }
        }

        // Inicializar al cargar
        inicializarUsuario();

        // ---- LOGIN ----
        document.getElementById("formLogin").addEventListener("submit", function(e) {
            e.preventDefault();

            
            const pinIngresado = document.getElementById("pin").value;

             // ---- VALIDACIÓN CON VALIDATE.JS ----
            const errores = validate({ pin: pinIngresado }, reglasPin);

            if (errores) {
                Swal.fire("Error", errores.pin[0], "error");
                return;
            }

            const usuario = cargarUsuario();

            if (pinIngresado === usuario.pin) {
                Swal.fire("Correcto", "PIN válido", "success")
                .then(() => {
                    window.location.href = "acciones.html";
                });
            } else {
                Swal.fire("Error", "PIN incorrecto", "error");
            }
        });