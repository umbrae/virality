var USER_COLOR = '#0033CC',
    ACTIVE_USER_COLOR = '#FF6633',
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
        config = {},
        sys,
        canvas = $('#social-graph'),
        tickCounter = 0,
        tickInterval;

    function getConfig(configVar) {
        var configVal;

        if (!config.hasOwnProperty(configVar)) {
            configVal = $('#' + configVar).val();
            if (!isNaN(parseFloat(configVal)) && isFinite(configVal)) {
                config[configVar] = parseFloat(configVal);
            } else {
                config[configVar] = configVal;
            }
        }
        
        return config[configVar];
    }

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
        return users[randRange(1, getConfig('population')-1)]
    }

    function activateUser(user) {
        sys.tweenNode(user, 0.1, {'color': ACTIVE_USER_COLOR})
        activeUsers[user.name] = user;
        pastUsers[user.name] = user;
    }

    function deactivateUser(user) {
        sys.tweenNode(user, 0.25, {'color': PAST_USER_COLOR})
        delete activeUsers[user.name];
    }

    /**
     * User source tells user target about the concept.
     * If it sticks, return true. If it doesn't, return false;
    **/
    function tellUser(sourceUser, targetUser) {
        var interested = Math.random();
        
        if (pastUsers.hasOwnProperty(targetUser.name)) {
            return false;
        }

        console.log(interested);
        console.log(getConfig('spread-odds'));
        if (interested < getConfig('spread-odds')) {
            return true;
        }
        
        return false;
    }

    function setupNetwork() {
        /* Create the nodes */
        for(var userId=0; userId < getConfig('population'); userId++) {
            addUser(userId);
        }

        /* Add the edges */
        for(var userId=0; userId < getConfig('population'); userId++) {
            curUser = users[userId];
            numEdges = Math.round(powerlaw(1, getConfig('connection-factor'), 2));
            for(var edge=0; edge < numEdges; edge++) {
                sys.addEdge(curUser, randomUser());
            }
        }
        
        return false;
    }

    function startTick() {
        $('#tick-counter').text(tickCounter);

        // Seed the system if we have no active users yet
        if (Object.keys(activeUsers).length == 0) {
            for(var i=0; i < getConfig('start-users'); i++) {
                activateUser(randomUser());
            }
        }
        
        window.clearInterval(tickInterval);
        tickInterval = window.setInterval(tick, getConfig('tick-speed'));
    }

    function stopTick() {
        window.clearInterval(tickInterval);
    }

    function tick() {
        tickCounter++;
        $('#tick-counter').text(tickCounter);
        
        if(Object.keys(activeUsers).length == 0) {
            stopTick();
        }
        
        for(activeUserId in activeUsers) {
            if (!activeUsers.hasOwnProperty(activeUserId)) {
                continue;
            }

            var activeUser = activeUsers[activeUserId];

            if (Math.random() > getConfig('stickiness')) {
                /* This user lost interest in the product and stopped using it. */
                deactivateUser(activeUser);
            } else {
                /* This user continued to use the product and showed his friends. */
                var outEdges = sys.getEdgesFrom(activeUser.name),
                    inEdges = sys.getEdgesTo(activeUser.name);

                for (var e=0; e < outEdges.length; e++) {
                    var edge = outEdges[e];
                    if (tellUser(edge.source, edge.target)) {
                        activateUser(edge.target);
                    }
                }
                
                for (var e=0; e < inEdges.length; e++) {
                    var edge = inEdges[e];
                    if (tellUser(edge.target, edge.source)) {
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

    function clear() {
        stop();
        users = {};
        activeUsers = {};
        pastUsers = {};
        config = {};
        tickCounter = 0;
        $('#tick-counter').text(tickCounter);
        sys.eachNode(function(node) {
            sys.pruneNode(node);
        });
        setupNetwork();
        return false;
    }

    function setupRanges() {
        $('span.range-display').each(function() {
            var $d = $(this),
                $range = $('#' + $(this).data('for'));

            $range.change(function() {
                if($d.data('percent')) {
                    $d.text(parseInt($range.val()*100) + "%");
                } else {
                    $d.text($range.val());
                }
            });
            $range.trigger('change');
        });
    }
    
    function init() {
        sys = arbor.ParticleSystem(2600, 512, 0.5);
        sys.renderer = Renderer(canvas);
        setupRanges();
        setupNetwork();

        $('#play').click(start);
        $('#stop').click(stop);
        $('#setup').click(clear);
    }
    
    return {
        "init": init
    };
}(this.jQuery));

$(document).ready(function() {
    virality.init();
});





