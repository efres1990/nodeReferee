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
    name:'EditarPerfil'
};

internals.after = (server, next) => {

    server.route({
        method: 'GET',
        path: '/football/perfil/{old}/{new}/{valor}',
        config:{
            description:'editar estadisticas del arbitro',
            /*validate: {
                params: {
                    name: Joi.string().min(3).max(10)
                }
            },*/
            validate: {
                params: {
                    old: Joi.string(),
                    new: Joi.string().allow('ejemplo@fef.es'),
                    valor: Joi.string()
                }
            },
            handler: (request, reply) => {

                const db = server.plugins['hapi-mongodb'].db;//tb var db = request.server.plugins['hapi-mongodb'].db[0];
                db.collection('arbitros').find( { 'email':request.params.old }).toArray((err, result) => {//toAarray si no tenemos un objeto cursor que no puede devolver reply
                  
                    if (request.params.valor === 'email'){
                        db.collection('arbitros').update({ 'email':{ $in:[request.params.old] } },{ $set: { 'email' : request.params.new } });
                    }
                    else if (request.params.valor === 'telefono'){
                        db.collection('arbitros').update({ 'telefono':{ $in:[request.params.old] } },{ $set: { 'telefono' : request.params.new } });

                    }
                    else if (request.params.valor === 'residencia'){
                        db.collection('arbitros').update({ 'residencia':{ $in:[request.params.old] } },{ $set: { 'residencia' : request.params.new } });

                    }
                    else {
                        db.collection('arbitros').update({ 'pass':{ $in:[request.params.old] } },{ $set: { 'pass' : request.params.new } });
                    }
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
