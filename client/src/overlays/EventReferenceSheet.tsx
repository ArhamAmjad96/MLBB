import type { MatchEvent, SpecialEventType } from '../../../shared/types';
import { EventBanner } from './Broadcast';
import { HudOverlay } from './HudOverlay';

const examples: SpecialEventType[] = ['first_blood','double_kill','triple_kill','maniac','savage','turtle_secured','lord_secured','shutdown','victory'];
export function EventReferenceSheet() {
  return <div className={`overlay-canvas broadcast reference-sheet ${new URLSearchParams(location.search).get('backdrop')==='reference'?'with-reference-feed':''}`}>
    <HudOverlay/>
    <div className="reference-stage reference-event-gallery">
      {examples.map(kind=>{
        const event:MatchEvent={id:kind,matchId:'local-design-review',game:'mlbb',type:'special',team:'blue',specialType:kind,headline:kind.replaceAll('_',' '),gameTimeSeconds:0,realTimestamp:0};
        return <EventBanner key={kind} event={event} teamName="ILL"/>;
      })}
    </div>
  </div>;
}
