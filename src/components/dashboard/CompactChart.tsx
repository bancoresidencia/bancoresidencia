import React from 'react';

export function CompactMeter({value, goal}: {value:number; goal:number}) {
  const percent = Math.max(0, Math.min(100, value));
  return <div className="mini-meter">
    <div className="mini-meter-label"><strong>{percent.toLocaleString('pt-BR')}%</strong><small>Meta {goal}%</small></div>
    <div className="mini-track"><i style={{width:percent+'%'}}/><b title={'Meta: '+goal+'%'} style={{left:goal+'%'}}/></div>
  </div>;
}

export function CompactTrend({values}: {values:number[]}) {
  if (!values.length) return <strong>Sem registros no período</strong>;
  const max=Math.max(1,...values);
  const points=values.map((v,i)=>[2+96*i/Math.max(1,values.length-1),27-24*v/max].join(',')).join(' ');
  return <svg role="img" aria-label="Evolução das questões resolvidas no período" viewBox="0 0 100 30" preserveAspectRatio="none" className="mini-trend"><circle cx="2" cy={27-24*values[0]/max} r="1.6" fill="currentColor"/><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg>;
}

export function CompactHours({hours}: {hours:number[]}) {
  const peak=Math.max(...hours), total=hours.reduce((a,b)=>a+b,0);
  if(!total)return <strong>Sem registros no período</strong>;
  return <><strong>{'Pico às '+hours.indexOf(peak)+'h'}</strong><div className="mini-hours">{hours.map((v,i)=><i key={i} title={i+'h · '+v} style={{opacity:0.15+0.85*v/peak}}/>)}</div><div className="mini-hour-labels"><small>0h</small><small>12h</small><small>23h</small></div></>;
}
