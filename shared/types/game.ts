export enum CardColor {
  White = 'W',
  Blue = 'U',
  Black = 'B',
  Red = 'R',
  Green = 'G',
  Colorless = 'C',
}

export enum CardType {
  Creature = 'Creature',
  Instant = 'Instant',
  Sorcery = 'Sorcery',
  Enchantment = 'Enchantment',
  Artifact = 'Artifact',
  Land = 'Land',
  Planeswalker = 'Planeswalker',
}

export interface Card {
  id: string
  name: string
  manaCost: number
  colors: CardColor[]
  type: CardType[]
  power?: number
  toughness?: number
  abilities: string[]
  text: string
}

export enum GamePhase {
  Beginning = 'Beginning',
  Upkeep = 'Upkeep',
  Draw = 'Draw',
  Main1 = 'Main1',
  Combat = 'Combat',
  Main2 = 'Main2',
  Ending = 'Ending',
}

export interface PlayerState {
  id: string
  name: string
  life: 40
  commander: Card
  mana: { [key in CardColor]: number }
  hand: Card[]
  battlefield: Card[]
  graveyard: Card[]
  exile: Card[]
  library: Card[]
  commanderDamage: number
}

export interface GameState {
  id: string
  player1: PlayerState
  player2: PlayerState
  currentPlayer: string
  phase: GamePhase
  turn: number
  stack: Card[]
  priority: string
  gameStatus: 'active' | 'finished'
  winner?: string
}

export enum ActionType {
  PlayCard = 'PlayCard',
  Attack = 'Attack',
  Block = 'Block',
  CastSpell = 'CastSpell',
  ActivateAbility = 'ActivateAbility',
  PassPriority = 'PassPriority',
  EndTurn = 'EndTurn',
}

export interface GameAction {
  playerId: string
  type: ActionType
  cardId?: string
  targetId?: string
  data?: any
}

export interface GameResult {
  gameId: string
  winner: string
  loser: string
  turns: number
  winCondition: string
  timestamp: Date
}
