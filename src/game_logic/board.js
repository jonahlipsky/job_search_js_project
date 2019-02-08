import crossNode from './cross_node';
import { hasNullStone, isTaken } from '../utilities/board_utils';
//import a final liberty method
const TAKEN = "TAKEN";


class Board{
  constructor(nCrosses){
    this.grid = this.gridSetup(nCrosses);
    this.nCrosses = nCrosses;
    this.color = 'black';
    this.gameElement = document.getElementById("game-element");
    this.ctx = this.gameElement.getContext('2d');
    this.ctx.translate(0, 760);
    this.ctx.scale(1, -1);
    this.render();
    this.gameElement.addEventListener('click', this.moveEvent.bind(this));
  }

  makeMove(color, coords){
    let targetNode = this.grid[coords[0]][coords[1]];
    switch(this.validMove(color,coords)){
      case true: 
        targetNode.assignStone(color);
        return true;
      case false:
        console.log("invalid move");
        return false;
      case TAKEN:
        debugger
        targetNode.assignStone(color);
        targetNode.connectedNodes.forEach( node => {
          if(node.stone && node.stone.color != color && node.groupHasNoLiberties(coords)){
            node.removeStone();
          }
        });
        return true
      default:
        console.log('error');
        return false;
    }
  }

  validMove(color, coords){
    //eventually add an option for ko as the first else if
    //add a case for not allowing suicidal moves
    let crossNode = this.grid[coords[0]][coords[1]];
    if(crossNode.stone){
      return false;
    } else if (crossNode.connectedNodes.some(isTaken(color, coords))){
      return TAKEN;
    } else if (crossNode.connectedNodes.some(hasNullStone)){
      return true;
    }
  }

  gridSetup(nCrosses){
    let grid = {};
    for (let i = 0; i < nCrosses; i++) {
      let column = {};
      for (let j = 0; j < nCrosses; j++) {
        column[j] = new crossNode([i, j], this); // [x,y]
        let connectedNodes = this.connectedNodesSetup(i, j, nCrosses);
        column[j].connectedNodes = connectedNodes;
      }      
      grid[i] = column;
    }
    this.mapNodesToGridCoordinates(grid);
    return grid;
  }

  mapNodesToGridCoordinates(grid){
    let nCrosses = Object.keys(grid).length;
    for (let i = 0; i < nCrosses; i++) {
      for (let j = 0; j < nCrosses; j++) {
        let node = grid[i][j];
        let mappedNodesToCoords = [];
        node.connectedNodes.forEach(nodeCoordintes => {
          mappedNodesToCoords.push(grid[nodeCoordintes[0]][nodeCoordintes[1]]);
        });
        node.connectedNodes = mappedNodesToCoords;
      }      
    }
  }

  connectedNodesSetup(i, j, nCrosses, grid){
    let up =    [i, j + 1];
    let right = [i + 1, j];
    let down =  [i, j - 1];
    let left =  [i - 1, j];

    let connectedNodes = [up, right, down, left];
    if (up[1] === nCrosses){
      delete connectedNodes[0];
    }
    if (right[0] === nCrosses){
      delete connectedNodes[1];
    }
    if(down[1] < 0){
      delete connectedNodes[2];
    }
    if(left[0] < 0){
      delete connectedNodes[3];
    }
    connectedNodes = connectedNodes.filter((node) => {
      return !!node;
    });

    return connectedNodes;
  }

  moveEvent(e){
    
    let x = e.offsetX - 20;
    let y = 740 - e.offsetY;
    let color = this.color;
    let xCoord = Math.floor((x + 20) / 40);
    let yCoord = Math.floor((y + 20) / 40);
    let coords = [xCoord, yCoord];
    let moveMade = this.makeMove(color,coords);
    this.render();
    if(moveMade){
      this.color = this.color === 'black' ? 'white' : 'black';
    }
    return;
  }

  render(){

    let boardSize = 40 * this.nCrosses;
    let p = 0; //outer padding
    let ip = 20;
    this.ctx.fillStyle = "#D5B077"; 
    this.ctx.fillRect(0,0,boardSize,boardSize); 
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';

    for (let y = ip; y <= boardSize; y += 40) {
      this.ctx.moveTo(p + ip, p + y);
      this.ctx.lineTo(boardSize - ip , p + y);
      this.ctx.stroke();        
    }

    for (let x = ip; x <= boardSize; x += 40) {      
      this.ctx.moveTo(p + x, p + ip);
      this.ctx.lineTo(p + x, boardSize - ip );
      this.ctx.stroke();        
    }

    let dotCoords = [3*40 + ip, 9*40 + ip, 15*40 + ip];


    this.ctx.fillStyle = 'black';
    for (let i = 0; i < dotCoords.length; i++) {
      for (let j = 0; j < dotCoords.length; j++) {
        this.ctx.beginPath();
        this.ctx.arc(dotCoords[i], dotCoords[j], 5, 0, 2*Math.PI, true);
        this.ctx.fill();
      }
    }



    for (let x = 0; x < this.nCrosses; x++) {
      for (let y = 0; y < this.nCrosses; y++) {
        let node = this.grid[x][y];
        if(node.stone){
          this.ctx.fillStyle = node.stone.color;
          this.ctx.beginPath();
          this.ctx.arc(node.coords[0] * 40 + ip, node.coords[1] * 40 + ip, 17, 0, 2*Math.PI, true);
          this.ctx.fill();
        }
      }
    }
    console.log(this.grid);
  }
}

export default Board;