var blockWidth_ = 5;
var blockHeight_ = 5;
var setThisRun = [];
var mouseDown_ = false;
var mouseUp_ = false;

var WHITE_COLOR = 'rgba(0, 0, 0, 0)';
var BLOCK_CLASS = 'block';
var GRID_CLASS = 'graph';
var ROW_CLASS = 'row';
var SHADE_CLASS = 'shade';
var SELECTED_COLOR_CLASS = 'selected_color';
var selector = {
GRID_CLASS: '.' + GRID_CLASS,
SHADE_CLASS: '.' + SHADE_CLASS,
SELECTED_COLOR_CLASS: '.' + SELECTED_COLOR_CLASS
};

util = {};

util.getColorValue = function(color) {
    var fakeElem = $('<div>').css('background-color', color);
    $('body').append(fakeElem);
    return fakeElem.css('background-color');
};

var Grid = function(numBlocksX, numBlocksY, blockWidth, blockHeight) {
	var grid = $('.' + GRID_CLASS);
$('#clear').click(this.clearGrid.bind(this));
$('.addcolumnbutton').click(this.addColumn.bind(this));
$('.addrowbutton').click(this.addRow.bind(this));

	this.blockWidth_ = blockWidth;
	this.blockHeight_ = blockHeight;
	this.numBlocksX_ = 1;
	this.numBlocksY_ = 1;
	grid.html('');
        this.rows_ = [];
        var firstBlock = new Box(blockWidth, blockHeight, 0, 0); 
        this.allBlocks_ = [ firstBlock ];
        this.addRow(null, false, numBlocksY - 1);
        this.addColumn(null, false, numBlocksX - 1);
};

Grid.prototype.addRow = function(e, top, opt_numRows) {
  opt_numRows = opt_numRows ? opt_numRows : 1;
  for (var j = 0; j < opt_numRows; j++) {
    var row = new Row(); 
    for (var i = 0; i < this.numBlocksX_; i++) {
      var block = new Box(this.blockWidth_, this.blockHeight_, i, this.numBlocksY_);
      row.append(block);
    }
    this.numBlocksY_++;
    if (top) {
      $('.' + GRID_CLASS).prepend(row.el_);
    } else {
      $('.' + GRID_CLASS).append(row.el_);
    }
    this.rows_.push(row);
  }
};

Grid.prototype.addColumn = function(e, left, opt_numCols) {
  opt_numCols = opt_numCols ? opt_numCols : 1;
  for (var j = 0; j < opt_numCols; j++) {
    for (var i = 0; i < this.rows_.length; i++) {
      var block = new Box(this.blockWidth_, this.blockHeight_, this.numBlocksX_, j);
      if (left) {
        this.rows_[i].prepend(block);
      } else {
        this.rows_[i].append(block);
      }
    }
    this.numBlocksX_++;
  }
};

Grid.prototype.clearGrid = function(e) {
    for (var i = 0; i < this.rows_.length; i++) {
      this.rows_[i].clear();
    }
}

var Row = function() {
  this.blocks_ = [];
  this.el_ = $('<div>').addClass(ROW_CLASS);
};

Row.prototype.append = function(block) {
  this.el_.append(block.el_);
  this.blocks_.push(block);
};

Row.prototype.prepend = function(block) {
  this.el_.prepend(block.el_);
  this.blocks_.push(block);
};

Row.prototype.clear = function() {
  for (var i = 0; i < this.blocks_.length; i++) {
    this.blocks[i].clear();
  }
}

var Box = function(blockWidth, blockHeight, x, y) {
  this.blockWidth_ = blockWidth;
  this.blockHeight_ = blockHeight;
  this.x_ = x;
  this.y_ = y;
  this.color_ = '';
  var boundColorBox = this.colorBox.bind(this);
  var boundMouseUp = this.mouseUp.bind(this);
  this.el_ = $('<div>').addClass('block').click(boundColorBox).
      mousedown(this.mouseDown).mouseup(boundMouseUp).
      hover(boundColorBox);
  this.el_.css('width', blockWidth + 'px');
  this.el_.css('height', blockHeight + 'px');
  this.setThisRun_ = false;
};

Box.prototype.clear = function() {
  this.el_.css('background-color', ''); 
  this.color_ = '';
}

Box.prototype.mouseDown = function(e) {
  mouseDown_ = true;
}

Box.prototype.mouseUp = function(e) {
  mouseUp_ = true;
}

Box.prototype.colorBox = function(e) {
    if (mouseDown_ && !this.setThisRun_) {
      var color = util.getColorValue($('#color').val());
      this.setThisRun_ = true;
      setThisRun.push(this);
      if (this.color_ == color) {
        this.clear();
        window.console.log ("Clearing the color!");
      } else {
        this.el_.css('background-color', color);
        this.color_ = color;
        window.console.log("Applying the color!", color);
      }
    }
    if (mouseDown_ && mouseUp_) {
          mouseDown_ = false;
	  mouseUp_ = false;
          this.setThisRun_ = false;
          for (var i = 0; i < setThisRun.length; i++) {
             setThisRun[i].setThisRun_ = false;
          }
          setThisRun = [];
          window.console.log("Done coloring!");
    }
}

function addColor(e) {
  color = $('#color').val();
  shade = $('<div>').addClass(SHADE_CLASS).css('background-color', color);
  shade.color = color;
  $($('#palette').children()[0]).after(shade);
  shade.click(setColorValue);
  $('.' + SELECTED_COLOR_CLASS).removeClass(SELECTED_COLOR_CLASS);
  shade.addClass(SELECTED_COLOR_CLASS);
}
function setColorValue() {
    shade = $(this);
    $('.selected_color').removeClass('selected_color');
    $('#color').val(shade.css('background-color'));
    shade.addClass('selected_color');
}

function render(e) {
  var numBlocksX = parseInt($('#numBlocksX').val(), 10);
  var numBlocksY = parseInt($('#numBlocksY').val(), 10);
  var blockSize = parseInt($('#blockSize').val(), 10);
  new Grid(numBlocksX, numBlocksY, blockSize, blockSize);
}
function showOptions(e) {
  $('.options').toggle('slow');
}
function showRenderOptions(e) {
  $('#backdrop').show();
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
$('#showColorOptions').click(showColorOptions);
$('#showRenderOptions').click(showRenderOptions);
$('.panel').hide();
$('.addcolumn').hover(toggleAddColumnButton, toggleAddColumnButton);
$('.addrow').hover(toggleAddRowButton, toggleAddRowButton);
var grid = new Grid(60, 50, 10, 10);
