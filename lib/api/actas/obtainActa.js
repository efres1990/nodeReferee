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
    name:'obtenerActas'
};

internals.after = (server, next) => {

    server.route({
        method: 'GET',
        path: '/football/referee/{nombre}',
        config:{
            description:'actas del arbitro',
            validate: {
                params: {
                    nombre: Joi.string()
                }
            },
            handler: (request, reply) => {

                const db = server.plugins['hapi-mongodb'].db;//tb var db = request.server.plugins['hapi-mongodb'].db[0];
                db.collection('actas').find( { 'arbitro':request.params.nombre }).toArray((err, result) => {//toAarray si no tenemos un objeto cursor que no puede devolver reply
                    if (err) {
                        return reply(Boom.internal('Internal MongoDB error', err));
                    }
                    return reply(result);

                });
            }
        }
    });

    return next();
};
