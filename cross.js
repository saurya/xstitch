var blockWidth_ = 5;
var blockHeight_ = 5;
var mouseDown_ = false;
var mouseUp_ = false;
function addColor(e) {
  color = $('#color').val();
  shade = $('<div>').addClass('shade').css('background-color', color);
  shade.color = color;
  $($('#palette').children()[0]).after(shade);
  shade.click(setColorValue);
  $('.selected_color').removeClass('selected_color');
  shade.addClass('selected_color');
}
function setColorValue() {
    shade = $(this);
    $('.selected_color').removeClass('selected_color');
    $('#color').val(shade.css('background-color'));
    shade.addClass('selected_color');
}
function colorBox(e) {
    if (mouseDown_ && !$(this).attr('setthisrun')) {
      var bgColor = $(this).css('background-color');
      var color = $('#color').val();
      var white = 'rgba(0, 0, 0, 0)';
      var fakeElem = $('<div>').css('background-color', color);
      $('body').append(fakeElem);
      var chosenColor = fakeElem.css('background-color');
      $(this).attr('setthisrun', 'true');
      if (bgColor == chosenColor) {
        $(this).css('background-color', '');
      } else {
        $(this).css('background-color', color);
      }
    }
    if (mouseDown_ && mouseUp_) {
          mouseDown_ = false;
	      mouseUp_ = false;
	      $('.block').attr('setthisrun', '');
    }
}
function mouseDown(e) {
  mouseDown_ = true;
}
function mouseUp(e) {
  mouseUp_ = true;
}
function clearGrid(e) {
    $('.block').css('background-color', '');
}
function generateGrid(numBlocksX, numBlocksY, blockWidth, blockHeight) {
    var grid = $('.graph');
    blockWidth_ = blockWidth;
    blockHeight_ = blockHeight;
    numBlocksX_ = numBlocksX;
    numBlocksY_ = numBlocksY;
    grid.html('');
    for (var i = 0; i < numBlocksY; i++) {
        var row = $('<div>').addClass('row');
        grid.append(row);
        for (var j = 0; j < numBlocksX; j++) {
           row.append(getNewBlock(blockWidth, blockHeight));
        }
    }
}
function getNewBlock(blockWidth, blockHeight) {
  var block = $('<div>').addClass('block').click(colorBox).mousedown(mouseDown).mouseup(mouseUp).hover(colorBox);
  block.css('width', blockWidth + 'px');
  block.css('height', blockHeight + 'px');
  return block;
}
function addRow(e, top) {
  var row = $('<div>').addClass('row');
  for (var i = 0; i < numBlocksX_; i++) {
    row.append(getNewBlock(blockWidth_, blockHeight_));
  }
  numBlocksY_++;
  if (top) {
    $('.graph').prepend(row);
  } else {
    $('.graph').append(row);
  }
}
function addColumn(e, left) {
    var rows = $('.row');
    for (var i = 0; i < rows.length; i++) {
      var block = getNewBlock(blockWidth_, blockHeight_);
      if (left) {
        $(rows[i]).prepend(block);
      } else {
        $(rows[i]).append(block);
      }
    }
    numBlocksX_++;
}

function render(e) {
  var numBlocksX = parseInt($('#numBlocksX').val(), 10);
  var numBlocksY = parseInt($('#numBlocksY').val(), 10);
  var blockSize = parseInt($('#blockSize').val(), 10);
  generateGrid(numBlocksX, numBlocksY, blockSize, blockSize);
}
function showOptions(e) {
  $('.options').toggle('slow');
}
function showRenderOptions(e) {
  var backdrop = $('#backdrop');
  backdrop.show();
  $('#exitbutton').show();
  $('.panel').hide();
  $('#renderOptions').show();
}
function showColorOptions(e) {
  var backdrop = $('#backdrop');
  backdrop.show();
  $('#exitbutton').show();
  $('.panel').hide();
  $('#colorOptions').show();
}
function hideBackdrop(e) {
  var backdrop = $('#backdrop');
  backdrop.hide();
}
function toggleAddColumnButton() {
  $('.addcolumnbutton').toggle();
}
function toggleAddRowButton() {
  $('.addrowbutton').toggle();
}
$('#new_shade').click(showColorOptions);
$('#render').click(render);
$('#addcolor').click(addColor);
$('#exitbutton').click(hideBackdrop);
addColor();
$('#clear').click(clearGrid);
$('#showColorOptions').click(showColorOptions);
$('#showRenderOptions').click(showRenderOptions);
$('.panel').hide();
$('.addcolumn').hover(toggleAddColumnButton, toggleAddColumnButton);
$('.addcolumnbutton').click(addColumn);
$('.addrow').hover(toggleAddRowButton, toggleAddRowButton);
$('.addrowbutton').click(addRow);
generateGrid(60, 50, 10, 10);
