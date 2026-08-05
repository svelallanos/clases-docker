Clase 2: crear una imagen con Dockerfile

En la clase anterior ejecutamos una imagen existente de Nginx. Ahora construiremos nuestra propia imagen, que tendrá una página web personalizada.

Un Dockerfile es un archivo de texto que contiene las instrucciones que Docker seguirá para construir una imagen. Cada instrucción puede crear una capa reutilizable dentro de esa imagen.

1. Crear el proyecto

Crea una carpeta llamada:

mi-primera-imagen

En Windows PowerShell:

mkdir mi-primera-imagen
cd mi-primera-imagen

En Linux:

mkdir mi-primera-imagen
cd mi-primera-imagen

La estructura quedará así:

mi-primera-imagen/
├── Dockerfile
└── index.html
2. Crear la página web

Dentro de la carpeta, crea un archivo llamado:

index.html

Coloca este contenido:

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi primera imagen Docker</title>

    <style>
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            background: #101827;
            color: white;
        }

        .contenedor {
            text-align: center;
            padding: 50px;
            border-radius: 15px;
            background: #1f2937;
        }

        h1 {
            color: #2496ed;
        }
    </style>
</head>

<body>
    <div class="contenedor">
        <h1>¡Docker está funcionando!</h1>
        <p>Esta página fue creada desde mi propia imagen Docker.</p>
        <p>Proyecto de SAMIZA LABS</p>
    </div>
</body>
</html>
3. Crear el Dockerfile

Crea un archivo llamado exactamente:

Dockerfile

No debe llamarse:

Dockerfile.txt

Coloca este contenido:

FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
4. Entender cada instrucción
FROM
FROM nginx:alpine

Indica la imagen base que utilizaremos.

En este caso usamos:

nginx:alpine
nginx: servidor web.
alpine: variante ligera basada en Alpine Linux.

Toda imagen normalmente comienza con una instrucción FROM, que establece la imagen base o inicia una nueva etapa de construcción.

COPY
COPY index.html /usr/share/nginx/html/index.html

Copia nuestro archivo desde la computadora hacia la imagen.

Origen:

index.html

Destino dentro de la imagen:

/usr/share/nginx/html/index.html

Docker solamente puede copiar archivos disponibles dentro del contexto de construcción. En nuestro comando, el punto . indicará que la carpeta actual será ese contexto.

EXPOSE
EXPOSE 80

Documenta que la aplicación escucha en el puerto 80.

Es importante entender que EXPOSE no publica automáticamente el puerto en tu computadora. Para acceder desde el navegador todavía tendremos que usar -p. La instrucción sirve principalmente para describir qué puerto utiliza el contenedor.

CMD
CMD ["nginx", "-g", "daemon off;"]

Define el comando predeterminado que se ejecutará al iniciar el contenedor.

La opción:

daemon off;

mantiene Nginx ejecutándose en primer plano. Esto permite que el proceso principal continúe activo y que el contenedor no se cierre.

La forma con corchetes es conocida como formato exec:

CMD ["comando", "argumento"]

Docker la recomienda habitualmente porque maneja mejor las señales del sistema que la forma de texto simple.

5. Construir la imagen

Desde la carpeta donde están el Dockerfile y index.html, ejecuta:

docker build -t samiza-web:v1 .

Significado:

docker build       Construye una imagen
-t                 Asigna un nombre y una etiqueta
samiza-web         Nombre de la imagen
v1                 Versión o etiqueta
.                  Contexto de construcción actual

El punto final es obligatorio:

.

Indica que Docker debe usar la carpeta actual como contexto de construcción.

6. Verificar la imagen

Ejecuta:

docker images

También puedes usar:

docker image ls

Deberías encontrar algo parecido a:

REPOSITORY    TAG    IMAGE ID       CREATED          SIZE
samiza-web    v1     3ea25d7f1234   10 seconds ago   ...
7. Crear el contenedor

Ejecuta:

docker run -d \
  --name samiza-contenedor \
  -p 8080:80 \
  samiza-web:v1

En PowerShell también puedes escribirlo en una sola línea:

docker run -d --name samiza-contenedor -p 8080:80 samiza-web:v1

Explicación:

-d                      Segundo plano
--name                   Nombre del contenedor
samiza-contenedor        Nombre elegido
-p 8080:80               Puerto PC : puerto contenedor
samiza-web:v1            Imagen que se ejecutará

Abre en el navegador:

http://localhost:8080

Deberás ver:

¡Docker está funcionando!
Esta página fue creada desde mi propia imagen Docker.

8. Inspeccionar el contenedor

Ver los contenedores activos:

docker ps

Ver los registros:

docker logs samiza-contenedor

Entrar al contenedor:

docker exec -it samiza-contenedor sh

Dentro del contenedor ejecuta:

ls

Después:

cd /usr/share/nginx/html

Y finalmente:

ls -la

Podrás observar el archivo:

index.html

Para ver su contenido:

cat index.html

Para salir:

exit
9. Modificar la aplicación

Cambia el contenido del archivo index.html, por ejemplo:

<h1>Mi segunda versión con Docker</h1>

Actualiza también el texto:

<p>Estoy aprendiendo a construir imágenes Docker.</p>

El contenedor actual no cambiará automáticamente, porque su imagen fue construida con la versión anterior del archivo.

Primero elimina el contenedor:

docker rm -f samiza-contenedor

Construye una nueva versión:

docker build -t samiza-web:v2 .

Ejecuta la versión nueva:

docker run -d --name samiza-contenedor -p 8080:80 samiza-web:v2

Recarga:

http://localhost:8080
10. Entender las etiquetas

Ahora tendrás dos versiones:

samiza-web:v1
samiza-web:v2

Puedes comprobarlo con:

docker images samiza-web

Las etiquetas permiten identificar versiones:

mi-app:v1
mi-app:v2
mi-app:produccion
mi-app:latest

También puedes crear una nueva etiqueta sin volver a construir:

docker tag samiza-web:v2 samiza-web:latest

Comprueba el resultado:

docker images samiza-web
11. Crear un .dockerignore

Crea un archivo llamado:

.dockerignore

Coloca:

.git
.gitignore
README.md
*.log
.env
node_modules
vendor

Este archivo evita enviar contenido innecesario o sensible al contexto de construcción.

Esto será especialmente importante en tus proyectos:

Laravel: evitar vendor, .env y archivos temporales.
Angular: evitar node_modules y dist.
Git: evitar la carpeta .git.

Docker procesa recursivamente los archivos del contexto; por eso .dockerignore ayuda a reducir el contexto enviado al constructor.

12. Cómo funciona la caché

Cuando vuelvas a ejecutar:

docker build -t samiza-web:v3 .

Docker puede mostrar mensajes como:

CACHED

Docker reutiliza capas anteriores cuando las instrucciones y archivos relacionados no cambiaron.

Por ejemplo:

FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html

Si la imagen base no cambió, Docker puede reutilizar la primera capa. Si modificaste index.html, solamente volverá a ejecutar desde el COPY correspondiente.

Para construir sin caché:

docker build --no-cache -t samiza-web:v3 .
13. Diferencia entre imagen y contenedor

En nuestro ejercicio:

Dockerfile
    ↓ docker build
Imagen samiza-web:v1
    ↓ docker run
Contenedor samiza-contenedor

La imagen es inmutable y funciona como plantilla.

El contenedor es una instancia ejecutándose a partir de esa imagen.

Puedes crear varios contenedores con la misma imagen:

docker run -d --name web-1 -p 8081:80 samiza-web:v2
docker run -d --name web-2 -p 8082:80 samiza-web:v2
docker run -d --name web-3 -p 8083:80 samiza-web:v2

Acceso:

http://localhost:8081
http://localhost:8082
http://localhost:8083

Todos usan la misma imagen, pero son contenedores diferentes.

Ejercicio de la clase 2

Realiza lo siguiente:

mkdir mi-primera-imagen
cd mi-primera-imagen

Crea:

Dockerfile
index.html
.dockerignore

Después ejecuta:

docker build -t samiza-web:v1 .
docker images
docker run -d --name samiza-contenedor -p 8080:80 samiza-web:v1
docker ps
docker logs samiza-contenedor

Abre:

http://localhost:8080

Finalmente entra al contenedor:

docker exec -it samiza-contenedor sh
Lo aprendido

Ahora ya sabes:

Qué es un Dockerfile.
Cómo utilizar FROM, COPY, EXPOSE y CMD.
Cómo construir una imagen con docker build.
Cómo asignar nombres y versiones.
Cómo crear un contenedor desde tu propia imagen.
Cómo funciona el contexto de construcción.
Para qué sirve .dockerignore.
Por qué una modificación requiere reconstruir la imagen.

La siguiente clase será sobre volúmenes y bind mounts, para modificar archivos sin reconstruir la imagen y conservar datos aunque eliminemos el contenedor.