/*
 * Temporal Structure: NYC Water Consumption, 1979–2024
 * D3 v3-compatible implementation using the bundled local library.
 * It loads the external CSV when served over HTTP and falls back to the
 * embedded copy when a browser blocks file:// CSV requests.
 */

var DATA_PATH = "data/nyc-water-consumption.csv";
var FALLBACK_CSV = `year,population,consumption_mgd,per_capita_gpd
1979,7102100,1512.4,212.95
1980,7071639,1505.9,212.95
1981,7089241,1309.3,184.69
1982,7109105,1382.4,194.45
1983,7181224,1423.8,198.27
1984,7234514,1465.0,202.5
1985,7274054,1325.8,182.26
1986,7319246,1350.7,184.54
1987,7342476,1446.5,197.0
1988,7353719,1483.9,201.79
1989,7344175,1401.7,190.86
1990,7335650,1423.8,194.09
1991,7374501,1469.3,199.24
1992,7428944,1368.6,184.23
1993,7506166,1368.5,182.32
1994,7570458,1357.7,179.34
1995,7633040,1325.7,173.68
1996,7697812,1297.9,168.61
1997,7773443,1205.5,155.08
1998,7858259,1219.5,155.19
1999,7947660,1237.2,155.67
2000,8008278,1240.4,154.89
2001,8024964,1184.0,147.54
2002,8041649,1135.6,141.21
2003,8058335,1093.7,135.72
2004,8075020,1099.5,136.16
2005,8091706,1138.0,140.64
2006,8108391,1069.0,131.84
2007,8125077,1114.0,137.11
2008,8141762,1098.0,134.86
2009,8158448,1007.5,123.49
2010,8175133,1039.0,127.09
2011,8337907,1021.0,122.45
2012,8463961,1009.1,119.23
2013,8565517,1006.1,117.46
2014,8655238,996.0,115.07
2015,8736590,1009.0,115.49
2016,8794592,1002.0,113.93
2017,8815395,990.2,112.33
2018,8826377,1008.0,114.2
2019,8824751,987.4,111.89
2020,8804190,981.0,111.42
2021,8454000,979.0,115.8
2022,8356000,999.0,119.55
2023,8391000,997.0,118.82
2024,8478000,1002.0,118.19`;
var tooltip = d3.select("#tooltip");

var metrics = {
  per_capita_gpd: {
    label: "Per-capita demand",
    unit: "gallons per person per day",
    axis: function(value) { return String(Math.round(value)); },
    value: function(value) { return d3.format(",.2f")(value) + " GPD"; },
    direction: "Lower values indicate less average daily demand per resident."
  },
  consumption_mgd: {
    label: "Total water consumption",
    unit: "million gallons per day",
    axis: d3.format(",.0f"),
    value: function(value) { return d3.format(",.1f")(value) + " MGD"; },
    direction: "This measure describes average demand on the citywide water system."
  },
  population: {
    label: "New York City population",
    unit: "residents",
    axis: d3.format(".2s"),
    value: function(value) { return d3.format(",")(value) + " people"; },
    direction: "Population is included to compare urban growth with resource demand."
  }
};

var dataset = [];
var currentMetric = "per_capita_gpd";
var resizeTimer;
var pct = d3.format("+.1f");

function percentChange(a, b) {
  return ((b - a) / a) * 100;
}

function parseRow(d) {
  return {
    year: +d.year,
    date: new Date(+d.year, 0, 1),
    population: +d.population,
    consumption_mgd: +d.consumption_mgd,
    per_capita_gpd: +d.per_capita_gpd
  };
}

function initializeWithData(data, sourceLabel) {
  dataset = data.filter(function(d) {
    return isFinite(d.year) && isFinite(d.population) &&
      isFinite(d.consumption_mgd) && isFinite(d.per_capita_gpd);
  }).sort(function(a, b) { return d3.ascending(a.year, b.year); });

  if (!dataset.length) {
    showFatalError("No valid temporal records were found.");
    return;
  }

  document.documentElement.setAttribute("data-temporal-source", sourceLabel);
  renderSummary();
  renderAll(false);
  bindControls();
}

function useEmbeddedFallback(error) {
  console.warn("External CSV could not be loaded; using embedded fallback.", error);
  try {
    initializeWithData(d3.csv.parse(FALLBACK_CSV, parseRow), "embedded-csv-fallback");
  } catch (fallbackError) {
    console.error("Unable to initialize temporal data:", fallbackError);
    showFatalError(fallbackError.message || "Unknown data error.");
  }
}

function loadData() {
  try {
    d3.csv(DATA_PATH, parseRow, function(error, data) {
      if (!error && data && data.length) {
        initializeWithData(data, "external-csv");
      } else {
        useEmbeddedFallback(error);
      }
    });
  } catch (error) {
    useEmbeddedFallback(error);
  }
}

function showFatalError(message) {
  d3.selectAll(".chart-frame").html(
    '<div class="error-panel"><strong>Temporal data could not be initialized.</strong><br>' + message + '</div>'
  );
}

function bindControls() {
  d3.selectAll("[data-metric]").on("click", function() {
    currentMetric = this.getAttribute("data-metric");
    d3.selectAll("[data-metric]").classed("active", false);
    d3.select(this).classed("active", true);
    renderMetricChart(true);
    renderChangeChart(true);
  });
}

function renderAll(animate) {
  renderMetricChart(animate);
  renderChangeChart(animate);
  renderIndexChart(animate);
}

function renderSummary() {
  var first = dataset[0];
  var last = dataset[dataset.length - 1];
  var cards = [
    {
      label: "Population",
      value: percentChange(first.population, last.population),
      text: d3.format(",")(first.population) + " → " + d3.format(",")(last.population) + " residents",
      className: "positive"
    },
    {
      label: "Total consumption",
      value: percentChange(first.consumption_mgd, last.consumption_mgd),
      text: d3.format(",.1f")(first.consumption_mgd) + " → " + d3.format(",.1f")(last.consumption_mgd) + " MGD",
      className: "negative"
    },
    {
      label: "Per-capita demand",
      value: percentChange(first.per_capita_gpd, last.per_capita_gpd),
      text: d3.format(",.2f")(first.per_capita_gpd) + " → " + d3.format(",.2f")(last.per_capita_gpd) + " GPD",
      className: "negative"
    }
  ];

  var selection = d3.select("#summary-cards").selectAll("article").data(cards);
  selection.exit().remove();
  selection.enter().append("article");
  selection
    .attr("class", function(d) { return "summary-card " + d.className; })
    .html(function(d) {
      return "<small>" + d.label + "</small><strong>" + pct(d.value) + "%</strong><p>" + d.text + "</p>";
    });
}

function chartSize(selector, minHeight) {
  var node = document.querySelector(selector);
  var measured = node ? node.clientWidth : 900;
  var width = Math.max(320, measured || 900);
  var height = Math.max(minHeight, Math.min(width * 0.56, minHeight + 170));
  return { width: width, height: height };
}

function createChart(selector, minHeight, margins) {
  var size = chartSize(selector, minHeight);
  var root = d3.select(selector);
  root.selectAll("svg").remove();
  var svg = root.append("svg")
    .attr("viewBox", "0 0 " + size.width + " " + size.height)
    .attr("width", size.width)
    .attr("height", size.height);
  var g = svg.append("g")
    .attr("class", "plot")
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");
  return {
    root: root,
    svg: svg,
    g: g,
    width: size.width,
    height: size.height,
    innerWidth: size.width - margins.left - margins.right,
    innerHeight: size.height - margins.top - margins.bottom
  };
}

function closestRecord(records, targetDate) {
  var bisect = d3.bisector(function(d) { return d.date; }).left;
  var index = bisect(records, targetDate, 1);
  if (index >= records.length) return records[records.length - 1];
  var left = records[index - 1];
  var right = records[index];
  return targetDate - left.date > right.date - targetDate ? right : left;
}

function extrema(records, key, wantMax) {
  return records.reduce(function(best, current) {
    if (!best) return current;
    return wantMax
      ? (current[key] > best[key] ? current : best)
      : (current[key] < best[key] ? current : best);
  }, null);
}

function drawAxes(g, x, y, innerWidth, innerHeight, xTicks, yFormatter) {
  var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(xTicks).tickFormat(d3.time.format("%Y"));
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(6).tickFormat(yFormatter);
  var grid = d3.svg.axis().scale(y).orient("left").ticks(6).tickSize(-innerWidth, 0, 0).tickFormat("");

  g.append("g").attr("class", "grid").call(grid);
  g.append("g").attr("class", "axis x-axis")
    .attr("transform", "translate(0," + innerHeight + ")").call(xAxis);
  g.append("g").attr("class", "axis y-axis").call(yAxis);
}

function renderMetricChart(animate) {
  var metric = metrics[currentMetric];
  var c = createChart("#metric-chart", 500, { top: 36, right: 35, bottom: 54, left: 82 });
  var svg = c.svg, g = c.g, innerWidth = c.innerWidth, innerHeight = c.innerHeight;
  var x = d3.time.scale().domain(d3.extent(dataset, function(d) { return d.date; })).range([0, innerWidth]);
  var extent = d3.extent(dataset, function(d) { return d[currentMetric]; });
  var padding = (extent[1] - extent[0]) * 0.12 || extent[1] * 0.05;
  var y = d3.scale.linear().domain([extent[0] - padding, extent[1] + padding]).nice().range([innerHeight, 0]);

  var defs = svg.append("defs");
  var gradient = defs.append("linearGradient").attr("id", "metric-gradient")
    .attr("x1", "0").attr("x2", "0").attr("y1", "0").attr("y2", "1");
  gradient.append("stop").attr("offset", "0%").attr("stop-color", "#819389").attr("stop-opacity", .28);
  gradient.append("stop").attr("offset", "100%").attr("stop-color", "#819389").attr("stop-opacity", 0);

  drawAxes(g, x, y, innerWidth, innerHeight, Math.min(10, Math.floor(innerWidth / 85)), metric.axis);

  var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d[currentMetric]); })
    .interpolate("monotone");
  var area = d3.svg.area()
    .x(function(d) { return x(d.date); })
    .y0(innerHeight)
    .y1(function(d) { return y(d[currentMetric]); })
    .interpolate("monotone");

  g.append("path").datum(dataset).attr("class", "metric-area").attr("d", area);
  var metricLine = g.append("path").datum(dataset).attr("class", "metric-line").attr("d", line);
  if (animate) metricLine.style("opacity", 0).transition().duration(550).ease("cubic-out").style("opacity", 1);

  g.selectAll("circle.metric-dot").data(dataset).enter().append("circle")
    .attr("class", "metric-dot").attr("r", 3.5)
    .attr("cx", function(d) { return x(d.date); })
    .attr("cy", function(d) { return y(d[currentMetric]); });

  var annotations = [
    { record: extrema(dataset, currentMetric, true), note: "series high" },
    { record: extrema(dataset, currentMetric, false), note: "series low" }
  ];
  var ann = g.selectAll("g.annotation").data(annotations).enter().append("g")
    .attr("class", "annotation")
    .attr("transform", function(d) { return "translate(" + x(d.record.date) + "," + y(d.record[currentMetric]) + ")"; });
  ann.append("line").attr("class", "annotation-line")
    .attr("x1", 0).attr("x2", function(d) { return d.record.year > 2010 ? -42 : 42; })
    .attr("y1", 0).attr("y2", -28);
  ann.append("text").attr("class", "annotation-label")
    .attr("x", function(d) { return d.record.year > 2010 ? -46 : 46; })
    .attr("y", -31)
    .attr("text-anchor", function(d) { return d.record.year > 2010 ? "end" : "start"; })
    .text(function(d) { return d.record.year + " · " + d.note; });

  var focus = g.append("g").attr("class", "focus").style("display", "none");
  focus.append("line").attr("class", "focus-line").attr("y1", 0).attr("y2", innerHeight);
  focus.append("circle").attr("class", "focus-dot").attr("r", 6);

  g.append("rect").attr("class", "overlay")
    .attr("width", innerWidth).attr("height", innerHeight).attr("fill", "transparent")
    .style("cursor", "crosshair")
    .on("mouseenter", function() { focus.style("display", null); })
    .on("mouseleave", function() { focus.style("display", "none"); hideTooltip(); })
    .on("mousemove", function() {
      var mx = d3.mouse(this)[0];
      var d = closestRecord(dataset, x.invert(mx));
      var fx = x(d.date), fy = y(d[currentMetric]);
      focus.attr("transform", "translate(" + fx + ",0)");
      focus.select("circle").attr("cy", fy);
      showMetricTooltip(d, metric);
    });

  var first = dataset[0], last = dataset[dataset.length - 1];
  var change = percentChange(first[currentMetric], last[currentMetric]);
  d3.select("#metric-caption").html(
    "<span><strong>" + metric.label + "</strong> · " + metric.unit + "</span>" +
    "<span>" + first.year + " to " + last.year + ": <strong>" + pct(change) + "%</strong>. " + metric.direction + "</span>"
  );
}

function renderChangeChart(animate) {
  var c = createChart("#change-chart", 290, { top: 26, right: 28, bottom: 48, left: 68 });
  var g = c.g, innerWidth = c.innerWidth, innerHeight = c.innerHeight;
  var changeData = dataset.slice(1).map(function(d, i) {
    return { year: d.year, date: d.date, value: percentChange(dataset[i][currentMetric], d[currentMetric]) };
  });
  var years = changeData.map(function(d) { return d.year; });
  var x = d3.scale.ordinal().domain(years).rangeRoundBands([0, innerWidth], .14);
  var maxAbs = d3.max(changeData, function(d) { return Math.abs(d.value); });
  var y = d3.scale.linear().domain([-maxAbs * 1.12, maxAbs * 1.12]).nice().range([innerHeight, 0]);
  var tickYears = changeData.filter(function(d, i) { return i % 5 === 0 || i === changeData.length - 1; }).map(function(d) { return d.year; });
  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickValues(tickYears);
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickFormat(function(d) { return d + "%"; });
  g.append("g").attr("class", "axis x-axis").attr("transform", "translate(0," + innerHeight + ")").call(xAxis);
  g.append("g").attr("class", "axis y-axis").call(yAxis);
  g.append("line").attr("class", "zero-line").attr("x1", 0).attr("x2", innerWidth).attr("y1", y(0)).attr("y2", y(0));

  var bars = g.selectAll("rect.change-bar").data(changeData).enter().append("rect")
    .attr("class", function(d) { return "change-bar " + (d.value >= 0 ? "positive" : "negative"); })
    .attr("x", function(d) { return x(d.year); })
    .attr("width", x.rangeBand())
    .attr("y", y(0)).attr("height", 0)
    .on("mousemove", function(d) { showChangeTooltip(d); })
    .on("mouseleave", hideTooltip);

  var target = animate ? bars.transition().duration(550).ease("cubic-out") : bars;
  target.attr("y", function(d) { return d.value >= 0 ? y(d.value) : y(0); })
    .attr("height", function(d) { return Math.abs(y(d.value) - y(0)); });
}

function renderIndexChart(animate) {
  var c = createChart("#index-chart", 500, { top: 36, right: 38, bottom: 54, left: 72 });
  var g = c.g, innerWidth = c.innerWidth, innerHeight = c.innerHeight;
  var first = dataset[0];
  var indexData = dataset.map(function(d) {
    return {
      year: d.year,
      date: d.date,
      populationIndex: (d.population / first.population) * 100,
      consumptionIndex: (d.consumption_mgd / first.consumption_mgd) * 100,
      perCapitaIndex: (d.per_capita_gpd / first.per_capita_gpd) * 100
    };
  });
  var x = d3.time.scale().domain(d3.extent(dataset, function(d) { return d.date; })).range([0, innerWidth]);
  var allValues = [];
  indexData.forEach(function(d) { allValues.push(d.populationIndex, d.consumptionIndex, d.perCapitaIndex); });
  var y = d3.scale.linear().domain([d3.min(allValues) - 8, d3.max(allValues) + 8]).nice().range([innerHeight, 0]);
  drawAxes(g, x, y, innerWidth, innerHeight, Math.min(10, Math.floor(innerWidth / 85)), function(d) { return String(Math.round(d)); });
  g.append("line").attr("class", "focus-line base-index")
    .attr("x1", 0).attr("x2", innerWidth).attr("y1", y(100)).attr("y2", y(100));
  g.append("text").attr("class", "annotation-label base-label")
    .attr("x", 4).attr("y", y(100) - 7).text("1979 baseline = 100");

  var series = [
    { key: "populationIndex", className: "population", label: "Population" },
    { key: "consumptionIndex", className: "consumption", label: "Total consumption" },
    { key: "perCapitaIndex", className: "percapita", label: "Per capita" }
  ];
  series.forEach(function(seriesItem) {
    var line = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d[seriesItem.key]); })
      .interpolate("monotone");
    var path = g.append("path").datum(indexData)
      .attr("class", "index-line " + seriesItem.className).attr("d", line);
    if (animate) path.style("opacity", 0).transition().duration(550).style("opacity", 1);
  });

  var last = indexData[indexData.length - 1];
  series.forEach(function(seriesItem) {
    g.append("circle").attr("class", "index-dot " + seriesItem.className)
      .attr("r", 5).attr("cx", x(last.date)).attr("cy", y(last[seriesItem.key]));
    g.append("text").attr("class", "annotation-label index-end-label")
      .attr("x", x(last.date) - 8)
      .attr("y", y(last[seriesItem.key]) + (seriesItem.key === "consumptionIndex" ? -10 : seriesItem.key === "perCapitaIndex" ? 14 : -8))
      .attr("text-anchor", "end")
      .text(seriesItem.label + ": " + d3.format(".0f")(last[seriesItem.key]));
  });

  g.append("rect").attr("class", "index-overlay")
    .attr("width", innerWidth).attr("height", innerHeight).attr("fill", "transparent")
    .style("cursor", "crosshair")
    .on("mousemove", function() {
      var d = closestRecord(indexData, x.invert(d3.mouse(this)[0]));
      tooltip.classed("visible", true).attr("aria-hidden", "false")
        .html("<small>" + d.year + " · 1979 = 100</small><strong>" + d3.format(".1f")(d.populationIndex) +
          "</strong><span>Population · " + d3.format(".1f")(d.consumptionIndex) +
          " total · " + d3.format(".1f")(d.perCapitaIndex) + " per capita</span>")
        .style("left", d3.event.clientX + "px").style("top", d3.event.clientY + "px");
    })
    .on("mouseleave", hideTooltip);
}

function showMetricTooltip(d, metric) {
  tooltip.classed("visible", true).attr("aria-hidden", "false")
    .html("<small>" + d.year + "</small><strong>" + metric.value(d[currentMetric]) +
      "</strong><span>" + d3.format(",")(d.population) + " residents · " +
      d3.format(",.1f")(d.consumption_mgd) + " MGD · " + d3.format(",.2f")(d.per_capita_gpd) + " GPD</span>")
    .style("left", d3.event.clientX + "px").style("top", d3.event.clientY + "px");
}

function showChangeTooltip(d) {
  tooltip.classed("visible", true).attr("aria-hidden", "false")
    .html("<small>" + d.year + " · YEAR-OVER-YEAR</small><strong>" + pct(d.value) +
      "%</strong><span>" + metrics[currentMetric].label + "</span>")
    .style("left", d3.event.clientX + "px").style("top", d3.event.clientY + "px");
}

function hideTooltip() {
  tooltip.classed("visible", false).attr("aria-hidden", "true");
}

window.addEventListener("resize", function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    if (dataset.length) renderAll(false);
  }, 180);
});

loadData();
