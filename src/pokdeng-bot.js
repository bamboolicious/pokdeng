class PokDengBot {
  constructor() {
    this.cardValues = {
      A: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 0,
      J: 0,
      Q: 0,
      K: 0,
    }
  }

  /**
   * Calculate the Pok Deng score for a hand of cards
   * @param {Array} cards - Array of card objects with rank and suit
   * @returns {number} - Score (0-9)
   */
  calculateScore(cards) {
    const total = cards.reduce((sum, card) => {
      return sum + this.cardValues[card.rank]
    }, 0)
    return total % 10
  }

  /**
   * Check if hand has special combinations (Pok, Deng)
   * @param {Array} cards - Array of card objects
   * @returns {Object} - Special hand information
   */
  checkSpecialHands(cards) {
    const score = this.calculateScore(cards)
    const result = { isPok: false, isDeng: false, multiplier: 1 }

    // Check for Pok (8 or 9 with exactly 2 cards)
    if (cards.length === 2 && (score === 8 || score === 9)) {
      result.isPok = true
      result.multiplier = score === 9 ? 3 : 2
    }

    // Check for Deng (3 cards with special combinations)
    if (cards.length === 3) {
      result.isDeng = this.checkDeng(cards)
      if (result.isDeng) {
        result.multiplier = 2
      }
    }

    return result
  }

  /**
   * Check for Deng combinations in 3-card hands
   * @param {Array} cards - Array of 3 card objects
   * @returns {boolean} - True if hand has Deng
   */
  checkDeng(cards) {
    if (cards.length !== 3) return false

    const suits = cards.map((card) => card.suit)
    const ranks = cards.map((card) => card.rank)

    // Same suit (flush)
    if (suits.every((suit) => suit === suits[0])) {
      return true
    }

    // Sequence (straight)
    const numericRanks = ranks
      .map((rank) => {
        if (rank === 'A') return 1
        if (rank === 'J') return 11
        if (rank === 'Q') return 12
        if (rank === 'K') return 13
        return parseInt(rank)
      })
      .sort((a, b) => a - b)

    // Check for consecutive sequence
    for (let i = 1; i < numericRanks.length; i++) {
      if (numericRanks[i] !== numericRanks[i - 1] + 1) {
        return false
      }
    }

    return true
  }

  /**
   * Make decisions for multiple hands
   * @param {Array} playHands - Array of player hands, each hand is an array of cards
   * @param {Array} knownHands - Array of known hands for context
   * @returns {Array} - Array of decision strings ('hit' or 'stand')
   */
  makeMultipleDecisions(playHands, knownHands = []) {
    const decisions = []

    for (let i = 0; i < playHands.length; i++) {
      const hand = playHands[i]

      // Get context from known hands (can be used as dealer/opponent info)
      const contextHands = knownHands.filter((_, index) => index !== i)

      // Make decision for this hand
      const decision = this.makeDecision(hand, [], {
        handIndex: i,
        totalHands: playHands.length,
        contextHands,
      })

      decisions.push(decision.action)
    }

    return decisions
  }

  /**
   * Determine winner between player and dealer scores
   * @param {number} playerScore - Player's score
   * @param {number} dealerScore - Dealer's score
   * @returns {string} - Winner ('player', 'dealer', or 'tie')
   */
  determineWinner(playerScore, dealerScore) {
    if (playerScore > dealerScore) return 'player'
    if (playerScore < dealerScore) return 'dealer'
    return 'tie'
  }

  /**
   * Make a decision whether to hit or stand
   * @param {Array} playerCards - Player's current cards (always 2 cards when deciding)
   * @param {Array} dealerCards - Dealer's visible cards (optional)
   * @param {Object} gameState - Additional game state information
   * @returns {Object} - Decision object with action, confidence, and reasoning
   */
  makeDecision(playerCards, dealerCards = [], gameState = {}) {
    const playerScore = this.calculateScore(playerCards)
    const playerSpecial = this.checkSpecialHands(playerCards)

    // Check for immediate stand conditions (Pok hands)
    const immediateStand = this.checkImmediateStand(playerCards, playerScore, playerSpecial)
    if (immediateStand) return immediateStand

    // Decision logic for 2-card hands (we always have 2 cards when deciding)
    const decision = this.makeTwoCardDecision(playerScore)

    // Adjust for dealer cards if available
    if (dealerCards && dealerCards.length > 0) {
      this.adjustForDealer(decision, dealerCards)
    }

    return {
      ...decision,
      playerScore,
      specialHand: playerSpecial,
    }
  }

  /**
   * Check if player should immediately stand
   * @param {Array} playerCards - Player's cards
   * @param {number} playerScore - Player's score
   * @param {Object} playerSpecial - Special hand info
   * @returns {Object|null} - Decision object or null
   */
  checkImmediateStand(playerCards, playerScore, playerSpecial) {
    // Always stand if player has Pok (8 or 9 with exactly 2 cards)
    if (playerSpecial.isPok) {
      return {
        action: 'stand',
        confidence: 0.95,
        reasoning: `Standing with Pok ${playerScore} - excellent hand`,
        playerScore,
        specialHand: playerSpecial,
      }
    }

    return null
  }

  /**
   * Make decision for 2-card hands
   * @param {number} playerScore - Player's score
   * @param {number} winProb - Win probability
   * @returns {Object} - Decision object
   */
  makeTwoCardDecision(playerScore, winProb) {
    if (playerScore >= 7) {
      return {
        action: 'stand',
        confidence: 0.8,
        reasoning: `Standing with good score: ${playerScore}`,
      }
    }

    if (playerScore >= 5) {
      const action = 'stand'
      return {
        action,
        confidence: 0.6,
        reasoning: `Score ${playerScore} - ${action === 'hit' ? 'taking calculated risk' : 'playing it safe'}`,
      }
    }

    if (playerScore >= 3) {
      return {
        action: 'hit',
        confidence: 0.7,
        reasoning: `Score ${playerScore} - hitting to improve hand`,
      }
    }

    return {
      action: 'hit',
      confidence: 0.9,
      reasoning: `Low score ${playerScore} - must hit`,
    }
  }

  /**
   * Adjust decision based on dealer's cards
   * @param {Object} decision - Current decision object
   * @param {Array} dealerCards - Dealer's cards
   */
  adjustForDealer(decision, dealerCards) {
    const dealerScore = this.calculateScore(dealerCards)
    const dealerSpecial = this.checkSpecialHands(dealerCards)

    if (dealerSpecial.isPok && decision.action === 'stand') {
      decision.confidence *= 0.3
      decision.reasoning += ` (dealer has Pok ${dealerScore})`
    }
  }

  /**
   * Simulate a game scenario for testing
   * @param {Array} playerCards - Player's cards
   * @param {Array} dealerCards - Dealer's cards
   * @returns {Object} - Game analysis
   */
  analyzeGame(playerCards, dealerCards) {
    const playerScore = this.calculateScore(playerCards)
    const dealerScore = this.calculateScore(dealerCards)
    const playerSpecial = this.checkSpecialHands(playerCards)
    const dealerSpecial = this.checkSpecialHands(dealerCards)

    const playerMultiplier = playerSpecial.multiplier
    const dealerMultiplier = dealerSpecial.multiplier

    // Determine winner based on Pok Deng rules
    const winner = this.determineGameWinner(playerSpecial, dealerSpecial, playerScore, dealerScore)

    return {
      winner,
      playerScore,
      dealerScore,
      playerSpecial,
      dealerSpecial,
      playerMultiplier,
      dealerMultiplier,
    }
  }

  /**
   * Determine the winner of a complete game
   * @param {Object} playerSpecial - Player's special hand info
   * @param {Object} dealerSpecial - Dealer's special hand info
   * @param {number} playerScore - Player's score
   * @param {number} dealerScore - Dealer's score
   * @returns {string} - Winner ('player', 'dealer', or 'tie')
   */
  determineGameWinner(playerSpecial, dealerSpecial, playerScore, dealerScore) {
    // Handle Pok vs non-Pok
    if (playerSpecial.isPok && !dealerSpecial.isPok) {
      return 'player'
    }

    if (dealerSpecial.isPok && !playerSpecial.isPok) {
      return 'dealer'
    }

    // Both have Pok or neither has Pok - compare scores
    return this.determineWinner(playerScore, dealerScore)
  }
}

module.exports = PokDengBot
