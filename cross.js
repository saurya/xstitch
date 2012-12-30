Array.prototype.insert = function(index, item) {
  this.splice(index, 0, item);
};

var blockWidth_ = 5;
var blockHeight_ = 5;
var setThisRun = [];
var undoStack = [];
var statePointer = -1;
var mouseDown_ = false;
var mouseUp_ = false;
var ERASE_MODE = 'erase';
var COPY_MODE = 'copy';
var COLOR_MODE = 'color';
var PASTE_MODE = 'paste';
var mode = COLOR_MODE;
var copyBuffer = {};

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
  this.numBlocksY_ = 0;
  grid.html('');
  this.rows_ = [];
  this.allBlocks_ = [];
  this.addRow(null, false, numBlocksY);
  this.addColumn(null, false, numBlocksX - 1);
  undoStack.push(this.allBlocks_); 
  statePointer++;
};

Grid.prototype.addRow = function(e, top, opt_numRows) {
  opt_numRows = opt_numRows ? opt_numRows : 1;
  for (var j = 0; j < opt_numRows; j++) {
    var row = new Row(); 
    for (var i = 0; i < this.numBlocksX_; i++) {
      var block = new Box(this.blockWidth_, this.blockHeight_, i, this.numBlocksY_);
      this.allBlocks_.push(block);
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
      var block = new Box(this.blockWidth_, this.blockHeight_, this.numBlocksX_, i);
      this.allBlocks_.push(block);
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
      //FIXME(saurya): This causes bugs with the undo/redo feature since
      // there's no object added to the global undoStack.
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
    this.blocks_[i].clear();
  }
}

var Box = function(blockWidth, blockHeight, x, y) {
  this.blockWidth_ = blockWidth;
  this.blockHeight_ = blockHeight;
  this.x_ = x;
  this.y_ = y;
  this.colors_ = [];
  this.statePointer_ = -1;
  var boundColorBox = this.colorBox.bind(this);
  var boundMouseUp = this.mouseUp.bind(this);
  var boundMouseDown = this.mouseDown.bind(this);
  this.el_ = $('<div>').addClass('block').click(boundColorBox).
      mousedown(boundMouseDown).mouseup(boundMouseUp).
      hover(boundColorBox);
  this.el_.css('width', blockWidth + 'px');
  this.el_.css('height', blockHeight + 'px');
  this.clear();
  this.setThisRun_ = false;
};

Box.prototype.getX = function() {
  return this.x_;
};

Box.prototype.getY = function() {
  return this.y_;
};

Box.prototype.clear = function() {
  this.setColor(''); 
};

Box.prototype.getColor = function() {
  return this.colors_[this.colors_.length - 1];
}

Box.prototype.popState = function() {
  this.statePointer_ = this.statePointer_ == 0 ? 0 : this.statePointer_ - 1;
  this.el_.css('background-color', this.colors_[this.statePointer_]);
};

Box.prototype.forwardState = function() {
  this.statePointer_ = this.statePointer_ == this.colors_.length - 1 ? this.statePointer_ : this.statePointer_ + 1;
  this.el_.css('background-color', this.colors_[this.statePointer_]);
};

Box.prototype.setColor = function(color) {
  this.el_.css('background-color', color);
  this.colors_.push(color);
  this.statePointer_++;
};

Box.prototype.mouseDown = function(e) {
  mouseDown_ = true;
  copyBuffer.startbox = copyBuffer.startbox ? copyBuffer.startbox : this;
};

Box.prototype.mouseUp = function(e) {
  mouseUp_ = true;
};

Box.prototype.colorBox = function(e) {
  if (mouseDown_ && !this.setThisRun_) {
    var color = util.getColorValue($('#color').val());
    this.setThisRun_ = true;
    setThisRun.push(this);
    if (mode == ERASE_MODE) {
      this.clear();
    } else if(mode == COLOR_MODE) {
      this.setColor(color);
    }
  }
  if (mouseDown_ && mouseUp_) {
    mouseDown_ = false;
    mouseUp_ = false;
    this.setThisRun_ = false;
    for (var i = 0; i < setThisRun.length; i++) {
       setThisRun[i].setThisRun_ = false;
    }
    if (mode == COPY_MODE) {
      copyBuffer.endbox = this;
      alignBufferTopLeft(copyBuffer);
      mode = PASTE_MODE;
    } else {
      if (mode == PASTE_MODE) {
        setThisRun = applyToRegionAroundBox(this, copyBuffer);
        copyBuffer.startbox = null;
      }
      statePointer++;
      undoStack.insert(statePointer, setThisRun);
    }
    setThisRun = [];
  }
};

function alignBufferTopLeft(buffer) {
  // TODO(saurya): This could be much shorter if we chose to just
  // record minimum and maximum X and Y when we are in copy mode.
  var minX = Math.min(buffer.startbox.x_, buffer.endbox.x_);
  var minY = Math.min(buffer.startbox.y_, buffer.endbox.y_);
  var maxX = Math.max(buffer.startbox.x_, buffer.endbox.x_);
  var maxY = Math.max(buffer.startbox.y_, buffer.endbox.y_);
  buffer.startbox = grid.rows_[minY].blocks_[minX];
  buffer.endbox = grid.rows_[maxY].blocks_[maxX];
  buffer.maxX = maxX;
  buffer.maxY = maxY;
  buffer.minX = minX;
  buffer.minY = minY;
}

function applyToRegionAroundBox(box, buffer) {
  var changedBoxes = []; 
  for (var i = 0; i <= buffer.maxY - buffer.minY; i++) {
    var changedY = box.y_ + i;
    if (changedY > grid.rows_.length) { 
      break;
    }
    for (var j = 0; j <= buffer.maxX - buffer.minX; j++) {
      var changedX = box.x_ + j;   
      if (changedX >= grid.rows_[0].blocks_.length) {
        break;
      }
      var changedBox = grid.rows_[changedY].blocks_[changedX];
      var copyBox = grid.rows_[buffer.minY + i].blocks_[buffer.minX + j];
      changedBox.setColor(copyBox.getColor());
      changedBoxes.push(changedBox);
    }
  }
  return changedBoxes;
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
  $('.' + SELECTED_COLOR_CLASS).removeClass(SELECTED_COLOR_CLASS);
  $('#color').val(shade.css('background-color'));
  shade.addClass(SELECTED_COLOR_CLASS);
  mode = COLOR_MODE;
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

function undo() {
  if (statePointer <= 0) { return; }
  var newState = undoStack[statePointer];
  for (var i = 0; i < newState.length; i++) {
    newState[i].popState();
  } 
  statePointer--;
}

function redo() {
  if (statePointer > undoStack.length - 1) { return; }
  statePointer++;
  var newState = undoStack[statePointer];
  for (var i = 0; i < newState.length; i++) {
    newState[i].forwardState();
  } 
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
$('#undo').click(undo);
$('#redo').click(redo);
$('#erase').click(function() {
  mode = ERASE_MODE;
  $('.' + SELECTED_COLOR_CLASS).removeClass(SELECTED_COLOR_CLASS);
});
$('#copy').click(function() {
  mode = COPY_MODE;
  $('.' + SELECTED_COLOR_CLASS).removeClass(SELECTED_COLOR_CLASS);
});
$('#paste').click(function() {
  mode = PASTE_MODE;
  $('.' + SELECTED_COLOR_CLASS).removeClass(SELECTED_COLOR_CLASS);
});

var grid = new Grid(60, 50, 10, 10);
