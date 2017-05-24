const bcrypt = require('bcryptjs');

const hashedPass = '$2a$10$4UdIHFn4p6tx3NImGkYlGOb8QvhF6FafqLSo1Fw2A.YotvWa0JKE6';

// comparing password 
bcrypt.compare('geekankit318', hashedPass)
    .then((result) => {
        if(result) {
            return console.log('Password Matched');
        }
        else {
            return console.log('Password Did Not Matched');            
        }
    }).catch((err) => console.log(err));