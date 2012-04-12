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
    return Math.floor((min-1)+(Math.random()*(max-(min-1))))+1;
}

/**
 * Create a dumb normal distribution using averaging.
 * Credit: http://www.protonfish.com/random.shtml
 **/
function standardNormalDist() {
	return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
}

function normalDist(mean, stdev) {
    return standardNormalDist()*stdev+mean;
}

// testBell = {}
// for (var k=0; k < 50000; k++) {
//     r = Math.round(normalDist(10,3));
//     if (r in testBell) {
//         testBell[r]++;
//     } else {
//         testBell[r] = 1;
//     }
// }

function clamp(min, max, val) {
    return Math.max(Math.min(max, val), min);
}

window.virality = (function($) {
    var users = {},
        pastUsers = {},
        activeUsers = {},
        cliques = {},
        config = {},
        sys,
        canvas = $('#social-graph'),
        tickCounter = 0,
        tickInterval,
        edgeInterval;

    function getConfig(configVar) {
        var configVal = $('#' + configVar).val();

        if (!isNaN(parseFloat(configVal)) && isFinite(configVal)) {
            return parseFloat(configVal);
        } else {
            return configVal;
        }
    }

    function addClique(cliqueId) {
        if (cliqueId in cliques) {
            return cliques[cliqueId];
        } else {
            cliques[cliqueId] = [];
        }
    }

    function addUserToClique(userId, cliqueId) {
        if (cliques[cliqueId].indexOf(userId) != -1) {
            return true;
        } else {
            cliques[cliqueId].push(userId);
        }
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

        /**
         * This user has already seen the concept.
        **/
        if (pastUsers.hasOwnProperty(targetUser.name)) {
            return false;
        }

        /**
         * Did the source user's pitch convince the new user? Does the new
         * user see value in the product?
        **/
        if (interested < getConfig('userValue')) {
            return true;
        }
        
        return false;
    }

    function setupNetwork() {
        /* Create the nodes */
        var topology = getConfig('topology');

        if (topology == "clique") {
            setupCliqueNetwork();
        } else {
            setupPowerLawNetwork();
        }

        return false;
    }

    function setupCliqueNetwork() {
        /**
         * Setup a clique-style network. This is useful for word-of-mouth
         * style networks, where people will tell their friends but not
         * necessarily the whole world (via twitter or the like).
         * Connections are small and tight.
        **/
        var numCliques = Math.round(getConfig('population') / 12);
        for(var cliqueId=0; cliqueId < numCliques; cliqueId++) {
            addClique(cliqueId);
        }

        for(var userId=0; userId < getConfig('population'); userId++) {
            addUser(userId);
            var numUserCliques = Math.round(normalDist(getConfig('connection-factor'),0.5));
            for (var i=0; i < numUserCliques; i++) {
                var cliqueId = randRange(0, numCliques-1);
                addUserToClique(userId, cliqueId);
            }
        }

        for(var cliqueId=0; cliqueId < numCliques; cliqueId++) {
            var clique = cliques[cliqueId];
            
            for (var i=0; i < clique.length; i++) {
                var fromUserId = clique[i];
                
                for (var k=i; k < clique.length; k++) {
                    var toUserId = clique[k];

                    if (Math.random() > 0.85) {
                        sys.addEdge(fromUserId, toUserId);                        
                    }
                }
            }
        }
    }

    function setupPowerLawNetwork() {
        /**
         * Setup a power-law style network. This is useful for twitter or
         * facebook style networks, where people will tell everyone they know
         * via their social network. Connections are big and loose.
        **/
        for(var userId=0; userId < getConfig('population'); userId++) {
            addUser(userId);
        }
        
        /**
         * Add the edges. Use a timeout because it seems to make a cleaner
         * graph when it has a moment to recombobulate.
        **/
        userId = 0;
        edgeInterval = window.setInterval(function() {
            if (userId >= getConfig('population')) {
                window.clearInterval(edgeInterval);
                return;
            }

            curUser = users[userId];
            numEdges = Math.round(powerlaw(1, getConfig('connection-factor')*3, 2));
            for(var edge=0; edge < numEdges; edge++) {
                sys.addEdge(curUser, randomUser());
            }

            userId++;
        }, 25);
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
        window.clearInterval(edgeInterval);
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
                /* User lost interest in the product and stopped using it. */
                console.log("User " + activeUserId + " lost interest.");
                deactivateUser(activeUser);
                continue;
            }

            if (Math.random() <= getConfig('virality')) {
                /* User decided to tell their friends about the product. */
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
        cliques = {};
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
        sys = arbor.ParticleSystem(2600, 100, 0.5);
        sys.renderer = Renderer(canvas);
        setupRanges();
        setupNetwork();

        $('#concept-config input').change(function() {
            var understandability, userValue, stickiness, satisfaction, complexity;

            // If an app is "sufficiently well designed" to overcome its
            // complexity, the understandability is 1. Otherwise,
            // it degrades.
            understandability = clamp(0,1,getConfig('designQuality')/getConfig('complexity'));

            // First, determine the average satisfaction - mean of usefulness/enjoyment
            userValue = (getConfig('coreUsefulness')+getConfig('enjoyment'))/2

            // Then, penalize for any lack of understandability
            userValue -= (1-understandability)

            // Then, penalize a bit for too aggressive sharing, which is
            // annoying. This is definitely my editorializing and is a 
            // judgment call.
            userValue -= (getConfig('shareAggressiveness')/6);

            // Is this app satisfyingly complex to use? Too-simple
            // apps are not satisfying, and too-complicated apps are not
            // satisfying. This plays a big role in stickiness.
            satisfaction = (Math.sin(Math.PI*getConfig('complexity')*1.25))*0.8 + ((getConfig('enjoyment')+getConfig('designQuality'))/8);
            
            // Add a modifier for decently complex systems. If they aren't
            // complex, they don't provide much value. If they're too complex,
            // they don't provide much value. If they're just the right amount
            // of complex, they can be valuable.
            // To visualize, in Grapher: y=|_frac_{{sin({π*({x})*1.25})};{3}}
            userValue += satisfaction / 3;
            userValue = clamp(0,1, userValue)

            // Something can be high value but not sticky, like a youtube
            // video.
            stickiness = clamp(0, 1, (satisfaction+userValue+getConfig('coreUsefulness'))/3);


            virality = clamp(0, 1, ((userValue+getConfig('shareAggressiveness')*2)/3)*getConfig('marketSize'));

            $('#understandability').val(understandability);
            $('#userValue').val(userValue);
            $('#stickiness').val(stickiness);
            $('#virality').val(virality);
            $('#satisfaction').val(satisfaction);

            // Trigger the change event so that the percentile displays change.
            $('#calculations input').trigger('change');
        });
        $('.config input').trigger('change');

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





