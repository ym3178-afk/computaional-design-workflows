(function () {
  var width = 1180;
  var height = 780;

  var relationshipMeta = {
    control: { label: "Control", color: "#9f796c", curve: -20 },
    data: { label: "Data", color: "#82968c", curve: 20 },
    exchange: { label: "Exchange", color: "#98a9a1", curve: -12 },
    governance: { label: "Governance", color: "#aea28f", curve: 14 },
    collective: { label: "Collective", color: "#9d8985", curve: -16 },
    outcome: { label: "Outcome", color: "#a8b0ab", curve: 12 }
  };

  var nodeTypeLabels = {
    platform: "Platform",
    algorithm: "Algorithm",
    data: "Data system",
    worker: "Worker",
    market: "Market actor",
    governance: "Institution",
    collective: "Collective",
    outcome: "Outcome"
  };

  var clusters = {
    "Governance": { x: width * 0.14, y: height * 0.22, label: "GOVERNANCE" },
    "Collective": { x: width * 0.18, y: height * 0.74, label: "COLLECTIVE ACTION" },
    "Labor": { x: width * 0.38, y: height * 0.57, label: "LABOR" },
    "Platform Core": { x: width * 0.55, y: height * 0.40, label: "PLATFORM CORE" },
    "Data Layer": { x: width * 0.72, y: height * 0.20, label: "DATA LAYER" },
    "Market": { x: width * 0.86, y: height * 0.48, label: "MARKET" },
    "Outcomes": { x: width * 0.69, y: height * 0.78, label: "LABOR OUTCOMES" }
  };

  var tooltip = d3.select("#tooltip");
  var network = d3.select("#network");
  var detailPanel = d3.select("#detail-panel");
  var activeRelationships = {};
  var selectedNode = null;
  var labelsVisible = true;

  Object.keys(relationshipMeta).forEach(function (key) {
    activeRelationships[key] = true;
  });

  d3.csv("nodes.csv", function (nodeError, nodeRows) {
    if (nodeError) return showError(nodeError);

    d3.csv("edges.csv", function (edgeError, edgeRows) {
      if (edgeError) return showError(edgeError);

      var nodes = nodeRows.map(function (d) {
        return {
          id: d.id,
          name: d.name,
          role: d.role,
          influence: +d.age,
          department: d.department,
          connectionsHint: +d.friends,
          radius: +d.size,
          color: d.color
        };
      });

      var links = edgeRows.map(function (d, i) {
        return {
          source: d.source,
          target: d.target,
          relationship: d.relationship,
          course: d.course,
          since: d.since ? +d.since : null,
          strength: +d.strength,
          type: d.type,
          department: d.department,
          curve: relationshipMeta[d.relationship].curve + ((i % 3) - 1) * 4
        };
      });

      buildFilters(links);
      buildNodeLegend(nodes);
      drawGraph(nodes, links);
    });
  });

  function showError(error) {
    console.error(error);
    network.html('<div class="error-message">The CSV files could not be loaded.<br>Run this project through a local server or GitHub Pages.</div>');
  }

  function buildFilters(links) {
    var counts = {};
    links.forEach(function (d) {
      counts[d.relationship] = (counts[d.relationship] || 0) + 1;
    });

    var filterData = Object.keys(relationshipMeta).map(function (key) {
      return {
        key: key,
        label: relationshipMeta[key].label,
        color: relationshipMeta[key].color,
        count: counts[key] || 0
      };
    });

    d3.select("#filters")
      .selectAll("button")
      .data(filterData)
      .enter()
      .append("button")
      .attr("type", "button")
      .attr("class", "filter-button")
      .attr("aria-pressed", "true")
      .html(function (d) {
        return '<span class="filter-dot" style="background:' + d.color + ';box-shadow:0 0 9px ' + d.color + '"></span>' +
          '<span>' + d.label + '</span>' +
          '<span class="filter-count">' + (d.count < 10 ? '0' + d.count : d.count) + '</span>';
      })
      .on("click", function (d) {
        activeRelationships[d.key] = !activeRelationships[d.key];
        d3.select(this)
          .classed("inactive", !activeRelationships[d.key])
          .attr("aria-pressed", activeRelationships[d.key] ? "true" : "false");
        dispatchFilterEvent();
      });
  }

  function dispatchFilterEvent() {
    var event;
    try {
      event = new CustomEvent("relationship-filter-change");
    } catch (e) {
      event = document.createEvent("CustomEvent");
      event.initCustomEvent("relationship-filter-change", false, false, {});
    }
    window.dispatchEvent(event);
  }

  function buildNodeLegend(nodes) {
    var seen = {};
    var unique = [];
    nodes.forEach(function (d) {
      if (!seen[d.role]) {
        seen[d.role] = true;
        unique.push({
          role: d.role,
          color: d.color,
          label: nodeTypeLabels[d.role] || d.role
        });
      }
    });

    d3.select("#node-legend")
      .selectAll("div")
      .data(unique)
      .enter()
      .append("div")
      .attr("class", "legend-row")
      .html(function (d) {
        return '<span class="legend-swatch" style="background:' + d.color + ';color:' + d.color + '"></span><span>' + d.label + '</span>';
      });
  }

  function drawGraph(nodes, links) {
    var nodeById = {};
    var departmentCount = {};

    nodes.forEach(function (node) {
      nodeById[node.id] = node;
      var anchor = clusters[node.department] || { x: width / 2, y: height / 2 };
      var index = departmentCount[node.department] || 0;
      departmentCount[node.department] = index + 1;
      var angle = index * 2.24;
      var radius = 22 + index * 16;
      node.x = anchor.x + Math.cos(angle) * radius;
      node.y = anchor.y + Math.sin(angle) * radius;
    });

    links.forEach(function (link) {
      link.source = nodeById[link.source];
      link.target = nodeById[link.target];
    });

    var svg = network.append("svg")
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMidYMid meet");

    var defs = svg.append("defs");
    var glow = defs.append("filter")
      .attr("id", "node-glow")
      .attr("x", "-80%")
      .attr("y", "-80%")
      .attr("width", "260%")
      .attr("height", "260%");
    glow.append("feGaussianBlur").attr("stdDeviation", 5).attr("result", "blur");
    var merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    Object.keys(relationshipMeta).forEach(function (key) {
      var meta = relationshipMeta[key];
      defs.append("marker")
        .attr("id", "arrow-" + key)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 9)
        .attr("refY", 0)
        .attr("markerWidth", 5.5)
        .attr("markerHeight", 5.5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-4L8,0L0,4")
        .attr("fill", meta.color)
        .attr("opacity", 0.9);
    });

    var zoomLayer = svg.append("g");
    var clusterLayer = zoomLayer.append("g").attr("class", "cluster-labels");
    var linkLayer = zoomLayer.append("g").attr("class", "links");
    var nodeLayer = zoomLayer.append("g").attr("class", "nodes");
    var labelLayer = zoomLayer.append("g").attr("class", "labels");

    clusterLayer.selectAll("text")
      .data(Object.keys(clusters).map(function (key) {
        return clusters[key];
      }))
      .enter()
      .append("text")
      .attr("class", "cluster-label")
      .attr("x", function (d) { return d.x; })
      .attr("y", function (d) { return d.y - 82; })
      .attr("text-anchor", "middle")
      .text(function (d) { return d.label; });

    var zoom = d3.behavior.zoom()
      .scaleExtent([0.48, 2.8])
      .on("zoom", function () {
        zoomLayer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      });

    svg.call(zoom).on("dblclick.zoom", null);

    var link = linkLayer.selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", function (d) { return relationshipMeta[d.relationship].color; })
      .attr("stroke-width", function (d) { return 0.8 + d.strength * 2.6; })
      .attr("stroke-opacity", function (d) { return 0.20 + d.strength * 0.34; })
      .attr("stroke-dasharray", function (d) { return d.relationship === "data" ? "5 5" : null; })
      .attr("marker-end", function (d) {
        return d.type === "directed" ? "url(#arrow-" + d.relationship + ")" : null;
      });

    var force = d3.layout.force()
      .nodes(nodes)
      .links(links)
      .size([width, height])
      .linkDistance(function (d) {
        var crossLayer = d.source.department !== d.target.department;
        return (crossLayer ? 190 : 145) + (1 - d.strength) * 70;
      })
      .linkStrength(function (d) { return 0.10 + d.strength * 0.24; })
      .charge(function (d) { return -620 - d.radius * 17; })
      .gravity(0.014)
      .friction(0.86)
      .start();

    var node = nodeLayer.selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(force.drag);

    node.append("circle")
      .attr("class", "node-halo")
      .attr("r", function (d) { return d.radius + 9; })
      .attr("fill", function (d) { return d.color; })
      .attr("opacity", function (d) { return d.id === "Platform" ? 0.14 : 0.055; })
      .attr("filter", function (d) { return d.id === "Platform" ? "url(#node-glow)" : null; });

    node.append("circle")
      .attr("class", "node-core")
      .attr("r", function (d) { return d.radius; })
      .attr("fill", function (d) { return d.color; })
      .attr("fill-opacity", function (d) { return d.id === "Platform" ? 0.98 : 0.84; })
      .attr("stroke", function (d) { return d3.rgb(d.color).brighter(0.9).toString(); })
      .attr("stroke-opacity", 0.78)
      .attr("stroke-width", function (d) { return d.id === "Platform" ? 2.8 : 1.5; });

    node.append("circle")
      .attr("class", "node-center")
      .attr("r", function (d) { return Math.max(3, d.radius * 0.14); })
      .attr("fill", "#fff")
      .attr("opacity", 0.9);

    var labels = labelLayer.selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle");

    labels.each(function (d) {
      var lines = splitLabel(d.name);
      var text = d3.select(this);
      lines.forEach(function (line, i) {
        text.append("tspan")
          .attr("x", 0)
          .attr("dy", i === 0 ? 0 : 12)
          .text(line);
      });
    });

    force.on("tick", function (event) {
      var alpha = event.alpha * 0.15;

      nodes.forEach(function (d) {
        var anchor = clusters[d.department] || { x: width / 2, y: height / 2 };
        d.x += (anchor.x - d.x) * alpha;
        d.y += (anchor.y - d.y) * alpha;
        d.x = Math.max(d.radius + 20, Math.min(width - d.radius - 20, d.x));
        d.y = Math.max(d.radius + 26, Math.min(height - d.radius - 30, d.y));
      });

      collide(nodes, 0.55);

      link.attr("d", function (d) {
        var dx = d.target.x - d.source.x;
        var dy = d.target.y - d.source.y;
        var distance = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / distance;
        var uy = dy / distance;
        var sx = d.source.x + ux * (d.source.radius + 4);
        var sy = d.source.y + uy * (d.source.radius + 4);
        var tx = d.target.x - ux * (d.target.radius + 12);
        var ty = d.target.y - uy * (d.target.radius + 12);
        var mx = (sx + tx) / 2;
        var my = (sy + ty) / 2;
        var normalX = -uy;
        var normalY = ux;
        var curve = Math.min(32, Math.max(-32, d.curve));
        var cx = mx + normalX * curve;
        var cy = my + normalY * curve;
        return "M" + sx + "," + sy + " Q" + cx + "," + cy + " " + tx + "," + ty;
      });

      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

      labels.attr("transform", function (d) {
        return "translate(" + d.x + "," + (d.y + d.radius + 16) + ")";
      });
    });

    node
      .on("mouseover", function (d) {
        highlightNode(d, true);
        tooltip
          .html('<strong>' + d.name + '</strong><span>' + (nodeTypeLabels[d.role] || d.role) + ' · ' + d.department + '<br>Influence score: ' + d.influence + '</span>')
          .classed("visible", true);
        moveTooltip(d3.event);
      })
      .on("mousemove", function () { moveTooltip(d3.event); })
      .on("mouseout", function () {
        tooltip.classed("visible", false);
        restoreState();
      })
      .on("click", function (d) {
        d3.event.stopPropagation();
        selectNode(d);
      });

    svg.on("click", clearSelection);
    window.addEventListener("relationship-filter-change", applyFilters);

    d3.select("#reset-view").on("click", function () {
      zoom.translate([0, 0]).scale(1);
      zoomLayer.transition().duration(650).attr("transform", "translate(0,0)scale(1)");
    });

    d3.select("#release-nodes").on("click", function () {
      nodes.forEach(function (d) { d.fixed = false; });
      force.resume();
    });

    d3.select("#toggle-labels").on("click", function () {
      labelsVisible = !labelsVisible;
      labelLayer.classed("labels-hidden", !labelsVisible);
      d3.select(this).text(labelsVisible ? "Hide labels" : "Show labels");
    });

    window.setTimeout(function () {
      selectNode(nodeById.Algorithm);
    }, 1150);

    function collide(allNodes, strength) {
      var quadtree = d3.geom.quadtree(allNodes);
      allNodes.forEach(function (d) {
        var r = d.radius + 30;
        var nx1 = d.x - r;
        var nx2 = d.x + r;
        var ny1 = d.y - r;
        var ny2 = d.y + r;
        quadtree.visit(function (quad, x1, y1, x2, y2) {
          if (quad.point && quad.point !== d) {
            var x = d.x - quad.point.x;
            var y = d.y - quad.point.y;
            var l = Math.sqrt(x * x + y * y) || 1;
            var minDistance = d.radius + quad.point.radius + 26;
            if (l < minDistance) {
              l = (l - minDistance) / l * strength;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      });
    }

    function applyFilters() {
      link
        .style("display", function (d) { return activeRelationships[d.relationship] ? null : "none"; })
        .attr("marker-end", function (d) {
          return activeRelationships[d.relationship] && d.type === "directed" ? "url(#arrow-" + d.relationship + ")" : null;
        });
      restoreState();
    }

    function visibleNodeMap() {
      var visible = {};
      links.forEach(function (d) {
        if (activeRelationships[d.relationship]) {
          visible[d.source.id] = true;
          visible[d.target.id] = true;
        }
      });
      return visible;
    }

    function highlightNode(focus, temporary) {
      var connected = {};
      connected[focus.id] = true;

      links.forEach(function (d) {
        if (!activeRelationships[d.relationship]) return;
        if (d.source.id === focus.id) connected[d.target.id] = true;
        if (d.target.id === focus.id) connected[d.source.id] = true;
      });

      node
        .classed("is-selected", function (d) { return !temporary && d.id === focus.id; })
        .attr("opacity", function (d) { return connected[d.id] ? 1 : 0.10; });
      labels.attr("opacity", function (d) { return connected[d.id] ? 1 : 0.07; });
      clusterLayer.attr("opacity", 0.22);
      link.attr("stroke-opacity", function (d) {
        var active = activeRelationships[d.relationship];
        var connectedLink = d.source.id === focus.id || d.target.id === focus.id;
        return active && connectedLink ? 0.95 : 0.025;
      });
    }

    function restoreState() {
      if (selectedNode) {
        highlightNode(selectedNode, false);
        return;
      }

      var visible = visibleNodeMap();
      node
        .classed("is-selected", false)
        .attr("opacity", function (d) { return visible[d.id] ? 1 : 0.12; });
      labels.attr("opacity", function (d) { return visible[d.id] ? 1 : 0.12; });
      clusterLayer.attr("opacity", 1);
      link.attr("stroke-opacity", function (d) {
        return activeRelationships[d.relationship] ? 0.20 + d.strength * 0.34 : 0;
      });
    }

    function selectNode(selected) {
      selectedNode = selected;
      var connections = links.filter(function (d) {
        return d.source.id === selected.id || d.target.id === selected.id;
      }).sort(function (a, b) { return b.strength - a.strength; });

      var visibleConnections = connections.slice(0, 9);
      var listHtml = visibleConnections.map(function (connection) {
        var outgoing = connection.source.id === selected.id;
        var other = outgoing ? connection.target : connection.source;
        var meta = relationshipMeta[connection.relationship];
        return '<div class="connection-item">' +
          '<div class="connection-top">' +
          '<span class="connection-line" style="background:' + meta.color + '"></span>' +
          '<strong>' + (outgoing ? '→ ' : '← ') + other.name + '</strong>' +
          '</div>' +
          '<p><span>' + meta.label + '</span> · ' + connection.course + '</p>' +
          '</div>';
      }).join("");

      if (connections.length > visibleConnections.length) {
        listHtml += '<div class="connection-more">+' + (connections.length - visibleConnections.length) + ' additional relationships</div>';
      }

      detailPanel.html(
        '<div class="panel-label">SELECTED NODE</div>' +
        '<div class="detail-content" style="--node-color:' + selected.color + '">' +
        '<div class="detail-type">' + (nodeTypeLabels[selected.role] || selected.role) + '</div>' +
        '<h3>' + selected.name + '</h3>' +
        '<p class="detail-description">' + selected.department + ' actor within the algorithmic management ecosystem.</p>' +
        '<div class="detail-stat">' +
        '<span>Influence</span><strong>' + selected.influence + '/100</strong>' +
        '<span>System layer</span><strong>' + selected.department + '</strong>' +
        '<span>Direct links</span><strong>' + connections.length + '</strong>' +
        '</div>' +
        '<div class="connection-title">DIRECT RELATIONSHIPS</div>' +
        '<div class="connection-list">' + listHtml + '</div>' +
        '</div>'
      );
      highlightNode(selected, false);
    }

    function clearSelection() {
      selectedNode = null;
      detailPanel.html('<div class="panel-label">SELECTED NODE</div><div class="detail-empty"><div class="empty-mark">+</div><p>Select a node to reveal its role and direct relationships.</p></div>');
      restoreState();
    }
  }

  function splitLabel(name) {
    if (name.length <= 15) return [name];
    var words = name.split(" ");
    if (words.length === 1) return [name];
    var first = [];
    var second = [];
    var firstLength = 0;
    var target = Math.ceil(name.length / 2);

    words.forEach(function (word) {
      if (firstLength < target || first.length === 0) {
        first.push(word);
        firstLength += word.length + 1;
      } else {
        second.push(word);
      }
    });

    if (!second.length) return [name];
    return [first.join(" "), second.join(" ")];
  }

  function moveTooltip(event) {
    var x = Math.min(window.innerWidth - 250, event.clientX + 12);
    var y = Math.max(70, Math.min(window.innerHeight - 70, event.clientY));
    tooltip.style("left", x + "px").style("top", y + "px");
  }
})();
