/**
 *
 * @param {Object} obj -
 */
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

/**
 * Join the values of args in a string
 * @params {[string]} args -
 */
function join (args) {
   var res = "";
   args.forEach( str => {
       res+=str + " ";

   });
   return res;
}

module.exports = {
    isEmpty,
    join
};
