window.onload = init;

//para cuando cree el json, lo guarde
let jsonFile;

//value de la seccion
let seccionFiltro = "";

//variable que asigna la columna
let columna = 1;

//desde y hasta para el filtro

let desde = "";
let hasta = "";

//variable de la estrella
let numeroEstrellas = "";
let idFallaEnviar = "";

//let si ha puntuado
let puntuadoIp = false;

//json de mongo
let jsonMongo;

//ip del dispositivo que accede
let ip = "";

//variable que dice en que parte del selector de la seccion de fallas estas XD
let sec = 0;

//variable para identificar si se ha votado mas de 4 veces
let borde = false;

//init
function init() {

    //coge la ip del dispositivo
    getIP();
    //carga toda la base de datos de mongo
    cargarMongo();

    document.getElementsByName("seleccionTamano").forEach(element => element.addEventListener("change", promesaCreadoraDelTodo));
    document.getElementById("selectSeccionFallas").addEventListener("change", promesaCreadoraDelTodo);
    document.getElementById("desde").addEventListener("input", promesaCreadoraDelTodo);
    document.getElementById("hasta").addEventListener("input", promesaCreadoraDelTodo);

    //descarga todo el json de las fallas
    descargarJson();


}

function descargarJson() {

    fetch("http://mapas.valencia.es/lanzadera/opendata/Monumentos_falleros/JSON").then(function(response) {

        return archivoJson = response.json();

    }).then(function(jsonDevuelto) {

        jsonFile = jsonDevuelto;

        console.log(jsonDevuelto);

    }).then(promesaCreadoraDelTodo);
}


function comprobarSiHaVotado() {

    for (let i = 0; i < jsonMongo.length; i++) {

        if (jsonMongo[i].ip == ip) {
            puntuadoIp = true;
        }

    }

    if (puntuadoIp == true) {
        console.log("si");
        //document.getElementById("votar").innerText = "Ya has votado";

    } else {
        console.log("no");
        //document.getElementById("votar").innerText = "No has votado";

    }

}

//es la funcion que lanza despues de descargar todo el json
function promesaCreadoraDelTodo() {

    //comprueba si has votado
    comprobarSiHaVotado();

    //detecta que es todas
    if (document.getElementById("selectSeccionFallas").selectedIndex == -1) {
        sec = 0;
    } else {
        sec = document.getElementById("selectSeccionFallas").selectedIndex;

    }

    console.log(document.getElementById("selectSeccionFallas").selectedIndex);

    //vaciamos primero el div para mejor seleccion
    document.getElementById("listaFallas").innerHTML = "";
    document.getElementById("selectSeccionFallas").innerHTML = "";

    cargarSecciones();

    document.getElementById("selectSeccionFallas").selectedIndex = sec;

    seccionFiltro = document.getElementById("selectSeccionFallas");

    let filtroSecciones = jsonFile.features.filter(busquedaSeccion);
    let filtroAnyo = filtroSecciones.filter(busquedaAnyo);

    filtroAnyo.forEach(iteracion => {

        //------------------------------//
        //aqui se crea la falla como tal//
        //------------------------------//
        let falla = document.createElement("div");
        falla.classList.add("falla");

        falla.dataset.idFalla = iteracion.properties.id;

        //falla.addEventListener("mouseover", mostrarInfoFalla);
        //falla.addEventListener("mouseout", borrarClase);
        let parrafo = document.createElement("p");
        let imagenP = document.createElement("img");
        let imagenI = document.createElement("img");

        imagenI.src = iteracion.properties.boceto_i;
        imagenP.src = iteracion.properties.boceto;
        parrafo.innerHTML = iteracion.properties.nombre;

        if (document.getElementsByName("seleccionTamano")[1].checked) {
            falla.appendChild(imagenI);
        } else if (document.getElementsByName("seleccionTamano")[0].checked) {
            falla.appendChild(imagenP);
        }

        falla.appendChild(parrafo);

        cargarEstrellas(falla, iteracion);

        let boton = document.createElement("button");
        boton.innerHTML = "Enviar";
        boton.addEventListener("click", comprobarEnvio);

        //pongo el boton desabilitado si has votado
        if (puntuadoIp == true) {

            boton.disabled = true;

        }

        falla.appendChild(boton);

        let Numero_Media = hacerMedia(iteracion.properties.id);

        if (borde == true) {
            falla.style.border = "2px solid yellow";
        }

        //console.log("falla con id =:> " + iteracion.properties.id);

        //para añadir la media, por default es 0 y redondear a la alza dependiendo de lo que page XD
        let media = document.createElement("input");
        media.setAttribute("type", "text");
        media.disabled = true;
        media.value = Numero_Media; //mas tarde añadire la media
        media.classList.add("centradoMedia");
        falla.appendChild(media);
        //ultimo paso

        //anyadir las fallas a una columna cada vez

        document.getElementById('listaFallas').appendChild(falla);
        console.log(document.getElementById("col" + columna));

        switch (columna) {

            case 1:
                columna = 2;
                break;

            case 2:
                columna = 3;
                break;

            case 3:
                columna = 1;
                break;

            default:
                break;
        }
    });
}

//funcion que coje la ip
function getIP(obj) {
    try {
        ip = obj.ip;
    } catch (error) {}
}

//esta funcion devuelve true or false si se cumple la condicion del filtro
//----------------------AQUI ESTAN LOS FILTROS----------------------------
function busquedaSeccion(iteracion) {

    //console.log(seccionFiltro.value);

    if (seccionFiltro.value == "Todas") {

        return true;

    } else {

        if (document.getElementsByName("seleccionTamano")[0].checked) { // principal
            return iteracion.properties.seccion == seccionFiltro.value;
        } else { // infantil
            return iteracion.properties.seccion_i == seccionFiltro.value;
        }
    }
}

function busquedaAnyo(iteracion) {

    let valorDesde = document.getElementById("desde").value;
    let valorHasta = document.getElementById("hasta").value;

    if (valorDesde == '') {
        valorDesde = 0;
    }

    if (valorHasta == '') {
        valorHasta = 9999;
    }

    if (valorDesde == 0 && valorHasta == 9999) {
        return true;
    }

    if (valorDesde <= iteracion.properties.anyo_fundacion && valorHasta >= iteracion.properties.anyo_fundacion) {
        console.log("cumple la condicion");
        return iteracion.properties.anyo_fundacion;
    }
}

//------------------------------------------------------------------------


//esta funcion carga las secciones, distinguiendo si es 
function cargarSecciones() {

    let seccioneSet = new Set;

    jsonFile.features.forEach(iteracion => {

        if (document.getElementsByName("seleccionTamano")[1].checked) { //infantil
            seccioneSet.add(iteracion.properties.seccion_i);

        } else if (document.getElementsByName("seleccionTamano")[0].checked) { //principal
            seccioneSet.add(iteracion.properties.seccion);

        }

    });

    //añadir
    let opTodas = document.createElement("option");
    opTodas.innerHTML = "Todas";
    document.getElementById("selectSeccionFallas").appendChild(opTodas);

    seccioneSet.forEach(element => {
        let opcion = document.createElement("option");
        opcion.innerHTML = element;
        document.getElementById("selectSeccionFallas").appendChild(opcion);
        //console.log(element);
    });
}

//forma de cargar las estrellas dinamicamente
function cargarEstrellas(fallaTraida, iteracionTraida) {

    let formulario = document.createElement("form");
    formulario.classList.add("calificacion");
    formulario.setAttribute('method', 'POST');
    let inputHidden = document.createElement("input");
    inputHidden.setAttribute('type', 'hidden');
    inputHidden.value = iteracionTraida.properties.id;

    formulario.appendChild(inputHidden);

    let p = document.createElement("p");

    for (let i = 5; i >= 1; i--) {

        let labelEstrella = document.createElement("label");
        labelEstrella.innerHTML = "✦";
        labelEstrella.dataset.estrella = i;
        labelEstrella.addEventListener("click", seleccionEstrella);
        formulario.appendChild(labelEstrella);

    }
    //final
    fallaTraida.appendChild(formulario);

}

//funcion que hace la media
function
hacerMedia(id) {

    let n_veces = 0;
    let suma = 0;

    //jsonMongo

    for (let i = 0; i < jsonMongo.length; i++) {

        //console.log(jsonMongo[i].ip);

        if (jsonMongo[i].ip != "127.0.0.1" && jsonMongo[i].idFalla == id) {

            suma += jsonMongo[i].puntuacion;
            n_veces++;
        }
    }

    if (n_veces >= 4) {

        borde = true;

    } else {
        borde = false;
    }

    if (suma == 0) {
        return 0;
    } else {
        console.log(Math.ceil(suma / n_veces));
        return Math.ceil(suma / n_veces);
    }

}
/*
function mostrarInfoFalla(e) {

    this.classList.add("hacerGrande");
    console.log(this);

}

function borrarClase(e) {

    this.classList.remove("hacerGrande");

}
*/
function seleccionEstrella(e) {
    let padreDelPadre = this.parentElement.parentElement;
    numeroEstrellas = this.dataset.estrella;
    idFallaEnviar = padreDelPadre.dataset.idFalla;
    this.classList.toggle("pulsado");

    if (padreDelPadre.dataset.idFalla == idFallaEnviar) {
        console.log("se puede enviar el id falla - " + idFallaEnviar + ", numeroEstrellas - " + numeroEstrellas);
    } else {
        console.log("puntua esta falla, no otra");
        //crear un div que diga eso
    }

}

//pequeño paso entes de enviar
function comprobarEnvio(e) {

    let padre = this.parentElement;
    console.log(padre);

    if (padre.dataset.idFalla != idFallaEnviar) {
        alert("comprueba que has votado o puntuado correctamente.");
    } else {
        valorar();
    }

}
//esta es la llamada que tendra el boton
function valorar(e) {

    //enviar un array de datos

    if (numeroEstrellas == '' || numeroEstrellas == null) {
        numeroEstrellas == 0;
    }

    var url = '/puntuaciones';
    var data = { idFalla: idFallaEnviar, ip: ip, puntuacion: numeroEstrellas }; //idfalla, ip, puntuacion

    fetch(url, {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response));

}

function cargarMongo() {

    fetch("/puntuaciones", {
            method: 'GET', // or 'PUT'
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(respuesta =>
            console.log(jsonMongo = respuesta) /*, jsonMongo = respuesta*/
        ) /*.then(comprobarSiHaVotado)*/ ;

}