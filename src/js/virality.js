var NUM_USERS = 20,
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

function randRange(min, max) {
    return Math.round(min+(Math.random()*(max-min)));
}

window.virality = (function($) {
    var users = {},
        activeUsers = {},
        sys,
        canvas = $('#social-graph'),
        tickInterval;

    function addUser(userId) {
        if (userId in users) {
            return users[userId];
        } else {
            node = sys.addNode(userId, {"shape": "dot", "color": "#3366CC"});
            users[userId] = node;
            return node
        }
    }

    function randomUser() {
        return users[randRange(1, NUM_USERS-1)]
    }

    function activateUser(user) {
        user.data['color'] = '#CC6633';
        activeUsers[user.name] = user;
    }

    function setupNetwork() {
        /* Create the nodes */
        for(var userId=0; userId < NUM_USERS; userId++) {
            addUser(userId);
        }

        /* Add the edges */
        for(var userId=0; userId < NUM_USERS; userId++) {
            curUser = users[userId];
            numEdges = Math.round(powerlaw(MIN_CONNECTIONS, MAX_CONNECTIONS, 2));
            for(var edge=0; edge < numEdges; edge++) {
                sys.addEdge(curUser, randomUser());
            }
        }
    }

    function startTick() {
        // Activate one user
        activateUser(randomUser());
        
        tickInterval = window.setInterval(tick, 1000);
    }

    function tick() {
        for(activeUser in activeUsers) {
            if (activeUsers.hasOwnProperty(activeUser)) {
                var edges = sys.getEdgesFrom(activeUser).concat(sys.getEdgesTo(activeUser));
                for (var e=0; e < edges.length; e++) {
                    var edge = edges[e];
                    activateUser(edge.target);
                    activateUser(edge.source);
                }
            }
        }
    }
    
    function init() {
        sys = arbor.ParticleSystem(2600, 512, 0.5);
        sys.renderer = Renderer(canvas);
        sys.fps(30);
        setupNetwork();
        startTick();
    }
    
    return {
        "init": init
    };
}(this.jQuery));

$(document).ready(function() {
    virality.init();
});





