'use strict';

module.exports = {
    validateEmail  : (email) => {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    validateUsername : (username) => {
        return usernames.replace(/[^a-z\d\s]+/gi, "").replace(/ /g,"_");
    }
}