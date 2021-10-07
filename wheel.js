/*\
$:/plugins/can/colourwheel/wheel.js
type: application/javascript
module-type: widget

A colour wheel to pick a hue

\*/
(function(){

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";
    
    var Widget = require("$:/core/modules/widgets/widget.js").widget;
    
    var CANWidget = function(parseTreeNode,options) {
        this.initialise(parseTreeNode,options);
    };
    
    /*
    Inherit from the base widget class
    */
    CANWidget.prototype = new Widget();

    CANWidget.prototype.getMarkerMode = function() {
        this.imageSource = "nothing";
        this.imageClass = "colourwheel_marker";
        this.imageTooltip = this.getAttribute("tooltip");
        this.imageAlt = this.getAttribute("alt");
    };

    CANWidget.prototype.styleSVG = function(svgid) {
        var masksvg = this.document.getElementById(svgid);
        masksvg.style.fill = "#999999";
        masksvg.style.width = "100%";
        masksvg.style.height = "100%";
    };
    
    /* All the events in here */
    CANWidget.prototype.allTheEvents = function() {
        var self = this;

        var tempSwatchDisplay = function(classname, offset) {
            var elements = self.document.getElementsByClassName(classname);
            for (var ele of elements) {
                ele.style.backgroundColor = getHSLA(self.angle + offset);
            };
        };

        var getAngle = function(ev) {
            self.mousex = ev.clientX - self.offsetx;
            self.mousey = ev.clientY - self.offsety;
            const x = self.mousex;
            const y = self.mousey;
            var angle = Math.round(Math.atan2(y, x) * 180 / Math.PI + 90);
            if (angle < 0) {
                angle += 360;
            }
            self.angle = angle % 360;
            self.markerNode.style.transform = 'rotate(' + self.angle + 'deg)'; 
            
            tempSwatchDisplay("triad1", 0);
            tempSwatchDisplay("triad2", 120);
            tempSwatchDisplay("triad3", 240); 
            /*console.log("angle: "+self.angle);*/
        };
        
        var getHSLA = function(angle) {
            return "hsla("+angle+", 100%, 50%)";
        };

        var writeAngle = function() {
            //self.wiki.setText(self.resultTiddler, self.resultField, undefined, self.angle);
            self.wiki.setText(self.resultTiddler, "hue1", undefined, self.angle);
            self.wiki.setText(self.resultTiddler, "hue2", undefined, self.angle + 120 );
            self.wiki.setText(self.resultTiddler, "hue3", undefined, self.angle + 240 );
        };
        /*
        Listener for grabbing bar. Get relative coords and sizes	
        */
        var grabBar = function(ev) {
            ev.preventDefault();
            self.halfWidth = Math.round(self.containerDiv.offsetWidth/2);
            const rect = ev.currentTarget.getBoundingClientRect();
            self.offsetx = rect.left + self.halfWidth;
            self.offsety = rect.top + self.halfWidth;
            getAngle(ev);
            //console.log("grabbar x: "+self.mousex+", y: "+self.mousey );
            self.containerDiv.addEventListener('mousemove', dragBar, false);
            self.containerDiv.addEventListener('mouseup', releaseBar, false);
            self.containerDiv.addEventListener('mouseleave', releaseBar, false);
        };
        /*
        Keep changing if dragged
        */
        self.containerDiv.addEventListener('mousedown', grabBar, false);
        var dragBar = function(ev) {	
            ev.preventDefault();
            ev.stopPropagation();
            //console.log("dragbar1 x: "+self.mousex+", y: "+self.mousey );
            //console.log("dragbar1 halfwidth: ", self.halfWidth );
            getAngle(ev);
            //writeAngle();
            //console.log("ev.currentTarget"+ev.currentTarget );
            };
            
        var releaseBar = function(ev) {
            ev.preventDefault();
            self.mousex = ev.clientX - self.rectleft - self.halfWidth;
            self.mousey = ev.clientY - self.recttop - self.halfWidth;
            //console.log("releasebar x: "+self.mousex+", y: "+self.mousey );
            getAngle(ev);
            writeAngle();
            /*console.log("x: "+self.mousex+", y: "+self.mousey );*/
            ev.currentTarget.removeEventListener('mousemove', dragBar, false);
            ev.currentTarget.removeEventListener('mouseup', releaseBar, false);
            ev.currentTarget.removeEventListener('mouseleave', releaseBar, false);
        };
        	
    };
    
    /*
    Render this widget into the DOM
    */
    CANWidget.prototype.render = function(parent,nextSibling) {
        var self = this;
        this.parentDomNode = parent;
        // If attributes are to be had from parameters, have to use computeAttributes()
        this.computeAttributes();
        this.execute();
        // Create elements:
        // The marker element that gets an svg from a tiddler:
        this.markerNode = this.document.createElement("div");
        this.markerNode.innerHTML = this.wiki.getTiddlerText(this.markerSVG);
        // The outside container for the wheel widget
        this.containerDiv = this.document.createElement("div");
        // 
        this.maskDiv = this.document.createElement("div");
        var innersvgtext = this.wiki.getTiddlerText(this.circlemaskSVG);
        this.maskDiv.innerHTML = innersvgtext;
        this.containerDiv.className = "colour-wheel";
        this.maskDiv.className = "colourwheel-mask";
        this.markerNode.className = "colourwheel-marker";
        this.containerDiv.style.position = "relative";
        this.containerDiv.style.flex = "0 0 auto";
        this.containerDiv.style.width = this.widgetWidth;
        this.containerDiv.style.height = this.widgetHeight;
        this.containerDiv.style.background = `
        conic-gradient(hsla(0, 100%, 50%, 1.0) 0deg, 
        hsla(60, 100%, 50%, 1.0) 60deg,
        hsla(120, 100%, 50%, 1.0) 120deg,
        hsla(180, 100%, 50%, 1.0) 180deg,
        hsla(240, 100%, 50%, 1.0) 240deg, 
        hsla(300, 100%, 50%, 1.0) 300deg,
        hsla(360, 100%, 50%, 1.0) 360deg)
        `;
        this.maskDiv.style.position = "absolute";
        this.maskDiv.style.width = "100%";
        this.maskDiv.style.height = "100%";
        // Styles for marker
        this.markerNode.style.position = "absolute";
        this.markerNode.style.width = "100%";
        this.markerNode.style.height = "100%";
        // All the events in one function so listeners can be removed when needed
        this.allTheEvents();
        // Make maskDiv a child of containerDiv
        this.containerDiv.appendChild(self.maskDiv);
        this.containerDiv.appendChild(self.markerNode);
        // this.containerDiv.appendChild(self.markerContainer);
        parent.insertBefore(this.containerDiv,nextSibling);
        this.renderChildren(this.maskDiv,null);
        this.renderChildren(this.markerNode,null);
        this.domNodes.push(this.containerDiv);
        this.styleSVG("circlemasksvg");
        var circlemaskpath = this.document.getElementById("circlemaskpath");
        circlemaskpath.style.stroke = "#333333";
        circlemaskpath.style.strokeWidth = "0.1";
        circlemaskpath.style.opacity = "1";
        var markersvg = this.document.getElementById("pointersvg");
        markersvg.style.stroke = "#999999";
        markersvg.style.width = "100%";
        markersvg.style.height = "100%";
    };
            
    /*
    Compute the internal state of the widget
    */
    CANWidget.prototype.execute = function() {
        var self = this;
        // Get our widget attributes
        this.resultField = this.getAttribute("field");
        this.resultTiddler = this.getAttribute("tiddler");
        this.mode = this.getAttribute("markerMode", "triadic");
        this.getMarkerMode();
        this.widgetWidth = "220px";
        this.widgetHeight = "220px";
        this.circlemaskSVG = "simplemask.svg";
        this.markerSVG = "simplepointers.svg";
        // Now initialise all the variables
        this.mousex = 0;
        this.mousey = 0;
        this.halfWidth = 0;
        this.angle = 0;
        this.rectleft = 0; 
        this.recttop = 0;
         // Make child widgets
        this.makeChildWidgets();
    };
    
    /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
    */
    CANWidget.prototype.refresh = function(changedTiddlers) {
        var changedAttributes = this.computeAttributes();
        if(changedAttributes.source || changedAttributes.width || changedAttributes.height || changedAttributes["class"] || changedAttributes.tooltip || changedTiddlers[this.imageSource]) {
            this.refreshSelf();
            return true;
        } else {
            return false;		
        }
    };
    
    exports.colourwheel = CANWidget;
    })();
    