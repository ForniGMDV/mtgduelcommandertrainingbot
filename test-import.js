const cards = [
  'Lightning Bolt', 'Counterspell', 'Giant Growth', 'Grizzly Bears', 'Stone Rain',
  'Goblin Assault Team', 'Dark Ritual', 'Swamp', 'Mountain', 'Forest'
];

let deckText = '';
for (let i = 0; i < 10; i++) {
  cards.forEach(card => {
    deckText += `1 ${card}\n`;
  });
}
deckText += '1 Emrakul the Aeons Torn';

fetch('http://localhost:3001/api/decks/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ deckText })
})
  .then(r => r.json())
  .then(data => {
    console.log('First card:', data.cards[0]);
    console.log('\nCards with images:');
    data.cards.filter(c => c.imageUrl).slice(0, 3).forEach(c => {
      console.log(`- ${c.name}: ${c.imageUrl?.substring(0, 80)}...`);
    });
  })
  .catch(e => console.error('Error:', e.message));
