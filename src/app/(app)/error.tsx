'use client'
export default function ErrorPage({error,reset}:{error:Error;reset:()=>void}){return <div className="page error-page"><div><h2>Não foi possível carregar esta área</h2><p className="muted">{error.message}</p><button className="btn btn-primary" onClick={reset}>Tentar novamente</button></div></div>}
