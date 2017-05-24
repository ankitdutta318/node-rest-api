const bcrypt = require('bcryptjs');

let hashedPass = null;

bcrypt.genSalt(10)
    .then((salt) => {
        return bcrypt.hash('geekankit318', salt);
    })
    .then((hash) => {
        hashedPass = hash;
        return console.log('**HASH Generate => ', hash);
    })
    .catch((err) => {
        return console.log(err);
    });
