const PokDengBot = require('../src/pokdeng-bot')

describe('PokDengBot', () => {
  let bot

  beforeEach(() => {
    bot = new PokDengBot()
  })

  describe('calculateScore', () => {
    test('should calculate score correctly', () => {
      expect(
        bot.calculateScore([
          { rank: 'A', suit: 'hearts' },
          { rank: '8', suit: 'spades' },
        ])
      ).toBe(9)

      expect(
        bot.calculateScore([
          { rank: 'K', suit: 'hearts' },
          { rank: 'Q', suit: 'spades' },
        ])
      ).toBe(0)

      expect(
        bot.calculateScore([
          { rank: '5', suit: 'hearts' },
          { rank: '7', suit: 'spades' },
        ])
      ).toBe(2) // 12 % 10 = 2
    })
  })

  describe('checkSpecialHands', () => {
    test('should detect Pok 9', () => {
      const result = bot.checkSpecialHands([
        { rank: 'A', suit: 'hearts' },
        { rank: '8', suit: 'spades' },
      ])
      expect(result.isPok).toBe(true)
      expect(result.multiplier).toBe(3)
    })

    test('should detect Pok 8', () => {
      const result = bot.checkSpecialHands([
        { rank: '3', suit: 'hearts' },
        { rank: '5', suit: 'spades' },
      ])
      expect(result.isPok).toBe(true)
      expect(result.multiplier).toBe(2)
    })

    test('should detect Deng (same suit)', () => {
      const result = bot.checkSpecialHands([
        { rank: '2', suit: 'hearts' },
        { rank: '5', suit: 'hearts' },
        { rank: '8', suit: 'hearts' },
      ])
      expect(result.isDeng).toBe(true)
      expect(result.multiplier).toBe(2)
    })
  })

  describe('makeDecision', () => {
    test('should stand on Pok 9', () => {
      const decision = bot.makeDecision([
        { rank: 'A', suit: 'hearts' },
        { rank: '8', suit: 'spades' },
      ])
      expect(decision.action).toBe('stand')
      expect(decision.confidence).toBe(0.95)
      expect(decision.playerScore).toBe(9)
    })

    test('should hit on low score', () => {
      const decision = bot.makeDecision([
        { rank: '2', suit: 'hearts' },
        { rank: 'K', suit: 'spades' },
      ])
      expect(decision.action).toBe('hit')
      expect(decision.confidence).toBe(0.9)
      expect(decision.playerScore).toBe(2)
    })
  })

  describe('makeMultipleDecisions', () => {
    test('should make decisions for multiple hands', () => {
      const playHands = [
        [
          { rank: 'A', suit: 'hearts' },
          { rank: '8', suit: 'spades' },
        ], // Pok 9 - should stand
        [
          { rank: '2', suit: 'hearts' },
          { rank: 'K', suit: 'spades' },
        ], // Score 2 - should hit
        [
          { rank: '3', suit: 'hearts' },
          { rank: '4', suit: 'spades' },
        ], // Score 7 - should stand
        [
          { rank: 'A', suit: 'hearts' },
          { rank: '2', suit: 'spades' },
        ], // Score 3 - should hit
      ]

      const decisions = bot.makeMultipleDecisions(playHands)

      expect(decisions).toEqual(['stand', 'hit', 'stand', 'hit'])
      expect(decisions.length).toBe(4)
    })

    test('should handle empty known hands', () => {
      const playHands = [
        [
          { rank: 'A', suit: 'hearts' },
          { rank: '8', suit: 'spades' },
        ],
      ]

      const decisions = bot.makeMultipleDecisions(playHands, [])
      expect(decisions).toEqual(['stand'])
    })
  })

  describe('analyzeGame', () => {
    test('should determine player wins with Pok', () => {
      const result = bot.analyzeGame(
        [
          { rank: 'A', suit: 'hearts' },
          { rank: '8', suit: 'spades' },
        ], // Pok 9
        [
          { rank: '3', suit: 'hearts' },
          { rank: '4', suit: 'spades' },
        ] // 7 (no Pok)
      )
      expect(result.winner).toBe('player')
      expect(result.playerScore).toBe(9)
      expect(result.dealerScore).toBe(7)
      expect(result.playerSpecial.isPok).toBe(true)
      expect(result.dealerSpecial.isPok).toBe(false)
    })

    test('should determine tie with same scores', () => {
      const result = bot.analyzeGame(
        [
          { rank: '4', suit: 'hearts' },
          { rank: '4', suit: 'spades' },
        ], // 8
        [
          { rank: '3', suit: 'hearts' },
          { rank: '5', suit: 'spades' },
        ] // 8
      )
      expect(result.winner).toBe('tie')
      expect(result.playerScore).toBe(8)
      expect(result.dealerScore).toBe(8)
    })
  })
})
