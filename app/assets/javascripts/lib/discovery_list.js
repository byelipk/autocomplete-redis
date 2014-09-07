Kalanso.DiscoveryList = {
  all: function() {
    return [this.factFinder, this.bridgeBuilder, this.analyzer, this.detective, this.messenger, this.entrepreneur, this.reporter, this.explorer, this.gateKeeper];
  },

  questions: function() {
    return [this.factFinder, this.bridgeBuilder, this.analyzer, this.detective, this.messenger, this.entrepreneur]
  },

  beliefs: function() {
    return [this.reporter, this.explorer, this.gateKeeper];
  },

  factFinder: {
    flag: 'FF',
    type: 'Question',
    name: 'Fact Finder',
    nameLower: 'fact finder',
    shortDesc: 'Fact Finders attempt to establish verifiable facts.',
    miniDesc: 'A question that attempts to determine basic and relatively straightforward information'
  },

  bridgeBuilder: {
    flag: 'BB',
    type: 'Question',
    name: 'Bridge Builder',
    nameLower: 'bridge builder',
    shortDesc: 'Bridge Builders connect different ideas together.',
    miniDesc: 'A question that attempts to organize facts and ideas to determine the relationship among them'
  },

  analyzer: {
    flag: 'AN',
    type: 'Question',
    name: 'Analyzer',
    nameLower: 'analyzer',
    shortDesc: 'Analyzers expose the hidden logic of a belief.',
    miniDesc: 'A question that tries to break a situation into its component parts and clarify its inner logic'
  },

  detective: {
    flag: 'DT',
    type: 'Question',
    name: 'Detective',
    nameLower: 'detective',
    shortDesc: 'Detectives identify important missing information.',
    miniDesc: 'A question that combines ideas to help create new solutions or make inferences regarding the future'
  },

  messenger: {
    flag: 'MS',
    type: 'Question',
    name: 'Messenger',
    nameLower: 'messenger',
    shortDesc: 'Messengers clarify the criteria used to render a judgement.',
    miniDesc: 'A question that clarifies the reasoning behind a judgement or evaluation made based on certain criteria'
  },

  entrepreneur: {
    flag: 'EN',
    type: 'Question',
    name: 'Entrepreneur',
    nameLower: 'entrepreneur',
    shortDesc: 'Entrepreneurs use ideas from one domain and apply them in another.',
    miniDesc: 'A question that takes concepts from one situation and applies them in another'
  },

  reporter: {
    flag: 'RP',
    type: 'Belief',
    name: 'Reporter',
    nameLower: 'reporter',
    shortDesc: 'Reporters provide accurate and verifiable facts.',
    miniDesc: 'A belief that makes factual claims which can be verified through investigation'
  },

  explorer: {
    flag: 'EX',
    type: 'Belief',
    name: 'Explorer',
    nameLower: 'explorer',
    shortDesc: 'Explorers make inferences based on facts.',
    miniDesc: 'A belief that is based on facts but makes claims about what is not currently known'
  },

  gateKeeper: {
    flag: 'GK',
    type: 'Belief',
    name: 'Gate Keeper',
    nameLower: 'gate keeper',
    shortDesc: 'Gate Keepers render judgements using a relative set of criteria.',
    miniDesc: 'A belief that expresses an evaluation based on certain criteria'
  }
}
