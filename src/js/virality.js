var NUM_USERS = 50,
    MIN_CONNECTIONS = 1,
    MAX_CONNECTIONS = NUM_USERS * 0.02,
    STICKINESS = 0.95,
    USER_COLOR = '#3366CC',
    ACTIVE_USER_COLOR = '#CC6633',
    PAST_USER_COLOR = '#CCCCCC';

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
        pastUsers = {},
        activeUsers = {},
        sys,
        canvas = $('#social-graph'),
        tickInterval;

    function addUser(userId) {
        if (userId in users) {
            return users[userId];
        } else {
            node = sys.addNode(userId, {"shape": "dot", "color": USER_COLOR});
            users[userId] = node;
            return node
        }
    }

    function randomUser() {
        return users[randRange(1, NUM_USERS-1)]
    }

    function activateUser(user) {
        sys.tweenNode(user, 0.25, {'color': ACTIVE_USER_COLOR})
        activeUsers[user.name] = user;
        pastUsers[user.name] = user;
    }

    function deactivateUser(user) {
        sys.tweenNode(user, 0.25, {'color': PAST_USER_COLOR})
        delete activeUsers[user.name];
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
        
        return false;
    }

    function startTick() {
        // Activate one user to seed the system
        if (Object.keys(activeUsers).length == 0) {
            activateUser(randomUser());            
        }
        
        tickInterval = window.setInterval(tick, 1000);
    }

    function stopTick() {
        window.clearInterval(tickInterval);
    }

    function tick() {
        for(activeUserId in activeUsers) {
            if (!activeUsers.hasOwnProperty(activeUserId)) {
                continue;
            }

            var activeUser = activeUsers[activeUserId];

            if (Math.random() > STICKINESS) {
                /* This user lost interest in the product and stopped using it. */
                deactivateUser(activeUser);
            } else {
                /* This user continued to use the product and showed his friends. */
                var outEdges = sys.getEdgesFrom(activeUser.name),
                    inEdges = sys.getEdgesTo(activeUser.name);

                for (var e=0; e < outEdges.length; e++) {
                    var edge = outEdges[e];
                    if (!pastUsers.hasOwnProperty(edge.target.name)) {
                        activateUser(edge.target);                            
                    }
                }
                
                for (var e=0; e < inEdges.length; e++) {
                    var edge = inEdges[e];
                    if (!pastUsers.hasOwnProperty(edge.source.name)) {
                        activateUser(edge.source);
                    }
                }
            }
        }
    }

    function start() {
        startTick();
        return false;
    }

    function stop() {
        stopTick();
        return false;
    }
    
    function init() {
        sys = arbor.ParticleSystem(2600, 512, 0.5);
        sys.renderer = Renderer(canvas);
        sys.fps(30);
        setupNetwork();

        $('#play').click(start);
        $('#stop').click(stop);
        $('#setup').click(setupNetwork);
    }
    
    return {
        "init": init
    };
}(this.jQuery));

$(document).ready(function() {
    virality.init();
});





