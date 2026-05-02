import { SymbolicAnalysis, SymbolicTag } from '../chess/symbolicAnalyzer';
import { CoachPersonalityName } from '../../types';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CoachFeedback {
  text: string;
  saliencySquares: string[];
}

type TemplateDictionary = Record<
  SymbolicTag,
  Record<UserLevel, Record<CoachPersonalityName, string[]>>
>;

const TEMPLATES: TemplateDictionary = {
  'Fork': {
    beginner: {
      friendly: [
        "Oh! Moving there allows the opponent to attack two of your pieces at once on {squares}.",
        "Watch out! Your opponent can now fork your pieces on {squares}.",
      ],
      attacker: [
        "You left a fork open! They're going to strike both targets on {squares}.",
        "Tactical error! A fork is available on {squares}. You must be more aggressive in your defense.",
      ],
      positional: [
        "That move creates a structural weakness, allowing a fork on {squares}.",
        "The coordination of your pieces is broken, leading to a fork on {squares}.",
      ],
      tactical: [
        "Tactical alert! A fork is possible on {squares}. Double attack detected.",
        "Your opponent has a double threat on {squares}. Classic fork pattern.",
      ],
    },
    intermediate: {
      friendly: [
        "A fork on {squares} complicates the position. Can you see a way out?",
        "That move allows a double attack on {squares}. Be careful!",
      ],
      attacker: [
        "Double threat on {squares}! Don't let them dictate the game.",
        "They've found a fork on {squares}. Counter-attack is your only hope.",
      ],
      positional: [
        "The lack of harmony between your pieces allows this fork on {squares}.",
        "Positional oversight leading to a fork on {squares}. Re-evaluate your piece placement.",
      ],
      tactical: [
        "Calculation error. The fork on {squares} wins material for the opponent.",
        "Tactical motif: Double attack on {squares}. High severity.",
      ],
    },
    advanced: {
      beginner: [], // Not used but keeps type safety
      intermediate: [],
      advanced: [],
      friendly: [
        "Interesting choice, but it permits a fork on {squares}.",
      ],
      attacker: [
        "Fatal mistake. The fork on {squares} is crushing.",
      ],
      positional: [
        "The strategic balance is lost due to this fork on {squares}.",
      ],
      tactical: [
        "Missed the tactical sequence leading to a fork on {squares}.",
      ],
    },
  },
  'Pin': {
    beginner: {
      friendly: [
        "Your piece on {squares} is pinned! It can't move without exposing a more valuable piece.",
        "That's a pin! Your piece is stuck because something important is behind it.",
      ],
      attacker: [
        "They've pinned you! Your piece on {squares} is paralyzed.",
        "Aggressive pin on {squares}! You need to break free immediately.",
      ],
      positional: [
        "The pin on {squares} restricts your mobility significantly.",
        "Positional pressure: your piece is pinned against a higher value target.",
      ],
      tactical: [
        "Tactical motif: Absolute/Relative pin on {squares}.",
        "Your piece is immobile on {squares} due to the pin.",
      ],
    },
    intermediate: {
      friendly: [
        "The pin on {squares} is annoying. How do you plan to unpin?",
        "Moving into a pin on {squares} might be risky.",
      ],
      attacker: [
        "They're using a pin on {squares} to keep you down. Fight back!",
        "Don't let that pin on {squares} stop your momentum.",
      ],
      positional: [
        "The pin on {squares} creates a target that can be exploited.",
        "Strategic constraint: the pin on {squares} limits your defensive options.",
      ],
      tactical: [
        "Tactical oversight. The pin on {squares} leads to material loss.",
        "Pin detected on {squares}. The pinned piece is under-defended.",
      ],
    },
    advanced: {
      friendly: ["The pin on {squares} is a significant tactical factor."],
      attacker: ["The pin on {squares} is a lethal weapon in their hands."],
      positional: ["The strategic implications of the pin on {squares} are severe."],
      tactical: ["Calculation error regarding the pin on {squares}."],
    },
  },
  'Hanging Piece': {
    beginner: {
      friendly: [
        "Oops! Your piece on {squares} is left undefended.",
        "You moved your piece to {squares} where it can be taken for free!",
      ],
      attacker: [
        "Free material! You just gave them a piece on {squares}.",
        "Careless! That piece on {squares} is hanging.",
      ],
      positional: [
        "Leaving the piece on {squares} undefended is a major positional error.",
        "Material balance is compromised by the hanging piece on {squares}.",
      ],
      tactical: [
        "Tactical blunder: Hanging piece on {squares}.",
        "Unforced error. Piece on {squares} has no defenders.",
      ],
    },
    intermediate: {
      friendly: [
        "Is the piece on {squares} really safe there?",
        "That piece on {squares} seems to be hanging.",
      ],
      attacker: [
        "You're gifting them pieces! {squares} is undefended.",
        "Unacceptable blunder. The piece on {squares} is free for the taking.",
      ],
      positional: [
        "The loss of the piece on {squares} ruins your long-term plans.",
        "Strategic failure: inability to protect the piece on {squares}.",
      ],
      tactical: [
        "Simple hanging piece on {squares}. You must calculate better.",
        "Material loss on {squares}. Oversight detected.",
      ],
    },
    advanced: {
      friendly: ["The piece on {squares} is unfortunately lost."],
      attacker: ["Inexcusable. You left {squares} hanging."],
      positional: ["The structural integrity is gone with the loss on {squares}."],
      tactical: ["Tactical blindness. Piece on {squares} is hanging."],
    },
  },
  // Fallback and other tags...
  'Material Loss': {
    beginner: {
      friendly: ["That move loses material. Let's see how the opponent would respond."],
      attacker: ["You're losing pieces! Look closer."],
      positional: ["Material disadvantage will haunt you in the endgame."],
      tactical: ["Simple material loss detected."],
    },
    intermediate: {
      friendly: ["Losing material here makes the game much harder."],
      attacker: ["Bad trade. You're down in material now."],
      positional: ["Positional sacrifice? Unlikely. Just material loss."],
      tactical: ["Calculation error leading to material loss."],
    },
    advanced: {
      friendly: ["A costly exchange results in material loss."],
      attacker: ["Blunder. You are now down in material."],
      positional: ["Strategic setback: material deficit."],
      tactical: ["Tactical error: material loss."],
    },
  },
  'Unknown': {
    beginner: {
      friendly: ["That move loses a significant advantage. Let's see how the opponent would respond."],
      attacker: ["Bad move. You're giving away the game."],
      positional: ["Your position just got much worse."],
      tactical: ["Unclear blunder. Let's analyze the punishment."],
    },
    intermediate: {
      friendly: ["The evaluation dropped significantly. Can you see why?"],
      attacker: ["You've lost the initiative. This is a big mistake."],
      positional: ["The strategic balance has shifted against you."],
      tactical: ["Significant evaluation drop. Let's explore the consequences."],
    },
    advanced: {
      friendly: ["A subtle but critical error. Let's look at the refutation."],
      attacker: ["Crushing blow to your chances. High centipawn loss."],
      positional: ["Fundamental strategic error detected."],
      tactical: ["Deep tactical failure. Refutation line is complex."],
    },
  },
  'Skewer': {
    beginner: {
      friendly: ["That's a skewer! Your valuable piece is being attacked, and something else is behind it."],
      attacker: ["You've been skewered on {squares}!"],
      positional: ["The skewer on {squares} forces a painful choice."],
      tactical: ["Tactical motif: Skewer on {squares}."],
    },
    intermediate: {
      friendly: ["Moving into a skewer on {squares} is dangerous."],
      attacker: ["They've skewered your heavy pieces on {squares}."],
      positional: ["The skewer on {squares} creates a major weakness."],
      tactical: ["Tactical oversight: Skewer pattern on {squares}."],
    },
    advanced: {
      friendly: ["The skewer on {squares} is a decisive factor."],
      attacker: ["Devastating skewer on {squares}."],
      positional: ["Positional collapse due to the skewer on {squares}."],
      tactical: ["Calculation error regarding the skewer on {squares}."],
    },
  },
  'Discovered Attack': {
    beginner: {
      friendly: ["Watch out! Moving that piece revealed an attack from somewhere else."],
      attacker: ["Sneaky! They have a discovered attack against you."],
      positional: ["Your position is vulnerable to this discovered threat."],
      tactical: ["Tactical motif: Discovered attack."],
    },
    intermediate: {
      friendly: ["A discovered attack complicates the position."],
      attacker: ["They've unleashed a discovered attack. Be careful!"],
      positional: ["The discovery creates immediate tactical pressure."],
      tactical: ["Discovered attack detected. High tactical complexity."],
    },
    advanced: {
      friendly: ["A powerful discovery shifts the evaluation."],
      attacker: ["Lethal discovered attack."],
      positional: ["Positional disaster caused by the discovery."],
      tactical: ["Deep tactical oversight: discovered attack."],
    },
  },
  'Back-Rank Weakness': {
    beginner: {
      friendly: ["Your King is trapped on the back rank! Watch out for checkmate."],
      attacker: ["Your back rank is wide open! You're asking for mate."],
      positional: ["Neglecting the back rank is a recipe for disaster."],
      tactical: ["Back-rank mate threat detected."],
    },
    intermediate: {
      friendly: ["The back-rank weakness is a constant threat."],
      attacker: ["Exploit the back rank! Oh wait, they're doing it to you."],
      positional: ["The structural weakness on the back rank is fatal."],
      tactical: ["Tactical vulnerability: Back-rank mate."],
    },
    advanced: {
      friendly: ["The back-rank issues are insurmountable."],
      attacker: ["Crushing back-rank mate sequence."],
      positional: ["Positional failure to secure the back rank."],
      tactical: ["Deep tactical weakness on the back rank."],
    },
  },
  'Missed Mate': {
    beginner: {
      friendly: ["Oh no! You had a chance to win the game right there."],
      attacker: ["You missed a kill shot! Mate was right there."],
      positional: ["Game-ending opportunity missed."],
      tactical: ["Tactical failure: Missed mate in one."],
    },
    intermediate: {
      friendly: ["Missing a mate like that is painful. Can you find it now?"],
      attacker: ["Total failure. You let the King escape mate."],
      positional: ["The game should have ended here."],
      tactical: ["Severe tactical oversight: Missed checkmate."],
    },
    advanced: {
      friendly: ["A tragic missed mate opportunity."],
      attacker: ["Inexcusable. Checkmate was available."],
      positional: ["The strategic goal of checkmate was missed."],
      tactical: ["Critical calculation error: Missed mate."],
    },
  },
  'Discovered Check': {
    beginner: {
      friendly: ["A discovered check! The King is under attack from a piece you didn't expect."],
      attacker: ["They've hit you with a discovered check! Brace yourself."],
      positional: ["The discovered check disrupts your entire setup."],
      tactical: ["Tactical motif: Discovered check."],
    },
    intermediate: {
      friendly: ["Discovered checks are always dangerous. This one is no exception."],
      attacker: ["Brutal discovered check. You're losing control."],
      positional: ["The discovery forces a disruptive response."],
      tactical: ["Tactical complexity increased by discovered check."],
    },
    advanced: {
      friendly: ["A masterfully played discovered check."],
      attacker: ["Devastating discovery against your King."],
      positional: ["Positional ruin following the discovered check."],
      tactical: ["Elite tactical execution: discovered check."],
    },
  },
  'Double Check': {
    beginner: {
      friendly: ["Double check! Your King is attacked by two pieces and MUST move."],
      attacker: ["Double check! You're in big trouble."],
      positional: ["The double check paralyzes your defense."],
      tactical: ["Tactical motif: Double check. The most powerful forcing move."],
    },
    intermediate: {
      friendly: ["Dealing with a double check is extremely difficult."],
      attacker: ["They've found a double check. It's almost over."],
      positional: ["The double check destroys your coordination."],
      tactical: ["High-level tactical execution: double check."],
    },
    advanced: {
      friendly: ["A crushing double check ends your resistance."],
      attacker: ["Lethal double check."],
      positional: ["Complete positional collapse under double check."],
      tactical: ["Ultimate tactical forcing move: double check."],
    },
  },
  'Trapped Piece': {
    beginner: {
      friendly: ["Your piece has nowhere to go! It's trapped."],
      attacker: ["You've let your piece get cornered. It's a goner."],
      positional: ["Positional claustrophobia: your piece is trapped."],
      tactical: ["Tactical motif: Trapped piece."],
    },
    intermediate: {
      friendly: ["The piece on {squares} is dangerously short of squares."],
      attacker: ["They've hunted down your piece. It's trapped."],
      positional: ["Lack of mobility leads to the piece being trapped."],
      tactical: ["Calculation error resulting in a trapped piece."],
    },
    advanced: {
      friendly: ["A sophisticated trap catches your piece."],
      attacker: ["Ruthless piece hunting. It's trapped."],
      positional: ["Strategic failure to provide escape squares."],
      tactical: ["Tactical mastery in trapping the piece."],
    },
  },
  'Deflection': {
    beginner: {
      friendly: ["Your defender was pulled away! That's called deflection."],
      attacker: ["They've deflected your defense. Smart play."],
      positional: ["The deflection ruins your defensive structure."],
      tactical: ["Tactical motif: Deflection."],
    },
    intermediate: {
      friendly: ["Watch out for deflection tactics. They just used one."],
      attacker: ["Your defender is distracted. Deflection works against you."],
      positional: ["Deflection creates a fatal gap in your position."],
      tactical: ["Tactical oversight regarding a deflection sequence."],
    },
    advanced: {
      friendly: ["An elegant deflection wins material."],
      attacker: ["Brutal deflection tactic."],
      positional: ["Strategic collapse triggered by deflection."],
      tactical: ["Sophisticated tactical execution: deflection."],
    },
  },
  'Removing the Defender': {
    beginner: {
      friendly: ["They took out your protector! Your piece is now vulnerable."],
      attacker: ["Defense removed! You're wide open now."],
      positional: ["The defensive anchor is gone."],
      tactical: ["Tactical motif: Removing the defender."],
    },
    intermediate: {
      friendly: ["Always check your defenders. One was just removed."],
      attacker: ["They've eliminated your best defender. Tough spot."],
      positional: ["The removal of the defender leads to a positional crisis."],
      tactical: ["Calculation failure: opponent removed your defender."],
    },
    advanced: {
      friendly: ["A clinical removal of the defender."],
      attacker: ["Lethal removal of your defensive piece."],
      positional: ["Strategic structure fails as the defender is removed."],
      tactical: ["Tactical precision: removing the defender."],
    },
  },
  'Overloaded Piece': {
    beginner: {
      friendly: ["Your piece has too many jobs! It can't protect everything at once."],
      attacker: ["You've overloaded your defender. It's failing."],
      positional: ["Positional strain: one piece is doing too much."],
      tactical: ["Tactical motif: Overloading."],
    },
    intermediate: {
      friendly: ["An overloaded piece is a classic tactical target."],
      attacker: ["They've exploited your overloaded defender."],
      positional: ["Strategic weakness: over-reliance on a single piece."],
      tactical: ["Tactical oversight: your piece was overloaded."],
    },
    advanced: {
      friendly: ["A subtle overloading tactic proves decisive."],
      attacker: ["Exploiting the overloaded defender with precision."],
      positional: ["Positional collapse due to overloading."],
      tactical: ["Sophisticated tactical motif: overloading."],
    },
  },
  'Exposed King': {
    beginner: {
      friendly: ["Your King is out in the open! It needs more protection."],
      attacker: ["Your King is a sitting duck. Aggression incoming."],
      positional: ["King safety is non-existent in this position."],
      tactical: ["Tactical vulnerability: Exposed King."],
    },
    intermediate: {
      friendly: ["The safety of your King is a major concern now."],
      attacker: ["Target acquired. Your King is wide open."],
      positional: ["Strategic failure to secure the King."],
      tactical: ["Tactical pressure mounting against the exposed King."],
    },
    advanced: {
      friendly: ["The exposure of the King is the critical imbalance."],
      attacker: ["Lethal attack against the exposed King."],
      positional: ["Positional ruin as the King is flushed out."],
      tactical: ["Elite tactical execution against the exposed King."],
    },
  },
};

/**
 * Generates natural language feedback based on symbolic analysis and user context.
 */
export function generateFeedback(
  analysis: SymbolicAnalysis,
  userLevel: UserLevel,
  personality: CoachPersonalityName
): CoachFeedback {
  const { tag, saliencySquares } = analysis;

  const tagTemplates = TEMPLATES[tag] || TEMPLATES['Unknown'];
  const levelTemplates = tagTemplates[userLevel] || tagTemplates['beginner'];
  const personalityTemplates = levelTemplates[personality] || levelTemplates['friendly'];

  const templates = personalityTemplates.length > 0 ? personalityTemplates : (tagTemplates['beginner']['friendly'] || ["Evaluation drop detected."]);
  
  const randomIndex = Math.floor(Math.random() * templates.length);
  let text = templates[randomIndex];

  // Interpolate squares if needed
  if (text.includes('{squares}') && saliencySquares.length > 0) {
    text = text.replace('{squares}', saliencySquares.join(', '));
  } else if (text.includes('{squares}')) {
    text = text.replace('{squares}', 'some key squares');
  }

  return {
    text,
    saliencySquares,
  };
}
