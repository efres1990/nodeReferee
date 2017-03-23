'use strict';

// Load modules

const Hoek = require('hoek');
const Server = require('./index.js');
const DatabasesConfiguration = require('./config/databases.js');
const SecurityConfiguration = require('./config/security.js');


// Declare internals

const internals = {};

internals.manifest = {
    connections: [
        {
            host: '0.0.0.0',
            port: process.env.PORT || 3000/*,
            tls: SecurityConfiguration.tls*/
        }
    ],
    registrations: [
        {
            plugin:'./api/arbitro/informacion.GET.js'
        },
        {
            plugin:'./api/actas/modifyActa.js'
        },
        {
            plugin:'./api/actas/obtainActa.js'
        },
        {
            plugin:'./api/actas/crearActa.js'
        },
        {
            plugin:'./api/partido/jugadoresSetEstado.js'
        },
        {
            plugin:'./api/login/forgetPass.js'
        },
        {
            plugin:'./api/arbitro/editPerfil.GET.js'
        },
        {
            plugin:'./api/partido/editMatch.GET.js'
        },
        {
            plugin:'./api/estadisticas/estadisticas.GET.js'
        },
        {
            plugin:'./api/login/login.GET.js'
        },
        {
            plugin:'./api/equipo/equipo.GET.js'
        },
        {
            plugin:'./api/estadisticas/modificarSancion.GET.js'
        },
        {
            plugin: 'hapi-auth-hawk'
        },
        {
            plugin: {
                register:'hapi-mongodb',
                options: DatabasesConfiguration.mongoConnections
            }
        },
        {
            plugin: 'inert'
        },
        {
            plugin: 'lout'
        },
        {
            plugin: 'vision'
        }
    ]
};

internals.composeOptions = {
    relativeTo: __dirname
};


Server.init(internals.manifest, internals.composeOptions, (err, server) => {

    Hoek.assert(!err, err);

    console.log('Server running at:', server.info.uri);
});
