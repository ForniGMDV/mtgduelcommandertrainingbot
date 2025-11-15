import { Router, Request, Response } from 'express'
import { SAMPLE_CARDS } from '../data/cards.js'
import type { Card } from '../services/gameService.js'
import { fetchCardData, getCardImageUrl } from '../utils/scryfall.js'

const router = Router()

function parseDeckText(text: string): string[] {
  const cards: string[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//')) continue

    const match = trimmed.match(/^(\d+)\s+(.+)$/)
    if (match) {
      const quantity = parseInt(match[1], 10)
      const name = match[2].trim()
      for (let i = 0; i < quantity; i++) {
        cards.push(name)
      }
    }
  }

  return cards
}

async function buildCard(name: string, id: string): Promise<Card> {
  const scryfallCard = await fetchCardData(name)
  
  if (scryfallCard) {
    const manaCost = scryfallCard.mana_cost || ''
    const genericCost = parseInt(manaCost.match(/\{(\d+)\}/)?.[1] || '0', 10)
    
    return {
      id,
      name: scryfallCard.name,
      manaCost: genericCost,
      type: scryfallCard.type_line || 'Unknown',
      power: scryfallCard.power ? parseInt(scryfallCard.power, 10) : undefined,
      toughness: scryfallCard.toughness ? parseInt(scryfallCard.toughness, 10) : undefined,
      text: scryfallCard.oracle_text || '',
      imageUrl: getCardImageUrl(scryfallCard),
    }
  }
  
  const guessedCost = name.toLowerCase().includes('land') ? 0 : 
                     name.toLowerCase().includes('mana') ? 0 : 1
  
  return {
    id,
    name: name || 'Unknown Card',
    manaCost: guessedCost,
    type: 'Card',
    power: undefined,
    toughness: undefined,
    text: '',
    imageUrl: undefined,
  }
}

router.post('/import', async (req: Request, res: Response) => {
  try {
    const { deckText } = req.body

    if (!deckText || typeof deckText !== 'string') {
      return res.status(400).json({ error: 'Invalid deck text' })
    }

    const cardNames = parseDeckText(deckText)

    if (cardNames.length < 99) {
      return res.status(400).json({ error: `Need at least 99 cards, got ${cardNames.length}` })
    }

    const cards: Card[] = await Promise.all(
      cardNames.map((name, idx) => buildCard(name, `card_${idx}`))
    )

    let commander: Card | null = null
    if (cards.length >= 99) {
      commander = cards.pop() || null
    }

    res.json({
      commander,
      cards,
      totalCards: cards.length + (commander ? 1 : 0),
      failedCards: [],
    })
  } catch (error) {
    console.error('Deck import error:', error)
    res.status(500).json({ error: 'Failed to import deck' })
  }
})

export default router
