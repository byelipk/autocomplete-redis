AutocompleteRedis.DiscoveryList = {
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
    flag: "FF",
    type: "Question",
    name: "Fact Finder",
    avatar: "avatar avatar-color-13 pull-left",
    char: "?",
    nameLower: "fact finder",
    shortDesc: "Fact Finders attempt to establish verifiable facts.",
    hiddenDesc: "A question that attempts to determine basic...",
    miniDesc: "A question that attempts to determine basic and relatively straightforward information"
  },

  bridgeBuilder: {
    flag: "BB",
    type: "Question",
    name: "Bridge Builder",
    avatar: "avatar avatar-color-13 pull-left",
    // avatar: "glyphicon glyphicon-question-sign pull-left",
    char: "?",
    nameLower: "bridge builder",
    shortDesc: "Bridge Builders connect different ideas together.",
    hiddenDesc: "A question that tries to organize facts and ideas...",
    miniDesc: "A question that attempts to organize facts and ideas to determine the relationship among them"
  },

  analyzer: {
    flag: "AN",
    type: "Question",
    name: "Analyzer",
    avatar: "avatar avatar-color-13 pull-left",
    // avatar: "glyphicon glyphicon-question-sign pull-left",
    char: "?",
    nameLower: "analyzer",
    shortDesc: "Analyzers expose the hidden logic of a belief.",
    hiddenDesc: "A question that tries to break a situation down...",
    miniDesc: "A question that tries to break down a situation into its component parts and clarify its inner logic"
  },

  detective: {
    flag: "DT",
    type: "Question",
    name: "Detective",
    avatar: "avatar avatar-color-13 pull-left",
    char: "?",
    nameLower: "detective",
    shortDesc: "Detectives identify important missing information.",
    hiddenDesc: "A question that combines ideas to create new...",
    miniDesc: "A question that combines ideas to create new solutions or make inferences regarding the future"
  },

  messenger: {
    flag: "MS",
    type: "Question",
    name: "Messenger",
    avatar: "avatar avatar-color-13 pull-left",
    char: "?",
    nameLower: "messenger",
    shortDesc: "Messengers clarify the criteria used to render a judgement.",
    hiddenDesc: "A question that clarifies the criteria used to...",
    miniDesc: "A question that clarifies the reasoning behind a judgement or evaluation made based on certain criteria"
  },

  entrepreneur: {
    flag: "EN",
    type: "Question",
    name: "Entrepreneur",
    avatar: "avatar avatar-color-13 pull-left",
    // avatar: "glyphicon glyphicon-question-sign pull-left",
    char: "?",
    nameLower: "entrepreneur",
    shortDesc: "Entrepreneurs use ideas from one domain and apply them in another.",
    hiddenDesc: "A question that uses concepts from one...",
    miniDesc: "A question that takes concepts from one situation and applies them in another"
  },

  reporter: {
    flag: "RP",
    type: "Belief",
    name: "Reporter",
    avatar: "avatar avatar-color-81 pull-left",
    // avatar: "glyphicon glyphicon-exclamation-sign pull-left",
    char: "!",
    nameLower: "reporter",
    shortDesc: "Reporters provide accurate and verifiable facts.",
    hiddenDesc: "A belief that makes factual claims which can be...",
    miniDesc: "A belief that makes factual claims which can be verified through investigation"
  },

  explorer: {
    flag: "EX",
    type: "Belief",
    name: "Explorer",
    avatar: "avatar avatar-color-81 pull-left",
    // avatar: "glyphicon glyphicon-exclamation-sign pull-left",
    char: "!",
    nameLower: "explorer",
    shortDesc: "Explorers make inferences based on facts.",
    hiddenDesc: "A belief that is based on facts but goes beyond...",
    miniDesc: "A belief that is based on facts but makes claims about what is not currently known"
  },

  gateKeeper: {
    flag: "GK",
    type: "Belief",
    name: "Gate Keeper",
    avatar: "avatar avatar-color-81 pull-left",
    // avatar: "glyphicon glyphicon-exclamation-sign pull-left",
    char: "!",
    nameLower: "gate keeper",
    shortDesc: "Gate Keepers render judgements using a relative set of criteria.",
    hiddenDesc: "A belief that expresses an evaluation based on...",
    miniDesc: "A belief that expresses an evaluation based on certain criteria"
  }
}
