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
    name:'modificar estado acta'
};

internals.after = (server, next) => {

    server.route({
        method: 'GET',
        path: '/football/acta/{fecha}/{observaciones}',
        config:{
            description:'modificar el estado del acta al pulsar enviar desde menu lateral',
            validate: {
                params: {
                    fecha: Joi.string(),
                    observaciones:Joi.string()
                }
            },
            handler: (request, reply) => {

                const db = server.plugins['hapi-mongodb'].db;//tb var db = request.server.plugins['hapi-mongodb'].db[0];
                db.collection('actas').update( { 'fechaPartido':{ $in:[request.params.fecha] } }, { $set: { 'estado' : 'cerrada' } });//$ nos indica la posición actual dentro del for.
                console.log(request.params.observaciones);
                db.collection('actas').update( { 'fechaPartido':{ $in:[request.params.fecha] } }, { $set: { 'observaciones' : request.params.observaciones } });//$ nos indica la posición actual dentro del for.

                return reply('Acta enviada correctamente');
            }
        }
    });

    return next();
};
