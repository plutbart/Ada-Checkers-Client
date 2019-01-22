import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Board from './board';
import { Button } from 'react-bootstrap'
import { getNewGame, joinNewGame, postMove, getGameState } from './fetchData';
import { getBoard, getServerBoard } from './board';

function getGameLabel(gameInitialized, gameID) {
  var label = ""
  if (gameInitialized) {
    label = `Game: ${gameID}`
  }
  return label
}

function getTurnLabel(gameInitialized, thisPlayer, turn) {
  var label = ""
  if (gameInitialized) {
    if (thisPlayer === turn) {
      label = label + "Your turn!"
    }
    else if (turn === 0) {
      label = label + "Waiting for opponent..."
    }
    else {
      label = label + "Opponent turn"
    }
  }
  return label
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gameID: 0,
      board: [],
      player1: 0,
      player2: 0,
      thisPlayer: 0,
      turn: 0,
      gameInitialized: false,
      isInputVisible: false,
      inputValue: "",
    }
  }

  updateGameState(serverResponse) {
    if (serverResponse.winner !== 0) {
      if (serverResponse.winner === this.state.thisPlayer) {
        alert("You won!")
      }
      else {
        alert("You lost!")
      }
      this.deInit();
    }
    this.setState({gameID: serverResponse.gameID})
    this.setState({board: getBoard(serverResponse.board,this.state.player1,this.state.player2)})
    this.setState({turn: serverResponse.turn})
    this.setState({player1: serverResponse.player1})
    this.setState({player2: serverResponse.player2})
  }

  initNewBoard(serverResponse) {
    this.setState({gameID: serverResponse.gameID})
    this.setState({board: getBoard(serverResponse.board,serverResponse.player1,serverResponse.player2)})
    this.setState({player1: serverResponse.player1})
    this.setState({player2: serverResponse.player2})
    this.setState({thisPlayer: serverResponse.thisPlayer})
    this.setState({turn: serverResponse.turn})
    this.setState({gameInitialized: true})
    this.initStateCheck()
  }

  deInit() {
    clearInterval(this.interval);
    this.setState({gameID: 0})
    this.setState({board: []})
    this.setState({player1: 0})
    this.setState({player2: 0})
    this.setState({thisPlayer: 0})
    this.setState({turn: 0})
    this.setState({gameInitialized: false})
  }

  clearGame() {
    this.setState({board: []})
    this.setState({gameInitialized: false})
    clearInterval(this.interval);
  }

  initStateCheck() {
    clearInterval(this.interval);
    this.interval = setInterval(() => this.checkForUpdates(), 1000);
  }

  checkForUpdates() {
    getGameState(this.state.gameID,(resp) => {
      if (resp.hasOwnProperty('error')) {
        alert(resp.error)
        this.deInit()
      }
      else {
        this.updateGameState(resp)
      }
    }, () => this.onServerFail())
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onErrorResponse(responseData) {
    if (responseData.hasOwnProperty('error')) {
      alert(responseData.error)
      this.deInit()
    }
  }

  onMove(board, from, to) {
    this.setState({board: board})
    let requestData = {
      gameID: this.state.gameID,
      playerID: this.state.thisPlayer,
      from: from,
      to: to,
    }
    postMove(requestData, this.state.gameID, (resp) => this.onErrorResponse(resp), () => this.onServerFail())
  }

  onNewGame() {
    getNewGame((resp) => this.initNewBoard(resp), () => this.onServerFail())
  }

  onJoinGame() {
    this.setState({isInputVisible: false})
    joinNewGame(this.state.inputValue, (resp) => {
      if (resp.hasOwnProperty('error')) {
        alert(resp.error)
        this.deInit()
      }
      else {
        this.initNewBoard(resp)
      }
    }, () => this.onServerFail())
  }

  onServerFail() {
    alert("Unable to fetch data from server")
    this.deInit();
  }

  render() {
    let gameInitialized = this.state.gameInitialized
    let thisPlayer = this.state.thisPlayer
    let turn = this.state.turn
    let gameID = this.state.gameID
    let board = this.state.board

    return (
      <div className="App">
        <header className="App-header">
          <div style={{height: 50,padding:10}}>
            <div style={{color: "#333333", fontWeight: "600",fontSize: 20}}>
              <p style={{margin:5}}>{getGameLabel(gameInitialized, gameID)}</p>
            </div>
            <div style={{color: "#333333", fontWeight: "600",fontSize: 15}}>
              <p style={{margin:5}}>{getTurnLabel(gameInitialized, thisPlayer, turn)}</p>
            </div>
          </div>
          <Controls
            onNewGame={async () => this.onNewGame()}
            onJoinGame={async () => this.setState({isInputVisible: true})}
            isInputVisible={this.state.isInputVisible}
            inputValue={this.state.inputValue}
            onInputChange={(value) => this.setState({inputValue: value})}
            onInputCancel={() => this.setState({isInputVisible: false})}
            onInputSubmit={() => this.onJoinGame()}
          />
        <Board board={this.state.board} gameInitialized={gameInitialized} onMove={(board,from,to) => this.onMove(board,from,to)}/>
        </header>

      </div>
    );
  }
}

export default App;

const Controls = (props) => {
  if (props.isInputVisible) {
    return (
      <div style={{display:"flex", flexDirection: "row", padding:10}}>
          <input
            style={{textAlign: "center", width: 150, height: 25, fontSize: 15, marginRight: 10, borderWidth: 1, borderColor: "#888888", backgroundColor: "#FCFCFC"}}
            value={props.inputValue}
            onChange={(event) => props.onInputChange(event.target.value)}
          />
        <Button style={{width:80, height: 30, marginRight: 10}} bsStyle="default" onClick={props.onInputCancel}>
            Cancel
          </Button>
          <Button style={{width:80, height: 30, marginRight: 10}} bsStyle="default" onClick={props.onInputSubmit}>
            Join game
          </Button>
      </div>
    )
  }
  else {
    return (
      <div style={{display:"flex", flexDirection: "row", padding:10}}>
        <Button style={{width:150, height: 30, marginRight: 10}} bsStyle="default" onClick={props.onNewGame}>
          New game
        </Button>
        <Button style={{width:150, height: 30, marginRight: 10}} bsStyle="default" onClick={props.onJoinGame}>
          Join game
        </Button>
      </div>
    )
  }
}
