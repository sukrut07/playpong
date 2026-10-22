import { MissionDto, GameDifficultySchema } from './schemas.js';

export const FALLBACK_MISSIONS: Record<'easy' | 'medium' | 'hard', MissionDto[]> = {
  easy: [
    {
      id: 'fb_easy_1',
      mission_title: 'Steady Returns',
      mission_description: 'Return 4 consecutive balls without missing.',
      mission_type: 'consecutive_returns',
      target_value: 4,
      current_value: 0,
      difficulty: 'easy',
      coach_tip: 'Position your hand centrally and make gentle forward pushes.',
      reason: 'Building muscle memory with consistent hand positioning.',
      completed: false,
    },
    {
      id: 'fb_easy_2',
      mission_title: 'Rally Starter',
      mission_description: 'Achieve a rally length of at least 3 returns in a single point.',
      mission_type: 'rally_length',
      target_value: 3,
      current_value: 0,
      difficulty: 'easy',
      coach_tip: 'Focus on tracking the ball early rather than swinging hard.',
      reason: 'Developing hand-eye synchronization in 3D space.',
      completed: false,
    },
  ],
  medium: [
    {
      id: 'fb_med_1',
      mission_title: 'Rally Maestro',
      mission_description: 'Keep the rally alive for 6 consecutive returns.',
      mission_type: 'consecutive_returns',
      target_value: 6,
      current_value: 0,
      difficulty: 'medium',
      coach_tip: 'Anticipate the bounce and adjust your paddle height before impact.',
      reason: 'Your control is solid; now test stamina and recovery.',
      completed: false,
    },
    {
      id: 'fb_med_2',
      mission_title: 'Precision Returner',
      mission_description: 'Successfully return 10 total balls in this match.',
      mission_type: 'total_returns',
      target_value: 10,
      current_value: 0,
      difficulty: 'medium',
      coach_tip: 'Use subtle wrist angles to steer the ball away from center.',
      reason: 'Improving total volume of accurate contact.',
      completed: false,
    },
  ],
  hard: [
    {
      id: 'fb_hard_1',
      mission_title: 'Apex Defense',
      mission_description: 'Return 8 consecutive balls against faster opponent drives.',
      mission_type: 'consecutive_returns',
      target_value: 8,
      current_value: 0,
      difficulty: 'hard',
      coach_tip: 'Shorten your swing follow-through for rapid paddle reset.',
      reason: 'High-speed rallies require compact movements.',
      completed: false,
    },
    {
      id: 'fb_hard_2',
      mission_title: 'Match Dominance',
      mission_description: 'Reach a single rally of 8+ returns and win the point.',
      mission_type: 'rally_length',
      target_value: 8,
      current_value: 0,
      difficulty: 'hard',
      coach_tip: 'Control the depth of your returns to push the opponent back.',
      reason: 'Mastering extended rallies under pressure.',
      completed: false,
    },
  ],
};

export function getFallbackMission(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): MissionDto {
  const list = FALLBACK_MISSIONS[difficulty] || FALLBACK_MISSIONS.easy;
  const picked = list[Math.floor(Math.random() * list.length)];
  return {
    ...picked,
    id: `mission_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
}
