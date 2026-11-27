import React from 'react';

export function CompactMeter({value, goal, gauge=false}: {value:number; goal?:number; gauge?:boolean}) {
  const percent=Math.max(0,Math.min(100,value));
  return <div className={gauge?'mini-meter mini-gauge':'mini-meter'} aria-label={percent+'%'}>
    {gauge && <svg aria-hidden="true" viewBox="0 0 110 59">
      <path d="M5 55 A50 50 0 0 1 105 55" pathLength="100" fill="none" stroke="var(--card-border,#888)" strokeWidth="8"/>
      <path d="M5 55 A50 50 0 0 1 105 55" pathLength="100" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={percent+' 100'}/>
    </svg>}
    <strong>{percent.toLocaleString('pt-BR')}%</strong>
    <div className="mini-track"><i style={{width:percent+'%'}}/>{goal!==undefined&&<b title={'Meta: '+goal+'%'} style={{left:goal+'%'}}/>}</div>
  </div>;
}

export function CompactTrend({values}: {values:number[]}) {
  const max=Math.max(1,...values);
  const points=values.map((v,i)=>[2+96*i/Math.max(1,values.length-1),27-24*v/max].join(',')).join(' ');
  return <svg role="img" aria-label="Evolução das questões resolvidas no período" viewBox="0 0 100 30" preserveAspectRatio="none" className="mini-trend"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg>;
}

export function CompactHours({hours}: {hours:number[]}) {
  const peak=Math.max(...hours), total=hours.reduce((a,b)=>a+b,0);
  if(!total)return <strong>Sem registros no período</strong>;
  return <><strong>{total<3?total+' registros':'Pico às '+hours.indexOf(peak)+'h'}</strong><div className="mini-hours">{hours.map((v,i)=><i key={i} title={i+'h · '+v} style={{opacity:0.15+0.85*v/peak}}/>)}</div></>;
}
