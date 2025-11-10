// backend/src/game-engine/advancedBot.js
import Bot from './bot.js';

export default class AdvancedBot extends Bot {
  constructor(game) {
    super(game);
    this.ruleEngine = new RuleEngine();
    this.neuralNetwork = new NeuralNetwork();
    this.mctsSearch = new MCTSSearch();
    this.strategyAdapter = new StrategyAdapter();
    this.learningModule = new LearningModule();

    // Load learned strategies if available
    this.loadLearnedStrategies();
  }

  async decide(botPlayer) {
    const gameState = this.extractGameState(botPlayer);

    // Use hybrid approach: rule-based + ML + MCTS
    const ruleBasedActions = this.ruleEngine.getValidActions(gameState);
    const mlSuggestion = this.neuralNetwork.predict(gameState);
    const mctsResult = this.mctsSearch.search(gameState, 500); // 500ms max

    // Combine approaches with weighted decision making
    const finalAction = this.combineApproaches(
      ruleBasedActions,
      mlSuggestion,
      mctsResult,
      gameState
    );

    // Learn from this decision for future improvement
    this.learningModule.recordDecision(gameState, finalAction);

    return finalAction;
  }

  extractGameState(botPlayer) {
    const opponent = this.game.players.find(p => p !== botPlayer);

    return {
      phase: this.game.phase,
      turn: this.game.turn,
      player: {
        life: botPlayer.life,
        hand: botPlayer.hand.map(card => this.cardToVector(card)),
        battlefield: botPlayer.battlefield.map(card => this.cardToVector(card)),
        graveyard: botPlayer.graveyard.map(card => this.cardToVector(card)),
        commandZone: botPlayer.commandZone.map(card => this.cardToVector(card)),
        landsPlayedThisTurn: botPlayer.landsPlayedThisTurn,
        commanderTaxCount: botPlayer.commanderTaxCount,
        manaPool: this.calculateManaPool(botPlayer)
      },
      opponent: {
        life: opponent.life,
        handCount: opponent.hand.length,
        battlefield: opponent.battlefield.map(card => this.cardToVector(card)),
        graveyard: opponent.graveyard.map(card => this.cardToVector(card))
      },
      stack: this.game.stack.map(item => this.stackItemToVector(item))
    };
  }

  cardToVector(card) {
    // Convert card to numerical vector for ML processing
    return {
      id: card.id,
      name: card.name,
      manaCost: card.manaCost || 0,
      type: this.encodeType(card.type),
      power: card.power || 0,
      toughness: card.toughness || 0,
      abilities: this.encodeAbilities(card.text || ''),
      isCommander: card.isCommander || false,
      keywords: this.encodeKeywords(card.text || '')
    };
  }

  stackItemToVector(item) {
    return {
      type: item.type,
      controller: item.controller,
      target: item.target,
      properties: item.properties || {}
    };
  }

  encodeType(type) {
    if (!type) return 0;
    const typeMap = {
      'Creature': 1,
      'Sorcery': 2,
      'Instant': 3,
      'Artifact': 4,
      'Enchantment': 5,
      'Land': 6,
      'Planeswalker': 7
    };

    for (const [key, value] of Object.entries(typeMap)) {
      if (type.includes(key)) return value;
    }
    return 0;
  }

  encodeAbilities(text) {
    const abilities = [
      'flying', 'trample', 'haste', 'vigilance', 'deathtouch', 'lifelink',
      'first strike', 'double strike', 'indestructible', 'reach'
    ];

    const encoded = {};
    const lowerText = text.toLowerCase();

    abilities.forEach(ability => {
      encoded[ability] = lowerText.includes(ability) ? 1 : 0;
    });

    return encoded;
  }

  encodeKeywords(text) {
    // Simple keyword extraction for ML processing
    const keywords = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('when')) keywords.push('triggered');
    if (lowerText.includes('whenever')) keywords.push('triggered');
    if (lowerText.includes('at')) keywords.push('triggered');
    if (lowerText.includes('tap:')) keywords.push('activated');
    if (lowerText.includes('pay')) keywords.push('activated');

    return keywords;
  }

  calculateManaPool(botPlayer) {
    // Simple mana calculation - could be enhanced with land type tracking
    const lands = botPlayer.battlefield.filter(card =>
      card.type && card.type.includes('Land')
    );

    return {
      total: lands.length,
      colors: {
        white: lands.filter(land => land.colors?.includes('W')).length,
        blue: lands.filter(land => land.colors?.includes('U')).length,
        black: lands.filter(land => land.colors?.includes('B')).length,
        red: lands.filter(land => land.colors?.includes('R')).length,
        green: lands.filter(land => land.colors?.includes('G')).length
      }
    };
  }

  combineApproaches(ruleActions, mlSuggestion, mctsResult, gameState) {
    // Weighted combination of different AI approaches
    const weights = {
      rules: 0.4,      // Start with 40% weight for rule-based actions
      ml: 0.3,         // 30% weight for ML prediction
      mcts: 0.3        // 30% weight for MCTS search
    };

    // Adjust weights based on game phase and complexity
    if (gameState.phase === 'combat') {
      weights.mcts = 0.5;  // More MCTS in complex combat situations
      weights.ml = 0.2;
      weights.rules = 0.3;
    }

    if (gameState.turn <= 3) {
      weights.rules = 0.6;  // More rule-based in early game
      weights.ml = 0.2;
      weights.mcts = 0.2;
    }

    // Select action based on combined approach
    const candidates = this.evaluateCandidates(ruleActions, mlSuggestion, mctsResult);

    // Sort by combined score and return the best action
    candidates.sort((a, b) => b.combinedScore - a.combinedScore);

    return candidates[0]?.action || { type: 'pass' };
  }

  evaluateCandidates(ruleActions, mlSuggestion, mctsResult) {
    const candidates = [];

    // Evaluate rule-based actions
    ruleActions.forEach(action => {
      const score = this.evaluateAction(action, 'rules');
      candidates.push({
        action,
        source: 'rules',
        score,
        combinedScore: score * 0.4
      });
    });

    // Evaluate ML suggestion
    if (mlSuggestion && mlSuggestion.action) {
      const score = this.evaluateAction(mlSuggestion.action, 'ml');
      candidates.push({
        action: mlSuggestion.action,
        source: 'ml',
        score,
        combinedScore: score * 0.3
      });
    }

    // Evaluate MCTS result
    if (mctsResult && mctsResult.bestAction) {
      const score = mctsResult.winProbability || 0.5;
      candidates.push({
        action: mctsResult.bestAction,
        source: 'mcts',
        score,
        combinedScore: score * 0.3
      });
    }

    return candidates;
  }

  evaluateAction(action, source) {
    // Basic action evaluation - could be enhanced with domain-specific heuristics
    let score = 0.5; // Default score

    switch (action.type) {
      case 'play-land':
        score = 0.8; // Usually good to play lands
        break;
      case 'cast':
        score = this.evaluateCastAction(action);
        break;
      case 'attack':
        score = this.evaluateAttackAction(action);
        break;
      case 'activate':
        score = this.evaluateActivateAction(action);
        break;
      case 'pass':
        score = 0.3; // Passing is usually neutral
        break;
    }

    return score;
  }

  evaluateCastAction(action) {
    // Evaluate casting spells based on board impact
    // This is a simplified evaluation - could be much more sophisticated
    return 0.6 + Math.random() * 0.2; // 0.6-0.8 range
  }

  evaluateAttackAction(action) {
    // Evaluate attacks based on potential damage and risk
    // Simplified evaluation - should consider opponent's blocks
    return 0.5 + Math.random() * 0.3; // 0.5-0.8 range
  }

  evaluateActivateAction(action) {
    // Evaluate activated abilities
    // Simplified evaluation - should consider ability effects
    return 0.4 + Math.random() * 0.3; // 0.4-0.7 range
  }

  loadLearnedStrategies() {
    try {
      const stored = localStorage.getItem('advancedBot_strategies');
      if (stored) {
        const strategies = JSON.parse(stored);
        this.neuralNetwork.loadWeights(strategies.weights);
        this.strategyAdapter.loadPatterns(strategies.patterns);
      }
    } catch (error) {
      console.warn('Could not load learned strategies:', error);
    }
  }

  saveLearnedStrategies() {
    try {
      const strategies = {
        weights: this.neuralNetwork.getWeights(),
        patterns: this.strategyAdapter.getPatterns()
      };
      localStorage.setItem('advancedBot_strategies', JSON.stringify(strategies));
    } catch (error) {
      console.warn('Could not save learned strategies:', error);
    }
  }
}

// Supporting classes for the Advanced Bot

class RuleEngine {
  getValidActions(gameState) {
    const actions = [];

    // Basic rule-based actions following MTG rules
    if (gameState.phase === 'main1' || gameState.phase === 'main2') {
      // Can play lands
      if (gameState.player.landsPlayedThisTurn < 1) {
        const lands = gameState.player.hand.filter(card =>
          card.type === 6 // Land type
        );
        lands.forEach(land => {
          actions.push({ type: 'play-land', cardId: land.id });
        });
      }

      // Can cast spells if enough mana
      const castableSpells = this.getCastableSpells(gameState);
      castableSpells.forEach(spell => {
        actions.push({ type: 'cast', cardId: spell.id });
      });
    }

    if (gameState.phase === 'combat') {
      // Can attack with creatures
      const attackers = gameState.player.battlefield.filter(card =>
        card.type === 1 && // Creature type
        card.power > 0 &&
        !card.tapped
      );

      if (attackers.length > 0) {
        actions.push({
          type: 'attack',
          attackers: attackers.map(c => c.id)
        });
      }
    }

    // Can always pass priority
    actions.push({ type: 'pass' });

    return actions;
  }

  getCastableSpells(gameState) {
    return gameState.player.hand.filter(card => {
      if (card.type === 6) return false; // Can't cast lands
      return card.manaCost <= gameState.player.manaPool.total;
    });
  }
}

class NeuralNetwork {
  constructor() {
    this.weights = this.initializeWeights();
    this.architecture = [64, 32, 16, 8]; // Layer sizes
  }

  initializeWeights() {
    const weights = [];
    for (let i = 0; i < this.architecture.length - 1; i++) {
      weights.push(this.randomMatrix(this.architecture[i], this.architecture[i + 1]));
    }
    return weights;
  }

  randomMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = (Math.random() - 0.5) * 2;
      }
    }
    return matrix;
  }

  predict(gameState) {
    // Convert game state to input vector
    const input = this.gameStateToVector(gameState);

    // Forward propagation through network
    let current = input;
    for (let i = 0; i < this.weights.length; i++) {
      current = this.matrixMultiply(current, this.weights[i]);
      current = this.activation(current);
    }

    // Convert output to action suggestion
    return this.vectorToAction(current);
  }

  gameStateToVector(gameState) {
    // Simplified vectorization - should be more comprehensive
    return [
      gameState.player.life / 20,
      gameState.opponent.life / 20,
      gameState.phase === 'main1' ? 1 : 0,
      gameState.phase === 'combat' ? 1 : 0,
      gameState.phase === 'main2' ? 1 : 0,
      gameState.player.hand.length / 7,
      gameState.player.battlefield.length / 10,
      gameState.opponent.battlefield.length / 10,
      gameState.player.manaPool.total / 10,
      gameState.turn / 20
    ];
  }

  matrixMultiply(vector, matrix) {
    const result = [];
    for (let i = 0; i < matrix[0].length; i++) {
      let sum = 0;
      for (let j = 0; j < vector.length; j++) {
        sum += vector[j] * matrix[j][i];
      }
      result.push(sum);
    }
    return result;
  }

  activation(vector) {
    // ReLU activation function
    return vector.map(x => Math.max(0, x));
  }

  vectorToAction(output) {
    // Convert neural network output to action
    const actionTypes = ['play-land', 'cast', 'attack', 'activate', 'pass'];
    const maxIndex = output.indexOf(Math.max(...output));

    return {
      action: { type: actionTypes[maxIndex] },
      confidence: output[maxIndex]
    };
  }

  loadWeights(weights) {
    if (weights && Array.isArray(weights)) {
      this.weights = weights;
    }
  }

  getWeights() {
    return this.weights;
  }
}

class MCTSSearch {
  constructor() {
    this.explorationFactor = 1.414; // sqrt(2) for UCB1
    this.maxIterations = 1000;
  }

  search(gameState, timeLimit) {
    const startTime = Date.now();
    const root = new MCTSNode(null, null, gameState);

    let iterations = 0;
    while (Date.now() - startTime < timeLimit && iterations < this.maxIterations) {
      const node = this.select(root);
      const result = this.simulate(node.state);
      this.backpropagate(node, result);
      iterations++;
    }

    return {
      bestAction: root.getBestAction(),
      winProbability: root.getWinProbability(),
      iterations
    };
  }

  select(node) {
    while (!node.isTerminal() && node.isFullyExpanded()) {
      node = node.getBestChild(this.explorationFactor);
    }

    if (!node.isTerminal() && !node.isFullyExpanded()) {
      return node.expand();
    }

    return node;
  }

  simulate(gameState) {
    // Simple random simulation - should be enhanced with better evaluation
    let state = JSON.parse(JSON.stringify(gameState));
    let depth = 0;
    const maxDepth = 20;

    while (depth < maxDepth && !this.isGameOver(state)) {
      const actions = this.getRandomActions(state);
      if (actions.length === 0) break;

      const action = actions[Math.floor(Math.random() * actions.length)];
      this.applyAction(state, action);
      depth++;
    }

    return this.evaluateGameState(state);
  }

  backpropagate(node, result) {
    while (node) {
      node.update(result);
      node = node.parent;
    }
  }

  isGameOver(gameState) {
    return gameState.player.life <= 0 || gameState.opponent.life <= 0;
  }

  getRandomActions(gameState) {
    const actions = [];
    // Generate random actions similar to rule engine
    // This is simplified - should match actual game rules
    if (Math.random() < 0.3) {
      actions.push({ type: 'pass' });
    }
    return actions;
  }

  applyAction(gameState, action) {
    // Simplified action application
    switch (action.type) {
      case 'pass':
        // Switch phases/turns
        break;
      case 'attack':
        // Apply combat damage
        if (Math.random() < 0.5) {
          gameState.opponent.life -= 2;
        }
        break;
    }
  }

  evaluateGameState(gameState) {
    if (gameState.player.life <= 0) return 0;
    if (gameState.opponent.life <= 0) return 1;

    // Simple evaluation based on life totals
    const playerAdvantage = gameState.player.life - gameState.opponent.life;
    return Math.max(0, Math.min(1, 0.5 + playerAdvantage / 40));
  }
}

class MCTSNode {
  constructor(parent, action, state) {
    this.parent = parent;
    this.action = action;
    this.state = state;
    this.children = [];
    this.visits = 0;
    this.wins = 0;
    this.unexpandedActions = this.getPossibleActions(state);
  }

  getPossibleActions(state) {
    // Simplified action generation
    return ['pass', 'attack'];
  }

  isFullyExpanded() {
    return this.unexpandedActions.length === 0;
  }

  isTerminal() {
    return this.state.player.life <= 0 || this.state.opponent.life <= 0;
  }

  expand() {
    const action = this.unexpandedActions.pop();
    const newState = this.applyAction(this.state, action);
    const child = new MCTSNode(this, action, newState);
    this.children.push(child);
    return child;
  }

  applyAction(state, action) {
    // Simplified action application
    const newState = JSON.parse(JSON.stringify(state));
    // Apply action logic here
    return newState;
  }

  getBestChild(explorationFactor) {
    const bestChild = this.children.reduce((best, child) => {
      const bestScore = best ? this.ucb1(best, explorationFactor) : -1;
      const childScore = this.ucb1(child, explorationFactor);
      return childScore > bestScore ? child : best;
    }, null);

    return bestChild;
  }

  ucb1(node, explorationFactor) {
    if (node.visits === 0) return Infinity;

    const exploitation = node.wins / node.visits;
    const exploration = Math.sqrt(Math.log(this.visits) / node.visits);

    return exploitation + explorationFactor * exploration;
  }

  update(result) {
    this.visits++;
    this.wins += result;
  }

  getBestAction() {
    const bestChild = this.children.reduce((best, child) => {
      return (!best || child.visits > best.visits) ? child : best;
    }, null);

    return bestChild ? bestChild.action : { type: 'pass' };
  }

  getWinProbability() {
    return this.visits > 0 ? this.wins / this.visits : 0.5;
  }
}

class StrategyAdapter {
  constructor() {
    this.patterns = new Map();
    this.opponentHistory = [];
  }

  adapt(gameState, action) {
    // Learn opponent patterns and adapt strategy
    this.recordOpponentAction(gameState, action);
    this.updatePatterns();
  }

  recordOpponentAction(gameState, action) {
    this.opponentHistory.push({
      state: gameState,
      action: action,
      timestamp: Date.now()
    });

    // Keep only recent history (last 100 actions)
    if (this.opponentHistory.length > 100) {
      this.opponentHistory.shift();
    }
  }

  updatePatterns() {
    // Analyze opponent patterns for strategic adaptation
    // This is simplified - could be much more sophisticated
    const recentActions = this.opponentHistory.slice(-20);

    // Detect aggressive vs defensive patterns
    const aggressiveActions = recentActions.filter(record =>
      record.action.type === 'attack'
    ).length;

    this.patterns.set('opponentAggression', aggressiveActions / recentActions.length);
  }

  getPatterns() {
    return Object.fromEntries(this.patterns);
  }

  loadPatterns(patterns) {
    if (patterns) {
      this.patterns = new Map(Object.entries(patterns));
    }
  }
}

class LearningModule {
  constructor() {
    this.decisionHistory = [];
    this.rewardHistory = [];
  }

  recordDecision(gameState, action) {
    this.decisionHistory.push({
      state: gameState,
      action: action,
      timestamp: Date.now()
    });
  }

  recordReward(reward) {
    this.rewardHistory.push({
      reward: reward,
      timestamp: Date.now()
    });
  }

  getDecisionHistory() {
    return this.decisionHistory;
  }

  getRewardHistory() {
    return this.rewardHistory;
  }
}