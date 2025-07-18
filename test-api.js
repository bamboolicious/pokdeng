#!/usr/bin/env node

// Test the updated Pok Deng Bot API with the new request/response format

console.log('🧪 Testing Pok Deng Bot Multi-Hand API\n')

const testCases = [
  {
    name: 'Basic Four-Hand Test',
    request: {
      playHands: [
        [
          { number: 1, suit: 'hearts' },
          { number: 2, suit: 'hearts' },
        ], // Ace + 2 = 3 → hit
        [
          { number: 3, suit: 'spades' },
          { number: 4, suit: 'spades' },
        ], // 3 + 4 = 7 → stand
        [
          { number: 5, suit: 'diamonds' },
          { number: 6, suit: 'diamonds' },
        ], // 5 + 6 = 11 % 10 = 1 → hit
        [
          { number: 1, suit: 'clubs' },
          { number: 1, suit: 'clubs' },
        ], // Ace + Ace = 2 → hit
      ],
      knownHands: [
        [
          { number: 1, suit: 'hearts' },
          { number: 2, suit: 'hearts' },
        ],
        [
          { number: 3, suit: 'spades' },
          { number: 4, suit: 'spades' },
        ],
        [
          { number: 5, suit: 'diamonds' },
          { number: 6, suit: 'diamonds' },
        ],
        [
          { number: 1, suit: 'clubs' },
          { number: 1, suit: 'clubs' },
        ],
      ],
    },
    expectedResponse: ['hit', 'stand', 'hit', 'hit'],
  },
  {
    name: 'Face Cards Test (Jack=11, Queen=12, King=13)',
    request: {
      playHands: [
        [
          { number: 1, suit: 'hearts' },
          { number: 8, suit: 'spades' },
        ], // Ace + 8 = Pok 9 → stand
        [
          { number: 2, suit: 'hearts' },
          { number: 13, suit: 'spades' },
        ], // 2 + King(0) = 2 → hit
        [
          { number: 11, suit: 'hearts' },
          { number: 12, suit: 'spades' },
        ], // Jack(0) + Queen(0) = 0 → hit
        [
          { number: 7, suit: 'diamonds' },
          { number: 2, suit: 'clubs' },
        ], // 7 + 2 = Pok 9 → stand
      ],
      knownHands: [],
    },
    expectedResponse: ['stand', 'hit', 'hit', 'stand'],
  },
  {
    name: 'Pok Hands Test',
    request: {
      playHands: [
        [
          { number: 1, suit: 'hearts' },
          { number: 8, suit: 'spades' },
        ], // Pok 9 → stand
        [
          { number: 3, suit: 'hearts' },
          { number: 5, suit: 'spades' },
        ], // Pok 8 → stand
        [
          { number: 4, suit: 'hearts' },
          { number: 4, suit: 'spades' },
        ], // Pok 8 → stand
        [
          { number: 6, suit: 'hearts' },
          { number: 3, suit: 'spades' },
        ], // Pok 9 → stand
      ],
      knownHands: [],
    },
    expectedResponse: ['stand', 'stand', 'stand', 'stand'],
  },
]

function runTests() {
  console.log('📋 Test Cases:\n')

  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`)
    console.log('   Request Body:')
    console.log(JSON.stringify(testCase.request, null, 2))
    console.log(`   Expected Response: ${JSON.stringify(testCase.expectedResponse)}`)
    console.log('   \n   Curl Command:')
    console.log(`   curl -X POST http://localhost:3000/decide \\`)
    console.log(`     -H "Content-Type: application/json" \\`)
    console.log(`     -d '${JSON.stringify(testCase.request)}'`)
    console.log('\n' + '─'.repeat(80) + '\n')
  })

  console.log('🎯 Card Number Mapping:')
  console.log('   Ace = 1 (value: 1 point)')
  console.log('   2-9 = 2-9 (value: face value)')
  console.log('   10 = 10 (value: 0 points)')
  console.log('   Jack = 11 (value: 0 points)')
  console.log('   Queen = 12 (value: 0 points)')
  console.log('   King = 13 (value: 0 points)')

  console.log('\n📊 API Endpoints:')
  console.log('   Health: GET http://localhost:3000/health')
  console.log('   Rules: GET http://localhost:3000/rules')
  console.log('   Multi-hand Decisions: POST http://localhost:3000/decide')
}

if (require.main === module) {
  runTests()
}
