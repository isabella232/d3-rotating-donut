if(typeof APP === 'undefined') {APP = {};}
APP.rotatingDonut = function() {
  'use strict';
  var o,
      events,
      local,
      rotation;

  o = {
    animationDuration: 600,
    iconSize: 0.7,
    thickness: 0.4,
    value: null,
    icon: null,
    color: null,
    key: null,
    sort: null
  };

  events = d3.dispatch('mouseenter', 'mouseleave', 'click');

  local = {
    label: d3.local(),
    animate: d3.local(),
    icons: d3.local(),
    dimensions: d3.local()
  };

  rotation = APP.pieSelectionRotation()
      .key(function(d) {return o.key(d);});

  function donut(group) {
    group.each(function(data) {
      render.call(this, data, group);
    });
  }

  function render(data, group) {
    var context,
        t,
        dim,
        pie,
        arc,
        pieTransition,
        pieIcons,
        segments,
        segmentEnter;

    if (!data) {return;}

    context = d3.select(this);

    if (group instanceof d3.transition) {
      t = d3.transition(group);
    } else {
      t = d3.transition().duration(o.animationDuration);
    }

    dim = getDimensions(context);

    pie = d3.pie()
        .value(o.value)
        .sort(null);

    arc = d3.arc()
        .outerRadius(dim.outerRadius)
        .innerRadius(dim.innerRadius);

    pieTransition = local.animate.get(this) || local.animate.set(this, APP.pieTransition());
    pieIcons = local.icons.get(this) || local.icons.set(this, APP.pieIcons());

    pieIcons
        .container(function() {return context.select('g.group');})
        .iconPath(dataAccess('icon'))
        .imageWidth(dim.outerRadius * o.thickness * o.iconSize)
        .interpolate(pieTransition.interpolate);

    context.selectAll('svg')
        .data([pie(data.sort(o.sort))])
        .call(rotation)
        .enter()
        .append('svg')
        .append('g')
        .attr('class', 'group')
        .append('text')
        .attr('class', 'donut-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle');

    context.selectAll('svg')
        .transition(t)
        .attr('width', dim.width)
        .attr('height', dim.height)
        .selectAll('g.group')
        .attr('transform', 'translate(' + dim.width / 2 + ',' + dim.height / 2 + ')');

    context.select('text.donut-label')
        .text(local.label.get(context.node()));

    segments = context.selectAll('svg')
        .select('g.group')
        .selectAll('path.segment')
        .data(Object, dataAccess('key'));

    segmentEnter = segments.enter()
        .append('path')
        .attr('class', 'segment')
        .attr('fill', dataAccess('color'))
        .on('mouseenter mouseleave click', onPathEvent(context));

    pieTransition
        .arc(arc)
        .sort(o.sort)
        .enteringSegments(segmentEnter)
        .transitioningSegments(segments)
        .offset(rotation.getAngle(context.select('svg')));

    segmentEnter
        .call(pieIcons)
        .transition(t)
        .call(pieTransition.enter)
        .call(pieIcons.tween);

    segments
        .transition(t)
        .call(pieTransition.transition)
        .call(pieIcons.tween);

    segments.exit()
        .transition(t)
        .call(pieTransition.exit)
        .call(pieIcons.exitTween)
        .remove();
  }

  function onPathEvent(context) {
    return function(d) {
      if (d3.event.type === 'click') {
        rotation.selectedSegment(context.select('svg'), d.data);
        context.call(donut);
      }
      events.call(d3.event.type, context.node(), d.data);
    };
  }

  function dataAccess(key) {
    return function(d) {
      return o[key](d.data);
    };
  }

  function getDimensions(context) {
    var thisDimensions = local.dimensions.get(context.node()) || {},
        width = thisDimensions.width || context.node().getBoundingClientRect().width,
        height = thisDimensions.height || context.node().getBoundingClientRect().height,
        outerRadius = Math.min(width, height) / 2,
        innerRadius = outerRadius * (1 - o.thickness);

    return {
      width: width,
      height: height,
      outerRadius: outerRadius,
      innerRadius: innerRadius
    };
  }

  donut.selectedSegment = function(context, d) {
    if (typeof d === 'undefined' ) {return rotation.selectedSegment(context.select('svg'));}
    rotation.selectedSegment(context.select('svg'), d);
    return donut;
  };
  donut.alignmentAngle = function(_) {
    if (typeof _ === 'undefined' ) {return rotation.alignmentAngle();}
    rotation.alignmentAngle(_);
    return donut;
  };

  donut.animationDuration = function(_) {
    if (!arguments.length) {return o.animationDuration;}
    o.animationDuration = _;
    return donut;
  };
  donut.iconSize = function(_) {
    if (!arguments.length) {return o.iconSize;}
    o.iconSize = _;
    return donut;
  };
  donut.thickness = function(_) {
    if (!arguments.length) {return o.thickness;}
    o.thickness = _;
    return donut;
  };
  donut.value = function(_) {
    if (!arguments.length) {return o.value;}
    o.value = _;
    return donut;
  };
  donut.icon = function(_) {
    if (!arguments.length) {return o.icon;}
    o.icon = _;
    return donut;
  };
  donut.color = function(_) {
    if (!arguments.length) {return o.color;}
    o.color = _;
    return donut;
  };
  donut.key = function(_) {
    if (!arguments.length) {return o.key;}
    o.key = _;
    return donut;
  };
  donut.sort = function(_) {
    if (!arguments.length) {return o.sort;}
    o.sort = _;
    return donut;
  };

  donut.dimensions = function(context, _) {
    var returnArray;
    if (typeof _ === 'undefined' ) {
      returnArray = context.nodes()
          .map(function (node) {return local.dimensions.get(node);});
      return context._groups[0] instanceof NodeList ? returnArray : returnArray[0];
    }
    context.each(function() {local.dimensions.set(this, _);});
    return donut;
  };
  donut.label = function(context, _) {
    var returnArray;
    if (typeof _ === 'undefined' ) {
      returnArray = context.nodes()
          .map(function (node) {return local.label.get(node);});
      return context._groups[0] instanceof NodeList ? returnArray : returnArray[0];
    }
    context.each(function() {local.label.set(this, _);});
    return donut;
  };

  donut.on = function(evt, callback) {
    events.on(evt, callback);
    return donut;
  };

  return donut;
};
