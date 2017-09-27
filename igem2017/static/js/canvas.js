var canvas = $('#canvas');
var canvas_width = canvas.width();
var canvas_height = canvas.height();
// x axis: top->down
// y axis: left->right
// init (0, 0) to (200, 200) of canvas
var canvas_position_x = 200;
var canvas_position_y = 200;

var standard_size = {
  deviceHeight: 100,
  partSize: 75,
  partPadding: 10,
  bonePadding: 10,
  unit: 1
};
function zoom(size, ratio) {
  let new_size = {}
  $.each(size, (key, value) => { new_size[key] = value * ratio; });
  return new_size;
}
var size = zoom(standard_size, 1);
function resizeDesign(ratio) {
  size = zoom(standard_size, ratio);
  redrawDesign();
}

var design;
jsPlumb.ready(function () {
  jsPlumb.setContainer($('#canvas'));
  $.get({
    url: '/get_circuit_test',
    success: function(data) {
      design = JSON.parse(data);
      console.log(design);
      $.each(design.devices, function(index, device) {
        addDevice(device);
      });
      $.each(design.parts, function(index, part) {
        addPart(part, 1, '#canvas');
        jsPlumb.draggable(part.DOM, {
          containment: true
        });
      });
      $.each(design.lines, function(index, link) {
        addLink(link);
      });
      redrawDesign();
    }
  });
});

function addDevice(data) {
  let device =
  $('<div></div>')
    .appendTo('#canvas')
    .addClass('device')
    .attr('deviceID', data.deviceID)
    .on('click', function() {
      if ($(this).hasClass('dragging')) {
        $(this).removeClass('dragging');
        return;
      }
      if ($(this).data('selected')) {
        unHighlightDevice($(this));
      } else {
        unHighlightDevice($('.device'));
        highlightDevice($(this));
      }
    });
  jsPlumb.draggable(device, {
    containment: true,
    drag: function() {
      device.addClass('dragging');
    }
  });
  let bone =
  $('<div></div>')
    .appendTo(device)
    .addClass('bone')
  let index = 0;
  $.each(data.parts, function(_, part) {
    addPart(part, index, device);
    index++;
  });
  data.DOM = device;
}

function addPart(data, index, device) {
  let part =
  $('<div></div>')
    .appendTo(device)
    .addClass('part')
    .attr('partID', data.ID)
    .append('<div class="ui centered fluid image"><img src="/static/img/design/' + data.Type + '.png"></img></div>')
    .append('<p>' + data.Name + '</p>');
  if (size.unit < 0.75)
    part.children('p').hide();
  data.DOM = part;
}

function addLink(data) {
  jsPlumb.connect({
    source: $('[partID=' + data.source + ']')[0],
    target: $('[partID=' + data.target + ']')[0],
    anchor: ['TopCenter', 'BottomCenter'],
    endpoint: 'Blank',
    connector: 'Flowchart'
  });
}

$('#canvas')
  .on('mousewheel', function(event) {
    if (!event.altKey)
      return;
    let ratio = size.unit;
    ratio = Math.max(0.25, Math.min(1.5, ratio + event.deltaY * 0.05));
    $('#ratio-dropdown')
      .dropdown('set value', ratio)
      .dropdown('set text', Math.round(ratio * 100) + '%');
    resizeDesign(ratio);
  });

function redrawDesign() {
  $.each(design.devices, function(index, device) {
    device.DOM
      .css({
        top: device.X * size.unit,
        left: device.Y * size.unit,
        height: size.partSize + size.partPadding * 3 + 3,
        width: Object.keys(device.parts).length * (size.partSize + size.partPadding) + size.partPadding
      })
      .children('.bone')
      .css({
        left: size.partPadding,
        width: device.DOM.width() - 2 * size.partPadding,
        bottom: size.partPadding
      });
    let count = 0;
    $.each(device.parts, function(index, part) {
      part.DOM
        .css({
          width: size.partSize,
          height: size.partSize,
          left: count * (size.partSize + size.partPadding) + size.partPadding
        });
      count++;
    });
  });
  $.each(design.parts, function(index, part) {
    part.DOM
      .css({
        width: size.partSize,
        height: size.partSize
      });
  });
  $('.part>p').css({
    fontSize: size.unit + 'em'
  });
  if (size.unit + 1e-3 < 0.5) // floating point error
    $('.part>p').hide();
  else
    $('.part>p').show();
  jsPlumb.repaintEverything();
  jsPlumb.revalidate($('.device'));
}

function exportDesign() {
  return {
    parts: $.map(parts, (value, index) => [value]),
    lines: lines
  };
}

function highlightDevice(circuit) {
  circuit
    .data('selected', true)
    .css({
      boxShadow: '0 0 5px 3px rgba(127, 127, 127, 0.2)'
    });
}
function unHighlightDevice(circuit) {
  circuit
    .data('selected', false)
    .css({
      boxShadow: ''
    });
}