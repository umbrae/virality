var NUM_USERS = 30,
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

(function($){


  // $(document).ready(function(){
  // 
  // 
    // /* This isn't going to produce a real power-law graph, but for demonstration purposes hopefully it's close enough. */
    // for(var userId=0; userId < NUM_USERS; userId++) {
    //     sys.addNode('user-' + userId);
    // }
    // window.curUser = 0;
    // window.edgeAdd = window.setInterval(function() {
    //     if (window.curUser > NUM_USERS) {
    //         window.clearInterval(window.edgeAdd);
    //         return;
    //     } else {
    //         window.curUser++;
    //     }
    //     node = sys.getNode('user-' + window.curUser);
    //     numEdges = Math.round(powerlaw(MIN_CONNECTIONS, MAX_CONNECTIONS, 2));
    //     curEdges = sys.getEdgesTo(node);
    //     for(var edge=curEdges.length; edge < numEdges; edge++) {
    //         randomNode = sys.getNode('user-' + randRange(1, NUM_USERS-1));
    //         sys.addEdge(node, randomNode);
    //     }
    // }, 10);

    // for(var userId=0; userId < NUM_USERS; userId++) {
    //     node = sys.getNode('user-' + userId);
    //     numEdges = Math.round(powerlaw(MIN_CONNECTIONS, MAX_CONNECTIONS, 2));
    //     curEdges = sys.getEdgesTo(node);
    //     console.log(curEdges.length);
    //     for(var edge=curEdges.length; edge < numEdges; edge++) {
    //         randomNode = sys.getNode('user-' + randRange(1, NUM_USERS-1));
    //         sys.addEdge(node, randomNode);
    //     }
    // }

    // var animals = sys.addNode('Animals',{'color':'red','shape':'dot','label':'Animals'});
  // 
  // });

})(this.jQuery)


window.virality = (function($) {
    var users = {},
        newUsers = {},
        sys,
        canvas = $('#social-graph'),
        tickInterval;

    function addUser(userId) {
        if (userId in users) {
            return users[userId];
        } else {
            node = sys.addNode(userId, {"shape": "dot", "color": "#9999CC"});
            node.p = arbor.Point(Math.random(), Math.random());
            users[userId] = node;
            newUsers[userId] = node;
            return node
        }
    }

    function addRandomConnections(user) {
        numEdges = Math.round(powerlaw(MIN_CONNECTIONS, MAX_CONNECTIONS, 2));
        for(var edge=0; edge < numEdges; edge++) {
            newUser = addUser(user.name + '-' + edge);
            sys.addEdge(user, newUser);
        }
    }

    function startTick() {
        window.setTimeout(function() {
            tickInterval = window.setInterval(tick, 10);
        }, 0);
    }

    function tick() {
        sys.renderer.redraw();
        if (Object.keys(users).length == 0) {
            addUser('1');
        }
        for (var userId in newUsers) {
            if (newUsers.hasOwnProperty(userId)) {
                addRandomConnections(newUsers[userId]);
                delete newUsers[userId];
            }
        }
        if (Object.keys(users).length > NUM_USERS) {
            console.log("Stopping");
            window.clearInterval(tickInterval);
            sys.stop();
            
            return;
        }
    }
    
    function init() {
        sys = arbor.ParticleSystem(2600, 512, 0.5);
        sys.renderer = Renderer(canvas);
        sys.fps(30);
        startTick();
    }
    
    return {
        "init": init,
        "startTick": startTick
    };
}(this.jQuery));

$(document).ready(function() {
    virality.init();
});





