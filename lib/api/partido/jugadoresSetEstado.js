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
    name:'titulares'
};

internals.after = (server, next) => {

    server.route({
        method: 'GET',
        path: '/football/{locvisi}/{fecha}/{array}/{estado}',
        config:{
            description:'jugadores titulares o no',
            /*validate: {
                query: Joi.object({
                    pass: Joi.string()
                })
            },*/
            handler: (request, reply) => {

                const db = server.plugins['hapi-mongodb'].db;//tb var db = request.server.plugins['hapi-mongodb'].db[0];
                db.collection('partido').find({ 'fechaPartido':request.params.fecha } ).toArray((err, result) => { //toAarray si no tenemos un objeto cursor que no puede devolver reply
                    //console.log(result[0].local.jugadores+'oooo');
                    const jugadores = result[0].local.jugadores;//lo que me devuelve es un array de una posición por eso accedo a la 0 y dentro al elemento jugadores.
                    const resultado = result;
                    const array = request.params.array;
                    if (err) {
                        return reply(Boom.internal('Internal MongoDB error', err));
                    }

                    for (let i = 0; i < jugadores.length; i++){
                        console.log(jugadores[i].nombre);
                        for (let j = 0; j < array.length; j++){

                        
                            console.log(array[j]);
                            if (array[j] === (jugadores[i].nombre) ) {
                                
                                if (request.params.estado === 'titular'){
                                    db.collection('partido').update( { 'local.jugadores.nombre':{ $in:[request.params.nombre] } }, { $set: { 'jugadores.$.estado' : 'titular' } });//$ nos indica la posición actual dentro del for.
                                }
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
