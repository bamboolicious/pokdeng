#!/usr/bin/env node

const PokDengBot = require('./src/pokdeng-bot')

console.log('🃏 Pok Deng Bot Demo\n')

const bot = new PokDengBot()

// Demo scenarios - all with 2 cards only (we never know the 3rd card)
const scenarios = [
  {
    name: '💎 Pok 9 - Best Hand',
    playerCards: [
      { rank: 'A', suit: '♥️' },
      { rank: '8', suit: '♠️' },
    ],
  },
  {
    name: '🔥 Pok 8 - Strong Hand',
    playerCards: [
      { rank: '3', suit: '♥️' },
      { rank: '5', suit: '♠️' },
    ],
  },
  {
    name: '👍 Good Score (7)',
    playerCards: [
      { rank: '3', suit: '♥️' },
      { rank: '4', suit: '♠️' },
    ],
  },
  {
    name: '🤔 Medium Score (5)',
    playerCards: [
      { rank: '2', suit: '♥️' },
      { rank: '3', suit: '♠️' },
    ],
  },
  {
    name: '😬 Low Score (2)',
    playerCards: [
      { rank: '2', suit: '♥️' },
      { rank: 'K', suit: '♠️' },
    ],
  },
]

scenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`)

  // Convert suit symbols back to text for the bot
  const convertSuit = (suit) => {
    if (suit === '♥️') return 'hearts'
    if (suit === '♠️') return 'spades'
    if (suit === '♦️') return 'diamonds'
    return 'clubs'
  }

  const botCards = scenario.playerCards.map((card) => ({
    ...card,
    suit: convertSuit(card.suit),
  }))

  const score = bot.calculateScore(botCards)
  const special = bot.checkSpecialHands(botCards)
  const decision = bot.makeDecision(botCards)

  console.log(`   Cards: ${scenario.playerCards.map((c) => c.rank + c.suit).join(', ')}`)
  console.log(`   Score: ${score}${special.isPok ? ' (Pok!)' : ''}${special.isDeng ? ' (Deng!)' : ''}`)
  console.log(`   Decision: ${decision.action.toUpperCase()} (${Math.round(decision.confidence * 100)}% confidence)`)
  console.log(`   Reasoning: ${decision.reasoning}\n`)
})

console.log('🚀 Server is running on http://localhost:3000')
console.log('📡 Try the API:')
console.log('   Health: curl http://localhost:3000/health')
console.log('   Rules:  curl http://localhost:3000/rules')
console.log(
  '   Multi-hand: curl -X POST http://localhost:3000/decide -H "Content-Type: application/json" -d \'{"playHands":[[{"number":1,"suit":"hearts"},{"number":8,"suit":"spades"}],[{"number":2,"suit":"hearts"},{"number":13,"suit":"spades"}]],"knownHands":[]}\''
)
console.log(
  '   Single hand: curl -X POST http://localhost:3000/decide-single -H "Content-Type: application/json" -d \'{"playerCards":[{"rank":"A","suit":"hearts"},{"rank":"8","suit":"spades"}]}\''
)
