export default function Home() {
  return (
    <div className="wrap">
      <div className="card">
        <h1>Recenzní systém</h1>
        <p className="sub">Toto je backend a admin aplikace. Klientské recenzní stránky žijí na /r/[slug].</p>
        <a className="button" href="/admin">Přejít do administrace</a>
      </div>
    </div>
  );
}
