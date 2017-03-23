'use strict';
const Joi = require('joi');

// Declare internals

const internals = {};


exports.register = (server, options, next) => {

    // Code inside the callback function of server.dependency will only be executed
    // after Auth plugin has been registered. It's triggered by server.start,
    // and runs before actual starting of the server.  It's done because the call to
    // server.route upon registration with auth:'basic' config would fail and make
    // the server crash if the basic strategy is not previously registered by Auth.

    server.dependency('hapi-mongodb', internals.after);//te aseguras que se carga el plugin antes de la conexion

    return next();
};

exports.register.attributes = {
    name:'EditarPartido'
};

internals.after = (server, next) => {
//actualizar tambien el partido del arbitro
    server.route({
        method: 'GET',
        path: '/football/partido/{local}/{visitante}/{estado}',
        config:{
            description:'editar estado partido',
            handler: (request, reply) => {

                const db = server.plugins['hapi-mongodb'].db;//tb var db = request.server.plugins['hapi-mongodb'].db[0];
                db.collection('partido').find({ 'local.nombre':{ $in:[request.params.local] } , 'visitante.nombre':{ $in:[request.params.visitante] } }).toArray((err, result) => {//toAarray si no tenemos un objeto cursor que no puede devolver reply
                    db.collection('partido').update({ 'local.nombre':{ $in:[request.params.local] } , 'visitante.nombre':{ $in:[request.params.visitante] } }, { $set: { 'estado' : request.params.estado } } );
                    db.collection('arbitros').update({ 'partidos.local.nombre':{ $in:[request.params.local] } , 'partidos.visitante.nombre':{ $in:[request.params.visitante] } }, { $set: { 'partidos.estado' : request.params.estado } } );

                    if (err) {
                        return reply(Boom.internal('Internal MongoDB error', err));
                    }
                    return reply(result);//cambiar por OK

                });
            }
        }
    });

    return next();
};
