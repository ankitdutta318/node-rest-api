const userRoutes = require('express').Router();

userRoutes.route('/')
    .get((req, res) => {
        res.status(200).json({
            status : 'success',
            message : 'ok'
        });
    })
    .post((req, res) => {
        res.status(200).json({
            status : 'success',
            message : 'ok'
        });
    });

userRoutes.route('/:username')
    .get((req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'ok'
        });
    })
    .patch((req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'ok'
        });
    })
    .delete((req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'ok'
        });
    });



module.exports = {
    userRoutes
}
