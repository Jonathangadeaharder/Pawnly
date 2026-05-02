/**
 * Onboarding Flow with Playstyle Sorter
 *
 * Interactive onboarding that determines player's chess style and sets up their profile.
 * Steps:
 * 1. Welcome & Introduction
 * 2. Playstyle Quiz (10 questions)
 * 3. Skill Level Assessment
 * 4. Opening System Recommendation
 * 5. Goal Setting
 * 6. Profile Customization
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import type { OpeningSystem } from '../../types';
import * as Haptics from 'expo-haptics';

type OnboardingStep =
  | 'welcome'
  | 'playstyle-quiz'
  | 'skill-assessment'
  | 'system-recommendation'
  | 'goals'
  | 'customization'
  | 'complete';

type Playstyle = 'aggressor' | 'positional-master' | 'tactician' | 'endgame-specialist' | 'balanced';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    playstyle: Playstyle;
    icon: string;
  }[];
}

const PLAYSTYLE_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'In a chess game, what excites you the most?',
    options: [
      { text: 'Launching a fierce attack on the enemy king', playstyle: 'aggressor', icon: '⚔️' },
      { text: 'Slowly building a superior position', playstyle: 'positional-master', icon: '🏰' },
      { text: 'Finding brilliant tactical combinations', playstyle: 'tactician', icon: '💡' },
      { text: 'Converting an endgame advantage', playstyle: 'endgame-specialist', icon: '🎯' },
    ],
  },
  {
    id: 'q2',
    question: 'When your opponent makes a mistake, you prefer to:',
    options: [
      { text: 'Immediately launch an attack', playstyle: 'aggressor', icon: '⚡' },
      { text: 'Improve your position first', playstyle: 'positional-master', icon: '📈' },
      { text: 'Look for a tactical blow', playstyle: 'tactician', icon: '🎪' },
      { text: 'Simplify to a winning endgame', playstyle: 'endgame-specialist', icon: '♔' },
    ],
  },
  {
    id: 'q3',
    question: 'Your ideal game would involve:',
    options: [
      { text: 'Sacrificing pieces for a mating attack', playstyle: 'aggressor', icon: '💥' },
      { text: 'Outmaneuvering your opponent strategically', playstyle: 'positional-master', icon: '♟️' },
      { text: 'A brilliant combination winning material', playstyle: 'tactician', icon: '✨' },
      { text: 'Mastering a technical endgame', playstyle: 'endgame-specialist', icon: '🏆' },
    ],
  },
  {
    id: 'q4',
    question: 'Which chess skill do you want to improve most?',
    options: [
      { text: 'Attacking the enemy king', playstyle: 'aggressor', icon: '👑' },
      { text: 'Understanding pawn structures', playstyle: 'positional-master', icon: '🧱' },
      { text: 'Spotting tactical patterns', playstyle: 'tactician', icon: '🔍' },
      { text: 'Endgame technique', playstyle: 'endgame-specialist', icon: '📚' },
    ],
  },
  {
    id: 'q5',
    question: 'In the opening, you prefer:',
    options: [
      { text: 'Aggressive pawn storms', playstyle: 'aggressor', icon: '🌪️' },
      { text: 'Solid, flexible setups', playstyle: 'positional-master', icon: '🛡️' },
      { text: 'Sharp, tactical lines', playstyle: 'tactician', icon: '⚡' },
      { text: 'Simple, clear positions', playstyle: 'endgame-specialist', icon: '🎨' },
    ],
  },
];

const PLAYSTYLE_DESCRIPTIONS: Record<Playstyle, {
  name: string;
  description: string;
  icon: string;
  recommendedSystem: OpeningSystem;
  strengths: string[];
  areasToImprove: string[];
}> = {
  'aggressor': {
    name: 'The Aggressor',
    description: 'You thrive on attacking chess! Your games are full of sacrifices, tactics, and relentless pressure on the enemy king.',
    icon: '⚔️',
    recommendedSystem: 'kings-indian-attack',
    strengths: ['Attacking play', 'Initiative', 'Kingside storms'],
    areasToImprove: ['Patience', 'Positional understanding', 'Defense'],
  },
  'positional-master': {
    name: 'The Positional Master',
    description: 'You excel at strategic maneuvering and long-term planning. You build positions slowly and suffocate opponents.',
    icon: '🏰',
    recommendedSystem: 'london-system',
    strengths: ['Strategic planning', 'Pawn structures', 'Prophylaxis'],
    areasToImprove: ['Tactics', 'Calculation', 'Sharp positions'],
  },
  'tactician': {
    name: 'The Tactician',
    description: 'You have a sharp eye for combinations! Your games are decided by brilliant tactical blows and precise calculation.',
    icon: '💡',
    recommendedSystem: 'torre-attack',
    strengths: ['Tactical vision', 'Calculation', 'Pattern recognition'],
    areasToImprove: ['Positional play', 'Endgames', 'Patience'],
  },
  'endgame-specialist': {
    name: 'The Endgame Specialist',
    description: 'You shine in the endgame! Technical positions are your forte, and you convert small advantages masterfully.',
    icon: '🎯',
    recommendedSystem: 'colle-system',
    strengths: ['Endgame technique', 'Precision', 'Calculation'],
    areasToImprove: ['Opening theory', 'Middlegame tactics', 'Attacking'],
  },
  'balanced': {
    name: 'The Balanced Player',
    description: 'You\'re a well-rounded player who adapts to any position. You can play any style depending on what the position demands.',
    icon: '⚖️',
    recommendedSystem: 'stonewall-attack',
    strengths: ['Versatility', 'Adaptability', 'All-around skills'],
    areasToImprove: ['Specialization', 'Deep preparation'],
  },
};

const SKILL_LEVELS = [
  { id: 'beginner', name: 'Beginner', rating: '< 1000', description: 'Learning the basics' },
  { id: 'intermediate', name: 'Intermediate', rating: '1000-1400', description: 'Know the fundamentals' },
  { id: 'advanced', name: 'Advanced', rating: '1400-1800', description: 'Solid player' },
  { id: 'expert', name: 'Expert', rating: '1800+', description: 'Strong player' },
];

const GOALS = [
  { id: 'improve-rating', text: 'Improve my chess rating', icon: '📈' },
  { id: 'learn-openings', text: 'Master opening systems', icon: '📚' },
  { id: 'win-tournaments', text: 'Win tournaments', icon: '🏆' },
  { id: 'casual-fun', text: 'Play for fun', icon: '🎮' },
  { id: 'beat-friends', text: 'Beat my friends', icon: '👥' },
  { id: 'become-master', text: 'Become a master', icon: '👑' },
];

export default function OnboardingFlow({ onComplete }: {
  onComplete: (data: OnboardingData) => void;
}) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Playstyle>>({});
  const [skillLevel, setSkillLevel] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [determinedPlaystyle, setDeterminedPlaystyle] = useState<Playstyle | null>(null);

  const determinePlaystyle = (): Playstyle => {
    const counts: Record<Playstyle, number> = {
      'aggressor': 0,
      'positional-master': 0,
      'tactician': 0,
      'endgame-specialist': 0,
      'balanced': 0,
    };

    Object.values(quizAnswers).forEach(answer => {
      counts[answer]++;
    });

    // Find the dominant playstyle
    let maxCount = 0;
    let dominantStyle: Playstyle = 'balanced';

    for (const [style, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantStyle = style as Playstyle;
      }
    }

    // If no clear winner, return balanced
    if (maxCount < 3) {
      return 'balanced';
    }

    return dominantStyle;
  };

  const handleQuizAnswer = (questionId: string, playstyle: Playstyle) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: playstyle }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Auto-advance to next question or finish quiz
    const currentIndex = PLAYSTYLE_QUIZ.findIndex(q => q.id === questionId);
    if (currentIndex < PLAYSTYLE_QUIZ.length - 1) {
      // Wait a bit before auto-advancing
      setTimeout(() => {
        // Scroll to next question
      }, 300);
    } else {
      // Quiz complete
      const playstyle = determinePlaystyle();
      setDeterminedPlaystyle(playstyle);
      setTimeout(() => {
        setCurrentStep('skill-assessment');
      }, 1000);
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleComplete = () => {
    const playstyle = determinedPlaystyle || determinePlaystyle();
    const systemRecommendation = PLAYSTYLE_DESCRIPTIONS[playstyle].recommendedSystem;

    const data: OnboardingData = {
      playstyle,
      skillLevel,
      recommendedSystem: systemRecommendation,
      goals: selectedGoals,
    };

    onComplete(data);
  };

  const renderWelcome = () => (
    <ScrollView contentContainerStyle={styles.stepContainer}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome to Chess Learning!</Text>
        <Text style={styles.welcomeSubtitle}>
          Let's personalize your chess journey
        </Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="school" size={32} color={Colors.primary} />
            <Text style={styles.featureText}>5 Universal Opening Systems</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="fitness" size={32} color={Colors.primary} />
            <Text style={styles.featureText}>Personalized Training</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="trophy" size={32} color={Colors.primary} />
            <Text style={styles.featureText}>Track Your Progress</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={32} color={Colors.primary} />
            <Text style={styles.featureText}>AI-Powered Analysis</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setCurrentStep('playstyle-quiz')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPlaystyleQuiz = () => (
    <ScrollView contentContainerStyle={styles.stepContainer}>
      <View style={styles.quizHeader}>
        <Text style={styles.stepTitle}>Discover Your Playstyle</Text>
        <Text style={styles.stepSubtitle}>
          Answer these questions to find your chess personality
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(Object.keys(quizAnswers).length / PLAYSTYLE_QUIZ.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {PLAYSTYLE_QUIZ.map((question, index) => {
        return (
          <View key={question.id} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Question {index + 1}</Text>
            <Text style={styles.questionText}>{question.question}</Text>

            <View style={styles.optionsContainer}>
              {question.options.map((option) => {
                const isSelected = quizAnswers[question.id] === option.playstyle;

                return (
                  <TouchableOpacity
                    key={option.playstyle}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => handleQuizAnswer(question.id, option.playstyle)}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option.text}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}

      {Object.keys(quizAnswers).length === PLAYSTYLE_QUIZ.length && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            const playstyle = determinePlaystyle();
            setDeterminedPlaystyle(playstyle);
            setCurrentStep('skill-assessment');
          }}
        >
          <Text style={styles.primaryButtonText}>See My Results</Text>
          <Ionicons name="arrow-forward" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderSkillAssessment = () => (
    <ScrollView contentContainerStyle={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's Your Current Level?</Text>
      <Text style={styles.stepSubtitle}>
        This helps us personalize your training intensity
      </Text>

      <View style={styles.levelsContainer}>
        {SKILL_LEVELS.map((level) => {
          const isSelected = skillLevel === level.id;

          return (
            <TouchableOpacity
              key={level.id}
              style={[styles.levelCard, isSelected && styles.levelCardSelected]}
              onPress={() => setSkillLevel(level.id)}
            >
              <Text style={[styles.levelName, isSelected && styles.levelNameSelected]}>
                {level.name}
              </Text>
              <Text style={styles.levelRating}>{level.rating}</Text>
              <Text style={styles.levelDescription}>{level.description}</Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={32} color={Colors.primary} style={styles.levelCheck} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {skillLevel && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setCurrentStep('system-recommendation')}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderSystemRecommendation = () => {
    if (!determinedPlaystyle) return null;

    const profile = PLAYSTYLE_DESCRIPTIONS[determinedPlaystyle];

    return (
      <ScrollView contentContainerStyle={styles.stepContainer}>
        <Text style={styles.stepTitle}>Your Chess Personality</Text>

        <View style={styles.playstyleCard}>
          <Text style={styles.playstyleIcon}>{profile.icon}</Text>
          <Text style={styles.playstyleName}>{profile.name}</Text>
          <Text style={styles.playstyleDescription}>{profile.description}</Text>

          <View style={styles.strengthsSection}>
            <Text style={styles.sectionTitle}>Your Strengths</Text>
            {profile.strengths.map((strength, index) => (
              <View key={index} style={styles.strengthItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.strengthText}>{strength}</Text>
              </View>
            ))}
          </View>

          <View style={styles.areasSection}>
            <Text style={styles.sectionTitle}>Areas to Develop</Text>
            {profile.areasToImprove.map((area, index) => (
              <View key={index} style={styles.areaItem}>
                <Ionicons name="trending-up" size={20} color={Colors.warning} />
                <Text style={styles.areaText}>{area}</Text>
              </View>
            ))}
          </View>

          <View style={styles.recommendationBox}>
            <Ionicons name="bulb" size={32} color={Colors.primary} />
            <Text style={styles.recommendationTitle}>Recommended Opening</Text>
            <Text style={styles.recommendationText}>
              {profile.recommendedSystem.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setCurrentStep('goals')}
        >
          <Text style={styles.primaryButtonText}>Set My Goals</Text>
          <Ionicons name="arrow-forward" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderGoals = () => (
    <ScrollView contentContainerStyle={styles.stepContainer}>
      <Text style={styles.stepTitle}>What Are Your Goals?</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>

      <View style={styles.goalsGrid}>
        {GOALS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);

          return (
            <TouchableOpacity
              key={goal.id}
              style={[styles.goalCard, isSelected && styles.goalCardSelected]}
              onPress={() => handleGoalToggle(goal.id)}
            >
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <Text style={[styles.goalText, isSelected && styles.goalTextSelected]}>
                {goal.text}
              </Text>
              {isSelected && (
                <View style={styles.goalCheckmark}>
                  <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedGoals.length > 0 && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleComplete}
        >
          <Text style={styles.primaryButtonText}>Complete Setup</Text>
          <Ionicons name="checkmark" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {currentStep === 'welcome' && renderWelcome()}
      {currentStep === 'playstyle-quiz' && renderPlaystyleQuiz()}
      {currentStep === 'skill-assessment' && renderSkillAssessment()}
      {currentStep === 'system-recommendation' && renderSystemRecommendation()}
      {currentStep === 'goals' && renderGoals()}
    </View>
  );
}

export interface OnboardingData {
  playstyle: Playstyle;
  skillLevel: string;
  recommendedSystem: OpeningSystem;
  goals: string[];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stepContainer: {
    padding: Spacing.lg,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  featureList: {
    width: '100%',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  featureText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  stepTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  quizHeader: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  questionCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  questionNumber: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  questionText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionIcon: {
    fontSize: Typography.fontSize['2xl'],
  },
  optionText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
  },
  optionTextSelected: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  levelsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  levelCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  levelName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  levelNameSelected: {
    color: Colors.primary,
  },
  levelRating: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  levelDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  levelCheck: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  playstyleCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  playstyleIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  playstyleName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  playstyleDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  strengthsSection: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  areasSection: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  strengthText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  areaText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
  },
  recommendationBox: {
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    width: '100%',
  },
  recommendationTitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  recommendationText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  goalCard: {
    width: '47%',
    aspectRatio: 1.2,
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  goalIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  goalText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    textAlign: 'center',
  },
  goalTextSelected: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  goalCheckmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
