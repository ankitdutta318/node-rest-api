const {db} = require('../db');

module.exports = {
    validateToken : (req, res, next) => {
        let token = req.header('x-token');

        db.then((connection) => {
            return connection.query('SELECT timestamp FROM tokens WHERE token = ?', [token]);
        }).then((result) => {
            if(result.length < 1) {
                return res.status(401).json({
                    status : 'failed',
                    message : 'invalid token'
                });
            }

            // validate time of token 
            let tokenCreationTime = result[0].timestamp;
            let currentTime = Date.now();

            if(currentTime - tokenCreationTime >= (1000 * 60 * 45)) {
                return res.status(401).json({
                    status : 'failed',
                    message : 'token expired'
                });
            } 

            return next();
        })
        .catch((err) => {
            console.log('**', err);
            return res.status(503).json({
                status : 'failed',
                message : 'service unavailable'
            });
        })
    } 
}