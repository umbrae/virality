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
            node = sys.addNode(userId);
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
        addUser('1');
        window.setTimeout(function() {
            tickInterval = window.setInterval(tick, 500);
        }, 500);
    }

    function tick() {
        console.log("tick")
        sys.renderer.redraw();
        for (var userId in newUsers) {
            if (newUsers.hasOwnProperty(userId)) {
                addRandomConnections(newUsers[userId]);
                delete newUsers[userId];
            }
        }
        if (Object.keys(users).length > NUM_USERS) {
            console.log("Stopping");
            window.clearInterval(tickInterval);
            return;
        }
    }
    
    function init() {
        var DeadSimpleRenderer = function(canvas){
          var canvas = $(canvas).get(0)
          var ctx = canvas.getContext("2d");
          var particleSystem = null

          var that = {
            //
            // the particle system will call the init function once, right before the
            // first frame is to be drawn. it's a good place to set up the canvas and
            // to pass the canvas size to the particle system
            //
            init:function(system){
              console.log("Init called");
              // save a reference to the particle system for use in the .redraw() loop
              particleSystem = system

              // inform the system of the screen dimensions so it can map coords for us.
              // if the canvas is ever resized, screenSize should be called again with
              // the new dimensions
              particleSystem.screenSize(canvas.width, canvas.height) 
              particleSystem.screenPadding(0) // leave an extra 80px of whitespace per side
            },

            // 
            // redraw will be called repeatedly during the run whenever the node positions
            // change. the new positions for the nodes can be accessed by looking at the
            // .p attribute of a given node. however the p.x & p.y values are in the coordinates
            // of the particle system rather than the screen. you can either map them to
            // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
            // which allow you to step through the actual node objects but also pass an
            // x,y point in the screen's coordinate system
            // 

            redraw:function(){
              ctx.clearRect(0,0, canvas.width, canvas.height)

              particleSystem.eachEdge(function(edge, pt1, pt2){
                // edge: {source:Node, target:Node, length:#, data:{}}
                // pt1:  {x:#, y:#}  source position in screen coords
                // pt2:  {x:#, y:#}  target position in screen coords

                // draw a line from pt1 to pt2
                ctx.strokeStyle = "rgba(0,0,0, .3)"
                ctx.lineWidth = 1 + 4*edge.data.weight
                ctx.beginPath()
                ctx.moveTo(pt1.x, pt1.y)
                ctx.lineTo(pt2.x, pt2.y)
                ctx.stroke()
              })

              particleSystem.eachNode(function(node, pt){
                // node: {mass:#, p:{x,y}, name:"", data:{}}
                // pt:   {x:#, y:#}  node position in screen coords

                // draw a circle centered at pt
                var w = 4
                ctx.beginPath(); 
                ctx.fillStyle = "black"
                ctx.arc(pt.x, pt.y, w, 0, Math.PI*2, true);
                ctx.closePath();
                ctx.fill();
              })
            }
          }
          return that
        }

        sys = arbor.ParticleSystem(1000, 400, 1);
        sys.renderer = DeadSimpleRenderer(canvas);
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





