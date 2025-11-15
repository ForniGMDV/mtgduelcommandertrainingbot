import { GameState, PlayerState, GamePhase, ActionType, GameAction, Card } from '../types/game'
import { Stack } from './stack'

export class GameEngine {
  private gameState: GameState
  private stack: Stack

  constructor(player1: PlayerState, player2: PlayerState) {
    this.stack = new Stack()
    this.gameState = {
      id: this.generateId(),
      player1,
      player2,
      currentPlayer: player1.id,
      phase: GamePhase.Beginning,
      turn: 1,
      stack: [],
      priority: player1.id,
      gameStatus: 'active',
    }
  }

  private generateId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  executeAction(action: GameAction): boolean {
    if (this.gameState.gameStatus !== 'active') return false
    if (action.playerId !== this.gameState.currentPlayer) return false

    switch (action.type) {
      case ActionType.EndTurn:
        return this.endTurn()
      case ActionType.PassPriority:
        return this.passPriority()
      case ActionType.PlayCard:
        return this.playCard(action)
      case ActionType.Attack:
        return this.attack(action)
      case ActionType.Block:
        return this.block(action)
      default:
        return false
    }
  }

  private endTurn(): boolean {
    const opponent = this.getOpponent(this.gameState.currentPlayer)
    this.gameState.currentPlayer = opponent.id
    this.gameState.turn++
    this.gameState.phase = GamePhase.Beginning
    return true
  }

  private passPriority(): boolean {
    const opponent = this.getOpponent(this.gameState.currentPlayer)
    this.gameState.priority = opponent.id
    return true
  }

  private playCard(action: GameAction): boolean {
    return true
  }

  private attack(action: GameAction): boolean {
    return true
  }

  private block(action: GameAction): boolean {
    return true
  }

  private getOpponent(playerId: string): PlayerState {
    return playerId === this.gameState.player1.id ? this.gameState.player2 : this.gameState.player1
  }

  getState(): GameState {
    return this.gameState
  }

  isGameOver(): boolean {
    return this.gameState.gameStatus === 'finished'
  }

  getWinner(): string | undefined {
    return this.gameState.winner
  }
}
