var R = require("ramda");
var _ = require("lodash");

var log = (x) => { console.log(x) };

var maybe = (x) => {
    return {
        map: function(fn) { return maybe(fn(x))},
        show: function(fn) { return fn(x)} 
    }
}

var map = R.curry( (fn, m) => { 
    return m.map(fn);
});
var show = R.curry( (fn, m) => { 
    return m.show(fn);
});

var double = (x) => {
    return (x+2)
};

R.compose(show(log), map(double), maybe)(10);
