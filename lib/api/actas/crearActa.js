'use strict';
const Joi = require('joi');

// Declare internals

const internals = {};


exports.register = (server, options, next) => {
    server.dependency('hapi-mongodb', internals.after);//te aseguras que se carga el plugin antes de la conexion

    return next();
};

exports.register.attributes = {
    name:'CreateActa'
};

internals.after = (server, next) => {

    server.route({
        method: 'GET',
        path: '/football/acta/{json}',
        config:{
            description:'se crea el acta del partido',
            /*validate: {
                params: {
                    json: Joi.object()
                }
            },*/
            handler: (request, reply) => {

                const db = server.plugins['hapi-mongodb'].db;//tb var db = request.server.plugins['hapi-mongodb'].db[0];
                const nombre = JSON.parse(request.params.json);
                //console.log(nombre.arbitro.split('+').join(' '));
                db.collection('actas').insert( { 'arbitro':nombre.arbitro.split('+').join(' '), 'equipoLocal':nombre.equipoLocal.split('+').join(' '),'equipoVisitante':nombre.equipoVisitante.split('+').join(' '),'estadio':nombre.estadio.split('+').join(' ') ,'asistentes':nombre.asistentes
                ,'fechaPartido':nombre.fechaPartido,'horaPartido':nombre.horaPartido,'jLocalAmarilla':nombre.jLocalAmarilla,'jVisitanteAmarilla':nombre.jVisitanteAmarilla,'jLocalRoja':nombre.jLocalRoja
                ,'jVisitanteRoja':nombre.jVisitanteRoja,'jLocalGol':nombre.jLocalGol,'jVisitanteGol':nombre.jVisitanteGol,'resultado':nombre.resultado,'observaciones':nombre.observaciones.split('+').join(' '),'estado':nombre.estado });
                db.collection('actas').find( ).toArray((err, result) => {//toAarray si no tenemos un objeto cursor que no puede devolver reply
                    if (err) {
                        return reply(Boom.internal('Internal MongoDB error', err));
                    }
                    return reply(nombre);

                });
            }
        }
    });

    return next();
};
