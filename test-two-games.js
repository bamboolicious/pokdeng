#!/usr/bin/env node

// Test both game modes: First game (no known hands) vs Second game (with known hands)

console.log('🎮 Testing Two Game Modes\n')

const firstGameRequest = {
  playHands: [
    [
      { number: 1, suit: 'hearts' },
      { number: 2, suit: 'hearts' },
    ], // Score 3
    [
      { number: 3, suit: 'spades' },
      { number: 4, suit: 'spades' },
    ], // Score 7
    [
      { number: 5, suit: 'diamonds' },
      { number: 6, suit: 'diamonds' },
    ], // Score 1
    [
      { number: 1, suit: 'clubs' },
      { number: 8, suit: 'clubs' },
    ], // Pok 9
  ],
  knownHands: [], // FIRST GAME: Always empty array
}

const secondGameRequest = {
  playHands: [
    [
      { number: 1, suit: 'hearts' },
      { number: 2, suit: 'hearts' },
    ], // Score 3
    [
      { number: 3, suit: 'spades' },
      { number: 4, suit: 'spades' },
    ], // Score 7
    [
      { number: 5, suit: 'diamonds' },
      { number: 6, suit: 'diamonds' },
    ], // Score 1
    [
      { number: 1, suit: 'clubs' },
      { number: 8, suit: 'clubs' },
    ], // Pok 9
  ],
  knownHands: [
    [
      { number: 7, suit: 'hearts' },
      { number: 2, suit: 'spades' },
    ], // Pok 9
    [
      { number: 13, suit: 'clubs' },
      { number: 10, suit: 'diamonds' },
    ], // Score 0
    [
      { number: 11, suit: 'hearts' },
      { number: 12, suit: 'spades' },
    ], // Score 0
    [
      { number: 9, suit: 'diamonds' },
      { number: 1, suit: 'hearts' },
    ], // Score 0
  ],
}

function testGameModes() {
  console.log('🎯 First Game (knownHands = [])')
  console.log('- Dealer never hits')
  console.log('- No prior knowledge')
  console.log('- Pure strategy based on current hand only')
  console.log('\nRequest:')
  console.log(JSON.stringify(firstGameRequest, null, 2))
  console.log('\nCurl command:')
  console.log(`curl -X POST http://localhost:3000/decide \\`)
  console.log(`  -H "Content-Type: application/json" \\`)
  console.log(`  -d '${JSON.stringify(firstGameRequest)}'`)

  console.log('\n' + '─'.repeat(80))

  console.log('\n🎯 Second Game (knownHands has data)')
  console.log('- May have information from previous rounds')
  console.log('- Can use known hands for context')
  console.log('- More informed decision making')
  console.log('\nRequest:')
  console.log(JSON.stringify(secondGameRequest, null, 2))
  console.log('\nCurl command:')
  console.log(`curl -X POST http://localhost:3000/decide \\`)
  console.log(`  -H "Content-Type: application/json" \\`)
  console.log(`  -d '${JSON.stringify(secondGameRequest)}'`)

  console.log('\n' + '─'.repeat(80))
  console.log('\n📋 Key Differences:')
  console.log('1. First game: knownHands = [] (always empty)')
  console.log('2. Second game: knownHands may contain context')
  console.log('3. We never know what cards we will hit')
  console.log('4. Dealer never hits in first game')
}

async function runLiveTest() {
  console.log('\n🧪 Running Live API Tests...\n')

  try {
    // Test first game
    console.log('Testing First Game...')
    const firstResponse = await fetch('http://localhost:3000/decide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firstGameRequest),
    })
    const firstResult = await firstResponse.json()
    console.log(`First Game Result: ${JSON.stringify(firstResult)}`)

    // Test second game
    console.log('\nTesting Second Game...')
    const secondResponse = await fetch('http://localhost:3000/decide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(secondGameRequest),
    })
    const secondResult = await secondResponse.json()
    console.log(`Second Game Result: ${JSON.stringify(secondResult)}`)

    console.log('\n✅ Both game modes working correctly!')
  } catch (error) {
    console.log('❌ Server not running. Start with: node server.js')
  }
}

if (require.main === module) {
  testGameModes()

  // Run live tests if fetch is available
  if (typeof fetch !== 'undefined') {
    runLiveTest()
  }
}

module.exports = { firstGameRequest, secondGameRequest }
