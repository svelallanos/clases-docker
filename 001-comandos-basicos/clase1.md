* Clase 1: conceptos fundamentales
* ¿Qué es Docker?
Docker permite empaquetar una aplicación junto con todo lo que necesita para funcionar:

. Sistema base.
. PHP, Node.js o cualquier lenguaje.
. Librerías y extensiones.
. Configuraciones.
. Dependencias.

El resultado puede ejecutarse de la misma manera en Windows, Linux, un VPS o un servidor de producción.
    “En mi computadora funciona, pero en el servidor no”.

Con Docker, el entorno de desarrollo y el entorno de producción pueden ser prácticamente iguales.

* Imagen y contenedor

* Imagen
Una imagen es una plantilla preparada para crear contenedores.

Ejemplos:
. nginx
. mysql
. php
. node
. redis

Podemos imaginar la imagen como el instalador o molde de una aplicación.

* Contenedor
Un contenedor es una instancia en ejecución de una imagen.

Ejemplo:
. docker run nginx

En este comando:
. docker run crea y ejecuta un contenedor.
. nginx es la imagen utilizada.

Una misma imagen puede producir varios contenedores:

Imagen nginx
├── Contenedor nginx-1
├── Contenedor nginx-2
└── Contenedor nginx-3

* Contenedor frente a máquina virtual
Una máquina virtual instala un sistema operativo completo. Un contenedor comparte parte del sistema del equipo anfitrión y contiene principalmente lo necesario para ejecutar la aplicación.

Por eso los contenedores suelen ser:
. Más rápidos al iniciar.
. Más ligeros.
. Más fáciles de copiar.
. Más adecuados para aplicaciones divididas en servicios.

1. Comprobar Docker
Abre una terminal y ejecuta:
. docker --version

Después:
. docker info

El primer comando muestra la versión. El segundo confirma que el motor de Docker está funcionando.

2. Ejecutar el contenedor de prueba
. docker run hello-world

Docker realizará lo siguiente:
. Buscará la imagen hello-world localmente.
. Si no existe, la descargará de Docker Hub.
. Creará un contenedor.
. Ejecutará el programa incluido.
. Mostrará un mensaje de confirmación.

3. Crear un servidor web Nginx

Ejecuta:
. docker run -d --name servidor-web -p 8080:80 nginx

Significado:
. docker run: crea y ejecuta el contenedor.
. -d: lo ejecuta en segundo plano.
. --name servidor-web: asigna un nombre.
. -p 8080:80: conecta el puerto 8080 de tu computadora con el puerto 80 del contenedor.
. nginx: imagen que se utilizará.

Abre en tu navegador:
. http://localhost:8080

* Resumen de comandos

| Comando           | Función                        |
| ----------------- | ------------------------------ |
| `docker run`      | Crear y ejecutar un contenedor |
| `docker ps`       | Mostrar contenedores activos   |
| `docker ps -a`    | Mostrar todos los contenedores |
| `docker images`   | Mostrar imágenes descargadas   |
| `docker logs`     | Mostrar registros              |
| `docker exec -it` | Entrar a un contenedor         |
| `docker stop`     | Detener un contenedor          |
| `docker start`    | Iniciar un contenedor detenido |
| `docker restart`  | Reiniciar un contenedor        |
| `docker rm`       | Eliminar un contenedor         |
| `docker rmi`      | Eliminar una imagen            |

** Ejercicio de clase**

docker run hello-world
docker run -d --name servidor-web -p 8080:80 nginx
docker ps
docker logs servidor-web
docker exec -it servidor-web sh
