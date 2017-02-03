var width = $(window).width(),
    // height = width * 1.1,
    height = $(window).height(),
    active = d3.select(null);

  projection = d3.geo.mercator();
  path = d3.geo.path().projection(projection)

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .on("click", reset);

  var g = svg.append("g")
      .style("stroke-width", "1.5px");

  var w,c,wb,cb

  var jsoncommunities = "http://camstark.github.io/calgis/CALGIS_ADM_COMMUNITY_DISTRICT/CALGIS_ADM_COMMUNITY_DISTRICT.json"
  var jsonwards = "http://camstark.github.io/calgis/CALGIS_ADM_WARD/CALGIS_ADM_WARD.json"

d3.queue()
    .defer(d3.json, jsoncommunities)
    .defer(d3.json, jsonwards)
    .await(ready)

function ready(error, communities, wards) {
  if (error) return console.error(error);

  var communityPolygons = topojson.feature(communities, communities.objects.CALGIS_ADM_COMMUNITY_DISTRICT)
  var communityBoundaries = topojson.mesh(communities, communities.objects.CALGIS_ADM_COMMUNITY_DISTRICT, function(a, b) { return a !== b; })

  var wardPolygons = topojson.feature(wards, wards.objects.CALGIS_ADM_WARD)
  var wardBoundaries = topojson.mesh(wards, wards.objects.CALGIS_ADM_WARD, function(a, b) { return a !== b; })

  projection
    .scale(1)
    .translate([0,0])

  var b = path.bounds(communityPolygons),
    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  projection
    .scale(s)
    .translate(t)

var colours = d3.scale.category10();
var colours = d3.scale.ordinal()
                  .domain([ "PARKS","EMPLOYMENT", "CENTRE CITY", "INNER CITY", "1950s", "1960s/1970s", "1980s/1990s", "2000s", "BUILDING OUT", "UNDEVELOPED", "OTHER"
])
.range(["#e5f5e0","#fdd49e","#67000d","#a50f15","#cb181d","#ef3b2c","#fb6a4a","#fc9272","#fcbba1","#fee0d2","#fff5f0","#fff"])

  c = g.append("g").classed("community", true)
  cb = g.append("g").classed("communityBoundary", true)




  c.selectAll("path")
    .data(communityPolygons.features)
  .enter().append("path")
    .attr("class", "community feature")
    // .style("fill", function(d) {console.log(d.properties["SRG"]) })
    .style("fill", function(d) {return colours(d.properties["COMM_STRUC"]) })
    .attr("d", path)
    .on("click", reset)

  cb.append("path")
      .datum(communityBoundaries)
      .attr("class", "community mesh")
      .attr("d", path)

  w = g.append("g").classed("ward", true)
  wb = g.append("g").classed("wardBoundary", true)

  w.selectAll("path")
      .data(wardPolygons.features)
    .enter().append("path")
      .attr("class", "ward feature")
      .attr("d", path)
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("click", clicked)

  wb.append("path")
      .datum(wardBoundaries)
      .attr("class", "ward mesh")
      .attr("d", path)

}
var chosenWard, chosenCommunity
function mouseover(d) {
  w.selectAll("path").classed("deemph", true)
  chosenWard = d3.select(this);
  chosenWard.classed("hover", true)
  $("#explainer").text("Oh, it's " + d.properties["LABEL"] + " (" + d.properties["ALDERMAN"] + ")")
}
function mouseout() {
  w.selectAll("path").classed("hover deemph", false)
  $("#explainer").text("Oh, we're done?")
}
function mouseoverCommunity(d) {
  c.selectAll("path").classed("deemph", true)
  chosenCommunity = d3.select(this);
  chosenCommunity.classed("hover", true)
  // chosenCommunity.classed("deemph", true)
  $("#explainer").text("Oh, it's " + d.properties["NAME"] + " (" + d.properties["COMM_STRUC"] + ")")
}
function mouseoutCommunity() {
  chosenCommunity.classed("hover", false)
  c.selectAll("path").classed("deemph", false)
  $("#explainer").text("Oh, we're done?")
}
function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active hover", false);
  // active.classed("hover", false);
  active = d3.select(this).classed("active", true);
  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];
  g.transition()
      .duration(750)
      .style("stroke-width", 1.5 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
  w.selectAll("path").on("mouseover", null).on("mouseout", null);
  c.selectAll("path").on("mouseover", mouseoverCommunity).on("mouseout", mouseoutCommunity);
  cb.selectAll("path").classed("visible", true)
}
function reset() {
  active.classed("active", false);
  active = d3.select(null);
  g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "");

  c.selectAll("path").classed("hover deemph", false);
  w.selectAll("path").classed("hover deemph", false).on("mouseover", mouseover).on("mouseout", mouseout)
  cb.selectAll("path").classed("visible", false)
}
