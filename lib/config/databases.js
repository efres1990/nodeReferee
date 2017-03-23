'use strict';

const Fs = require('fs');



const internals = {
    mongoConnections:
    {
        url: 'mongodb://elafr:3333333@ds052968.mlab.com:52968/code101',
        settings: {
            server: { ssl: false },
            replset: { sslValidate: true }
        }
    }
};

module.exports = internals;
