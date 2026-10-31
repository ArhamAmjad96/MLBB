import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store database in project root/data directory
const dataDir = path.resolve(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'mark47.db');
export const db = new DatabaseSync(dbPath);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      game TEXT NOT NULL,
      season TEXT,
      default_format TEXT NOT NULL DEFAULT 'BO3',
      status TEXT NOT NULL DEFAULT 'upcoming',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_code TEXT NOT NULL,
      game TEXT NOT NULL,
      logo TEXT,
      primary_color TEXT DEFAULT '#0284c7',
      secondary_color TEXT DEFAULT '#0f172a'
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      in_game_name TEXT NOT NULL,
      role TEXT NOT NULL,
      photo TEXT,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL,
      game TEXT NOT NULL,
      match_name TEXT NOT NULL,
      format TEXT NOT NULL DEFAULT 'BO3',
      current_game_number INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'scheduled',
      data_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS match_events (
      id TEXT PRIMARY KEY,
      match_id TEXT NOT NULL,
      game_time_seconds INTEGER NOT NULL,
      real_timestamp INTEGER NOT NULL,
      type TEXT NOT NULL,
      game TEXT NOT NULL,
      team TEXT NOT NULL,
      data_json TEXT NOT NULL,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS active_state (
      key TEXT PRIMARY KEY,
      data_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  seedInitialData();
}

export function saveActiveState(state: any): void {
  try {
    const stmt = db.prepare(`
      INSERT INTO active_state (key, data_json, updated_at)
      VALUES ('current_match', ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        data_json = excluded.data_json,
        updated_at = excluded.updated_at
    `);
    stmt.run(JSON.stringify(state), Date.now());
  } catch (err) {
    console.error('[MARK47 DB] Error saving active state:', err);
  }
}

export function loadActiveState(): any | null {
  try {
    const row = db.prepare(`SELECT data_json FROM active_state WHERE key = 'current_match'`).get() as { data_json: string } | undefined;
    if (row && row.data_json) {
      return JSON.parse(row.data_json);
    }
  } catch (err) {
    console.error('[MARK47 DB] Error loading active state:', err);
  }
  return null;
}

export function clearActiveState(): void {
  try {
    db.prepare(`DELETE FROM active_state WHERE key = 'current_match'`).run();
  } catch (err) {
    console.error('[MARK47 DB] Error clearing active state:', err);
  }
}

function seedInitialData() {
  const tournamentRows = db.prepare('SELECT count(*) as count FROM tournaments').all() as any[];
  const tournamentCount = tournamentRows[0]?.count ?? 0;
  if (tournamentCount > 0) return;

  const now = Date.now();

  // 1. Seed MLBB Tournament & Teams
  db.prepare(`
    INSERT INTO tournaments (id, name, game, season, default_format, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('mlbb-season-1', 'MARK47 MLBB Masters', 'mlbb', 'Season 1', 'BO3', 'live', now);

  const insertTeam = db.prepare(`
    INSERT INTO teams (id, name, short_code, game, logo, primary_color, secondary_color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertTeam.run('team_onic', 'Fnatic ONIC', 'FNOC', 'mlbb', 'https://api.dicebear.com/7.x/identicon/svg?seed=ONIC', '#f59e0b', '#000000');
  insertTeam.run('team_bren', 'AP.Bren', 'APBR', 'mlbb', 'https://api.dicebear.com/7.x/identicon/svg?seed=BREN', '#ef4444', '#1e293b');

  const insertPlayer = db.prepare(`
    INSERT INTO players (id, team_id, name, in_game_name, role, photo)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Players for ONIC
  insertPlayer.run('p_kairi', 'team_onic', 'Kairi Ygnacio', 'Kairi', 'JUNGLE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kairi');
  insertPlayer.run('p_sanz', 'team_onic', 'Gilang Sanz', 'Sanz', 'MID', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanz');
  insertPlayer.run('p_cw', 'team_onic', 'Calvin Winata', 'CW', 'GOLD', 'https://api.dicebear.com/7.x/avataaars/svg?seed=CW');
  insertPlayer.run('p_kiboy', 'team_onic', 'Nicky Fernando', 'Kiboy', 'ROAM', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kiboy');
  insertPlayer.run('p_lutpiii', 'team_onic', 'Lutfi Ardianto', 'Lutpiii', 'EXP', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lutpiii');

  // Players for AP.Bren
  insertPlayer.run('p_kyle', 'team_bren', 'Michael Sayson', 'KyleTzy', 'JUNGLE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=KyleTzy');
  insertPlayer.run('p_pheww', 'team_bren', 'Angelo Arcangel', 'Pheww', 'MID', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pheww');
  insertPlayer.run('p_super_marco', 'team_bren', 'Marco Requitano', 'Super Marco', 'GOLD', 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperMarco');
  insertPlayer.run('p_owgwen', 'team_bren', 'Rowgien Stimpson', 'Owgwen', 'ROAM', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Owgwen');
  insertPlayer.run('p_flaptzy', 'team_bren', 'David Canon', 'FlapTzy', 'EXP', 'https://api.dicebear.com/7.x/avataaars/svg?seed=FlapTzy');

  // 2. Seed HOK Tournament & Teams
  db.prepare(`
    INSERT INTO tournaments (id, name, game, season, default_format, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('hok-championship-1', 'MARK47 HOK Invitational', 'hok', '2026 Invitational', 'BO5', 'live', now);

  insertTeam.run('team_ag', 'All Gamers', 'AG', 'hok', 'https://api.dicebear.com/7.x/identicon/svg?seed=AG', '#dc2626', '#111827');
  insertTeam.run('team_wolves', 'Chongqing Wolves', 'WOLVES', 'hok', 'https://api.dicebear.com/7.x/identicon/svg?seed=Wolves', '#eab308', '#18181b');

  // Players for AG
  insertPlayer.run('p_yinuo', 'team_ag', 'Xu Bicheng', 'Yinuo', 'FARM', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yinuo');
  insertPlayer.run('p_yixing', 'team_ag', 'Chen Jiayu', 'Yixing', 'MID', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yixing');
  insertPlayer.run('p_zhongdan', 'team_ag', 'Bao Haoran', 'ZhongDan', 'JUNGLE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhongDan');
  insertPlayer.run('p_damao', 'team_ag', 'Mao Zichen', 'DaMao', 'ROAM', 'https://api.dicebear.com/7.x/avataaars/svg?seed=DaMao');
  insertPlayer.run('p_xuanran', 'team_ag', 'Guo Yuxuan', 'XuanRan', 'CLASH', 'https://api.dicebear.com/7.x/avataaars/svg?seed=XuanRan');

  // Players for Wolves
  insertPlayer.run('p_fly', 'team_wolves', 'Peng Yunfei', 'Fly', 'CLASH', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fly');
  insertPlayer.run('p_xiaopang', 'team_wolves', 'Li Daheng', 'XiaoPang', 'JUNGLE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=XiaoPang');
  insertPlayer.run('p_xiangyu', 'team_wolves', 'Cai Youzhe', 'XiangYu', 'MID', 'https://api.dicebear.com/7.x/avataaars/svg?seed=XiangYu');
  insertPlayer.run('p_yaoyang', 'team_wolves', 'Wang Yang', 'YaoYang', 'FARM', 'https://api.dicebear.com/7.x/avataaars/svg?seed=YaoYang');
  insertPlayer.run('p_fan', 'team_wolves', 'Yang Fan', 'Fan', 'ROAM', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fan');
}
