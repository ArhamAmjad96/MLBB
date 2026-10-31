import { HeroDefinition, ObjectiveDefinition, DraftRuleConfig } from '../../../shared/types.js';

export const MLBB_HEROES: HeroDefinition[] = [
  { id: 'mlbb_fanny', name: 'Fanny', game: 'mlbb', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fanny' },
  { id: 'mlbb_ling', name: 'Ling', game: 'mlbb', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ling' },
  { id: 'mlbb_lancelot', name: 'Lancelot', game: 'mlbb', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lancelot' },
  { id: 'mlbb_hayabusa', name: 'Hayabusa', game: 'mlbb', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Hayabusa' },
  { id: 'mlbb_chou', name: 'Chou', game: 'mlbb', primaryRole: 'EXP', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chou' },
  { id: 'mlbb_yu_zhong', name: 'Yu Zhong', game: 'mlbb', primaryRole: 'EXP', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=YuZhong' },
  { id: 'mlbb_paquito', name: 'Paquito', game: 'mlbb', primaryRole: 'EXP', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Paquito' },
  { id: 'mlbb_uranus', name: 'Uranus', game: 'mlbb', primaryRole: 'EXP', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Uranus' },
  { id: 'mlbb_kagura', name: 'Kagura', game: 'mlbb', primaryRole: 'MID', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kagura' },
  { id: 'mlbb_valentina', name: 'Valentina', game: 'mlbb', primaryRole: 'MID', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Valentina' },
  { id: 'mlbb_pharsa', name: 'Pharsa', game: 'mlbb', primaryRole: 'MID', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pharsa' },
  { id: 'mlbb_yve', name: 'Yve', game: 'mlbb', primaryRole: 'MID', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Yve' },
  { id: 'mlbb_novaria', name: 'Novaria', game: 'mlbb', primaryRole: 'MID', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Novaria' },
  { id: 'mlbb_beatrix', name: 'Beatrix', game: 'mlbb', primaryRole: 'GOLD', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Beatrix' },
  { id: 'mlbb_claude', name: 'Claude', game: 'mlbb', primaryRole: 'GOLD', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Claude' },
  { id: 'mlbb_brody', name: 'Brody', game: 'mlbb', primaryRole: 'GOLD', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Brody' },
  { id: 'mlbb_wanwan', name: 'Wanwan', game: 'mlbb', primaryRole: 'GOLD', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Wanwan' },
  { id: 'mlbb_khufra', name: 'Khufra', game: 'mlbb', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Khufra' },
  { id: 'mlbb_franco', name: 'Franco', game: 'mlbb', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Franco' },
  { id: 'mlbb_kaja', name: 'Kaja', game: 'mlbb', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kaja' },
  { id: 'mlbb_diggie', name: 'Diggie', game: 'mlbb', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Diggie' },
  { id: 'mlbb_mathilda', name: 'Mathilda', game: 'mlbb', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mathilda' },
  { id: 'mlbb_tigreal', name: 'Tigreal', game: 'mlbb', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Tigreal' },
  { id: 'mlbb_arlott', name: 'Arlott', game: 'mlbb', primaryRole: 'EXP', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Arlott' },
  { id: 'mlbb_fredrinn', name: 'Fredrinn', game: 'mlbb', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fredrinn' },
  { id: 'mlbb_baxia', name: 'Baxia', game: 'mlbb', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Baxia' },
  { id: 'mlbb_karrie', name: 'Karrie', game: 'mlbb', primaryRole: 'GOLD', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Karrie' }
];

export const MLBB_OBJECTIVES: ObjectiveDefinition[] = [
  { id: 'turtle', name: 'Turtle', game: 'mlbb', icon: '🐢', description: 'Team Shield & Gold bonus' },
  { id: 'lord', name: 'Lord', game: 'mlbb', icon: '👑', description: 'Summons siege Lord in weakest enemy lane' },
  { id: 'enhanced_lord', name: 'Enhanced Lord', game: 'mlbb', icon: '⚡', description: 'Enhanced Lord with charge crash ability' }
];

// Official MPL / M-Series 10-ban format:
// Phase 1 Bans: Blue, Red, Blue, Red, Blue, Red (3 bans each)
// Phase 1 Picks: Blue 1, Red 2, Blue 2, Red 1 (3 picks each)
// Phase 2 Bans: Red, Blue, Red, Blue (2 bans each)
// Phase 2 Picks: Red 1, Blue 2, Red 1 (2 picks each)
export const MLBB_DRAFT_CONFIG: DraftRuleConfig = {
  game: 'mlbb',
  name: 'Standard Tournament (10-Ban Split)',
  totalBansPerTeam: 5,
  totalPicksPerTeam: 5,
  defaultTimerSeconds: 40,
  phases: [
    // Phase 1: 3 bans per team
    { id: 'p1_b_b1', phaseNumber: 1, type: 'ban', team: 'blue', timeSeconds: 40, slotIndex: 0, label: 'Blue Ban 1' },
    { id: 'p1_r_b1', phaseNumber: 2, type: 'ban', team: 'red', timeSeconds: 40, slotIndex: 0, label: 'Red Ban 1' },
    { id: 'p1_b_b2', phaseNumber: 3, type: 'ban', team: 'blue', timeSeconds: 40, slotIndex: 1, label: 'Blue Ban 2' },
    { id: 'p1_r_b2', phaseNumber: 4, type: 'ban', team: 'red', timeSeconds: 40, slotIndex: 1, label: 'Red Ban 2' },
    { id: 'p1_b_b3', phaseNumber: 5, type: 'ban', team: 'blue', timeSeconds: 40, slotIndex: 2, label: 'Blue Ban 3' },
    { id: 'p1_r_b3', phaseNumber: 6, type: 'ban', team: 'red', timeSeconds: 40, slotIndex: 2, label: 'Red Ban 3' },
    // Phase 1: 3 picks per team
    { id: 'p1_b_p1', phaseNumber: 7, type: 'pick', team: 'blue', timeSeconds: 40, slotIndex: 0, label: 'Blue Pick 1' },
    { id: 'p1_r_p1', phaseNumber: 8, type: 'pick', team: 'red', timeSeconds: 40, slotIndex: 0, label: 'Red Pick 1' },
    { id: 'p1_r_p2', phaseNumber: 9, type: 'pick', team: 'red', timeSeconds: 40, slotIndex: 1, label: 'Red Pick 2' },
    { id: 'p1_b_p2', phaseNumber: 10, type: 'pick', team: 'blue', timeSeconds: 40, slotIndex: 1, label: 'Blue Pick 2' },
    { id: 'p1_b_p3', phaseNumber: 11, type: 'pick', team: 'blue', timeSeconds: 40, slotIndex: 2, label: 'Blue Pick 3' },
    { id: 'p1_r_p3', phaseNumber: 12, type: 'pick', team: 'red', timeSeconds: 40, slotIndex: 2, label: 'Red Pick 3' },
    // Phase 2: 2 bans per team
    { id: 'p2_r_b4', phaseNumber: 13, type: 'ban', team: 'red', timeSeconds: 40, slotIndex: 3, label: 'Red Ban 4' },
    { id: 'p2_b_b4', phaseNumber: 14, type: 'ban', team: 'blue', timeSeconds: 40, slotIndex: 3, label: 'Blue Ban 4' },
    { id: 'p2_r_b5', phaseNumber: 15, type: 'ban', team: 'red', timeSeconds: 40, slotIndex: 4, label: 'Red Ban 5' },
    { id: 'p2_b_b5', phaseNumber: 16, type: 'ban', team: 'blue', timeSeconds: 40, slotIndex: 4, label: 'Blue Ban 5' },
    // Phase 2: 2 picks per team
    { id: 'p2_r_p4', phaseNumber: 17, type: 'pick', team: 'red', timeSeconds: 40, slotIndex: 3, label: 'Red Pick 4' },
    { id: 'p2_b_p4', phaseNumber: 18, type: 'pick', team: 'blue', timeSeconds: 40, slotIndex: 3, label: 'Blue Pick 4' },
    { id: 'p2_b_p5', phaseNumber: 19, type: 'pick', team: 'blue', timeSeconds: 40, slotIndex: 4, label: 'Blue Pick 5' },
    { id: 'p2_r_p5', phaseNumber: 20, type: 'pick', team: 'red', timeSeconds: 40, slotIndex: 4, label: 'Red Pick 5' }
  ]
};
