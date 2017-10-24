var C = require('chalk');

var log = (x) => console.log(x);

module.exports = {
    red:     (x) => log(C.red(x)),
    green:   (x) => log(C.green(x)),
    yellow:  (x) => log(C.yellow(x)),
    blue:    (x) => log(C.blue(x)),
    magenta: (x) => log(C.magenta(x)),
    cyan:    (x) => log(C.cyan(x)),
    white:   (x) => log(C.white(x)),
    gray:    (x) => log(C.gray(x)),

    log:     (x) => log(x),
    heading: (x) => log(C.bgBlue('\n'+ x)),
    info:    (x) => log(C.cyan.underline.bold('\n'+ x)),
    success: (x) => log(C.green('\n'+ x)),
    warning: (x) => log(C.yellow('\n'+ x)),
    error:   (x) => log(C.red('\n'+ x)),
    nl:      ()  => log('\n')
 }