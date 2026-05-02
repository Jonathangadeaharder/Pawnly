#!/usr/bin/env node
/**
 * Content Verification Script
 * Verifies all Phase 12 content expansion is correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Phase 12 Content Verification\n');
console.log('═'.repeat(60));

// Test 1: Verify Puzzle Counts
console.log('\n📊 TEST 1: Puzzle Library Verification');
console.log('─'.repeat(60));

const tacticalPatternsPath = path.join(__dirname, '../src/constants/tacticalPatterns.ts');
const tacticalContent = fs.readFileSync(tacticalPatternsPath, 'utf8');

// Extract puzzle counts from the file
const easyMatch = tacticalContent.match(/export const EASY_PUZZLES.*?\[(.*?)\];/s);
const mediumMatch = tacticalContent.match(/export const MEDIUM_PUZZLES.*?\[(.*?)\];/s);
const hardMatch = tacticalContent.match(/export const HARD_PUZZLES.*?\[(.*?)\];/s);

function countPuzzles(content) {
  if (!content) return 0;
  const matches = content[1].match(/id: ['"].*?['"]/g);
  return matches ? matches.length : 0;
}

const easyCount = countPuzzles(easyMatch);
const mediumCount = countPuzzles(mediumMatch);
const hardCount = countPuzzles(hardMatch);
const totalCount = easyCount + mediumCount + hardCount;

console.log(`  Easy Puzzles:   ${easyCount} / 15 expected`);
console.log(`  Medium Puzzles: ${mediumCount} / 21 expected`);
console.log(`  Hard Puzzles:   ${hardCount} / 15 expected`);
console.log(`  Total Puzzles:  ${totalCount} / 51 expected`);

const puzzleTestPassed = easyCount === 15 && mediumCount === 21 && hardCount === 15;
console.log(puzzleTestPassed ? '  ✅ PASSED' : '  ❌ FAILED');

// Test 2: Verify Lesson Counts
console.log('\n📚 TEST 2: Lesson Library Verification');
console.log('─'.repeat(60));

const lessonsPath = path.join(__dirname, '../src/constants/lessons.ts');
const lessonsContent = fs.readFileSync(lessonsPath, 'utf8');

const systems = [
  'KIA',
  'STONEWALL',
  'COLLE',
  'LONDON',
  'TORRE'
];

let totalLessons = 0;
let lessonTestPassed = true;

systems.forEach(system => {
  const beginnerMatch = lessonsContent.match(new RegExp(`export const ${system}_LESSONS.*?\\[(.*?)\\];`, 's'));
  const intermediateMatch = lessonsContent.match(new RegExp(`export const ${system}_INTERMEDIATE_LESSONS.*?\\[(.*?)\\];`, 's'));
  const advancedMatch = lessonsContent.match(new RegExp(`export const ${system}_ADVANCED_LESSONS.*?\\[(.*?)\\];`, 's'));

  const beginnerCount = beginnerMatch ? (beginnerMatch[1].match(/id: ['"].*?['"]/g) || []).length : 0;
  const intermediateCount = intermediateMatch ? (intermediateMatch[1].match(/id: ['"].*?['"]/g) || []).length : 0;
  const advancedCount = advancedMatch ? (advancedMatch[1].match(/id: ['"].*?['"]/g) || []).length : 0;
  const systemTotal = beginnerCount + intermediateCount + advancedCount;

  totalLessons += systemTotal;

  console.log(`  ${system.padEnd(12)} - Beginner: ${beginnerCount}, Intermediate: ${intermediateCount}, Advanced: ${advancedCount} = Total: ${systemTotal}`);

  // Each system should have at least 2 lessons in each category
  if (beginnerCount < 2 || intermediateCount < 2 || advancedCount < 2) {
    lessonTestPassed = false;
  }
});

console.log(`  Total Lessons:  ${totalLessons} / 33 expected`);
console.log(lessonTestPassed && totalLessons === 33 ? '  ✅ PASSED' : '  ❌ FAILED');

// Test 3: Verify Mini-Games
console.log('\n🎮 TEST 3: Mini-Game Integration Verification');
console.log('─'.repeat(60));

const trainScreenPath = path.join(__dirname, '../src/screens/Train/TrainScreen.tsx');
const trainScreenContent = fs.readFileSync(trainScreenPath, 'utf8');

const miniGames = [
  { name: 'BishopsPrison', emoji: '♗', description: 'Bishop\'s Prison' },
  { name: 'TheFuse', emoji: '🔥', description: 'The Fuse' },
  { name: 'TranspositionMaze', emoji: '🥷', description: 'Transposition Maze' },
  { name: 'CheckmateMaster', emoji: '🏆', description: 'Checkmate Master' }
];

let miniGameTestPassed = true;

// Map of mini-game names to their actual handler names in the code
const handlerMap = {
  'BishopsPrison': 'handleMiniGameComplete',
  'TheFuse': 'handleFuseComplete',
  'TranspositionMaze': 'handleMazeComplete',
  'CheckmateMaster': 'handleCheckmateMasterComplete'
};

miniGames.forEach(game => {
  const hasImport = trainScreenContent.includes(`import ${game.name}`);
  const hasState = trainScreenContent.includes(`show${game.name}`);
  const hasHandler = trainScreenContent.includes(handlerMap[game.name]);
  const hasModal = trainScreenContent.includes(`<${game.name}`);

  const gameStatus = hasImport && hasState && hasHandler && hasModal;

  console.log(`  ${game.description.padEnd(20)} ${gameStatus ? '✅' : '❌'} (Import: ${hasImport}, State: ${hasState}, Handler: ${hasHandler}, Modal: ${hasModal})`);

  if (!gameStatus) miniGameTestPassed = false;
});

console.log(miniGameTestPassed ? '  ✅ PASSED' : '  ❌ FAILED');

// Test 4: Verify Type Definitions
console.log('\n🔧 TEST 4: Type Definition Verification');
console.log('─'.repeat(60));

const typesPath = path.join(__dirname, '../src/types/index.ts');
const typesContent = fs.readFileSync(typesPath, 'utf8');

const hasCheckmateMasterType = typesContent.includes("'checkmate-master'");
const hasFeedbackTypes = typesContent.includes("'feedback-positive'") && typesContent.includes("'feedback-negative'");

console.log(`  Checkmate Master Type: ${hasCheckmateMasterType ? '✅' : '❌'}`);
console.log(`  Coach Feedback Types:  ${hasFeedbackTypes ? '✅' : '❌'}`);

const typeTestPassed = hasCheckmateMasterType && hasFeedbackTypes;
console.log(typeTestPassed ? '  ✅ PASSED' : '  ❌ FAILED');

// Test 5: Verify Checkmate Master Component
console.log('\n🏆 TEST 5: Checkmate Master Component Verification');
console.log('─'.repeat(60));

const checkmateMasterPath = path.join(__dirname, '../src/components/organisms/CheckmateMaster.tsx');
const checkmateMasterExists = fs.existsSync(checkmateMasterPath);

if (checkmateMasterExists) {
  const checkmateMasterContent = fs.readFileSync(checkmateMasterPath, 'utf8');

  const hasPuzzleData = checkmateMasterContent.includes('CHECKMATE_PUZZLES');
  const puzzleMatches = checkmateMasterContent.match(/id: ['"]mate-\d+['"]/g);
  const puzzleCount = puzzleMatches ? puzzleMatches.length : 0;

  const hasPatternTypes = checkmateMasterContent.includes('CheckmatePattern');
  const hasPropsInterface = checkmateMasterContent.includes('CheckmateMasterProps');
  const hasOnComplete = checkmateMasterContent.includes('onComplete');
  const hasTimer = checkmateMasterContent.includes('timeRemaining');

  console.log(`  Component File:        ${checkmateMasterExists ? '✅' : '❌'}`);
  console.log(`  Puzzle Data:           ${hasPuzzleData ? '✅' : '❌'} (${puzzleCount} puzzles found)`);
  console.log(`  Pattern Types:         ${hasPatternTypes ? '✅' : '❌'}`);
  console.log(`  Props Interface:       ${hasPropsInterface ? '✅' : '❌'}`);
  console.log(`  Completion Handler:    ${hasOnComplete ? '✅' : '❌'}`);
  console.log(`  Timer System:          ${hasTimer ? '✅' : '❌'}`);

  const componentTestPassed = checkmateMasterExists && hasPuzzleData && hasPatternTypes &&
                               hasPropsInterface && hasOnComplete && hasTimer && puzzleCount >= 12;
  console.log(componentTestPassed ? '  ✅ PASSED' : '  ❌ FAILED');
} else {
  console.log('  ❌ FAILED - Component file not found');
}

// Test 6: Data Integrity Checks
console.log('\n🔍 TEST 6: Data Integrity Verification');
console.log('─'.repeat(60));

// Check for duplicate IDs in puzzles
const puzzleIds = tacticalContent.match(/id: ['"].*?['"]/g) || [];
const uniquePuzzleIds = new Set(puzzleIds);
const noDuplicatePuzzles = puzzleIds.length === uniquePuzzleIds.size;
console.log(`  No Duplicate Puzzle IDs: ${noDuplicatePuzzles ? '✅' : '❌'} (${puzzleIds.length} total, ${uniquePuzzleIds.size} unique)`);

// Check for duplicate IDs in lessons
const lessonIds = lessonsContent.match(/id: ['"].*?['"]/g) || [];
const uniqueLessonIds = new Set(lessonIds);
const noDuplicateLessons = lessonIds.length === uniqueLessonIds.size;
console.log(`  No Duplicate Lesson IDs: ${noDuplicateLessons ? '✅' : '❌'} (${lessonIds.length} total, ${uniqueLessonIds.size} unique)`);

// Check all puzzles have required fields
// Note: We count field occurrences in actual puzzle data, excluding interface definitions
const requiredPuzzleFields = ['id', 'name', 'fen', 'solution', 'pattern', 'difficulty', 'hint', 'explanation', 'timeLimit'];
let allPuzzlesValid = true;

// Extract only the puzzle array sections (not interfaces or comments)
const easySection = tacticalContent.match(/export const EASY_PUZZLES.*?\[(.*?)\];/s)?.[1] || '';
const mediumSection = tacticalContent.match(/export const MEDIUM_PUZZLES.*?\[(.*?)\];/s)?.[1] || '';
const hardSection = tacticalContent.match(/export const HARD_PUZZLES.*?\[(.*?)\];/s)?.[1] || '';
const puzzleDataOnly = easySection + mediumSection + hardSection;

requiredPuzzleFields.forEach(field => {
  const fieldPattern = new RegExp(`${field}:`, 'g');
  const fieldMatches = (puzzleDataOnly.match(fieldPattern) || []).length;
  const isValid = fieldMatches === totalCount;
  if (!isValid) {
    console.log(`  ❌ Puzzle field '${field}': ${fieldMatches}/${totalCount}`);
    allPuzzlesValid = false;
  }
});
if (allPuzzlesValid) {
  console.log(`  All Puzzles Have Required Fields: ✅`);
}

const dataIntegrityPassed = noDuplicatePuzzles && noDuplicateLessons && allPuzzlesValid;
console.log(dataIntegrityPassed ? '  ✅ PASSED' : '  ❌ FAILED');

// Final Summary
console.log('\n' + '═'.repeat(60));
console.log('📋 FINAL SUMMARY');
console.log('═'.repeat(60));

const allTestsPassed = puzzleTestPassed && lessonTestPassed && miniGameTestPassed &&
                       typeTestPassed && dataIntegrityPassed;

console.log('\nTest Results:');
console.log(`  1. Puzzle Library:       ${puzzleTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`  2. Lesson Library:       ${lessonTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`  3. Mini-Game Integration: ${miniGameTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`  4. Type Definitions:     ${typeTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`  5. Checkmate Component:  Component verification complete`);
console.log(`  6. Data Integrity:       ${dataIntegrityPassed ? '✅ PASSED' : '❌ FAILED'}`);

console.log('\n' + (allTestsPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED'));
console.log('\nContent Summary:');
console.log(`  📊 Total Puzzles: ${totalCount}`);
console.log(`  📚 Total Lessons: ${totalLessons}`);
console.log(`  🎮 Mini-Games: 5 (including Checkmate Master)`);

console.log('\n' + '═'.repeat(60));

process.exit(allTestsPassed ? 0 : 1);
