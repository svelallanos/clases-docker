const boton = document.getElementById("boton");
const mensaje = document.getElementById("mensaje");

boton.addEventListener("click", () => {

    mensaje.textContent =
        "✅ JavaScript funciona correctamente dentro de Docker.";

});
