var width = $(window).width(),
    height = width * 1.1,
    // height = $(window).height(),
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

  var jsoncommunities = "http://camstark.github.io/calgis/CALGIS_ADM_COMMUNITY_DISTRICT/CALGIS_ADM_COMMUNITY_DISTRICT.json"
  var jsonwards = "http://camstark.github.io/calgis/CALGIS_ADM_WARD/CALGIS_ADM_WARD.json"

d3.queue()
    .defer(d3.json, jsoncommunities)
    .defer(d3.json, jsonwards)
    .await(ready)

function ready(error, communities, wards) {
// d3.json(jsoncommunities, function(error, calgary) {
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

  var c = g.append("g").classed("community", true)

  c.selectAll("path")
    .data(communityPolygons.features)
  .enter().append("path")
    .attr("class", "community feature")
    .attr("d", path)
    .on("click", clicked)

  c.append("path")
      .datum(communityBoundaries)
      .attr("class", "community mesh")
      .attr("d", path)

  var w = g.append("g").classed("ward", true)

  w.selectAll("path")
      .data(wardPolygons.features)
    .enter().append("path")
      .attr("class", "ward feature")
      .attr("d", path)
      .on("click", clicked)

  w.append("path")
      .datum(wardBoundaries)
      .attr("class", "ward mesh")
      .attr("d", path)

}

function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
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
}
function reset() {
  active.classed("active", false);
  active = d3.select(null);
  g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "");
}
