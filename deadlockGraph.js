function deadlockGraph(xmlString) {
    var self = this;
    var doc = $($.parseXML(xmlString));

    self.processes = {}
    self.processCount = 0;
    doc.find('process').each(function () {
        var id = this.getAttribute('id')
        processes[id] = {
            id: id,
            waitresource: this.getAttribute('waitresource'),
            spid: this.getAttribute('spid'),
            //inputbuf: this.getElementsByTagName('inputbuf').textContent.trim()
            name: id,
            type: "process"
        };
        processCount++;
    });
    var victims = doc.find('victim');

    self.resources = $.map(doc.find('resource-list').children(), function (val) {
        var res = val;
        return {
            id: res.getAttribute('id'),
            name: res.getAttribute('id'),
            type: "resource",
            owners: $.map($(res).find('owner'), function (val, i) {
                return {
                    id: val.getAttribute('id'),
                    mode: val.getAttribute('mode'),
                    process: processes[val.getAttribute('id')]
                }
            }),
            waiters: $.map($(res).find('waiter'), function (val, i) {
                return {
                    id: val.getAttribute('id'),
                    mode: val.getAttribute('mode'),
                    requestType: val.getAttribute('requestType'),
                    process: processes[val.getAttribute('id')]
                }
            }),
            resourceType: res.tagName
        };
    });

    self.nodes = [];
    $.map(self.processes, function (value, key) { self.nodes.push(value); });
    $.map(self.resources, function (value, i) { self.nodes.push(value); });

    self.links = []
    $.map(self.resources, function (value, i) {
        var res = value;
        
        $.map(res.owners, function (owner, i) {
            links.push({
                source: owner.process,
                target: res,
                value: 1
            });
        });

        $.map(res.waiters, function (waiter, i) {
            links.push({
                source: waiter.process,
                target: res,
                value: 1
            });
        });
    });

    var width = 1200;
    var height = 1000;
    var processRadius = 300;
    
    var color = d3.scale.category20();
        
    var svg = d3.select('#deadrock').append('svg')
        .attr("width", width)
        .attr("height", height);

    var processNodes = svg.selectAll(".node")
        .data(self.nodes)
        .enter()
        .append("g")
        .filter(function(d, i){
            return d.type =="process";
        })                
        .attr("class", function (x) {
            return "node " + x.type;
        })
        .attr('transform', function(d, i) {
            d.x = processRadius * Math.cos((180+(360*i/self.processCount))*Math.PI/180) + width/2;
            d.y = processRadius * Math.sin((180+(360*i/self.processCount))*Math.PI/180) + height/2;
           return "translate(" + d.x + "," + d.y + ")";
        });        

    processNodes
        .append("circle")
        .attr("r", 40)
        .style("fill", 'white')
        .style("stroke-width", 2)
        .style("stroke", "black");


    processNodes
        .append("text")
        .text(function (d, i) { return d.name; });


    var resourceNodes = svg.selectAll(".node")
        .data(self.nodes)
        .enter()
        .append("g")
        .filter(function(d, i){
            return d.type =="resource";
        })                
        .attr("class", function (x) {
            return "node " + x.type;
        })
        .attr('transform', function(d, i) {
            d.x = width / 2 - 20;
            d.y = 400 + 60 * i;
           return "translate(" + d.x + "," + d.y + ")";
        });      

    resourceNodes
        .append("rect")
        .attr("width", 40)
        .attr("height", 40)
        .style("fill", 'white')
        .style("stroke-width", 2)
        .style("stroke", "black")

    resourceNodes
        .append("text")
        .text(function (d, i) { return d.name; });


    var link = svg.selectAll(".link")
        .data(self.links)
        .enter()
        .append("line")
        .attr("x1", function(x,i){
            return x.source.x;
        })
        .attr("y1", function(x,i){
            return x.source.y;
        })
        .attr("x2", function(x,i){
            return x.target.x + 20;
        })
        .attr("y2", function(x,i){
            return x.target.y + 20;
        })
        .attr("class", "link")
        .style("stroke-width", 1 );        

    return self;
};


