Clase 3: volúmenes y Bind Mounts en Docker

En esta clase aprenderás a:

Conservar datos aunque elimines un contenedor.
Compartir archivos entre tu computadora y un contenedor.
Modificar una página web sin reconstruir la imagen.
Persistir una base de datos MySQL.
Diferenciar un volumen de un bind mount.
1. El problema de guardar datos dentro del contenedor

Por defecto, los archivos creados dentro de un contenedor se guardan en su capa de escritura. Si eliminas el contenedor, esos datos también desaparecen.

Por ejemplo:

docker run --name prueba alpine sh -c "echo 'Hola Docker' > /mensaje.txt"

Puedes revisar el archivo:

docker start prueba
docker exec prueba cat /mensaje.txt

Pero si eliminas el contenedor:

docker rm -f prueba

El archivo también desaparecerá.

Los contenedores están diseñados para poder eliminarse y reemplazarse. Por eso, los datos importantes deben almacenarse fuera de su capa interna mediante volúmenes o bind mounts.

2. Tipos de almacenamiento

Docker ofrece principalmente estas opciones:

Tipo	Uso principal
Bind mount	Compartir archivos de tu computadora con el contenedor
Volumen	Conservar datos administrados por Docker
tmpfs	Guardar datos temporales en memoria

En esta clase nos enfocaremos en los dos primeros.

Parte 1: Bind mounts
3. ¿Qué es un bind mount?

Un bind mount conecta directamente una carpeta o archivo de tu computadora con una ubicación dentro del contenedor.

Carpeta de tu computadora
          ↓
Bind mount
          ↓
Carpeta dentro del contenedor

Por ejemplo:

mi-primera-imagen/
          ↓
/usr/share/nginx/html

Cuando modificas un archivo en tu computadora, el cambio aparece inmediatamente dentro del contenedor.

Los bind mounts son especialmente útiles durante el desarrollo porque permiten trabajar con el código fuente utilizando tu editor habitual. Docker recomienda generalmente la sintaxis --mount porque es más explícita.

4. Recuperar el proyecto anterior

Usaremos la carpeta de la clase 2:

mi-primera-imagen/
├── Dockerfile
├── index.html
└── .dockerignore

Ingresa a esa carpeta:

cd mi-primera-imagen

Elimina el contenedor anterior, en caso de que todavía exista:

docker rm -f samiza-contenedor

No importa si Docker indica que el contenedor no existe.

5. Ejecutar Nginx con un bind mount
En Linux

Ejecuta desde la carpeta del proyecto:

docker run -d \
  --name samiza-desarrollo \
  -p 8080:80 \
  --mount type=bind,source="$(pwd)",target=/usr/share/nginx/html \
  nginx:alpine
En Windows PowerShell
docker run -d --name samiza-desarrollo -p 8080:80 --mount "type=bind,source=$($PWD.Path),target=/usr/share/nginx/html" nginx:alpine

Abre en tu navegador:

http://localhost:8080

Ahora Nginx está leyendo directamente el archivo index.html de tu computadora.

6. Entender el comando

La parte importante es:

--mount type=bind,source="$(pwd)",target=/usr/share/nginx/html
type=bind

Indica que utilizaremos un bind mount:

type=bind
source

Es la carpeta de tu computadora:

source="$(pwd)"

En Linux, $(pwd) devuelve la ruta actual, por ejemplo:

/home/samuel/Proyectos/mi-primera-imagen

En PowerShell usamos:

source=$($PWD.Path)
target

Es la carpeta dentro del contenedor:

target=/usr/share/nginx/html

La relación queda así:

Tu computadora                      Contenedor

mi-primera-imagen/     ──────────>  /usr/share/nginx/html
    index.html                           index.html
7. Modificar archivos sin reconstruir la imagen

Abre index.html y cambia:

<h1>¡Docker está funcionando!</h1>

Por:

<h1>Estoy trabajando con Bind Mounts</h1>

Agrega también:

<p>Ahora puedo modificar mi proyecto sin reconstruir la imagen.</p>

Guarda el archivo y actualiza el navegador:

http://localhost:8080

El cambio aparecerá inmediatamente.

No ejecutamos nuevamente:

docker build

Tampoco eliminamos ni reiniciamos el contenedor.

Esta es una de las principales ventajas de los bind mounts durante el desarrollo.

8. Comprobar el archivo dentro del contenedor

Ejecuta:

docker exec -it samiza-desarrollo sh

Dentro del contenedor:

cd /usr/share/nginx/html
ls -la

Muestra el contenido:

cat index.html

Verás exactamente el mismo contenido guardado en tu computadora.

Sal del contenedor:

exit
9. Inspeccionar los montajes

Ejecuta:

docker inspect samiza-desarrollo

Busca una sección parecida a:

"Mounts": [
    {
        "Type": "bind",
        "Source": "/ruta/mi-primera-imagen",
        "Destination": "/usr/share/nginx/html"
    }
]

También puedes mostrar solamente los montajes:

docker inspect samiza-desarrollo --format '{{json .Mounts}}'
10. Bind mount de solo lectura

Los bind mounts normalmente permiten que el contenedor modifique los archivos del equipo anfitrión. Cuando el contenedor solo necesita leerlos, podemos agregar readonly.

Primero elimina el contenedor:

docker rm -f samiza-desarrollo
Linux
docker run -d \
  --name samiza-desarrollo \
  -p 8080:80 \
  --mount type=bind,source="$(pwd)",target=/usr/share/nginx/html,readonly \
  nginx:alpine
PowerShell
docker run -d --name samiza-desarrollo -p 8080:80 --mount "type=bind,source=$($PWD.Path),target=/usr/share/nginx/html,readonly" nginx:alpine

Prueba escribir desde el contenedor:

docker exec samiza-desarrollo sh -c "echo prueba > /usr/share/nginx/html/prueba.txt"

Deberás recibir un error similar a:

Read-only file system

El contenedor puede leer los archivos, pero no puede modificarlos. Esto reduce el riesgo de que un proceso dentro del contenedor cambie accidentalmente los archivos del anfitrión.

Parte 2: volúmenes de Docker
11. ¿Qué es un volumen?

Un volumen es un espacio de almacenamiento creado y administrado por Docker.

Docker
  └── Volumen
        └── Datos persistentes

A diferencia de un bind mount, tú no eliges normalmente la ubicación física exacta. Docker se encarga de administrarla.

Los volúmenes existen independientemente de los contenedores. Por eso, puedes eliminar un contenedor y conectar posteriormente el mismo volumen a otro contenedor.

12. Crear un volumen

Ejecuta:

docker volume create samiza-datos

Docker mostrará:

samiza-datos

Lista los volúmenes:

docker volume ls

Resultado aproximado:

DRIVER    VOLUME NAME
local     samiza-datos
13. Guardar información en el volumen

Ejecuta:

docker run \
  --name escritor \
  --mount type=volume,source=samiza-datos,target=/datos \
  alpine \
  sh -c "echo 'SAMIZA LABS - información persistente' > /datos/mensaje.txt"

Este contenedor:

Utiliza la imagen alpine.
Conecta samiza-datos con /datos.
Crea el archivo /datos/mensaje.txt.
Finaliza después de escribirlo.

Revisa el contenedor:

docker ps -a

Aparecerá con estado:

Exited
14. Eliminar el contenedor

Elimina el contenedor escritor:

docker rm escritor

El contenedor desaparece, pero el volumen continúa existiendo:

docker volume ls

Todavía verás:

samiza-datos
15. Leer el dato con otro contenedor

Crea un contenedor nuevo y conecta el mismo volumen:

docker run \
  --rm \
  --mount type=volume,source=samiza-datos,target=/datos \
  alpine \
  cat /datos/mensaje.txt

Resultado:

SAMIZA LABS - información persistente

Esto demuestra que:

Contenedor escritor
        ↓
Guarda el archivo
        ↓
Volumen samiza-datos
        ↓
Se elimina el contenedor
        ↓
Contenedor lector
        ↓
Recupera el mismo archivo

La opción:

--rm

elimina automáticamente el contenedor lector cuando finaliza, pero no elimina el volumen.

16. Inspeccionar el volumen

Ejecuta:

docker volume inspect samiza-datos

En Linux podrías encontrar información similar a:

[
    {
        "Driver": "local",
        "Mountpoint": "/var/lib/docker/volumes/samiza-datos/_data",
        "Name": "samiza-datos",
        "Scope": "local"
    }
]

No es recomendable modificar directamente el contenido interno de /var/lib/docker/volumes. Es preferible acceder al volumen montándolo en un contenedor.

Parte 3: persistir MySQL
17. ¿Por qué MySQL necesita un volumen?

Una base de datos no debe depender de la existencia del contenedor.

El diseño correcto es:

Contenedor MySQL
        ↓
/var/lib/mysql
        ↓
Volumen mysql-samiza-data

Si actualizamos o eliminamos el contenedor de MySQL, los archivos de la base de datos permanecen en el volumen.

La imagen oficial de MySQL almacena sus archivos de datos en /var/lib/mysql, por lo que esa es la ubicación que conectaremos al volumen.

18. Crear el volumen para MySQL
docker volume create mysql-samiza-data

Comprueba:

docker volume ls
19. Crear el contenedor MySQL
Linux
docker run -d \
  --name mysql-clase3 \
  -e MYSQL_ROOT_PASSWORD=ClaveDocker123 \
  -e MYSQL_DATABASE=samiza_db \
  -p 3307:3306 \
  --mount type=volume,source=mysql-samiza-data,target=/var/lib/mysql \
  mysql:8.4
PowerShell
docker run -d --name mysql-clase3 -e MYSQL_ROOT_PASSWORD=ClaveDocker123 -e MYSQL_DATABASE=samiza_db -p 3307:3306 --mount type=volume,source=mysql-samiza-data,target=/var/lib/mysql mysql:8.4

Explicación:

Opción	Función
--name mysql-clase3	Nombre del contenedor
MYSQL_ROOT_PASSWORD	Contraseña del usuario root
MYSQL_DATABASE	Base de datos inicial
-p 3307:3306	Puerto de tu PC hacia MySQL
source=mysql-samiza-data	Volumen utilizado
target=/var/lib/mysql	Directorio de datos de MySQL
mysql:8.4	Imagen de MySQL

En un proyecto real debes utilizar una contraseña más segura y evitar colocar secretos directamente en archivos que subirás a Git.

20. Revisar el inicio de MySQL

Ejecuta:

docker logs -f mysql-clase3

Cuando MySQL esté preparado, aparecerá un mensaje indicando que está listo para aceptar conexiones.

Sal del seguimiento de registros con:

Ctrl + C

Esto no detiene el contenedor.

Comprueba que siga activo:

docker ps
21. Entrar a MySQL

Ejecuta:

docker exec -it mysql-clase3 mysql -uroot -p

Cuando solicite la contraseña, escribe:

ClaveDocker123

La contraseña no se mostrará mientras la escribes.

22. Crear datos de prueba

Dentro de MySQL ejecuta:

SHOW DATABASES;

Selecciona la base:

USE samiza_db;

Crea una tabla:

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL
);

Inserta información:

INSERT INTO clientes (nombre, correo)
VALUES
('Samuel Vela', 'samuel@samizalabs.com'),
('Michel Rojas', 'michel@samizalabs.com');

Consulta:

SELECT * FROM clientes;

Resultado aproximado:

+----+---------------+-------------------------+
| id | nombre        | correo                  |
+----+---------------+-------------------------+
|  1 | Samuel Vela   | samuel@samizalabs.com   |
|  2 | Michel Rojas  | michel@samizalabs.com   |
+----+---------------+-------------------------+

Sal de MySQL:

EXIT;
23. Eliminar completamente el contenedor MySQL
docker rm -f mysql-clase3

Comprueba:

docker ps -a

El contenedor ya no existirá.

Sin embargo, el volumen continúa:

docker volume ls

Deberás ver:

mysql-samiza-data
24. Crear nuevamente el contenedor

Ejecuta nuevamente:

docker run -d \
  --name mysql-clase3 \
  -e MYSQL_ROOT_PASSWORD=ClaveDocker123 \
  -e MYSQL_DATABASE=samiza_db \
  -p 3307:3306 \
  --mount type=volume,source=mysql-samiza-data,target=/var/lib/mysql \
  mysql:8.4

En PowerShell puedes usar la versión de una sola línea:

docker run -d --name mysql-clase3 -e MYSQL_ROOT_PASSWORD=ClaveDocker123 -e MYSQL_DATABASE=samiza_db -p 3307:3306 --mount type=volume,source=mysql-samiza-data,target=/var/lib/mysql mysql:8.4

Espera a que MySQL termine de iniciar:

docker logs -f mysql-clase3
25. Comprobar que los datos sobrevivieron

Ingresa nuevamente:

docker exec -it mysql-clase3 mysql -uroot -p

Ejecuta:

USE samiza_db;
SELECT * FROM clientes;

Los clientes seguirán almacenados.

Eso demuestra que el contenedor fue eliminado, pero los datos permanecieron en:

mysql-samiza-data
26. Bind mount frente a volumen
Característica	Bind mount	Volumen
Ubicación	Tú eliges la carpeta	Docker la administra
Uso frecuente	Código fuente y configuración	Bases de datos y datos persistentes
Edición desde el host	Directa	No recomendada directamente
Portabilidad	Depende de las rutas del host	Mayor
Persistencia	Depende de la carpeta del host	Independiente del contenedor
Ejemplo	Proyecto Laravel o Angular	MySQL, PostgreSQL o Redis

Regla práctica:

Código fuente → Bind mount
Base de datos → Volumen

Los volúmenes suelen ser la opción preferida para datos generados y utilizados por contenedores, mientras que los bind mounts resultan adecuados cuando necesitas trabajar directamente con archivos del anfitrión.

27. Sintaxis corta con -v

Docker también acepta esta sintaxis:

Bind mount
docker run -v "$(pwd):/usr/share/nginx/html" nginx:alpine
Volumen
docker run -v samiza-datos:/datos alpine

Su estructura es:

origen:destino

Aunque -v es más breve, --mount resulta más fácil de leer y evita algunas ambigüedades. Docker recomienda generalmente --mount para comandos nuevos.

28. Eliminar volúmenes

Para eliminar un volumen específico:

docker volume rm samiza-datos

Para eliminar el volumen de MySQL, primero debes eliminar el contenedor que lo utiliza:

docker rm -f mysql-clase3
docker volume rm mysql-samiza-data

Al eliminar el volumen de MySQL, se perderán definitivamente las bases de datos almacenadas en él.

Para mostrar volúmenes que no utiliza ningún contenedor:

docker volume ls --filter dangling=true

Docker también permite eliminar los volúmenes no utilizados:

docker volume prune

Utiliza docker volume prune con precaución, especialmente en servidores de producción.

Ejercicio de la clase 3
Ejercicio 1: bind mount
Ejecuta Nginx con la carpeta de tu proyecto montada.
Abre localhost:8080.
Modifica index.html.
Comprueba que el cambio aparezca sin reconstruir la imagen.
Inspecciona el montaje con:
docker inspect samiza-desarrollo --format '{{json .Mounts}}'
Ejercicio 2: volumen

Ejecuta:

docker volume create ejercicio-datos

Guarda un archivo:

docker run --name creador \
  --mount type=volume,source=ejercicio-datos,target=/app \
  alpine \
  sh -c "echo 'Estoy aprendiendo Docker' > /app/curso.txt"

Elimina el contenedor:

docker rm creador

Lee el archivo con otro contenedor:

docker run --rm \
  --mount type=volume,source=ejercicio-datos,target=/app \
  alpine \
  cat /app/curso.txt

El resultado debe ser:

Estoy aprendiendo Docker
Lo aprendido

Ahora sabes:

Por qué no debemos guardar datos importantes únicamente dentro del contenedor.
Qué es un bind mount.
Cómo editar código sin reconstruir una imagen.
Qué es un volumen administrado por Docker.
Cómo compartir un volumen entre diferentes contenedores.
Cómo conservar los datos de una base MySQL.
Cómo inspeccionar y eliminar volúmenes.
Cuándo usar bind mounts y cuándo usar volúmenes.

La clase 4 será sobre Docker Compose, donde levantaremos Nginx y MySQL mediante un archivo compose.yaml, sin escribir comandos extensos de docker run.