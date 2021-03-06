var globals = require('../globals');

// Function for handling /senseStartTask REST endpoint
module.exports.respondSenseStartTask = function (req, res, next) {
    // Use data in request to start Qlik Sense task
    globals.logger.log('info', req.query.taskId);
    // console.info(req.query.taskId);

    globals.qrsUtil.senseStartTask.senseStartTask(req.query.taskId);

    res.send(req.query);
    next();
};
