FROM nginx:alpine

RUN mkdir -p /usr/share/nginx/html/models

# Modelo anatómico del Human Reference Atlas (CC BY 4.0).
# Si la descarga no está disponible durante el build, la aplicación mostrará
# instrucciones para colocar manualmente models/corazon.glb.
RUN wget -q \
    "https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Heart.glb" \
    -O /usr/share/nginx/html/models/corazon.glb \
    || rm -f /usr/share/nginx/html/models/corazon.glb

COPY index.html /usr/share/nginx/html/index.html
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY models /usr/share/nginx/html/models

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
