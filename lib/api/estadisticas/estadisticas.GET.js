'use strict';
//const Joi = require('joi');

// Declare internals

const internals = {};
//let valor = '';

exports.register = (server, options, next) => {

    server.dependency('hapi-mongodb', internals.after);//te aseguras que se carga el plugin antes de la conexion

    return next();
};

exports.register.attributes = {
    name:'jugadores con GET'
};

internals.after = (server, next) => {

    server.route({
        method: 'GET',
        path: '/football/estadisticas/{nombre}/{tarjeta}/{locvisi}/{fecha}',//poner la fecha bien
        config:{
            description:'jugadores con GET',
            handler:(request, reply) => {

                const db = server.plugins['hapi-mongodb'].db;
                //console.log(request.params.nombre );
                //$in nos permite obtener los valores dentro de un objeto del json que contienen un array
                db.collection('equipo').find({ 'jugadores.nombre':{ $in:[request.params.nombre] } }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply

                    const jugadores = result[0].jugadores;//lo que me devuelve es un array de una posición por eso accedo a la 0 y dentro al elemento jugadores.
                    console.log(result);
                    console.log(jugadores);
                    if (err) {
                        return reply(Boom.internal('Internal MongoDB error', err));
                    }

                    for (let i = 0; i < jugadores.length - 1; i++){
                        if (jugadores[i].nombre === request.params.nombre){
                            console.log(result[0].jugadores[i].disponibilidad);
                            if (request.params.tarjeta === '1'){
                                //console.log("dentro");
                                db.collection('equipo').update( { 'jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'jugadores.$.tA' : 1 } });//$ nos indica la posición actual dentro del for.
                                if (jugadores[i].tA === 4){
                                    console.log(result[0].jugadores[i].tA);
                                    db.collection('equipo').update( { 'jugadores.nombre':{ $in:[request.params.nombre] } }, { $set: { 'jugadores.$.disponibilidad' : 'sancionado' } });//$ nos indica la posición actual dentro del for.
                                    if (request.params.locvisi === 'local'){
                                        db.collection('partido').update( { 'local.jugadores.nombre':{ $in:[request.params.nombre] } }, { $set: { 'local.jugadores.$.estado' : 'sancionado' } });//$ nos indica la posición actual dentro del for.
                                    }
                                    else if (request.params.locvisi === 'visitante'){
                                        db.collection('partido').update( { 'visitante.jugadores.nombre':{ $in:[request.params.nombre] } }, { $set: { 'visitante.jugadores.$.estado' : 'sancionado' } });//$ nos indica la posición actual dentro del for.

                                    }
                                }
                                internals.InsertarAmarillaPartidos(request,i, (err, res) => {

                                    if (err) {
                                        return reply(Boom.internal('Internal MongoDB error', err));
                                    }
                                });
                            }
                            else if (request.params.tarjeta === '-1'){
                                db.collection('equipo').update( { 'jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'jugadores.$.tA' : -1 } });
                                internals.InsertarRoja(request,i, (err, res) => {
                                    if (err) {
                                        return reply(Boom.internal('Internal MongoDB error', err));
                                    }
                                });
                                console.log("fuera"+jugadores[i].tA);
                                if (jugadores[i].tA !== 0){
                                    internals.InsertarRojaPartidos(request,i, (err, res) => {

                                        if (err) {
                                            return reply(Boom.internal('Internal MongoDB error', err));
                                        }
                                    });
                                    internals.quitarAmarillaPartido(request,i, (err, res) => {
                                console.log("fuera");

                                        if (err) {
                                            return reply(Boom.internal('Internal MongoDB error', err));
                                        }
                                    });
                                    
                                }
                                else if (result[0].jugadores[i].tA === 0){
                                    return reply('No es roja el jugador no tenia otra amarilla');
                                }
                            }
                            else if (request.params.tarjeta === 'roja'){
                                internals.InsertarRoja(request,i, (err, res) => {

                                    if (err) {
                                        return reply(Boom.internal('Internal MongoDB error', err));
                                    }
                                });
                                internals.InsertarRojaPartidos(request,i, (err, res) => {

                                    if (err) {
                                        return reply(Boom.internal('Internal MongoDB error', err));
                                    }
                                });
                            }
                            else {
                                internals.InsertarGol(request,i, (err, res) => {

                                    if (err) {
                                        return reply(Boom.internal('Internal MongoDB error', err));
                                    }
                                });
                                internals.InsertarGolPartido(request,i, (err, res) => {

                                    if (err) {
                                        return reply(Boom.internal('Internal MongoDB error', err));
                                    }
                                });
                            }
                        }
                    }
                    return reply('OK');

                });

            }
        }
    });
    return next();
};
internals.InsertarRoja = (request, i, cb) => {

    const db = request.server.plugins['hapi-mongodb'].db;
    
    db.collection('equipo').find({ 'jugadores.nombre':{ $in:[request.params.nombre] } }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      

        db.collection('equipo').update( { 'jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'jugadores.$.tR' : 1 } });//$ nos indica la posición actual dentro del for.
        if (err) {
            return cb(err, null);
        }
        return cb(null, 'OK equipo');

    });
};
internals.InsertarRojaPartidos = (request, i, cb) => {

    const db = request.server.plugins['hapi-mongodb'].db;
    if (request.params.locvisi === 'local'){
        db.collection('partido').find({ 'local.jugadores.nombre':{ $in:[request.params.nombre] },'fechaPartido':request.params.fecha } ).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      
            db.collection('partido').update( { 'local.jugadores.nombre':{ $in:[request.params.nombre] } } ,{ $inc: { 'local.jugadores.$.tR' : 1 } });//$ nos indica la posición actual dentro del for.
            if (err) {
                return cb(err, null);
            }
            return cb(null, 'OK partidos');

        });
    }
    else if (request.params.locvisi === 'visitante'){
        db.collection('partido').find({ 'visitante.jugadores.nombre':{ $in:[request.params.nombre] },'fechaPartido':request.params.fecha }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      
            db.collection('partido').update( { 'visitante.jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'visitante.jugadores.$.tR' : 1 } });//$ nos indica la posición actual dentro del for.
            if (err) {
                return cb(err, null);
            }
            return cb(null, 'OK partidos');

        });
    }
};
internals.quitarAmarillaPartido = (request, i, cb) => {

    const db = request.server.plugins['hapi-mongodb'].db;
    if (request.params.locvisi === 'local'){
        db.collection('partido').find({ 'local.jugadores.nombre':{ $in:[request.params.nombre] },'fechaPartido':request.params.fecha }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      

            db.collection('partido').update( { 'local.jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'local.jugadores.$.tA' : -1 } });//$ nos indica la posición actual dentro del for.
            if (err) {
                return cb(err, null);
            }
            return cb(null, 'OK');

        });
    }
    else if (request.params.locvisi === 'visitante'){
        db.collection('partido').find({ 'visitante.jugadores.nombre':{ $in:[request.params.nombre] },'fechaPartido':request.params.fecha }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      

            db.collection('partido').update( { 'visitante.jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'visitante.jugadores.$.tA' : -1 } });//$ nos indica la posición actual dentro del for.
            if (err) {
                return cb(err, null);
            }
            return cb(null, 'OK');

        });
    }
};
internals.InsertarAmarillaPartidos = (request, i, cb) => {

    const db = request.server.plugins['hapi-mongodb'].db;
    if (request.params.locvisi === 'local'){

        db.collection('partido').find({ 'local.jugadores.nombre':{ $in:[request.params.nombre] },'fechaPartido':request.params.fecha  }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      

            db.collection('partido').update( { 'local.jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'local.jugadores.$.tA' : 1 } });//$ nos indica la posición actual dentro del for.
            if (err) {
                return cb(err, null);
            }
            return cb(null, 'OK');

        });
    }
    else if (request.params.locvisi === 'visitante'){
        console.log("si visitante");
        db.collection('partido').find({ 'visitante.jugadores.nombre':{ $in:[request.params.nombre] },'fechaPartido':request.params.fecha  }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      

            db.collection('partido').update( { 'visitante.jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'visitante.jugadores.$.tA' : 1 } });//$ nos indica la posición actual dentro del for.
            if (err) {
                return cb(err, null);
            }
            return cb(null, 'OK');

        });
    }
};

internals.InsertarGol = (request, i, cb) => {

    const db = request.server.plugins['hapi-mongodb'].db;
    db.collection('equipo').find({ 'jugadores.nombre':{ $in:[request.params.nombre] } }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      

        db.collection('equipo').update( { 'jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'jugadores.$.goles' : 1 } });
        if (err) {
            return cb(err, null);
        }
        return cb(null, 'OK');

    });
};
internals.InsertarGolPartido = (request, i, cb) => {

    const db = request.server.plugins['hapi-mongodb'].db;
    if (request.params.locvisi === 'local'){

        db.collection('partido').find({ 'local.jugadores.nombre':{ $in:[request.params.nombre] },'fechaPartido':request.params.fecha }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      

            db.collection('partido').update( { 'local.jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'local.jugadores.$.goles' : 1 } });

            //db.collection('arbitros').update( { 'resultado':{ $in:[request.params.fecha] } }, { $inc: { 'local.jugadores.$.goles' : 1 } });

            if (err) {
                return cb(err, null);
            }
            return cb(null, 'OK');

        });
    }
    else if (request.params.locvisi === 'visitante'){
        db.collection('partido').find({ 'visitante.jugadores.nombre':{ $in:[request.params.nombre] },'fechaPartido':request.params.fecha }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      

            db.collection('partido').update( { 'visitante.jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'visitante.jugadores.$.goles' : 1 } });
            //db.collection('arbitros').update( { 'resultado':{ $in:[request.params.fecha] } }, { $inc: { 'local.jugadores.$.goles' : 1 } });

            if (err) {
                return cb(err, null);
            }
            return cb(null, 'OK');

        });
    }
    db.collection('partido').update( { 'fechaPartido':{ $in:[request.params.fecha] } }, { $set: { 'resultado' : request.params.tarjeta } });

};
/*internals.InsertarGolPartido = (request, i, cb) => {

    const db = request.server.plugins['hapi-mongodb'].db;
    db.collection('partido').find({ 'local.jugadores.nombre':{ $in:[request.params.nombre] },'fechaPartido':request.params.fecha }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply      

        db.collection('partido').update( { 'local.jugadores.nombre':{ $in:[request.params.nombre] } }, { $inc: { 'local.jugadores.$.estado' : 'cambiado' } });
        if (err) {
            return cb(err, null);
        }
        return cb(null, 'OK');

    });
};*/