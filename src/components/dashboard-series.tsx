type Point={day:string;conversations:number;leads:number;sales:number;revenue:number}

export function DashboardSeries({data}:{data:Point[]}){
  if(!data.length)return <div className="empty">Ainda não há dados neste período.</div>
  const w=720,h=220,p=24,max=Math.max(1,...data.map(x=>Number(x.conversations||0)))
  const xy=data.map((x,i)=>({x:p+i*(w-p*2)/Math.max(1,data.length-1),y:h-p-(Number(x.conversations||0)/max)*(h-p*2),v:Number(x.conversations||0),day:x.day}))
  const points=xy.map(q=>`${q.x},${q.y}`).join(' ')
  const area=`M ${p} ${h-p} L ${points.replaceAll(' ', ' L ')} L ${w-p} ${h-p} Z`
  const every=Math.max(1,Math.ceil(data.length/6))
  return <div className="chart-wrap"><svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Evolução das conversas no período"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d8ff72" stopOpacity=".22"/><stop offset="100%" stopColor="#d8ff72" stopOpacity="0"/></linearGradient></defs>{[.25,.5,.75,1].map(n=><line key={n} className="chart-gridline" x1={p} x2={w-p} y1={p+(h-p*2)*n} y2={p+(h-p*2)*n}/>)}<path d={area} className="chart-area"/><polyline points={points} className="chart-line"/>{xy.map((q,i)=><g key={q.day}><circle className="chart-dot" cx={q.x} cy={q.y} r="4"/>{(i%every===0||i===xy.length-1)&&<text className="chart-label" x={q.x} y={h-4} textAnchor="middle">{new Date(`${q.day}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</text>}</g>)}</svg></div>
}
