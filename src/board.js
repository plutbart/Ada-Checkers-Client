import React, { Component } from 'react';
import { getNewGame, joinNewGame, postMove, getGameState } from './fetchData';

const boardStyle = {
  evenColor: "#555555",
  oddcolor: "#ececec",
  player1: "#DADADA",
  player2: "#2A2A2A",
  borderColor: "#257EB7",
  selectionColor: "#F45642",
  field: {
    width: 60,
    height: 60,
    borderColor: "red",
  },
  pawn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 10,
  }
}

function getTileColor(no) {
  if (no%2===0) {
    return boardStyle.evenColor;
  }
  else {
    return boardStyle.oddcolor;
  }
}

function getPawnColor(pawn) {
  if (pawn == 1) {
    return boardStyle.player1
  }
  if (pawn == 2) {
    return boardStyle.player2
  }
  return "transparent"
}

function getSelectionColor(element, current) {

  if (element.x === current.selection.x && element.y === current.selection.y) {
    return boardStyle.selectionColor
  }
  else if (element.x === current.position.x && element.y === current.position.y) {
    return boardStyle.borderColor
  }
  return "transparent"
}

const sampleBoard = [[66609,0,66609,0,66609,0,66609,0],[0,66609,0,66609,0,66609,0,66609],[66609,0,66609,0,66609,0,66609,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,70195,0,70195,0,70195,0,70195],[70195,0,70195,0,70195,0,70195,0],[0,70195,0,70195,0,70195,0,70195]]

export function getBoard(board, player1, player2) {
  var newBoard = []
  for (var i=0; i<board.length; i++) {
    var row = board[i]
    var newRow = []
    for (var j=0; j<row.length; j++) {
      if (row[j] === player1) {
        newRow.push(1)
      }
      else if (row[j] === player2) {
        newRow.push(2)
      }
      else {
        newRow.push(0)
      }
    }
    newBoard.push(newRow)
  }
  return newBoard
}

export function getServerBoard(board,player1,player2) {
  var newBoard = []
  for (var i=0; i<board.length; i++) {
    var row = board[i]
    var newRow = []
    for (var j=0; j<row.length; j++) {
      if (row[j] === 1) {
        newRow.push(player1)
      }
      else if (row[j] === 2) {
        newRow.push(player2)
      }
      else {
        newRow.push(0)
      }
    }
    newBoard.push(newRow)
  }
  return newBoard
}

export default class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: {},
      selection: {},
    }
  }

  select = (i,j,callback) => {
      let current = this.state.position
      if (current.x === i && current.y === j) {
        this.setState({selection: {x: i, y: j}})
      }
      else {
        let selection = this.state.selection
        if (Object.keys(selection).length === 0 && selection.constructor === Object) {
          this.setState({position: {x: i, y: j}})
        }
        else {
          callback({
            x: this.state.position.x,
            y: this.state.position.y
          },{
            x: i,
            y: j,
          })
          this.setState({position: {x: i, y: j}})
          this.setState({selection: {}})
        }
      }
  }

  move = (board, from, to, callback) => {
    let newBoard = board
    if (newBoard[to.x][to.y] == 0) {
      newBoard[to.x][to.y] = newBoard[from.x][from.y]
      newBoard[from.x][from.y] = 0
    }
    callback(newBoard,[from.x+1,from.y+1],[to.x+1,to.y+1])
  }

  createTable = (board, onMove, gameInitialized) => {
    let table = []
    for (let i = 0; i < 8; i++) {
      let children = []
      for (let j = 0; j < 8; j++) {
        children.push(
          <div key={j}
            style={{
              borderStyle: "solid",
              borderWidth: 6,
              borderColor: getSelectionColor({x: i, y: j},{position: this.state.position, selection: this.state.selection}),
              width: boardStyle.field.width,
              height: boardStyle.field.height,
              backgroundColor: getTileColor(i+j)
            }}
            onClick={()=>this.select(i,j,(from,to) => (gameInitialized ? this.move(board,from,to,onMove) : 0))}
          >
              <Pawn board={board} index={{x: i, y: j}}/>
          </div>
        )
      }
      table.push(<div key={i} style={{display:"flex", flexDirection: "row"}}>{children}</div>)
    }

    return table
  }
  render() {
    return (
      <div style={{display:"flex", flexDirection: "column"}}>
        {this.createTable(this.props.board,this.props.onMove,this.props.gameInitialized)}
      </div>

    );
  }
}

const Pawn = (props) => {
  let board = props.board
  let x = props.index.x
  let y = props.index.y
  if (board.length > x) {
    if (board[x].length > y) {
      return (
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          margin: 10,
          backgroundColor: getPawnColor(props.board[props.index.x][props.index.y])
        }}/>
      )
    }
  }
  return(<div></div>)
}
