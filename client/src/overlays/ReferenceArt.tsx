import type { CSSProperties } from 'react';

import { DRAFT_ART, HUD_ART, isReferencePreview } from './referenceAssets';

/** Reuse the approved artwork at its native coordinates; no resampling or generated substitutes. */
export function ArtSlice({ source = DRAFT_ART, x, y, width, height, className = '', style }: {
  source?: string; x: number; y: number; width: number; height: number;
  className?: string; style?: CSSProperties;
}) {
  return <span aria-hidden="true" className={`art-slice ${className}`} style={{
    width, height, backgroundImage: `url("${source}")`, backgroundPosition: `${-x}px ${-y}px`,
    ...style,
  }} />;
}

export function DraftFrame({customLogo=false}:{customLogo?:boolean}) {
  return <svg className="approved-frame" viewBox="0 0 1672 941" aria-hidden="true">
    <defs>
      <clipPath id="draft-approved-frame">
        <path d="M0 0H1672V135H1377L1356 114H1020L1003 146H988L955 183H847L836 197L824 183H720L688 147H671L651 114H317L299 137H0Z" />
        <path d="M0 548H650Q668 548 680 568L704 603Q712 612 729 612H944Q960 612 972 596L1002 558Q1014 548 1030 548H1672V941H0Z" />
        <path d="M733 648L836 546L942 648L836 735Z" />
        <path d="M818 531L825 524L831 535L837 538L845 533L851 525L849 540L857 549L856 565L863 584L854 591L851 610L845 624L836 641L827 623L821 609L818 590L808 582L817 566L815 550L824 540Z" />
      </clipPath>
      <mask id="draft-editable-brand-mask">
        <rect width="1672" height="941" fill="white"/>
        <path d="M0 0H394L297 133H0Z" fill="black"/>
        <rect x="1343" width="329" height="88" fill="black"/>
        {customLogo && <><path d="M733 648L836 546L942 648L836 735Z" fill="black"/><rect x="803" y="521" width="65" height="123" fill="black"/></>}
      </mask>
    </defs>
    <path d="M755 634H919V663L888 691H785L755 663Z" fill="#17141b"/>
    <image mask="url(#draft-editable-brand-mask)" href={DRAFT_ART} width="1672" height="941" clipPath="url(#draft-approved-frame)" />
  </svg>;
}

/** An illustrative feed layer, enabled only in the explicitly requested reference review. */
export function ReferenceBackdrop({kind}:{kind:'draft'|'hud'}) {
  const params=new URLSearchParams(window.location.search);
  if (!isReferencePreview() || params.get('backdrop')!=='reference') return null;
  return <svg viewBox="0 0 1672 941" className="reference-backdrop" aria-hidden="true">
    <defs><mask id={`reference-feed-${kind}`}>
      {kind==='draft' ? <>
        <path fill="white" d="M0 137H299L317 114H651L671 147H688L720 183H824L836 197L847 183H955L988 146H1003L1020 114H1356L1377 135H1672V548H1030Q1014 548 1002 558L972 596Q960 612 944 612H729Q712 612 704 603L680 568Q668 548 650 548H0Z"/>
        <path d="M43 168H297L312 183V196H32V175Z" fill="black"/>
        {Array.from({length:5},(_,i)=><rect key={i} x="32" y={203+i*56} width="280" height="50" fill="black"/>)}
        <path d="M733 648L836 546L942 648L836 735Z" fill="black"/>
        <path d="M818 531L825 524L831 535L837 538L845 533L851 525L849 540L857 549L856 565L863 584L854 591L851 610L845 624L836 641L827 623L821 609L818 590L808 582L817 566L815 550L824 540Z" fill="black"/>
      </> : <>
        <rect width="1672" height="559" fill="white"/>
        <path d="M250 0H1672V111H1378L1390 88H1375L1366 112H1228L1216 111H898L874 124H796L774 111H426L410 112H299Z" fill="black"/>
        {Array.from({length:5},(_,i)=><g key={i}>
          <path d={`M18 ${257+i*62}H263L245 ${314+i*62}H0Z`} fill="black"/>
          <path d={`M1409 ${257+i*62}H1654L1672 ${314+i*62}H1427Z`} fill="black"/>
        </g>)}
      </>}
    </mask></defs>
    {kind==='hud' && <rect width="1672" height="125" fill="#080f13"/>}
    <image href={kind==='draft'?DRAFT_ART:HUD_ART} width="1672" height="941" mask={`url(#reference-feed-${kind})`}/>
  </svg>;
}
