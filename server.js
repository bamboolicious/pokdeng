const express = require('express')
const cors = require('cors')
const PokDengBot = require('./src/pokdeng-bot')

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize the bot
const bot = new PokDengBot()

// Helper function to convert number format to rank format
function convertCardNumberToRank(number) {
  if (number === 1) return 'A'
  if (number >= 2 && number <= 9) return number.toString()
  if (number === 10) return '10'
  if (number === 11) return 'J'
  if (number === 12) return 'Q'
  if (number === 13) return 'K'
  return number.toString()
}

// Helper function to convert a hand from number format to rank format
function convertHandFormat(hand) {
  return hand.map((card) => ({
    rank: convertCardNumberToRank(card.number),
    suit: card.suit,
  }))
}

// Routes
app.post('/', (req, res) => {
  try {
    const { playHands, gameType } = req.body

    // Validate input
    if (!playHands || !Array.isArray(playHands) || playHands.length === 0) {
      return res.status(400).json({
        error: 'Invalid input: playHands must be a non-empty array',
      })
    }

    // Validate that each hand is an array of cards
    for (let i = 0; i < playHands.length; i++) {
      if (!Array.isArray(playHands[i]) || playHands[i].length === 0) {
        return res.status(400).json({
          error: `Invalid input: playHands[${i}] must be a non-empty array of cards`,
        })
      }
    }

    // Process each hand and make decisions
    const decisions = playHands.map((hand, index) => {
      // Convert number format to rank format for the bot
      const convertedHand = convertHandFormat(hand)

      // Game mode detection based on knownHands
      const isFirstGame = gameType === 1

      // For first game: no known cards (dealer never hits, pure strategy)
      // For second game: use known hands for context
      const contextCards = isFirstGame ? [] : playHands.filter((_, knownIndex) => knownIndex !== index).flat()

      const convertedKnownCards = convertHandFormat(contextCards)

      // Pass game mode information to the bot
      const gameState = {
        isFirstGame,
        handIndex: index,
        totalHands: playHands.length,
      }

      const decision = bot.makeDecision(convertedHand, convertedKnownCards, gameState)
      return decision.action
    })

    res.json(decisions)
  } catch (error) {
    console.error('Error making decision:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

app.post('/all-hit', (req, res) => {
  try {
    const { playHands } = req.body
    if (!playHands || !Array.isArray(playHands) || playHands.length === 0) {
      return res.status(400).json({
        error: 'Invalid input: playHands must be a non-empty array',
      })
    }

    const decisions = playHands.map(() => 'hit')
    res.json(decisions)
  } catch (error) {
    console.error('Error making decision:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

app.post('/all-stand', (req, res) => {
  try {
    const { playHands } = req.body
    if (!playHands || !Array.isArray(playHands) || playHands.length === 0) {
      return res.status(400).json({
        error: 'Invalid input: playHands must be a non-empty array',
      })
    }
    const decisions = playHands.map(() => 'stand')
    res.json(decisions)
  } catch (error) {
    console.error('Error making decision:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

app.post('/all-random', (req, res) => {
  try {
    const { playHands } = req.body
    if (!playHands || !Array.isArray(playHands) || playHands.length === 0) {
      return res.status(400).json({
        error: 'Invalid input: playHands must be a non-empty array',
      })
    }
    const decisions = playHands.map(() => (Math.random() < 0.5 ? 'hit' : 'stand'))
    res.json(decisions)
  } catch (error) {
    console.error('Error making decision:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

app.post('/test', (req, res) => {
  try {
    const { iterations = 10 } = req.body

    // Function to generate random card
    function generateRandomCard() {
      const suits = ['hearts', 'diamonds', 'clubs', 'spades']
      return {
        number: Math.floor(Math.random() * 13) + 1,
        suit: suits[Math.floor(Math.random() * suits.length)],
      }
    }

    // Function to create a single player hand (2 cards)
    function createPlayerHand() {
      const hand = []
      for (let j = 0; j < 2; j++) {
        hand.push(generateRandomCard())
      }
      return hand
    }

    // Function to create 100 player hands for batch processing
    function create100PlayerHands() {
      const hands = []
      for (let i = 0; i < 100; i++) {
        hands.push(createPlayerHand())
      }
      return hands
    }

    let totalWins = 0
    let totalGames = 0
    const allResults = []

    // Run iterations (each iteration processes 100 hands)
    const promises = []
    for (let iteration = 0; iteration < iterations; iteration++) {
      const playHands = create100PlayerHands()
      const knownHands = [] // First game mode - empty knownHands

      // Make request to external API with 100 hands
      const requestBody = { playHands, knownHands }

      const promise = fetch('https://j48qnj1z-3000.asse.devtunnels.ms/api/game1/decide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => response.json())
        .then((decisions) => {
          // Helper function to check if all cards are royals (J, Q, K)
          function hasAllRoyals(hand) {
            return hand.every((card) => card.number >= 11 && card.number <= 13)
          }

          // Helper function to calculate hand score
          function calculateHandScore(hand) {
            return (
              hand.reduce((sum, card) => {
                const value = card.number === 1 ? 1 : card.number >= 10 ? 0 : card.number
                return sum + value
              }, 0) % 10
            )
          }

          // Helper function to check for ตอง (Three of a kind) - must have 3 cards
          function hasTong(hand) {
            if (hand.length !== 3) return false
            const numbers = hand.map((card) => card.number)
            return numbers[0] === numbers[1] && numbers[1] === numbers[2]
          }

          // Helper function to check for เรียง (Straight) - must have 3 cards
          function hasStraight(hand) {
            if (hand.length !== 3) return false
            const numbers = hand.map((card) => card.number).sort((a, b) => a - b)
            // Check for consecutive numbers, but not [12,13,1] wrap-around
            return (
              numbers[1] === numbers[0] + 1 &&
              numbers[2] === numbers[1] + 1 &&
              !(numbers[0] === 1 && numbers[1] === 12 && numbers[2] === 13)
            )
          }

          // Helper function to check for ผี (Ghost) - must have 3 cards and ALL must be royal
          function hasGhost(hand) {
            return hand.length === 3 && hand.every((card) => card.number >= 11 && card.number <= 13)
          }

          // Helper function to check for เด้ง Number (same numbers)
          function getDengNumber(hand) {
            const numbers = hand.map((card) => card.number)
            const numberCounts = {}
            numbers.forEach((num) => {
              numberCounts[num] = (numberCounts[num] || 0) + 1
            })

            const maxCount = Math.max(...Object.values(numberCounts))
            if (maxCount >= 2) return maxCount
            return 0
          }

          // Helper function to check for เด้ง Suit (same suit)
          function getDengSuit(hand) {
            const suits = hand.map((card) => card.suit)
            const suitCounts = {}
            suits.forEach((suit) => {
              suitCounts[suit] = (suitCounts[suit] || 0) + 1
            })

            const maxCount = Math.max(...Object.values(suitCounts))
            if (maxCount >= 2) return maxCount
            return 0
          }

          // Helper function to get hand rank and multiplier
          function getHandRank(hand) {
            const score = calculateHandScore(hand)

            // Check for ตอง (Three of a kind) - x5
            if (hasTong(hand)) {
              return { rank: 8, multiplier: 5, description: 'ตอง (Three of a kind)', score, tieBreaker: hand[0].number }
            }

            // Check for เรียง (Straight) - x3
            if (hasStraight(hand)) {
              const numbers = hand.map((card) => card.number).sort((a, b) => b - a)
              return { rank: 7, multiplier: 3, description: 'เรียง (Straight)', score, tieBreaker: numbers[0] }
            }

            // Check for ผี (Ghost) - x3
            if (hasGhost(hand)) {
              return { rank: 6, multiplier: 3, description: 'ผี (Ghost)', score, tieBreaker: 0 }
            }

            // Check for เด้ง Number (same numbers)
            const dengNumber = getDengNumber(hand)
            if (dengNumber === 3) {
              // This should be ตอง, but just in case
              return { rank: 8, multiplier: 5, description: 'ตอง (Three numbers)', score, tieBreaker: hand[0].number }
            } else if (dengNumber === 2) {
              const numbers = hand.map((card) => card.number)
              const repeatedNumber = numbers.find((num, index) => numbers.indexOf(num) !== index)
              return { rank: 5, multiplier: 2, description: 'เด้ง Number (Pair)', score, tieBreaker: repeatedNumber }
            }

            // Check for เด้ง Suit (same suit)
            const dengSuit = getDengSuit(hand)
            if (dengSuit === 3) {
              return { rank: 4, multiplier: 3, description: 'เด้ง Suit (3 cards)', score, tieBreaker: score }
            } else if (dengSuit === 2) {
              return { rank: 3, multiplier: 2, description: 'เด้ง Suit (2 cards)', score, tieBreaker: score }
            }

            // Regular score
            return { rank: 1, multiplier: 1, description: 'Regular score', score, tieBreaker: score }
          }

          // Process each of the 100 hands
          let batchWins = 0
          const batchResults = []

          for (let handIndex = 0; handIndex < playHands.length; handIndex++) {
            const playerHand = [...playHands[handIndex]]
            const playerDecision = decisions[handIndex]

            // Apply player's decision - ALL players can hit based on their decision
            if (playerDecision === 'hit') {
              const newCard = generateRandomCard()
              playerHand.push(newCard)
            }

            // Generate dealer hand (2 cards, dealer NEVER hits)
            const dealerHand = createPlayerHand()

            // Get hand rankings using Thai Pok Deng rules
            const playerRank = getHandRank(playerHand)
            const dealerRank = getHandRank(dealerHand)

            let won = false
            let winReason = ''

            // Special case for ผี (Ghost) - if both have ghost, it's a tie
            if (playerRank.description.includes('ผี') && dealerRank.description.includes('ผี')) {
              won = false // Tie, but we'll count as loss for simplicity
              winReason = 'Both had ผี (Ghost) - tie'
            }
            // Compare hand ranks first
            else if (playerRank.rank > dealerRank.rank) {
              won = true
              winReason = `Player had ${playerRank.description} vs Dealer ${dealerRank.description}`
            } else if (playerRank.rank < dealerRank.rank) {
              won = false
              winReason = `Dealer had ${dealerRank.description} vs Player ${playerRank.description}`
            }
            // Same rank - compare tie breakers
            else {
              if (playerRank.tieBreaker > dealerRank.tieBreaker) {
                won = true
                winReason = `Same rank (${playerRank.description}) - Player tie-breaker higher`
              } else if (playerRank.tieBreaker < dealerRank.tieBreaker) {
                won = false
                winReason = `Same rank (${playerRank.description}) - Dealer tie-breaker higher`
              } else {
                won = false // Tie
                winReason = `Tie - Same rank and tie-breaker`
              }
            }

            if (won) batchWins++

            batchResults.push({
              handIndex,
              initialPlayerHand: playHands[handIndex],
              dealerHand,
              playerDecision,
              finalPlayerHand: playerHand,
              playerRank: playerRank.description,
              playerScore: playerRank.score,
              playerMultiplier: playerRank.multiplier,
              dealerRank: dealerRank.description,
              dealerScore: dealerRank.score,
              dealerMultiplier: dealerRank.multiplier,
              winReason,
              won,
            })
          }

          totalGames += playHands.length
          totalWins += batchWins

          return {
            iteration: iteration + 1,
            totalHands: playHands.length,
            wins: batchWins,
            losses: playHands.length - batchWins,
            winRate: `${((batchWins / playHands.length) * 100).toFixed(2)}%`,
          }
        })
        .catch((error) => {
          console.error(`Error in iteration ${iteration + 1}:`, error)
          return {
            iteration: iteration + 1,
            error: error.message,
          }
        })

      promises.push(promise)
    }

    // Wait for all iterations to complete
    Promise.all(promises)
      .then((iterationResults) => {
        const successfulResults = iterationResults.filter((result) => !result.error)
        const overallWinRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0

        res.json({
          summary: {
            totalIterations: iterations,
            successfulIterations: successfulResults.length,
            failedIterations: iterationResults.length - successfulResults.length,
            totalGames,
            totalWins,
            totalLosses: totalGames - totalWins,
            overallWinRate: `${overallWinRate.toFixed(2)}%`,
          },
          iterationResults: successfulResults, // Results from each iteration (each with 100 games)
        })
      })
      .catch((error) => {
        console.error('Test error:', error)
        res.status(500).json({
          error: 'Test failed',
          message: error.message,
        })
      })
  } catch (error) {
    console.error('Test error:', error)
    res.status(500).json({
      error: 'Test failed',
      message: error.message,
    })
  }
})

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
})

app.get('/rules', (req, res) => {
  res.json({
    game: 'Pok Deng (ป๊อกเด้ง)',
    description: 'Thai card game similar to Blackjack',
    scoring: {
      A: 1,
      '2-9': 'Face value',
      '10, J, Q, K': 0,
    },
    goal: 'Get as close to 9 as possible without going over',
    specialHands: {
      'Pok 8': 'Two cards totaling 8',
      'Pok 9': 'Two cards totaling 9',
      Deng: 'Three cards of same suit or sequence',
    },
  })
})

app.listen(port, () => {
  console.log(`🃏 Pok Deng Bot server running on port ${port}`)
  console.log(`📊 Health check: http://localhost:${port}/health`)
  console.log(`📋 Game rules: http://localhost:${port}/rules`)
  console.log(`🎯 Decision endpoint: POST http://localhost:${port}/decide`)
})

module.exports = app
