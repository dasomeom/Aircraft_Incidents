//We are using d3.js (v3), jquery and topojson (https://github.com/topojson or https://github.com/topojson/topojson)
// TopoJSON is an extension of GeoJSON that encodes topology. Combined with fixed-precision encoding for coordinates, TopoJSON is usually much smaller than GeoJSON.

/*

D3 works with two types of geographic JSON, GeoJSON, and a format called TopoJSON.

GeoJSON vs. TopoJSON
TopoJSON is an extension of GeoJSON that encodes topology. Rather than representing geometries discretely, geometries in TopoJSON files are stitched together from shared line segments called arcs.

*/

$(document).ready(function() {
    // Width and Height of the whole visualization
    var w = 1000;
    var h = 480;

    var margin = { top: 50, right: 0, bottom: 200, left: 40 };

    var width = 1900 - margin.left - margin.right;
    var height = 700 - margin.top - margin.bottom;

    var svg2 = d3.select("#CountryGraph")
        .attr("width", 1900)
        .attr("height", 700)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    var diameter = 500, //max size of the bubbles
        color    = d3.scale.category10(); //color category

    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    var svg3 = d3.select("#Maker")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

    var svg4 = d3.select("#Maker2")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");



    //D3 has some internal functionality that can turn GeoJSON data into screen coordinates based on the projection you set. This is not unlike other libraries such as Leaflet, but the result is much more open-ended, not constrained to shapes on a tiled Mercator map.1 So, yes, D3 supports projections.
    var projection = d3.geo.equirectangular()
    // Create GeoPath function that uses built-in D3 functionality to turn
// lat/lon coordinates into screen coordinates
    var path = d3.geo.path()
        .projection(projection);
    //add the following to create our SVG canvas.
    var svg = d3.select("#map")
        .append('svg')
        .attr('width', w)
        .attr('height', h)
    svg.append('rect')
        .attr('width', w)
        .attr('height', h)
        .attr('fill', 'lightcyan');
    // Append empty placeholder g element to the SVG
    // g will contain geometry elements
    var g = svg.append("g");

    //add a call to d3.json to load the TopoJSON file
    //so it loads into our visualization
    d3.json('https://d3js.org/world-50m.v1.json', function(error, data) {
        //if (error) console.error(error);

        var countries = topojson.feature(data, data.objects.countries).features;

        g.selectAll(".country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("name", function(d) {return d.properties.name;})
            .on('click', function(d) {
                d3.select(this).classed("selected", true)
            })
            .on("mouseover", function(d) {
                d3.select(this).classed("selected", true)
            })
            .on("mouseout", function(d) {
                d3.select(this).classed("selected", false)
            })


        g.append('path')
            .datum(countries)
            .attr('d', path);

        //create the zoom effect

        var zoom = d3.behavior.zoom()
            .on("zoom", function() {
                g.attr("transform", "translate(" +
                    d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
                g.selectAll("path")
                    .attr("d", path.projection(projection));
            });
        svg.call(zoom);




        // Load the data from the json file
        d3.csv('aircraft_incidents.csv', function(error, data) {
            if (error) throw error;
            var map1 = {};
            var map3 = {};
            var map5 = {};
            data.forEach(function(d) {
                if (map1[d.Country] != null) {
                    map1[d.Country] = map1[d.Country] + 1;
                } else {
                    map1[d.Country] = 1;
                }

                if (map3[d.Make] != null) {
                    map3[d.Make] = map3[d.Make] + 1;
                } else {
                    map3[d.Make] = 1;
                }

                if (map5[d.Make] != null) {
                    map5[d.Make] = +map5[d.Make] + Number(d.Total_Fatal_Injuries);
                } else {
                    map5[d.Make] = +d.Total_Fatal_Injuries;
                }
            });
            //by country array
            var map2 = [];
            var aaa = 0;
            for (var key in map1) {
                var c = map1[key];
                map2[aaa] = {Country: key, Count: +c};
                aaa++;
            }
            map2.sort((a,b) => (a.Count > b.Count) ? -1 : ((b.Count > a.Count) ? 1 : 0));


            // number of incidents by make array
            var map4 = [];
            aaa = 0;
            for (var key in map3) {
                var c = map3[key];
                map4[aaa] = {Make: key, Count: +c};
                aaa++;
            }
            map4 = map4.map(function(d, i){ d.value = +d.Count; return d; });
            var nodes1 = bubble.nodes({children:map4}).filter(function(d) { return !d.children; });

            //setup the chart
            var bubbles = svg3.append("g")
                .attr("transform", "translate(0,0)")
                .selectAll(".bubble")
                .data(nodes1)
                .enter();

            //create the bubbles
            bubbles.append("circle")
                .attr("r", function(d){ return d.r; })
                .attr("cx", function(d){ return d.x; })
                .attr("cy", function(d){ return d.y; })
                .style("fill", function(d) { return color(d.value); });

            //format the text for each bubble
            bubbles.append("text")
                .attr("x", function(d){ return d.x; })
                .attr("y", function(d){ return d.y + 5; })
                .attr("text-anchor", "middle")
                .text(function(d, i){ return d.Make; })
                .style({
                    "fill":"white",
                    "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
                    "font-size": "14px"
                });


            // number fo fatal injuries by make array
            var map6 = [];
            aaa = 0;
            for (var key in map5) {
                var c = map5[key];
                map6[aaa] = {Make: key, Injury: +c};
                aaa++;
            }
            map6 = map6.map(function(d, i){ d.value = +d.Injury; return d; });
            var nodes2 = bubble.nodes({children:map6}).filter(function(d) { return !d.children; });

            //setup the chart
            var bubbles2 = svg4.append("g")
                .attr("transform", "translate(0,0)")
                .selectAll(".bubble")
                .data(nodes2)
                .enter();

            //create the bubbles
            bubbles2.append("circle")
                .attr("r", function(d){ return d.r; })
                .attr("cx", function(d){ return d.x; })
                .attr("cy", function(d){ return d.y; })
                .style("fill", function(d) { return color(d.value); });

            //format the text for each bubble
            bubbles2.append("text")
                .attr("x", function(d){ return d.x; })
                .attr("y", function(d){ return d.y + 5; })
                .attr("text-anchor", "middle")
                .text(function(d, i){ return d.Make; })
                .style({
                    "fill":"white",
                    "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
                    "font-size": "13px"
                });




            var max = d3.max(map2, function(d, i) { return d.Count; });

            var y = d3.scale.linear().domain([0,max]).range([height, 0]);

            var x = d3.scale.ordinal()
                .domain(map2.map(function(d, i) { return d.Country; }))
                .rangeRoundBands([0, width], 0.1);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            svg2.append("g")
                .attr("class", "xaxis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("font-size", "12px")
                .style("text-anchor", "end")
                .attr("dx", "-.9em")
                .attr("dy", "-.5em")
                .attr("transform", function(d) {
                    return "rotate(-80)"
                });

            svg2.append("g")
                .attr("class", "yaxis")
                .style("font-size", "12px")
                .call(yAxis);

            // Title
            svg2.append("text")
                .text('Aircraft Incidents by Country')
                .style("font-size", "20px")
                .attr("text-anchor", "middle")
                .attr("class", "graph-title")
                .attr("y", -10)
                .attr("x", width / 2.0);

            // Bars
            var bar = svg2.selectAll(".bar")
                .data(map2)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d, i) { return x(d.Country); })
                .attr("width", x.rangeBand())
                .attr("y", function(d, i) { return y(d.Count); })
                .attr("height", function(d, i) { return height - y(d.Count); });

            svg2.selectAll(".text")
                .data(map2)
                .enter()
                .append("text")
                .style("font-size", "9px")
                .attr("class","label")
                .attr("x", (function(d,i) { return x(d.Country); }  ))
                .attr("y", function(d,i) { return y(d.Count) - 8; })
                .attr("dy", ".75em")
                .text(function(d) { return d.Count; });










            dataset=data.map(function(d) { return [+d.Longitude,+d.Latitude];});
            //var locations = [data.Latitude, data.Longitude];
            //var hue = 0; //create the circles
            // we will pass our data (the TopoJSON) as an argument, then create SVG elements using a classic D3 append. Selecting all paths, the TopoJSON is bound in the data method. From here, we can perform work on each element.


            /**locations.map(function(d) {  // Create an object for holding dataset
                hue += 0.36                // Create property for each circle, give it value from color
                d.color = 'hsl(' + hue + ', 100%, 50%)';
                //d.color = BLACK;
            });
             **/
            // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
            g.selectAll('circle')
                .data(data)
                .enter()
                .append('circle') //show the circles
                .attr('cx', function(d) {return projection([d["Longitude"],d["Latitude"]])[0];})
                .attr('cy', function(d){return projection([d["Longitude"],d["Latitude"]])[1];})
                .attr("r", 2)
                .style('fill', "black")

                //Next, we need to write two pieces of code, one that listens for when the value of the tooltip changes, and one that updates the SVG elements.
                //We are going to use some D3 code to listen for an input change on the tooltip elements

                //Add Event Listeners | mouseover
                .on('mouseover', function(d) {
                    d3.select(this).style('fill', 'black');
                    d3.select('#number').text(d.Accident_Number);
                    d3.select('#date').text(d.Event_Date);
                    d3.select('#location').text(d.Location);
                    d3.select('#country').text(d.Country);
                    d3.select('#injury').text(d.Injury_Severity);
                    d3.select('#carrier').text(d.Air_Carrier);
                    d3.select('#totalFatal').text(d.Total_Fatal_Injuries);
                    d3.select('#totalSerious').text(d.Total_Serious_Injuries);
                    d3.select('#weather').text(d.Weather_Condition);
                    d3.select('#tooltip')
                        .style('left', (d3.event.pageX + 20) + 'px')
                        .style('top', (d3.event.pageY - 80) + 'px')
                        .style('display', 'block')
                        .style('opacity', 0.8)
                })
            //Add Event Listeners | mouseout
            //.on('mouseout', function(d) {
            //       d3.select(this).style('fill', d.color);
            //       d3.select('#tip')
            //           .style('display', 'none');
            //   });




        });
    });
});
