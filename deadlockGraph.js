function deadlockGraph(xmlString) {
    var self = this;
    var doc = $($.parseXML(xmlString));

    self.processes = {}
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
    var height = 1500;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-200)
        .linkDistance(200)
        .size([width, height]);
        
    var svg = d3.select('#deadrock').append('svg')
        .attr("width", width)
        .attr("height", height);

    force
        .nodes(self.nodes)
        .links(self.links)
        .start();


    var link = svg.selectAll(".link")
        .data(self.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", 1 );

    var node = svg.selectAll(".node")
        .data(self.nodes)
        .enter()
        .append("g")
        .attr("class", function (x) {
            return "node " + x.type;
        })
        .call(force.drag);

    node.filter('.resource')
        .append("rect")
        .attr("width", 40)
        .attr("height", 40)
        .style("fill", 'white')
        .style("stroke-width", 2)
        .style("stroke", "black");

    node.filter('.process')
        .append("circle")
        .attr("r", 40)
        .style("fill", 'white')
        .style("stroke-width", 2)
        .style("stroke", "black");


    node.append("text")
        .text(function (d) { return d.name; });

    self.tick = function () {
        link.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    };

    force.on("tick", tick);

    return self;
};


