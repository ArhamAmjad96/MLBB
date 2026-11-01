import type { MatchLiveState, TeamMatchState } from '../../../shared/types';

const leftHeroes = ['Granger', 'Hylos', 'Gatotkaca', 'Lancelot', 'Uranus'];
const rightHeroes = ['Dyrroth', 'Karrie', 'Yve', 'Beatrix', 'Floryn'];
export const referenceStats = leftHeroes.map((name, i) => ({
  heroName: name, avatar: `/heroes/mlbb/${name.toLowerCase()}.png`,
  picks: [33, 28, 27, 24, 24][i], winRate: [52, 64, 41, 58, 54][i],
}));

// Available only on explicitly marked, local reference-preview URLs. Never written to match state.
export function referenceState(state: MatchLiveState, draft = false): MatchLiveState {
  function team(source: TeamMatchState, side: number): TeamMatchState {
    return { ...source, shortCode: side ? 'EXC' : 'ILL', name: side ? 'EXC' : 'ILL',
      coachName: side ? 'RAVEN' : 'KAZE', logo: '', seriesScore: side ? 0 : 1,
      kills: side ? 7 : 6, gold: 49900, towers: 9, objectives: { turtle: 3, lord: 2 },
      picks: Array.from({length: 5}, (_, i) => ({slot:i, playerName:`PLAYER${String(i + 1 + side * 5).padStart(2, '0')}`,
        ...(draft ? {} : {heroId:`ref-${side}-${i}`,heroName:(side ? rightHeroes : leftHeroes)[i],heroAvatar:`/heroes/mlbb/${(side ? rightHeroes : leftHeroes)[i].toLowerCase()}.png`}),
      })), bans: Array.from({length:5}, (_, i) => ({slot:i})),
    };
  }
  return { ...state, tournamentName:'FIRST BLOOD', matchName:'REGULAR SEASON - WEEK 1 DAY 1', format:'BO3', clockSeconds:1199,
    teamBlue:team(state.teamBlue,0),teamRed:team(state.teamRed,1),
    draft:{...state.draft,timerRemaining:48,isTimerRunning:true},
    overlayControls:{...state.overlayControls,draftStageLabel:'GROUP STAGE',draftStats:referenceStats},
  };
}
