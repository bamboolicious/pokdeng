// Multi-hand Pok Deng Bot API Examples

const multiHandExamples = [
  {
    name: 'Four different hands with varying strengths',
    request: {
      playHands: [
        [
          { number: 1, suit: 'hearts' },
          { number: 8, suit: 'spades' },
        ], // Pok 9 - should stand
        [
          { number: 2, suit: 'hearts' },
          { number: 13, suit: 'spades' },
        ], // Score 2 - should hit
        [
          { number: 3, suit: 'hearts' },
          { number: 4, suit: 'spades' },
        ], // Score 7 - should stand
        [
          { number: 1, suit: 'clubs' },
          { number: 2, suit: 'diamonds' },
        ], // Score 3 - should hit
      ],
      knownHands: [],
    },
    expectedResponse: ['stand', 'hit', 'stand', 'hit'],
  },
  {
    name: 'Three hands with context from known hands',
    request: {
      playHands: [
        [
          { number: 5, suit: 'hearts' },
          { number: 4, suit: 'spades' },
        ], // Score 9 - should stand
        [
          { number: 6, suit: 'hearts' },
          { number: 1, suit: 'spades' },
        ], // Score 7 - should stand
        [
          { number: 2, suit: 'hearts' },
          { number: 2, suit: 'spades' },
        ], // Score 4 - should hit
      ],
      knownHands: [
        [
          { number: 1, suit: 'hearts' },
          { number: 8, suit: 'hearts' },
        ], // Pok 9
        [
          { number: 10, suit: 'spades' },
          { number: 10, suit: 'clubs' },
        ], // Score 0
        [
          { number: 7, suit: 'diamonds' },
          { number: 2, suit: 'diamonds' },
        ], // Score 9
      ],
    },
    expectedResponse: ['stand', 'stand', 'hit'],
  },
]

// Function to generate curl commands for testing
function generateMultiHandCurlCommands() {
  console.log('=== MULTI-HAND POK DENG BOT API EXAMPLES ===\n')

  multiHandExamples.forEach((example, index) => {
    console.log(`--- Example ${index + 1}: ${example.name} ---`)
    console.log(`Expected response: ${JSON.stringify(example.expectedResponse)}`)
    console.log(`\nCurl command:`)
    console.log(`curl -X POST http://localhost:3000/decide \\`)
    console.log(`  -H "Content-Type: application/json" \\`)
    console.log(`  -d '${JSON.stringify(example.request)}'`)
    console.log()
  })
}

// Function to test the new API format directly with Node.js
async function testMultiHandAPI() {
  console.log('=== TESTING MULTI-HAND API ===\n')

  // Test if server is running
  try {
    const response = await fetch('http://localhost:3000/health')
    if (!response.ok) {
      console.log('❌ Server is not running. Start it with: npm start')
      return
    }
    console.log('✅ Server is running\n')
  } catch (error) {
    console.log('❌ Server is not running. Start it with: npm start')
    return
  }

  // Test each example
  for (const [index, example] of multiHandExamples.entries()) {
    console.log(`Testing Example ${index + 1}: ${example.name}`)

    try {
      const response = await fetch('http://localhost:3000/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(example.request),
      })

      const result = await response.json()
      console.log(`Expected: ${JSON.stringify(example.expectedResponse)}`)
      console.log(`Actual:   ${JSON.stringify(result)}`)
      console.log(`Match:    ${JSON.stringify(result) === JSON.stringify(example.expectedResponse) ? '✅' : '❌'}\n`)
    } catch (error) {
      console.log(`❌ Error testing example ${index + 1}:`, error.message)
    }
  }
}

// Export for use in other files
module.exports = {
  multiHandExamples,
  generateMultiHandCurlCommands,
  testMultiHandAPI,
}

// Run examples if called directly
if (require.main === module) {
  generateMultiHandCurlCommands()

  // If fetch is available (Node.js 18+), run API tests
  if (typeof fetch !== 'undefined') {
    testMultiHandAPI()
  }
}
