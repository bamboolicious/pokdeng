# Pok Deng Bot Server

A Node.js server that can make intelligent decisions for the Thai card game ป๊อกเด้ง (Pok Deng).

## What is Pok Deng?

Pok Deng is a popular Thai card game similar to Blackjack. The goal is to get as close to 9 as possible without going over.

### Card Values
- **A**: 1 point
- **2-9**: Face value
- **10, J, Q, K**: 0 points

### Special Hands
- **Pok 8**: Two cards totaling 8 (pays 2x)
- **Pok 9**: Two cards totaling 9 (pays 3x)
- **Deng**: Three cards with same suit or sequence (pays 2x)

## Installation

```bash
npm install
```

## Usage

### Start the server
```bash
npm start
```

### Development mode with auto-restart
```bash
npm run dev
```

## API Endpoints

### POST /decide
Make hit/stand decisions for multiple hands simultaneously.

**Request Body:**
```json
{
  "playHands": [
    [{"number": 1, "suit": "hearts"}, {"number": 8, "suit": "spades"}],
    [{"number": 2, "suit": "hearts"}, {"number": 13, "suit": "spades"}],
    [{"number": 11, "suit": "hearts"}, {"number": 12, "suit": "spades"}]
  ],
  "knownHands": [
    [{"number": 7, "suit": "diamonds"}, {"number": 2, "suit": "clubs"}]
  ]
}
```

**Card Number Mapping:**
- **Ace = 1** (value: 1 point)
- **2-9 = 2-9** (value: face value)  
- **10 = 10** (value: 0 points)
- **Jack = 11** (value: 0 points)
- **Queen = 12** (value: 0 points)
- **King = 13** (value: 0 points)

**Response:**
```json
["stand", "hit", "hit"]
```

### GET /health
Check server health status.

### GET /rules
Get game rules and scoring information.

## Decision Logic

The bot uses sophisticated logic to make decisions based on **2-card hands only**:

1. **Always stand** on Pok (8 or 9 with 2 cards)
2. **Strategic decisions** for 2-card hands based on:
   - Current score
   - Win probability calculations
   - Dealer's visible cards (if any)
   - Risk assessment

**Note**: We never know what the third card will be, so all decisions are made with exactly 2 cards.

## Examples

### Example 1: Strong Hand (Pok 9)
```json
{
  "playerCards": [
    {"rank": "A", "suit": "hearts"},
    {"rank": "8", "suit": "spades"}
  ]
}
```
**Decision**: Stand (confidence: 95%) - "Standing with Pok 9 - excellent hand"

### Example 2: Weak Hand
```json
{
  "playerCards": [
    {"rank": "2", "suit": "hearts"},
    {"rank": "K", "suit": "spades"}
  ]
}
```
**Decision**: Hit (confidence: 90%) - "Low score 2 - must hit"

### Example 3: Medium Hand
```json
{
  "playerCards": [
    {"rank": "3", "suit": "hearts"},
    {"rank": "3", "suit": "spades"}
  ]
}
```
**Decision**: Hit (confidence: 70%) - "Score 6 - hitting to improve hand"

## Testing

Run the test suite:
```bash
npm test
```

## License

ISC
# pokdeng
