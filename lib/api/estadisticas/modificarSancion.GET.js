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
    name:'jugadores'
};

internals.after = (server, next) => {
//no se usa??? posible uso cuando acabe el partido quitar sanción a los jugadores que ya la hayan cumplido.
    server.route({
        method: 'GET',
        path: '/football/{nombre}/{sancion}',
        config:{
            description:'jugadores',
            /*validate: {
                query: Joi.object({
                    pass: Joi.string()
                })
            },*/
            handler: (request, reply) => {

                const db = server.plugins['hapi-mongodb'].db;//tb var db = request.server.plugins['hapi-mongodb'].db[0];
                db.collection('equipo').find({ 'jugadores.nombre':{ $in:[request.params.nombre] } }).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply

                    const jugadores = result[0].jugadores;//lo que me devuelve es un array de una posición por eso accedo a la 0 y dentro al elemento jugadores.
                    console.log(result);
                    console.log(jugadores);
                    if (err) {
                        return reply(Boom.internal('Internal MongoDB error', err));
                    }

                    for (let i = 0; i < jugadores.length; i++){
                        if (result[0].jugadores[i].nombre === request.params.nombre){
                            db.collection('equipo').update( { 'jugadores.nombre':{ $in:[request.params.nombre] } }, { $set: { 'jugadores.$.disponibilidad' : request.params.sancion } });//$ nos indica la posición actual dentro del for.
                        }
                    }
                    return reply('OK');

                });
            }

        }
    });
    return next();
};
