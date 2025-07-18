// Example usage of the Pok Deng Bot API

const examples = [
  {
    name: 'Pok 9 - Best possible hand',
    playerCards: [
      { rank: 'A', suit: 'hearts' },
      { rank: '8', suit: 'spades' },
    ],
    expected: 'stand',
  },
  {
    name: 'Pok 8 - Very strong hand',
    playerCards: [
      { rank: '3', suit: 'hearts' },
      { rank: '5', suit: 'spades' },
    ],
    expected: 'stand',
  },
  {
    name: 'Good score of 7',
    playerCards: [
      { rank: '3', suit: 'hearts' },
      { rank: '4', suit: 'spades' },
    ],
    expected: 'stand',
  },
  {
    name: 'Medium score of 6',
    playerCards: [
      { rank: '2', suit: 'hearts' },
      { rank: '4', suit: 'spades' },
    ],
    expected: 'hit or stand (depends on strategy)',
  },
  {
    name: 'Low score of 3',
    playerCards: [
      { rank: 'A', suit: 'hearts' },
      { rank: '2', suit: 'spades' },
    ],
    expected: 'hit',
  },
  {
    name: 'Very low score of 1',
    playerCards: [
      { rank: 'A', suit: 'hearts' },
      { rank: 'K', suit: 'spades' },
    ],
    expected: 'hit',
  },
  {
    name: 'Three cards with Deng (same suit)',
    playerCards: [
      { rank: '2', suit: 'hearts' },
      { rank: '5', suit: 'hearts' },
      { rank: '8', suit: 'hearts' },
    ],
    expected: 'stand (forced - 3 cards max)',
  },
  {
    name: 'Three cards without Deng',
    playerCards: [
      { rank: '2', suit: 'hearts' },
      { rank: '3', suit: 'spades' },
      { rank: '4', suit: 'clubs' },
    ],
    expected: 'stand (forced - 3 cards max)',
  },
]

// Function to test the API with curl commands
function generateCurlCommands() {
  examples.forEach((example, index) => {
    const payload = {
      playerCards: example.playerCards,
      dealerCards: [],
      gameState: {},
    }

    console.log(`\n--- Example ${index + 1}: ${example.name} ---`)
    console.log(`Expected: ${example.expected}`)
    console.log(`\nCurl command:`)
    console.log(`curl -X POST http://localhost:3000/decide \\`)
    console.log(`  -H "Content-Type: application/json" \\`)
    console.log(`  -d '${JSON.stringify(payload)}'`)
  })
}

// Function to test with dealer cards
function generateDealerExamples() {
  const dealerExamples = [
    {
      name: 'Player has medium hand, dealer shows Pok',
      playerCards: [
        { rank: '3', suit: 'hearts' },
        { rank: '3', suit: 'spades' },
      ],
      dealerCards: [
        { rank: 'A', suit: 'clubs' },
        { rank: '8', suit: 'diamonds' },
      ],
    },
    {
      name: 'Player has good hand, dealer shows weak card',
      playerCards: [
        { rank: '4', suit: 'hearts' },
        { rank: '3', suit: 'spades' },
      ],
      dealerCards: [{ rank: 'K', suit: 'clubs' }],
    },
  ]

  console.log(`\n\n=== DEALER CARD EXAMPLES ===`)

  dealerExamples.forEach((example, index) => {
    const payload = {
      playerCards: example.playerCards,
      dealerCards: example.dealerCards,
      gameState: {},
    }

    console.log(`\n--- Dealer Example ${index + 1}: ${example.name} ---`)
    console.log(`\nCurl command:`)
    console.log(`curl -X POST http://localhost:3000/decide \\`)
    console.log(`  -H "Content-Type: application/json" \\`)
    console.log(`  -d '${JSON.stringify(payload)}'`)
  })
}

if (require.main === module) {
  console.log('=== POK DENG BOT API EXAMPLES ===')
  console.log('Start the server with: npm start')
  console.log('Then run these curl commands to test different scenarios:')

  generateCurlCommands()
  generateDealerExamples()

  console.log(`\n\n=== OTHER ENDPOINTS ===`)
  console.log(`Health check: curl http://localhost:3000/health`)
  console.log(`Game rules: curl http://localhost:3000/rules`)
}

module.exports = { examples, generateCurlCommands, generateDealerExamples }
