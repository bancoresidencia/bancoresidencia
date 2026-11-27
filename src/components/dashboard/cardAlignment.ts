import type { CardRects, CardRect, EdgeX, EdgeY } from './cardGeometry';
import type { AlignmentGuide } from './FigmaSmartGuides';

export function cardAlignment(cards: CardRects, id:string, r:CardRect, width:number, height:number, x:EdgeX, y:EdgeY) {
  const guides: AlignmentGuide[]=[];
  const delta={x:0,y:0};
  const moving=x==='none' && y==='none';
  for(const axis of ['x','y'] as const){
    const horizontal=axis==='x', edge=horizontal?x:y;
    if(!moving && edge==='none') continue;
    const size=horizontal?'width':'height', cross=horizontal?'y':'x', crossSize=horizontal?'height':'width';
    const span=horizontal?width:height;
    const offsets=moving?[0,.5,1]:[edge==='left'||edge==='top'?0:1];
    let best=6.01;
    let guide:AlignmentGuide|undefined;
    function candidate(anchor:number,target:number,label:string,start:number,end:number){
      const shift=target-anchor;
      if(Math.abs(shift)>=best)return;
      best=Math.abs(shift);delta[axis]=shift;
      guide={type:horizontal?'vertical':'horizontal',position:target,start,end,label};
    }
    const neighbors=Object.entries(cards).filter(([key])=>key!==id).map(([,rect])=>rect);
    for(const offset of offsets){
      const anchor=r[axis]+r[size]*offset;
      if(offset===.5)candidate(anchor,span/2,'Centro do painel',0,horizontal?height:width);
      for(const other of neighbors){
        if(!moving && Math.abs(r[size]-other[size])<=6){
          const match=offset===1?r[axis]+other[size]:r[axis]+r[size]-other[size];
          candidate(anchor,match,horizontal?'Mesma largura':'Mesma altura',r[cross],r[cross]+r[crossSize]);
        }
        for(const target of [0,.5,1]){
          if((offset===.5)!==(target===.5))continue;
          candidate(anchor,other[axis]+target*other[size],target===.5?'Centros':'Bordas',
            Math.min(other[cross],r[cross]),Math.max(other[cross]+other[crossSize],r[cross]+r[crossSize]));
        }
      }
    }
    if(moving){
      const lane=neighbors.filter(n=>n[cross]<r[cross]+r[crossSize] && r[cross]<n[cross]+n[crossSize]);
      const before=Math.max(-Infinity,...lane.filter(n=>n[axis]+n[size]<=r[axis]+6).map(n=>n[axis]+n[size]));
      const after=Math.min(Infinity,...lane.filter(n=>n[axis]>=r[axis]+r[size]-6).map(n=>n[axis]));
      if(Number.isFinite(before+after)&&after-before>=r[size]){
        candidate(r[axis],(before+after-r[size])/2,'Espaços iguais',r[cross],r[cross]+r[crossSize]);
      }
    }
    if(guide)guides.push(guide);
  }
  return {delta,guides};
}
