var NUM_USERS = 500,
    MIN_CONNECTIONS = 1,
    MAX_CONNECTIONS = NUM_USERS * 0.1;

/**
 * I won't pretend to know what this means in detail, borrowed essentially
 * wholesale from http://antirez.com/post/PRNG-power-law-long-tail.html
 * and ported to JS.
**/
function powerlaw(min, max, n) {
    max += 1;
    exp = n+1
    pl = Math.pow(((Math.pow(max, exp) - Math.pow(min, exp))* Math.random() + Math.pow(min, exp)), (1.0/exp))
    return (max-1-parseInt(pl))+min
}

/**
 * Set up our social graph, which should show a power law distribution
 * in terms of # of connections per user.
 */
var users = [];
for(var i=0; i < NUM_USERS; i++) {
    r=powerlaw(MIN_CONNECTIONS, MAX_CONNECTIONS, 2)
    users.push(r);
}
