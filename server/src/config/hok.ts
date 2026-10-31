import { HeroDefinition, ObjectiveDefinition, DraftRuleConfig } from '../../../shared/types.js';

export const HOK_HEROES: HeroDefinition[] = [
  { id: 'hok_han_xin', name: 'Han Xin', game: 'hok', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=HanXin' },
  { id: 'hok_li_bai', name: 'Li Bai', game: 'hok', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LiBai' },
  { id: 'hok_sun_wukong', name: 'Sun Wukong', game: 'hok', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Wukong' },
  { id: 'hok_nakoruru', name: 'Nakoruru', game: 'hok', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nakoruru' },
  { id: 'hok_lam', name: 'Lam', game: 'hok', primaryRole: 'JUNGLE', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lam' },
  { id: 'hok_mai_shiranui', name: 'Mai Shiranui', game: 'hok', primaryRole: 'MID', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mai' },
  { id: 'hok_angela', name: 'Angela', game: 'hok', primaryRole: 'MID', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Angela' },
  { id: 'hok_diaochan', name: 'Diaochan', game: 'hok', primaryRole: 'MID', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Diaochan' },
  { id: 'hok_liang', name: 'Liang', game: 'hok', primaryRole: 'MID', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Liang' },
  { id: 'hok_shangguan', name: 'Shangguan Waner', game: 'hok', primaryRole: 'MID', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shangguan' },
  { id: 'hok_luban_seven', name: 'Luban No. 7', game: 'hok', primaryRole: 'FARM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Luban' },
  { id: 'hok_arli', name: 'Arli', game: 'hok', primaryRole: 'FARM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Arli' },
  { id: 'hok_lady_sun', name: 'Lady Sun', game: 'hok', primaryRole: 'FARM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LadySun' },
  { id: 'hok_consort_yu', name: 'Consort Yu', game: 'hok', primaryRole: 'FARM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ConsortYu' },
  { id: 'hok_marcopolo', name: 'Marco Polo', game: 'hok', primaryRole: 'FARM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MarcoPolo' },
  { id: 'hok_allain', name: 'Allain', game: 'hok', primaryRole: 'CLASH', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Allain' },
  { id: 'hok_arthur', name: 'Arthur', game: 'hok', primaryRole: 'CLASH', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Arthur' },
  { id: 'hok_mayene', name: 'Mayene', game: 'hok', primaryRole: 'CLASH', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mayene' },
  { id: 'hok_charlotte', name: 'Charlotte', game: 'hok', primaryRole: 'CLASH', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Charlotte' },
  { id: 'hok_dolia', name: 'Dolia', game: 'hok', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dolia' },
  { id: 'hok_da_qiao', name: 'Da Qiao', game: 'hok', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DaQiao' },
  { id: 'hok_donghuang', name: 'Donghuang Taiyi', game: 'hok', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Donghuang' },
  { id: 'hok_sun_bin', name: 'Sun Bin', game: 'hok', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SunBin' },
  { id: 'hok_kangkang', name: 'Kui', game: 'hok', primaryRole: 'ROAM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kui' },
  { id: 'hok_fuzi', name: 'Old Master', game: 'hok', primaryRole: 'CLASH', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=OldMaster' }
];

export const HOK_OBJECTIVES: ObjectiveDefinition[] = [
  { id: 'primal_tyrant', name: 'Primal Tyrant', game: 'hok', icon: '🐉', description: 'Attack damage & physical/magical power boost' },
  { id: 'shadow_overlord', name: 'Shadow Overlord', game: 'hok', icon: '🐲', description: 'Summons 3 waves of powerful dragon vanguards' },
  { id: 'tempest_dragon', name: 'Tempest Dragon', game: 'hok', icon: '⚡', description: 'Massive lightning aura and shield (Late game 20m+)' }
];

// Honor of Kings (KPL Standard 4-Ban Tournament format)
// Phase 1 Bans: Blue 1, Red 1, Blue 2, Red 2 (2 bans each)
// Phase 1 Picks: Blue 1, Red 2, Blue 2, Red 1 (3 picks each)
// Phase 2 Bans: Red 3, Blue 3, Red 4, Blue 4 (2 bans each)
// Phase 2 Picks: Red 4, Blue 4, Blue 5, Red 5 (2 picks each)
export const HOK_DRAFT_CONFIG: DraftRuleConfig = {
  game: 'hok',
  name: 'KPL Standard Tournament (4-Ban Split)',
  totalBansPerTeam: 4,
  totalPicksPerTeam: 5,
  defaultTimerSeconds: 40,
  phases: [
    // Phase 1: 2 bans each
    { id: 'hok_p1_b_b1', phaseNumber: 1, type: 'ban', team: 'blue', timeSeconds: 40, slotIndex: 0, label: 'Blue Ban 1' },
    { id: 'hok_p1_r_b1', phaseNumber: 2, type: 'ban', team: 'red', timeSeconds: 40, slotIndex: 0, label: 'Red Ban 1' },
    { id: 'hok_p1_b_b2', phaseNumber: 3, type: 'ban', team: 'blue', timeSeconds: 40, slotIndex: 1, label: 'Blue Ban 2' },
    { id: 'hok_p1_r_b2', phaseNumber: 4, type: 'ban', team: 'red', timeSeconds: 40, slotIndex: 1, label: 'Red Ban 2' },
    // Phase 1: 3 picks each
    { id: 'hok_p1_b_p1', phaseNumber: 5, type: 'pick', team: 'blue', timeSeconds: 40, slotIndex: 0, label: 'Blue Pick 1' },
    { id: 'hok_p1_r_p1', phaseNumber: 6, type: 'pick', team: 'red', timeSeconds: 40, slotIndex: 0, label: 'Red Pick 1' },
    { id: 'hok_p1_r_p2', phaseNumber: 7, type: 'pick', team: 'red', timeSeconds: 40, slotIndex: 1, label: 'Red Pick 2' },
    { id: 'hok_p1_b_p2', phaseNumber: 8, type: 'pick', team: 'blue', timeSeconds: 40, slotIndex: 1, label: 'Blue Pick 2' },
    { id: 'hok_p1_b_p3', phaseNumber: 9, type: 'pick', team: 'blue', timeSeconds: 40, slotIndex: 2, label: 'Blue Pick 3' },
    { id: 'hok_p1_r_p3', phaseNumber: 10, type: 'pick', team: 'red', timeSeconds: 40, slotIndex: 2, label: 'Red Pick 3' },
    // Phase 2: 2 bans each
    { id: 'hok_p2_r_b3', phaseNumber: 11, type: 'ban', team: 'red', timeSeconds: 40, slotIndex: 2, label: 'Red Ban 3' },
    { id: 'hok_p2_b_b3', phaseNumber: 12, type: 'ban', team: 'blue', timeSeconds: 40, slotIndex: 2, label: 'Blue Ban 3' },
    { id: 'hok_p2_r_b4', phaseNumber: 13, type: 'ban', team: 'red', timeSeconds: 40, slotIndex: 3, label: 'Red Ban 4' },
    { id: 'hok_p2_b_b4', phaseNumber: 14, type: 'ban', team: 'blue', timeSeconds: 40, slotIndex: 3, label: 'Blue Ban 4' },
    // Phase 2: 2 picks each
    { id: 'hok_p2_r_p4', phaseNumber: 15, type: 'pick', team: 'red', timeSeconds: 40, slotIndex: 3, label: 'Red Pick 4' },
    { id: 'hok_p2_b_p4', phaseNumber: 16, type: 'pick', team: 'blue', timeSeconds: 40, slotIndex: 3, label: 'Blue Pick 4' },
    { id: 'hok_p2_b_p5', phaseNumber: 17, type: 'pick', team: 'blue', timeSeconds: 40, slotIndex: 4, label: 'Blue Pick 5' },
    { id: 'hok_p2_r_p5', phaseNumber: 18, type: 'pick', team: 'red', timeSeconds: 40, slotIndex: 4, label: 'Red Pick 5' }
  ]
};
