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
    name:'nuevaContraseña'
};

internals.after = (server, next) => {

    server.route({
        method: 'GET',
        path: '/football/correo/{correo}',
        config:{
            description:'nueva Contraseña',
            handler: (request, reply) => {

                const randomstring = Math.random().toString(36).slice(-8);
                console.log(randomstring);
                const db = server.plugins['hapi-mongodb'].db;//tb var db = request.server.plugins['hapi-mongodb'].db[0];
                db.collection('arbitros').find( { 'email':request.params.correo }).toArray((err, result) => {//toAarray si no tenemos un objeto cursor que no puede devolver reply
                    db.collection('arbitros').update( { 'email':{ $in:[request.params.correo] } }, { $set: { 'pass' : randomstring } });//$ nos indica la posición actual dentro del for.

                    if (err) {
                        return reply(Boom.internal('Internal MongoDB error', err));
                    }
                    return reply(randomstring);

                });
            }
        }
    });

    return next();
};
