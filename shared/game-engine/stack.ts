import { Card } from '../types/game'

export class Stack {
  private items: Card[] = []

  push(card: Card): void {
    this.items.push(card)
  }

  pop(): Card | undefined {
    return this.items.pop()
  }

  peek(): Card | undefined {
    return this.items[this.items.length - 1]
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  size(): number {
    return this.items.length
  }

  clear(): void {
    this.items = []
  }

  getAll(): Card[] {
    return [...this.items]
  }
}
