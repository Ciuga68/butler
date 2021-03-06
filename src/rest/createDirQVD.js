// Load code from sub modules
var globals = require('../globals');

var mkdirp = require('mkdirp');

// Function for handling /createDirQVD REST endpoint
module.exports.respondCreateDirQVD = function (req, res, next) {
    globals.logger.log('info', 'Creating dir: %s', req.query);

    mkdirp(globals.qvdFolder + '/' + req.query.directory, function (err) {
        // path was created unless there was error
        if (err) {
            globals.logger.log('error', 'Error while creating dir ' + req.query.directory + ': ' + err);
        } else {
            globals.logger.log('verbose', 'Created dir ' + req.query.directory);

        }
    });

    res.send(req.query);
    next();
};
