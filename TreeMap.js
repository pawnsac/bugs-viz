// 
// Tree Map given 
// CSC544 Project JIT Problem Area Analysis
// Tanner Finken <finkent@arizona.edu>
//
// This file provides the code for the treemap, providing functions to
//  initialize and draw the file tree map, in different ways
//  such as sizing for number of commits, additional lines, or removing lines(subtraction)
//  and squarify algorithm implemented to view the tree map.  
//

 
////////////////////////////////////////////////////////////////////////
// Global variables for the dataset 

// Adjust data by commenting out lines
// let data = FileData;
let data = FileDataNew;


////////////////////////////////////////////////////////////////////////
// Tree related helper functions

function setTreeSize(tree)
{
  if (tree.children !== undefined) {
    let size = 0;
    for (let i=0; i<tree.children.length; ++i) {
      size += setTreeSize(tree.children[i]);
    }
    tree.size = size;
  }
  if (tree.children === undefined) {
    // do nothing, tree.size is already defined for leaves
  }
  return tree.size;
};

function setTreeBountySize(tree)
{
  if (tree.children !== undefined) {
    let size = 0;
    for (let i=0; i<tree.children.length; ++i) {
      size += setTreeBountySize(tree.children[i]);
    }
    tree.bountySize = size;
  }
  if (tree.children === undefined) {
    // do nothing, tree.size is already defined for leaves
  }
  return tree.bountySize;
};

function setTreeCheckSize(tree)
{
  if (tree.children !== undefined) {
    let size = 0;
    for (let i=0; i<tree.children.length; ++i) {
      size += setTreeCheckSize(tree.children[i]);
    }
    tree.checkSize = size;
  }
  if (tree.children === undefined) {
    // do nothing, tree.size is already defined for leaves
  }
  return tree.checkSize;
};

function setTreeCrashSize(tree)
{
  if (tree.children !== undefined) {
    let size = 0;
    for (let i=0; i<tree.children.length; ++i) {
      size += setTreeCrashSize(tree.children[i]);
    }
    tree.crashSize = size;
  }
  if (tree.children === undefined) {
    // do nothing, tree.size is already defined for leaves
  }
  return tree.crashSize;
};

function setTreeAdditions(tree)
{
  if (tree.children !== undefined) {
    let size = 0;
    for (let i=0; i<tree.children.length; ++i) {
      size += setTreeAdditions(tree.children[i]);
    }
    tree.additions = size;
  }
  if (tree.children === undefined) {
    // do nothing, tree.additions is already defined for leaves
  }
  return tree.additions;
};

function setTreeSubtracts(tree)
{
  if (tree.children !== undefined) {
    let size = 0;
    for (let i=0; i<tree.children.length; ++i) {
      size += setTreeSubtracts(tree.children[i]);
    }
    tree.subtracts = size;
  }
  if (tree.children === undefined) {
    // do nothing, tree.subtracts is already defined for leaves
  }
  return tree.subtracts;
};

function setTreeDifference(tree)
{
  if (tree.children !== undefined) {
    let sum = 0;
    for (let i=0; i<tree.children.length; ++i) {
      sum += setTreeDifference(tree.children[i]);
    }
    tree.difference = sum;
  }
  if (tree.children === undefined) {
    // do nothing, tree.subtracts is already defined for leaves
  }
  return tree.difference;
};

function checkTreeDifference(tree)
{ let min = 0;
  let max = 0;
  if (tree.children !== undefined) {
    
    for (let i=0; i<tree.children.length; ++i) {
      let [childMin, childMax] = checkTreeDifference(tree.children[i]);
      if(childMin < min) min = childMin;
      if(childMax > max) max = childMax;
    }
  }
  if (tree.children === undefined) {
    // return the min/max is the same difference
    return [tree.difference, tree.difference];
  }
  return [min, max];
};

function setTreeCount(tree)
{
  if (tree.children !== undefined) {
    let count = 0;
    for (let i=0; i<tree.children.length; ++i) {
      count += setTreeCount(tree.children[i]);
    }
    tree.count = count;
  }
  if (tree.children === undefined) {
    tree.count = 1;
  }
  return tree.count;
}

//Function to set the tree depth of all the nodes
// each child node is incremented with an additional depth
// Returns: max depth of the given tree
function setTreeDepth(tree, depth)
{
  let furtherDepth = depth;
  if (tree.children !== undefined) {
    for (let i=0; i<tree.children.length; ++i) {
      let nextDepth = setTreeDepth(tree.children[i], depth + 1);
      if(nextDepth > furtherDepth) furtherDepth = nextDepth;
    }
    tree.depth = depth;
  }
  if (tree.children === undefined) {
    tree.depth = depth;
  }
  return furtherDepth;
};


// Initialize the size, count, and depth variables within the tree
setTreeSize(data);
let maxBounty = setTreeBountySize(data);
setTreeCheckSize(data);
setTreeCrashSize(data);
setTreeCount(data);
setTreeAdditions(data);
setTreeSubtracts(data);
setTreeDifference(data);
// setTreeCommits(data);
let maxDepth = setTreeDepth(data, 0);
let colorDepth = d3.scaleSequential().domain([0, maxDepth])
            .range(["white","crimson"]);
let [minDif, maxDif] = checkTreeDifference(data);
// console.log(minDif, maxDif);
let colorDifference = d3.scaleDiverging([maxDif, 0, minDif], d3.interpolateRdBu);
let colorCheck = d3.scaleLinear([0,1],["white","orange"]);
let colorCrash = d3.scaleLinear([0,1], ["white", "purple"]);
let colorLogBounty= d3.scaleLog([1,maxBounty],[0,1]);
let colorBounty = d3.scaleLinear([0,1], ["white", "green"]);
let colorScale;
let colorParam =d3.select("#colorParam").property("value");
let sizeParam = d3.select("#sizeParam").property("value");
let bestSlice = false;



////////////////////////////////////////////////////////////////////////
// Main Code for the Treemapping Technique

//Function to set the rectangles of the tree using 
// the squarify algorithm found in this paper: https://www.win.tue.nl/~vanwijk/stm.pdf
function squarifyRects(rect, tree, attrFun) {
  //Function that should compute the squarified version of the rectangle boxes
  tree.rect = rect;
  if(rect.y1==NaN) console.log(rect);
  if (tree.children !== undefined) {
    tree.children.sort((a,b) => attrFun(a) - attrFun(b));
    let cumulativeSizes = [0];
    let realChildren = [];
    let realChildrenIndex = [];
    for (let i=0; i<tree.children.length; ++i) {
      cumulativeSizes.push(cumulativeSizes[i] + attrFun(tree.children[i]));
      realChildren.push(attrFun(tree.children[i]));
      realChildrenIndex.push(i);
    }
    
    let rectWidth = rect.x2 - rect.x1;
    let rectHeight = rect.y2 - rect.y1; 
    let currentRect = Object.assign({}, rect);
    let totalArea = rectWidth * rectHeight;
    let border = 7;
    let row = [];
    let rowIndex = [];
    let scaleArea = d3.scaleLinear()
                  .domain([0, cumulativeSizes[cumulativeSizes.length-1]])
                  .range([0, totalArea]);
    while(realChildren.length>0) { //Loop over and add until all used
      let separateVert = rectWidth > rectHeight;
      let toAdd = checkWorst(currentRect, realChildren, row, scaleArea);
      if(toAdd) {
        let addition = realChildren.pop();
        let additionIndex = realChildrenIndex.pop();
        row.push(addition);
        rowIndex.push(additionIndex);
      } else {
        //Layout/ permanent rows and then restart/ keep going
        let finalWidth = computeWidth(currentRect, row, scaleArea);
        let rowRects = computeRectangles(currentRect, row, finalWidth, scaleArea);
        //Adjust and recursively call children rectangles
        for(let i=0; i<rowRects.length; i++) {
          let rowRect = rowRects[i];
          let currIndex = rowIndex[i];
          let xRoom = rowRect.x2-rowRect.x1;
          let yRoom = rowRect.y2-rowRect.y1;
          if(xRoom<=2*border) {
            if(isNaN(rowRect.x1) || isNaN(rowRect.x2)) {
              rowRect.x1 = currentRect.x1;
              rowRect.x2 = currentRect.x2;
            } else {
              rowRect.x1 += xRoom/5; rowRect.x2 -= xRoom/5;
            }
          } else {
            if(isNaN(rowRect.x1) || isNaN(rowRect.x2)) {
              rowRect.x1 = currentRect.x1;
              rowRect.x2 = currentRect.x2;
            } else {
              rowRect.x1 += border; rowRect.x2 -= border;
            }
          }
          if(yRoom<=2*border) {
            if(isNaN(rowRect.y1) || isNaN(rowRect.y2)) {
              rowRect.y1 = currentRect.y1;
              rowRect.y2 = currentRect.y2;
            } else {
              rowRect.y1 += yRoom/5; rowRect.y2 -= yRoom/5;
            }
          } else {
            if(isNaN(rowRect.y1) || isNaN(rowRect.y2)) {
              rowRect.y1 = currentRect.y1;
              rowRect.y2 = currentRect.y2;
            } else {
              rowRect.y1 += border;
              rowRect.y2 -= border;
            }
          }
          squarifyRects(rowRect, tree.children[currIndex], attrFun);
        }
        //Reset row and adjust rectangle
        row = []; rowIndex = [];
        let sliceVert = shouldSliceVert(currentRect);
        if(sliceVert) {
          currentRect.x1 += finalWidth;
        } else {
          currentRect.y1 += finalWidth;
        }
      }
    }
    if(row.length<1) console.log(row.length);
    //At the end layout the final row that hasn't been laid out
    let finalWidth = computeWidth(currentRect, row, scaleArea);
    let rowRects = computeRectangles(currentRect, row, finalWidth, scaleArea);
    //Adjust and recursively call children rectangles
    for(let i=0; i<rowRects.length; i++) {
      let rowRect = rowRects[i];
      let currIndex = rowIndex[i];
      let xRoom = rowRect.x2-rowRect.x1;
      let yRoom = rowRect.y2-rowRect.y1;
      if(xRoom<=2*border) {
        if(isNaN(rowRect.x1) || isNaN(rowRect.x2)) {
          rowRect.x1 = currentRect.x1;
          rowRect.x2 = currentRect.x2;
        } else {
          rowRect.x1 += xRoom/5; rowRect.x2 -= xRoom/5;
        }
      } else {
        if(isNaN(rowRect.x1) || isNaN(rowRect.x2)) {
          rowRect.x1 = currentRect.x1;
          rowRect.x2 = currentRect.x2;
        } else {
          rowRect.x1 += border; rowRect.x2 -= border;
        }
      }
      if(yRoom<=2*border) {
        if(isNaN(rowRect.y1) || isNaN(rowRect.y2)) {
          rowRect.y1 = currentRect.y1;
          rowRect.y2 = currentRect.y2;
        } else {
          rowRect.y1 += yRoom/5; rowRect.y2 -= yRoom/5;
        }
      } else {
        if(isNaN(rowRect.y1) || isNaN(rowRect.y2)) {
          rowRect.y1 = currentRect.y1;
          rowRect.y2 = currentRect.y2;
        } else {
          rowRect.y1 += border;
          rowRect.y2 -= border;
        }
      }
      // if(tree.children[currIndex].name=="dbus") console.log(tree.children[currIndex].name,rowRect);
      squarifyRects(rowRect, tree.children[currIndex], attrFun);
    }
    //Don't need to Reset row or adjust rectangle
  }
}

// Helper functions to assist with Squarify algorithm:

//Returns true or false based on if adding the next value into the row
// will have a higher ratio(false) or lower ratio(true)
// true means it should be added as it improves the ratio to closer to a square
function checkWorst(theRect, listOfReals, currentRow, scaleForArea) {
  //Simulate adding the next value in listOfReals to the rectangle, and return true or false if it's better
  if(currentRow.length==0) return true; //Always add to an empty row
  let widthNeeded = computeWidth(theRect, currentRow, scaleForArea);
  let listOfFirstRects = computeRectangles(theRect, currentRow, widthNeeded, scaleForArea);
  let worstRatio = 0; //Check the worst ratio without insert
  for(let i=0; i<listOfFirstRects.length; i++) {
    let rect = listOfFirstRects[i];
    let rectiWidth = rect.x2 - rect.x1;
    let rectiHeight = rect.y2 - rect.y1; 
    let rectiRatio = (rectiWidth > rectiHeight) ? rectiWidth / rectiHeight : rectiHeight / rectiWidth;
    if(rectiRatio > worstRatio) {
      worstRatio = rectiRatio;
    }
  }
  //Then add and check highest ratio
  let addition = listOfReals.pop();
  currentRow.push(addition);
  widthNeeded = computeWidth(theRect, currentRow, scaleForArea);
  let listOfSecondRects = computeRectangles(theRect, currentRow, widthNeeded, scaleForArea);
  let worst2Ratio = 0; //Check the worst ratio without insert
  for(let i=0; i<listOfSecondRects.length; i++) {
    let rect = listOfSecondRects[i];
    let rectiWidth = rect.x2 - rect.x1;
    let rectiHeight = rect.y2 - rect.y1; 
    let rectiRatio = (rectiWidth > rectiHeight) ? rectiWidth / rectiHeight : rectiHeight / rectiWidth;
    if(rectiRatio > worst2Ratio) {
      worst2Ratio = rectiRatio;
    }
  }
  //Reset the row
  currentRow.pop();
  listOfReals.push(addition);
  //Return if the first is larger(worse) ratio
  return worstRatio >= worst2Ratio;
}

// Computes how much width is used in the rectangle for the given row
function computeWidth(theRect, currentRow, scaleForArea) {
  let totalRowArea = 0;
  let rectWidth = theRect.x2 - theRect.x1;
  let rectHeight = theRect.y2 - theRect.y1; 
  for(let i=0; i<currentRow.length; i++) { //Add them all to the row and check
    let rowRect = currentRow[i];
    totalRowArea += scaleForArea(rowRect);
  }
  let widthNeeded = shouldSliceVert(theRect) ? totalRowArea / rectHeight : totalRowArea / rectWidth;
  return widthNeeded;
}

//Computes all the rectangles and returns the list
function computeRectangles(theRect, currentRow, width, scaleForArea) {
  //Function to generate the list of rectangles gives the bounding rectangle and row values
  let listOfRects = [];
  let accumulativeSizes = [0];
  for(let i=0; i<currentRow.length; i++) { //Add them all to the row and check
    let rowRect = currentRow[i];
    let sideSize = scaleForArea(rowRect) / width;
    accumulativeSizes.push(accumulativeSizes[i] + sideSize);
  }
  let sliceVertical = shouldSliceVert(theRect);
  for(let i=0; i<currentRow.length; i++) { //Add them all to the row and check
    if(sliceVertical) {
      let newRect = { x1: theRect.x1, x2: theRect.x1 + width, y1: theRect.y1 + accumulativeSizes[i], y2: theRect.y1 + accumulativeSizes[i+1] };
      listOfRects.push(newRect);
    } else {
      let newRect = { x1: theRect.x1 + accumulativeSizes[i], x2: theRect.x1 + accumulativeSizes[i+1], y1: theRect.y1, y2: theRect.y1 + width };
      listOfRects.push(newRect);
    }
  }
  
  return listOfRects;
}

// Check if the rectangle should slice vertical (if the width is larger than height)
function shouldSliceVert(theRect) {
  let rectWidth = theRect.x2 - theRect.x1;
  let rectHeight = theRect.y2 - theRect.y1; 
  let sliceVertical = rectWidth > rectHeight;
  return sliceVertical;
}

// initialize the tree map
let winWidth = window.innerWidth;
let winHeight = window.innerHeight;
let newWidth = 10000;
let newHeight = 10000;

// compute the rectangles for each tree node, later and use the sizeParam value to do it
// squarifyRects(
//   {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
//   function(t) { return t.size; }
// );

// make a list of all tree nodes;
function makeTreeNodeList(tree, lst)
{
  lst.push(tree);
  if (tree.children !== undefined) {
    for (let i=0; i<tree.children.length; ++i) {
      makeTreeNodeList(tree.children[i], lst);
    }
  }
}

let treeNodeList = [];
makeTreeNodeList(data, treeNodeList);



////////////////////////////////////////////////////////////////////////
// Visual Encoding portion

// d3 selection to draw the tree map 
let gs = d3.select("#svg")
           .attr("width", winWidth)
           .attr("height", winHeight)
           .selectAll("g")
           .data(treeNodeList)
           .enter()
           .append("g");

// let colorDepth = d3.scaleSequential().domain([0, maxDepth])
//             .interpolator(d3.interpolatePuRd);

function setAttrs(sel) {
  sel.attr("width", function(treeNode) { return treeNode.rect.x2 - treeNode.rect.x1; })
     .attr("height", function(treeNode) { return treeNode.rect.y2 - treeNode.rect.y1;})
     .attr("x", function(treeNode) { return treeNode.rect.x1;})
     .attr("y", function(treeNode) { return winHeight - (treeNode.rect.y2);})
     .attr("fill", function(treeNode) { 
        if(colorParam=="depth")
        return colorScale(treeNode.depth);
      else if(colorParam=="difference")
        return colorScale(treeNode.difference); 
      else if(colorParam=="check")
        return colorScale(treeNode.checkSize / treeNode.size);
      else if(colorParam=="crash") 
        return colorScale(treeNode.crashSize / treeNode.size);
      else if(colorParam=="bounty") {
        if(treeNode.bountySize==0) return "white";
        return colorScale(colorLogBounty(treeNode.bountySize));
      }
      else {console.log("Unknown color scale chosen"); return "black";} })
     .attr("stroke", function(treeNode) { return "black";})
     .attr("style", "stroke-width:1px;");
}

if(sizeParam=="commits") {
  squarifyRects(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
    function(t) { return t.size; }
  );
} else if(sizeParam=="additions") {
  squarifyRects(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
    function(t) { return t.additions/t.size; }
  );
} else if(sizeParam=="subtracts") {
  squarifyRects(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
    function(t) { return t.subtracts/t.size; }
  );
} else {
  console.log("ERR: No squarify called in the beginning");
}

if(colorParam=="depth") {
  colorScale = colorDepth;
  d3.select(".selectColorBox").attr("style","background: linear-gradient(to right, white 0%, crimson 100%);");
} else if(colorParam=="difference") {
  colorScale = colorDifference;
  d3.select(".selectColorBox").attr("style","background: linear-gradient(to right, blue 0%, white 50%, red 100%);");
} else if(colorParam=="check") {
  colorScale = colorCheck;
  d3.select(".selectColorBox").attr("style", "background: linear-gradient(to right, white 0%, orange 100%);");
} else if(colorParam=="crash") {
  colorScale = colorCrash;
  d3.select(".selectColorBox").attr("style", "background: linear-gradient(to right, white 0%, purple 100%);");
} else if(colorParam=="bounty") {
  colorScale = colorBounty;
  d3.select(".selectColorBox").attr("style", "background: linear-gradient(to right, white 0%, green 100%);");
}

let textHover = gs.append("rect").call(setAttrs)
                .append("title")
                .text(function(treeNode) { 
                  return treeNode.name + " : " + treeNode.size;
              });

function updateTitle() {

  if(sizeParam=="commits") {
    textHover.text(function(treeNode) { 
        if(colorParam=="depth")
          return treeNode.name + " : " + treeNode.size + " commits(" + treeNode.depth + ")";
        else if(colorParam=="difference")
          return treeNode.name + " : " + treeNode.size + " commits(" + (treeNode.additions-treeNode.subtracts) + ")";
        else if(colorParam=="check")
          return treeNode.name + " : " + treeNode.size + " commits(" + (treeNode.checkSize/treeNode.size) + ")";
        else if(colorParam=="crash")
          return treeNode.name + " : " + treeNode.size + " commits(" + (treeNode.crashSize/treeNode.size) + ")";
        else if(colorParam=="bounty")
          return treeNode.name + " : " + treeNode.size + " commits(" + (treeNode.bountySize) + ")";
        return treeNode.name + " : " + treeNode.size + " commits";
            });
  } else if(sizeParam=="additions") {
    textHover.text(function(treeNode) { 
      if(colorParam=="depth")
        return treeNode.name + " : " + (treeNode.additions/treeNode.size).toFixed(2) + " avg. additions(" + treeNode.depth + ")";
      else if(colorParam=="difference")
        return treeNode.name + " : " + (treeNode.additions/treeNode.size).toFixed(2) + " avg. additions(" + (treeNode.additions-treeNode.subtracts) + ")";
      else if(colorParam=="check")
        return treeNode.name + " : " + (treeNode.additions/treeNode.size).toFixed(2) + " avg. additions(" + (treeNode.checkSize/treeNode.size) + ")";
      else if(colorParam=="crash")
        return treeNode.name + " : " + (treeNode.additions/treeNode.size).toFixed(2) + " avg. additions(" + (treeNode.crashSize/treeNode.size) + ")";
      else if(colorParam=="bounty")
        return treeNode.name + " : " + (treeNode.additions/treeNode.size).toFixed(2) + " avg. additions(" + (treeNode.bountySize) + ")";
      return treeNode.name + " : " + (treeNode.additions/treeNode.size).toFixed(2) + " avg. additions";
  });
  } else if(sizeParam=="subtracts") {
    textHover.text(function(treeNode) { 
      if(colorParam=="depth")
        return treeNode.name + " : " + (treeNode.subtracts/treeNode.size).toFixed(2) + " avg. deletions(" + treeNode.depth + ")";
      else if(colorParam=="difference")
        return treeNode.name + " : " + (treeNode.subtracts/treeNode.size).toFixed(2) + " avg. deletions(" + (treeNode.additions-treeNode.subtracts) + ")";
      else if(colorParam=="check")
        return treeNode.name + " : " + (treeNode.subtracts/treeNode.size).toFixed(2) + " avg. deletions(" + (treeNode.checkSize/treeNode.size) + ")";
      else if(colorParam=="crash")
        return treeNode.name + " : " + (treeNode.subtracts/treeNode.size).toFixed(2) + " avg. deletions(" + (treeNode.crashSize/treeNode.size) + ")";
      else if(colorParam=="bounty")
        return treeNode.name + " : " + (treeNode.subtracts/treeNode.size).toFixed(2) + " avg. deletions(" + (treeNode.bountySize) + ")";
      return treeNode.name + " : " + (treeNode.subtracts/treeNode.size).toFixed(2) + " avg. deletions";
  });
  }
}

updateTitle();


////////////////////////////////////////////////////////////////////////
// Callbacks for user inputs

d3.select("#sizeParam")
.on("change", function() {
  sizeParam = d3.select(this).property("value");
  // console.log(sizeParam);
  if(sizeParam=="commits") {
    squarifyRects(
      {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
      function(t) { return t.size; }
    );
  } else if(sizeParam=="additions") {
    squarifyRects(
      {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
      function(t) { return t.additions/t.size; }
    );
  } else if(sizeParam=="subtracts") {
    squarifyRects(
      {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
      function(t) { return t.subtracts/t.size; }
    );
  }
  updateTitle();
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);

});

d3.select("#colorParam")
.on("change", function() {
  colorParam = d3.select(this).property("value");
  updateTitle();
  // console.log(colorParam);
  if(colorParam=="depth") {
    colorScale = colorDepth;
    d3.select(".selectColorBox").attr("style","background: linear-gradient(to right, white 0%, red 100%);");
  } else if(colorParam=="difference") {
    colorScale = colorDifference;
    d3.select(".selectColorBox").attr("style","background: linear-gradient(to right, blue 0%, white 50%, red 100%);");
  } else if(colorParam=="check") {
    colorScale = colorCheck;
    d3.select(".selectColorBox").attr("style", "background: linear-gradient(to right, white 0%, orange 100%);");
  } else if(colorParam=="crash") {
    colorScale = colorCrash;
    d3.select(".selectColorBox").attr("style", "background: linear-gradient(to right, white 0%, purple  100%);");
  } else if(colorParam=="bounty") {
    colorScale = colorBounty;
    d3.select(".selectColorBox").attr("style", "background: linear-gradient(to right, white 0%, green 100%);");
  }
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);

});

