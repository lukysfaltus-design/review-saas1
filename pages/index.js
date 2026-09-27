export default function Home() {
  return (
    <div className="landing">
      <div className="card">
        <h1>Recenzní systém</h1>
        <p>
          Toto je backend a admin aplikace. Klientské recenzní stránky žijí na{' '}
          <code>/r/[slug]</code>.
        </p>
        <a className="btn" href="/admin">
          Přejít do administrace
        </a>
      </div>
    </div>
  );
}
