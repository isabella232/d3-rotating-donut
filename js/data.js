if(typeof APP === 'undefined') {APP = {};}
APP.generateData = function(splice) {
  'use strict';
  var colors = d3.scaleOrdinal(d3.schemeCategory10),
      arr = [],
      i;

  for (i = 1; i <= 5; i++) {
    arr.push({
      id: i,
      value: 5 + Math.random() * 15,
      color: colors(i)
    });
  }
  if (splice) {
    arr.sort(function() {return 0.5 - Math.random();})
        .splice(0, Math.random() * 5);
  }
  return arr;
};