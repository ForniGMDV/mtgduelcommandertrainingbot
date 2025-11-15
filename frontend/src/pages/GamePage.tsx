import { useState, useCallback, useEffect, useRef } from 'react'
import DeckImport from '../components/DeckImport'
import StackedDeck from '../components/StackedDeck'

interface Card {
  id: string
  name: string
  manaCost: number
  type: string
  power?: number
  toughness?: number
  text: string
  imageUrl?: string
  x?: number
  y?: number
}

interface PlayerState {
  id: string
  name: string
  life: number
  hand: Card[]
  battlefield: Card[]
  graveyard: Card[]
  exile: Card[]
  library: Card[]
  commander: Card | null
  mana: number
  maxMana: number
}

interface GameState {
  id: string
  player: PlayerState
  opponent: PlayerState
  currentPhase: string
  isPlayerTurn: boolean
  turn: number
  stack: Card[]
}

interface CardContextMenu {
  cardId: string
  x: number
  y: number
  zone: 'hand' | 'battlefield' | 'library' | 'graveyard' | 'exile'
}

const PHASES = ['Beginning', 'Main 1', 'Combat', 'Main 2', 'Ending']

const DEFAULT_DECK: Card[] = [
  { id: '1', name: 'Ancient Den', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/3/0/301e15c8-7ff1-4ce0-85d5-5ff12eb06e6e.jpg' },
  { id: '2', name: 'Andúril, Flame of the West', manaCost: 2, type: 'Artifact Equip', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/e/8e664119-592f-4236-96e3-a465e1f29aa3.jpg' },
  { id: '3', name: 'Arachne, Psionic Weaver', manaCost: 2, type: 'Creature', text: '', power: 2, toughness: 3, imageUrl: 'https://cards.scryfall.io/normal/front/a/f/af1d394b-f74e-4055-b9a8-9fdf7db70b0a.jpg' },
  { id: '4', name: 'Armageddon', manaCost: 3, type: 'Sorcery', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/8/88e07bcc-2569-4df1-9228-08efce76727f.jpg' },
  { id: '5', name: 'Basri, Tomorrow\'s Champion', manaCost: 2, type: 'Planeswalker', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/3/7/37d4ea8b-0fa9-4606-99b1-eb34cfc6e73b.jpg' },
  { id: '6', name: 'Benevolent Bodyguard', manaCost: 1, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/d/4/d4602b20-b3fb-4a27-b33f-155e098e50d5.jpg' },
  { id: '7', name: 'Castle Ardenvale', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/7/f/7f910495-8bd7-4134-a281-c16fd666d5b9.jpg' },
  { id: '8', name: 'Cathar Commando', manaCost: 2, type: 'Creature', text: '', power: 2, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/0/8/08e22d57-39fd-4bf9-be71-66d0d758ebd1.jpg' },
  { id: '9', name: 'City of Traitors', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/7/1/7177e92d-dfd5-4b48-b33d-933829229854.jpg' },
  { id: '10', name: 'Crystal Vein', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/1/c/1c28ab69-d7d1-41cd-b88c-aba310b260d1.jpg' },
  { id: '11', name: 'Disruptor Flute', manaCost: 2, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/3/6/36f1f63b-0f60-4203-8815-c110b1ef68da.jpg' },
  { id: '12', name: 'Doomed Traveler', manaCost: 1, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/3/5/35f61b99-7ecd-42d4-8a6a-e4eb79e2aa3d.jpg' },
  { id: '13', name: 'Drannith Magistrate', manaCost: 2, type: 'Creature', text: '', power: 1, toughness: 3, imageUrl: 'https://cards.scryfall.io/normal/front/9/8/98b0a4a8-9319-451b-9b79-b56bbb9879eb.jpg' },
  { id: '14', name: 'Dust Bowl', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/7/5/75b03052-49c1-475c-9d18-4b46d13d218e.jpg' },
  { id: '15', name: 'Eiganjo Castle', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/0/5/05a203cb-1910-4997-a5c3-66db13fc86b4.jpg' },
  { id: '16', name: 'Eiganjo, Seat of the Empire', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/5/8/5865b67e-34ab-4ee0-b89f-af67d109e233.jpg' },
  { id: '17', name: 'Enlightened Tutor', manaCost: 1, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/0/c/0c9ebec9-49c7-4b0b-a8f2-63ec160a9213.jpg' },
  { id: '18', name: 'Esper Sentinel', manaCost: 1, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/f/3/f3537373-ef54-433b-bc9f-eea03171fc1c.jpg' },
  { id: '19', name: 'Flagstones of Trokair', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/e/6/e6291d3e-f0ee-4e0d-9053-ed56816da250.jpg' },
  { id: '20', name: 'Flare of Fortitude', manaCost: 2, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/a/f/afb80e0c-b946-4fba-8b33-063ae40d5f03.jpg' },
  { id: '21', name: 'Galadriel\'s Dismissal', manaCost: 2, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/7/b/7be5bb7f-57f9-4c7b-9cb5-27d9be74e670.jpg' },
  { id: '22', name: 'Garrison Cat', manaCost: 1, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/e/7/e7e1a7e5-415a-48d9-8ed1-c8493ca531f9.jpg' },
  { id: '23', name: 'Gemstone Caverns', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/9/4/94d23430-5d14-4e6b-bcc8-d0fd51da3324.jpg' },
  { id: '24', name: 'Ghost Vacuum', manaCost: 2, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/2/8/28be5e2a-d664-4a5e-b7f2-128baebe88e9.jpg' },
  { id: '25', name: 'Giver of Runes', manaCost: 1, type: 'Creature', text: '', power: 1, toughness: 2, imageUrl: 'https://cards.scryfall.io/normal/front/4/e/4e4f8ff8-b28a-4c14-9c69-4a0359049dcc.jpg' },
  { id: '26', name: 'Glimmer Lens', manaCost: 2, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/6/b/6bae539b-099b-4525-96d4-eb3d62c5a535.jpg' },
  { id: '27', name: 'Hand of Vecna', manaCost: 4, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/a/3/a3ba4f70-1e55-47e9-b8d1-c245e81f32ac.jpg' },
  { id: '28', name: 'Hunted Witness', manaCost: 1, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/1/8/183b5c65-d896-4dad-9629-2e3ec7e1d9b6.jpg' },
  { id: '29', name: 'Indebted Spirit', manaCost: 1, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/f/3/f3f4a891-5ac5-4d5c-8d1b-0cd3d4e8b5c2.jpg' },
  { id: '30', name: 'Jacked Rabbit', manaCost: 1, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/c/4/c4cb03a5-8f97-472f-8ca5-44c6b1dd2c9c.jpg' },
  { id: '31', name: 'Jolted Awake', manaCost: 3, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/2/c/2c5a6b1e-31ef-4305-9f19-e4a9ca2e0bb5.jpg' },
  { id: '32', name: 'Lavaspur Boots', manaCost: 3, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/c/e/cea48d63-5a08-46fe-9dc6-5f5fc0c2ac7a.jpg' },
  { id: '33', name: 'Lay Down Arms', manaCost: 2, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/f/0/f010a7b5-c68b-487d-84f7-8b96f65fe0f6.jpg' },
  { id: '34', name: 'Lazotep Quarry', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/4/8/48c71f65-c16f-414e-9df4-4e2b73ad1d04.jpg' },
  { id: '35', name: 'Lion Sash', manaCost: 2, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/3/e/3e94cb50-4064-4b9b-82a3-72399c0b0d81.jpg' },
  { id: '36', name: 'Mana Tithe', manaCost: 1, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/7/d/7d48cb14-4a5a-526f-215b-cf6569e5f165.jpg' },
  { id: '37', name: 'March of Otherworldly Light', manaCost: 1, type: 'Sorcery', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/5/5/559a6a46-6531-4f8b-a8f7-cf63ba2497de.jpg' },
  { id: '38', name: 'Masterwork of Ingenuity', manaCost: 2, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/d/5/d545e29e-4500-4c6f-8c6d-59d920d37e6d.jpg' },
  { id: '39', name: 'Mishra\'s Factory', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/a/5/a5c2da21-be0f-4546-a5b1-88f6b8e35735.jpg' },
  { id: '40', name: 'Mother of Runes', manaCost: 1, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/a/5/a535bc5e-41f3-4882-898a-ecadff9885c2.jpg' },
  { id: '41', name: 'Nesting Bot', manaCost: 2, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/6/d/6d1dd130-c8ce-4a08-a92a-a3c2a5556e5b.jpg' },
  { id: '42', name: 'Ocelot Pride', manaCost: 2, type: 'Creature', text: '', power: 2, toughness: 2, imageUrl: 'https://cards.scryfall.io/normal/front/f/d/fd3b5651-50c2-4e3e-9ef6-8b5cb66df63a.jpg' },
  { id: '43', name: 'On Thin Ice', manaCost: 2, type: 'Enchant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/2/9/29ea1228-47c4-4932-82cb-220617b13b0a.jpg' },
  { id: '44', name: 'Oust', manaCost: 1, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/f/d/fdb8d1ca-daf1-4401-bab1-6bf20107394e.jpg' },
  { id: '45', name: 'Parallax Wave', manaCost: 3, type: 'Enchant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/0/e/0edb9d3b-3ff4-440d-a821-6db247e59b6d.jpg' },
  { id: '46', name: 'Phelia, Exuberant Shepherd', manaCost: 3, type: 'Creature', text: '', power: 2, toughness: 2, imageUrl: 'https://cards.scryfall.io/normal/front/5/9/592fb23d-bba7-49ee-9473-908d168b4df8.jpg' },
  { id: '47', name: 'Portable Hole', manaCost: 1, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/5/6/56a8b3b7-ff84-4d0b-be05-c313d654fe6d.jpg' },
  { id: '48', name: 'Pre-War Formalwear', manaCost: 1, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/a/5/a5f50ae8-ded9-46e4-a737-4ce29dd0d650.jpg' },
  { id: '49', name: 'Puresteel Paladin', manaCost: 2, type: 'Creature', text: '', power: 1, toughness: 2, imageUrl: 'https://cards.scryfall.io/normal/front/ca/a/caa10dca-286b-4e06-a575-751b591e59c7.jpg' },
  { id: '50', name: 'Ranger-Captain of Eos', manaCost: 2, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/0/5/05a1ff0f-e6b6-4f21-aa2d-4f0b89a67e87.jpg' },
  { id: '51', name: 'Ravages of War', manaCost: 2, type: 'Sorcery', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/4/4/44b8d3a8-3922-416b-a17f-22c378f0c017.jpg' },
  { id: '52', name: 'Razorgrass Ambush', manaCost: 2, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/b/d/bdf2ac9c-f54d-4e24-9f46-6c36b8e12f4b.jpg' },
  { id: '53', name: 'Recruiter of the Guard', manaCost: 2, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/b/b/bba201ba-48a4-41f8-9b34-f0251fa5b583.jpg' },
  { id: '54', name: 'Reverent Mantra', manaCost: 1, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/0/f/0fa0669b-df89-4f2d-96d1-1878dd7b91da.jpg' },
  { id: '55', name: 'Seam Rip', manaCost: 2, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/d/4/d4d3c1e1-3d37-4223-a816-6eb76fa932eb.jpg' },
  { id: '56', name: 'Sigarda\'s Aid', manaCost: 1, type: 'Enchant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/7/f/7fc32f1d-bed5-426c-ae89-378348cb5d69.jpg' },
  { id: '57', name: 'Skrelv, Defector Mite', manaCost: 1, type: 'Creature', text: '', power: 1, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/6/8/6876b67c-9159-4c8c-a54f-f3a6ad1e4b1f.jpg' },
  { id: '58', name: 'Skullclamp', manaCost: 1, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/8/8854e9c7-a4ad-4b6f-a32f-6f63e7b1e303.jpg' },
  { id: '59', name: 'Skyclave Apparition', manaCost: 2, type: 'Creature', text: '', power: 2, toughness: 2, imageUrl: 'https://cards.scryfall.io/normal/front/b/8/b83dc5f5-b31f-459f-ab0e-6ae2fcc50e0b.jpg' },
  { id: '60', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '61', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '62', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '63', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '64', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '65', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '66', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '67', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '68', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '69', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '70', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '71', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '72', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '73', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '74', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '75', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '76', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '77', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '78', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '79', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '80', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '81', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '82', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '83', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '84', name: 'Snow-Covered Plains', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/c/8c76df13-1844-4f6b-8b5d-8e563b5b3fac.jpg' },
  { id: '85', name: 'Solitude', manaCost: 2, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/4/7/47a6234f-309f-4e03-9263-66da48b57986.jpg' },
  { id: '86', name: 'Springleaf Drum', manaCost: 1, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/5/f/5f351163-36a7-4b7f-b651-23c6429b27f1.jpg' },
  { id: '87', name: 'Static Prison', manaCost: 2, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/4/e/4e2ae3d1-1c0c-4474-9cf5-c8f2c92f4c91.jpg' },
  { id: '88', name: 'Stoneforge Mystic', manaCost: 2, type: 'Creature', text: '', power: 1, toughness: 2, imageUrl: 'https://cards.scryfall.io/normal/front/1/0/10de41ff-4776-4bcc-adac-4312488f4e9f.jpg' },
  { id: '89', name: 'Swift Reconfiguration', manaCost: 2, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/2/6/2695d46e-9ebc-4ecd-9e59-48bde161debc.jpg' },
  { id: '90', name: 'Sword of Fire and Ice', manaCost: 3, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/d/e/deb75418-11de-47d0-83a9-1e32208ee2ab.jpg' },
  { id: '91', name: 'Swords to Plowshares', manaCost: 1, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/e/f/ef51e1c8-2e92-44e3-b739-b76235ba2b39.jpg' },
  { id: '92', name: 'Talon Gates of Madara', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/d/a/daeaafb3-5d8a-4b60-a1e9-67a2e0f37e39.jpg' },
  { id: '93', name: 'Tectonic Edge', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/9/4/94aeb796-1ad2-41d1-937d-293ab35177b0.jpg' },
  { id: '94', name: 'Tithe Taker', manaCost: 2, type: 'Creature', text: '', power: 2, toughness: 1, imageUrl: 'https://cards.scryfall.io/normal/front/b/d/bd26b7b1-992d-4b8c-bc33-51aab5abdf98.jpg' },
  { id: '95', name: 'Umezawa\'s Jitte', manaCost: 2, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/f/f/ff61a51e-36c8-47a5-8131-9bbb327a794c.jpg' },
  { id: '96', name: 'Urza\'s Saga', manaCost: 0, type: 'Land', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/c/0/c0c0996e-4d6b-4d04-8349-99e796e39d6b.jpg' },
  { id: '97', name: 'Voice of Victory', manaCost: 2, type: 'Instant', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/4/9/49b2be83-ab55-4a6f-97a6-e5922b2b7932.jpg' },
  { id: '98', name: 'Winter Moon', manaCost: 2, type: 'Artifact', text: '', power: 0, toughness: 0, imageUrl: 'https://cards.scryfall.io/normal/front/8/6/865bca1a-38f0-4641-9566-4fde426adad0.jpg' },
  { id: '99', name: 'Witch Enchanter', manaCost: 3, type: 'Creature', text: '', power: 2, toughness: 2, imageUrl: 'https://cards.scryfall.io/normal/front/2/e/2e188a15-f0e8-46f4-8901-2a7bcd50e46a.jpg' },
  { id: '100', name: 'Cloud, Midgar Mercenary', manaCost: 3, type: 'Creature', text: '', power: 3, toughness: 3, imageUrl: 'https://cards.scryfall.io/normal/front/8/5/858286d5-b579-46e3-89e2-371b3b25d176.jpg' },
]

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [showLibraryMenu, setShowLibraryMenu] = useState(false)
  const [contextMenu, setContextMenu] = useState<CardContextMenu | null>(null)
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; zone: string } | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const startGame = useCallback(async (playerDeck?: Card[]) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: playerDeck ? JSON.stringify({ playerDeck }) : undefined,
      })
      if (!response.ok) throw new Error('Failed to start game')
      const data = await response.json()
      setGameState(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const executeAction = useCallback(async (action: { type: string; cardId?: string; playerId?: string; fromZone?: string; toZone?: string }) => {
    if (!gameState) {
      setError('No game active')
      return
    }
    try {
      const response = await fetch(`/api/games/${gameState.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })
      if (!response.ok) throw new Error('Action failed')
      const data = await response.json()
      setGameState(data)
      setError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      console.error(err)
    }
  }, [gameState])

  const playCard = useCallback((cardId: string) => {
    executeAction({ type: 'PlayCard', cardId })
  }, [executeAction])

  const drawCard = useCallback(() => {
    executeAction({ type: 'Draw', playerId: 'player_1' })
  }, [executeAction])

  const shuffleDeck = useCallback(() => {
    executeAction({ type: 'Shuffle', playerId: 'player_1' })
  }, [executeAction])

  const endTurn = useCallback(() => {
    executeAction({ type: 'EndTurn' })
  }, [executeAction])

  const moveCard = useCallback((cardId: string, fromZone: 'hand' | 'battlefield' | 'library' | 'graveyard' | 'exile', toZone: 'hand' | 'battlefield' | 'library' | 'graveyard' | 'exile') => {
    executeAction({ type: 'MoveCard', cardId, fromZone, toZone, playerId: 'player_1' })
    setContextMenu(null)
  }, [executeAction])

  const updateCardPosition = useCallback((cardId: string, x: number, y: number, isOpponent: boolean) => {
    if (!gameState) return
    setGameState(prev => {
      if (!prev) return prev
      const updated = { ...prev }
      const cards = isOpponent ? updated.opponent.battlefield : updated.player.battlefield
      const card = cards.find(c => c.id === cardId)
      if (card) {
        card.x = x
        card.y = y
      }
      return updated
    })
  }, [gameState])

  const handleImport = async (cards: any[]) => {
    setLoading(true)
    setError(null)
    
    const enrichedCards: Card[] = []
    for (const card of cards) {
      if (!card.imageUrl) {
        try {
          await new Promise(resolve => setTimeout(resolve, 150))
          const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(card.name)}`)
          if (response.ok) {
            const data = await response.json()
            const imageUrl = data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal
            enrichedCards.push({ ...card, imageUrl })
            continue
          }
        } catch (err) {
          console.warn(`Failed to fetch image for ${card.name}:`, err)
        }
      } else {
        enrichedCards.push({ ...card, imageUrl: card.imageUrl })
        continue
      }
      enrichedCards.push(card)
    }
    
    setLoading(false)
    setShowImport(false)
    startGame(enrichedCards)
  }

  useEffect(() => {
    const enrichDefaultDeck = async () => {
      setLoading(true)
      const enrichedCards: Card[] = []
      
      for (const card of DEFAULT_DECK) {
        try {
          await new Promise(resolve => setTimeout(resolve, 50))
          const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(card.name)}`)
          if (response.ok) {
            const data = await response.json()
            const imageUrl = data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal
            enrichedCards.push({ ...card, imageUrl: imageUrl || card.imageUrl })
          } else {
            enrichedCards.push(card)
          }
        } catch (err) {
          console.warn(`Failed to fetch image for ${card.name}:`, err)
          enrichedCards.push(card)
        }
      }
      
      setLoading(false)
      startGame(enrichedCards)
    }
    
    enrichDefaultDeck()
  }, [startGame])

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 to-black flex flex-col items-center justify-center gap-8 p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-purple-400 mb-2">MTG Duel</h1>
          <p className="text-gray-400">Commander Battle</p>
        </div>
        {error && <div className="bg-red-900/50 text-red-300 p-4 rounded border border-red-600 max-w-sm text-center text-sm">{error}</div>}
        <div className="flex gap-4">
          <button
            onClick={() => startGame(DEFAULT_DECK)}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
          >
            New Game
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
          >
            Import Deck
          </button>
        </div>
        {showImport && <DeckImport onImport={handleImport} onClose={() => setShowImport(false)} />}
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#4f506b'
    }} className="h-screen w-screen flex flex-col overflow-hidden cursor-default select-none">

      <div className="h-12 bg-black/70 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="text-white font-bold">{gameState?.opponent.name || 'Opponent'} - {gameState?.opponent.life || 0} HP</div>
        <div className={`text-lg font-bold ${gameState?.isPlayerTurn ? 'text-green-400' : 'text-orange-400'}`}>
          Turn {gameState?.turn || 0} - {gameState?.isPlayerTurn ? 'Your Turn' : `${gameState?.opponent.name}'s Turn`}
        </div>
        <div className="text-white font-bold">{gameState?.player.name || 'Player'} - {gameState?.player.life || 0} HP</div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <OpponentArea gameState={gameState} setContextMenu={setContextMenu} setShowLibraryMenu={setShowLibraryMenu} showLibraryMenu={showLibraryMenu} setDraggedCard={setDraggedCard} draggedCard={draggedCard} moveCard={moveCard} updateCardPosition={updateCardPosition} />

        <PlayArea gameState={gameState} currentPhase={gameState.currentPhase} />

        <PlayerArea gameState={gameState} setContextMenu={setContextMenu} playCard={playCard} setShowLibraryMenu={setShowLibraryMenu} showLibraryMenu={showLibraryMenu} drawCard={drawCard} shuffleDeck={shuffleDeck} setDraggedCard={setDraggedCard} draggedCard={draggedCard} moveCard={moveCard} updateCardPosition={updateCardPosition} />
      </div>

      <GameControls gameState={gameState} endTurn={endTurn} startGame={startGame} DEFAULT_DECK={DEFAULT_DECK} setShowImport={setShowImport} />

      {showImport && <DeckImport onImport={handleImport} onClose={() => setShowImport(false)} />}

      {contextMenu && (
        <CardContextMenuComponent 
          contextMenu={contextMenu} 
          gameState={gameState}
          setContextMenu={setContextMenu}
          moveCard={moveCard}
        />
      )}
    </div>
  )
}

function DraggableCard({ card, zone, setContextMenu, setDraggedCard, containerRef, updateCardPosition, isOpponent }: any) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      const newX = Math.max(0, Math.min((card.x || 0) + deltaX, rect.width - 60))
      const newY = Math.max(0, Math.min((card.y || 0) + deltaY, rect.height - 80))
      
      card.x = newX
      card.y = newY
      setDragStart({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      updateCardPosition()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, card, containerRef, updateCardPosition])

  return (
    <div
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => {
        e.preventDefault()
        setContextMenu({ cardId: card.id, x: e.clientX, y: e.clientY, zone })
      }}
      className="absolute w-14 h-20 bg-gray-700 rounded border border-gray-500 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        left: `${card.x || 0}px`,
        top: `${card.y || 0}px`
      }}
    >
      {card.imageUrl ? (
        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
      ) : (
        <div className="text-gray-300 font-bold text-xs text-center">{card.name}</div>
      )}
    </div>
  )
}

function OpponentArea({ gameState, setContextMenu, setShowLibraryMenu, showLibraryMenu, setDraggedCard, draggedCard, moveCard, updateCardPosition }: any) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <div className="flex-1 flex gap-2 bg-black/20 p-2 overflow-hidden">
      <div className="w-20 flex flex-col gap-2">
        <StackedDeckDisplay count={gameState.opponent.library.length} />
        <div className="flex-1 flex flex-col gap-1 min-h-0">
          <div className="text-xs text-gray-300 font-bold">⚰️ {gameState.opponent.graveyard.length}</div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-1">
            {gameState.opponent.graveyard.slice(-3).map((card: Card) => (
              <SmallCardDisplay key={card.id} card={card} zone="graveyard" setContextMenu={setContextMenu} setDraggedCard={setDraggedCard} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1 min-h-0">
          <div className="text-xs text-gray-300 font-bold">🔒 {gameState.opponent.exile.length}</div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-1">
            {gameState.opponent.exile.slice(-3).map((card: Card) => (
              <SmallCardDisplay key={card.id} card={card} zone="exile" setContextMenu={setContextMenu} setDraggedCard={setDraggedCard} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        <div className="bg-black/30 rounded border border-gray-600 p-2">
          <div className="text-xs text-gray-400">🖐️ Hand ({gameState.opponent.hand.length})</div>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: Math.min(gameState.opponent.hand.length, 6) }).map((_, i) => (
              <div key={`opp-hand-${i}`} className="w-12 h-16 bg-blue-600/40 rounded border border-blue-400 flex items-center justify-center text-xs text-blue-200">
                🔒
              </div>
            ))}
          </div>
        </div>
        <div 
          ref={containerRef}
          className="flex-1 bg-gradient-to-br from-gray-900 to-black rounded border-2 border-gray-700 p-2 overflow-hidden relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (draggedCard && containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect()
              const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 60))
              const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 80))
              if (draggedCard.zone !== 'battlefield') {
                moveCard(draggedCard.cardId, draggedCard.zone, 'battlefield')
              }
              updateCardPosition(draggedCard.cardId, x, y, true)
            }
          }}
        >
          <div className="text-xs text-gray-500 mb-1">Opponent Battlefield</div>
          {gameState.opponent.battlefield.map((card: Card) => (
            <DraggableCard 
              key={card.id} 
              card={card} 
              zone="battlefield" 
              setContextMenu={setContextMenu} 
              setDraggedCard={setDraggedCard}
              containerRef={containerRef}
              updateCardPosition={() => updateCardPosition(card.id, card.x || 0, card.y || 0, true)}
              isOpponent={true}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PlayArea({ gameState, currentPhase }: any) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-black/50 px-4 py-2">
      <div className="flex gap-2">
        {PHASES.map((phase) => (
          <button
            key={phase}
            className={`px-4 py-2 rounded text-sm font-bold transition ${
              currentPhase === phase
                ? 'bg-purple-600 text-white border border-purple-400'
                : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {gameState.stack.length > 0 && (
        <div className="text-lg text-yellow-400 font-bold">
          📚 Stack: {gameState.stack.length}
        </div>
      )}
    </div>
  )
}

function PlayerArea({ gameState, setContextMenu, playCard, setShowLibraryMenu, showLibraryMenu, drawCard, shuffleDeck, setDraggedCard, draggedCard, moveCard, updateCardPosition }: any) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex-1 flex gap-2 bg-black/20 p-2 overflow-hidden">
      <div className="w-20 flex flex-col gap-2">
        <StackedDeckDisplay count={gameState.player.library.length} onClick={setShowLibraryMenu} />
        {showLibraryMenu && (
          <div className="bg-gray-800 rounded border border-purple-500 shadow-lg absolute z-50 mt-28">
            <button onClick={drawCard} className="block w-full px-2 py-1 text-left text-white hover:bg-purple-600 text-xs font-bold">
              📥 Draw
            </button>
            <button onClick={shuffleDeck} className="block w-full px-2 py-1 text-left text-white hover:bg-purple-600 text-xs font-bold border-t border-gray-600">
              🔀 Shuffle
            </button>
          </div>
        )}
        <div className="flex-1 flex flex-col gap-1 min-h-0">
          <div className="text-xs text-gray-300 font-bold">⚰️ {gameState.player.graveyard.length}</div>
          <div 
            className="flex-1 overflow-y-auto flex flex-col gap-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (draggedCard) moveCard(draggedCard.cardId, draggedCard.zone, 'graveyard')
            }}
          >
            {gameState.player.graveyard.slice(-3).map((card: Card) => (
              <SmallCardDisplay key={card.id} card={card} zone="graveyard" setContextMenu={setContextMenu} setDraggedCard={setDraggedCard} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1 min-h-0">
          <div className="text-xs text-gray-300 font-bold">🔒 {gameState.player.exile.length}</div>
          <div 
            className="flex-1 overflow-y-auto flex flex-col gap-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (draggedCard) moveCard(draggedCard.cardId, draggedCard.zone, 'exile')
            }}
          >
            {gameState.player.exile.slice(-3).map((card: Card) => (
              <SmallCardDisplay key={card.id} card={card} zone="exile" setContextMenu={setContextMenu} setDraggedCard={setDraggedCard} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        <div 
          ref={containerRef}
          className="flex-1 bg-gradient-to-br from-gray-900 to-black rounded border-2 border-gray-700 p-2 overflow-hidden relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (draggedCard && containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect()
              const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 60))
              const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 80))
              if (draggedCard.zone !== 'battlefield') {
                moveCard(draggedCard.cardId, draggedCard.zone, 'battlefield')
              }
              updateCardPosition(draggedCard.cardId, x, y, false)
            }
          }}
        >
          <div className="text-xs text-gray-500 mb-1">Your Battlefield</div>
          {gameState.player.battlefield.map((card: Card) => (
            <DraggableCard 
              key={card.id} 
              card={card} 
              zone="battlefield" 
              setContextMenu={setContextMenu} 
              setDraggedCard={setDraggedCard}
              containerRef={containerRef}
              updateCardPosition={() => updateCardPosition(card.id, card.x || 0, card.y || 0, false)}
              isOpponent={false}
            />
          ))}
        </div>

        <div className="bg-black/30 rounded border border-purple-500 p-2 h-28 overflow-hidden">
          <div className="text-xs text-gray-400 mb-1">🖐️ Hand ({gameState.player.hand.length})</div>
          <div 
            className="flex gap-1 overflow-x-auto h-full"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (draggedCard) moveCard(draggedCard.cardId, draggedCard.zone, 'hand')
            }}
          >
            {gameState.player.hand.map((card: Card) => (
              <div
                key={card.id}
                draggable
                onDragStart={() => setDraggedCard({ cardId: card.id, zone: 'hand' })}
                onDragEnd={() => setDraggedCard(null)}
                onClick={() => gameState.isPlayerTurn && playCard(card.id)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setContextMenu({ cardId: card.id, x: e.clientX, y: e.clientY, zone: 'hand' })
                }}
                className={`flex-shrink-0 w-14 h-20 rounded border-2 flex items-center justify-center text-xs overflow-hidden cursor-move transition ${
                  gameState.isPlayerTurn
                    ? 'border-purple-500 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/50 hover:opacity-80'
                    : 'border-gray-600 opacity-50'
                }`}
              >
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-purple-300">
                    <div className="font-bold text-xs">{card.name}</div>
                    <div className="text-blue-300">💎 {card.manaCost}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function GameControls({ gameState, endTurn, startGame, DEFAULT_DECK, setShowImport }: any) {
  return (
    <div className="h-12 bg-black/50 border-t border-gray-700 flex items-center justify-between px-4 gap-2">
      <div className="text-sm text-gray-400">MTG Duel - Commander</div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowImport(true)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition"
        >
          📥 Import
        </button>
        {gameState.isPlayerTurn && (
          <button
            onClick={endTurn}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition"
          >
            🏁 End Turn
          </button>
        )}
        <button
          onClick={() => startGame(DEFAULT_DECK)}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold rounded transition"
        >
          🔄 New Game
        </button>
      </div>
    </div>
  )
}

function StackedDeckDisplay({ count, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-blue-600/20 rounded border border-blue-500 p-2 cursor-pointer hover:bg-blue-600/30 transition h-20 flex items-center justify-center"
    >
      <div className="relative w-12 h-16">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-full h-full bg-blue-600 rounded border border-blue-400"
            style={{ transform: `translateY(${i * 2}px) translateX(${i * 1}px)` }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xs">{count}</span>
        </div>
      </div>
    </div>
  )
}

function SmallCardDisplay({ card, zone, setContextMenu, setDraggedCard }: any) {
  return (
    <div
      draggable
      onDragStart={() => setDraggedCard({ cardId: card.id, zone })}
      onDragEnd={() => setDraggedCard(null)}
      onContextMenu={(e) => {
        e.preventDefault()
        setContextMenu({ cardId: card.id, x: e.clientX, y: e.clientY, zone })
      }}
      className="w-full h-12 bg-gray-700 rounded border border-gray-500 flex items-center justify-center overflow-hidden cursor-move text-xs hover:opacity-80"
    >
      {card.imageUrl ? (
        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover opacity-70" />
      ) : (
        <div className="text-gray-300 font-bold text-xs text-center px-1">{card.name}</div>
      )}
    </div>
  )
}

function CardThumbnail({ card, zone, setContextMenu, setDraggedCard }: any) {
  return (
    <div
      draggable
      onDragStart={() => setDraggedCard({ cardId: card.id, zone })}
      onDragEnd={() => setDraggedCard(null)}
      onContextMenu={(e) => {
        e.preventDefault()
        setContextMenu({ cardId: card.id, x: e.clientX, y: e.clientY, zone })
      }}
      className="w-14 h-20 bg-gray-700 rounded border border-gray-500 flex items-center justify-center overflow-hidden cursor-move flex-shrink-0 hover:opacity-80"
    >
      {card.imageUrl ? (
        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
      ) : (
        <div className="text-gray-300 font-bold text-xs text-center">{card.name}</div>
      )}
    </div>
  )
}

function CardContextMenuComponent({ contextMenu, gameState, setContextMenu, moveCard }: any) {
  const card = contextMenu.zone === 'battlefield'
    ? gameState.player.battlefield.find((c: Card) => c.id === contextMenu.cardId) || gameState.opponent.battlefield.find((c: Card) => c.id === contextMenu.cardId)
    : contextMenu.zone === 'hand'
    ? gameState.player.hand.find((c: Card) => c.id === contextMenu.cardId) || gameState.opponent.hand.find((c: Card) => c.id === contextMenu.cardId)
    : contextMenu.zone === 'graveyard'
    ? gameState.player.graveyard.find((c: Card) => c.id === contextMenu.cardId) || gameState.opponent.graveyard.find((c: Card) => c.id === contextMenu.cardId)
    : contextMenu.zone === 'exile'
    ? gameState.player.exile.find((c: Card) => c.id === contextMenu.cardId) || gameState.opponent.exile.find((c: Card) => c.id === contextMenu.cardId)
    : null

  const isLand = card?.type.includes('Land')

  return (
    <div
      className="fixed bg-gray-800 rounded border border-purple-500 shadow-lg z-50 py-1 min-w-40 text-xs"
      style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
      onMouseLeave={() => setContextMenu(null)}
    >
      {contextMenu.zone === 'battlefield' && isLand && (
        <button
          onClick={() => moveCard(contextMenu.cardId, 'battlefield', 'battlefield')}
          className="block w-full px-2 py-1 text-left text-white hover:bg-purple-600 font-bold border-b border-gray-600"
        >
          🗡️ To Creatures
        </button>
      )}
      {contextMenu.zone === 'battlefield' && !isLand && (
        <button
          onClick={() => moveCard(contextMenu.cardId, 'battlefield', 'battlefield')}
          className="block w-full px-2 py-1 text-left text-white hover:bg-purple-600 font-bold border-b border-gray-600"
        >
          🌲 To Lands
        </button>
      )}
      {contextMenu.zone !== 'graveyard' && (
        <button
          onClick={() => moveCard(contextMenu.cardId, contextMenu.zone, 'graveyard')}
          className="block w-full px-2 py-1 text-left text-white hover:bg-purple-600 font-bold border-b border-gray-600"
        >
          ⚰️ To Graveyard
        </button>
      )}
      {contextMenu.zone !== 'exile' && (
        <button
          onClick={() => moveCard(contextMenu.cardId, contextMenu.zone, 'exile')}
          className="block w-full px-2 py-1 text-left text-white hover:bg-purple-600 font-bold border-b border-gray-600"
        >
          🔒 To Exile
        </button>
      )}
      {contextMenu.zone !== 'library' && (
        <button
          onClick={() => moveCard(contextMenu.cardId, contextMenu.zone, 'library')}
          className="block w-full px-2 py-1 text-left text-white hover:bg-purple-600 font-bold border-b border-gray-600"
        >
          📚 To Library
        </button>
      )}
      {contextMenu.zone !== 'hand' && (
        <button
          onClick={() => moveCard(contextMenu.cardId, contextMenu.zone, 'hand')}
          className="block w-full px-2 py-1 text-left text-white hover:bg-purple-600 font-bold"
        >
          🖐️ To Hand
        </button>
      )}
    </div>
  )
}
