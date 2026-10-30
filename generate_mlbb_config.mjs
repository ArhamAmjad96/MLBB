// generate_mlbb_config.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generate() {
  const res = await fetch('https://raw.githubusercontent.com/Ceplin03/database-mlbb.Mobile-Legends-Bang-Bang/master/hero.json');
  const heroes = await res.json();

  // Known specific overrides for competitive MLBB lanes
  const jungleOverrides = new Set([
    'Fanny', 'Ling', 'Lancelot', 'Hayabusa', 'Gusion', 'Helcurt', 'Hanzo',
    'Karina', 'Saber', 'Alucard', 'Aamon', 'Nolan', 'Harley', 'Yi Sun-shin',
    'Julian', 'Baxia', 'Fredrinn', 'Barats', 'Balmond', 'Aulus', 'Martis'
  ]);

  const goldOverrides = new Set([
    'Beatrix', 'Claude', 'Brody', 'Wanwan', 'Karrie', 'Moskov', 'Bruno',
    'Clint', 'Lesley', 'Irithel', 'Miya', 'Layla', 'Hanabi', 'Popol and Kupa',
    'Melissa', 'Natan', 'Ixia', 'Kimmy', 'Granger', 'Harith'
  ]);

  const roamOverrides = new Set([
    'Khufra', 'Franco', 'Kaja', 'Diggie', 'Mathilda', 'Tigreal', 'Atlas',
    'Grock', 'Minotaur', 'Lolita', 'Belerick', 'Johnson', 'Hylos', 'Gatotkaca',
    'Carmilla', 'Angela', 'Estes', 'Rafaela', 'Floryn', 'Faramis', 'Chip',
    'Akai', 'Natalia'
  ]);

  const midOverrides = new Set([
    'Kagura', 'Valentina', 'Pharsa', 'Yve', 'Novaria', 'Lunox', 'Kadita',
    'Luo Yi', 'Xavier', 'Cecilion', 'Lylia', 'Nana', 'Eudora', 'Gord',
    'Aurora', 'Vale', 'Valir', 'Vexana', 'Chang\'e', 'Odette', 'Cyclops',
    'Alice', 'Zhask', 'Zhuxin'
  ]);

  const expOverrides = new Set([
    'Chou', 'Yu Zhong', 'Paquito', 'Uranus', 'Lapu-Lapu', 'Terizla', 'Arlott',
    'Benedetta', 'Cici', 'Dyrroth', 'Thamuz', 'Ruby', 'Alpha', 'Badang',
    'Guinevere', 'Silvanna', 'Masha', 'Phoveus', 'Esmeralda', 'Gloo', 'Edith',
    'X.Borg', 'Sun', 'Zilong', 'Hilda', 'Jawhead', 'Freya', 'Leomord',
    'Aldous', 'Argus', 'Khaleed', 'Bane', 'Minsitthar', 'Joy', 'Suyou', 'Lukas', 'Yin'
  ]);

  function getLane(name, rawRoles) {
    if (jungleOverrides.has(name)) return 'JUNGLE';
    if (goldOverrides.has(name)) return 'GOLD';
    if (roamOverrides.has(name)) return 'ROAM';
    if (midOverrides.has(name)) return 'MID';
    if (expOverrides.has(name)) return 'EXP';

    const roles = rawRoles.map(r => r.toLowerCase());
    if (roles.includes('marksman')) return 'GOLD';
    if (roles.includes('mage')) return 'MID';
    if (roles.includes('support')) return 'ROAM';
    if (roles.includes('tank')) return 'ROAM';
    if (roles.includes('assassin')) return 'JUNGLE';
    if (roles.includes('fighter')) return 'EXP';
    return 'EXP';
  }

  const processedHeroes = heroes.map(h => {
    const rawName = h.name_hero.trim();
    const id = 'mlbb_' + rawName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const imgFile = h['images-hero'] || `${rawName.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
    const lane = getLane(rawName, h.role);
    // local path first with cdn fallback
    const avatar = `/heroes/mlbb/${imgFile}`;

    return {
      id,
      name: rawName,
      game: 'mlbb',
      primaryRole: lane,
      avatar,
      fallbackAvatar: `https://cdn.jsdelivr.net/gh/Ceplin03/database-mlbb.Mobile-Legends-Bang-Bang@master/images-hero/${imgFile}`
    };
  });

  // Sort alphabetically by name
  processedHeroes.sort((a, b) => a.name.localeCompare(b.name));

  const content = `import { HeroDefinition, ObjectiveDefinition, DraftRuleConfig } from '../../../shared/types.js';

export const MLBB_HEROES: HeroDefinition[] = ${JSON.stringify(processedHeroes, null, 2)};

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
`;

  const targetPath = path.resolve(__dirname, 'server/src/config/mlbb.ts');
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`Successfully generated ${processedHeroes.length} heroes into ${targetPath}!`);
}

generate().catch(console.error);
