var width = $(window).width(),
    height = width * 1.1,
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

var jsonpath = "http://github.com/camstark/calgis/blob/master/CALGIS_ADM_COMMUNITY_DISTRICT/CALGIS_ADM_COMMUNITY_DISTRICT.json"
//var jsonpath = "../../../CALGIS/CALGIS_ADM_COMMUNITY_DISTRICT/CALGIS_ADM_COMMUNITY_DISTRICT.json"

d3.json(jsonpath, function(error, calgary) {
  if (error) return console.error(error);

  var communities = topojson.feature(calgary, calgary.objects.CALGIS_ADM_COMMUNITY_DISTRICT)
  var communityBoundaries = topojson.mesh(calgary, calgary.objects.CALGIS_ADM_COMMUNITY_DISTRICT, function(a, b) { return a !== b; })

  projection
    .scale(1)
    .translate([0,0])

  var b = path.bounds(communities),
    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  projection
    .scale(s)
    .translate(t)

  g.selectAll("path")
      .data(communities.features)
    .enter().append("path")
      .attr("class", "feature")
      .attr("d", path)
      .on("click", clicked)

  g.append("path")
      .datum(communityBoundaries)
      .attr("class", "mesh")
      .attr("d", path)
})

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
