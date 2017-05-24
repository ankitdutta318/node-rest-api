'use strict';

module.exports = {
    /**
     * Check whether the given email address is valid or not
     * @param  {string} 
     * @returns {boolean}
     * 
     */
    validateEmail  : (email) => {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    
    /**
     * Replace special characters from username and remove spaces with '-'
     * @param  {string} 
     * @returns {string}
     * 
     */
    validateUsername : (username) => {
        if (!username) {
            return username;
        }
        return username.replace(/[^a-z\d\s]+/gi, "").replace(/ /g,"-");
    }
}