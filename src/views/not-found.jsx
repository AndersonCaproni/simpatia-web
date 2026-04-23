const NotFound = () => {
  return (
    <>
      <style>{`
        .nf-root {
          height: 100dvh;
          width: 100dvw;
          background: var(--gradiente-azul-claro);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          font-family: var(--font-family), sans-serif;
          padding: 1.5rem;
          box-sizing: border-box;
        }

        .nf-bg-lines {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(55,1,153,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(55,1,153,0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .nf-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
          width: 100%;
          max-width: 600px;
          opacity: 0;
          transform: translateY(24px);
          animation: nf-reveal 1s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
        }

        @keyframes nf-reveal {
          to { opacity: 1; transform: translateY(0); }
        }

        .nf-badge {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.3em;
          color: var(--azul-principal);
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          opacity: 0;
          animation: nf-reveal 0.8s ease 0.4s forwards;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nf-badge::before, .nf-badge::after {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: var(--azul-principal);
          opacity: 0.4;
        }

        .nf-number-wrap {
          position: relative;
          opacity: 0;
          animation: nf-reveal 1s cubic-bezier(0.22,1,0.36,1) 0.25s forwards;
        }

        .nf-number {
          font-size: clamp(8rem, 28vw, 22rem);
          font-weight: 700;
          line-height: 0.85;
          letter-spacing: -0.05em;
          background: linear-gradient(135deg, var(--azul-principal) 0%, rgba(4, 7, 205, 0.2) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          user-select: none;
        }

        .nf-number-shadow {
          position: absolute;
          inset: 0;
          font-size: clamp(8rem, 28vw, 22rem);
          font-weight: 700;
          line-height: 0.85;
          letter-spacing: -0.05em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(55,1,153,0.15);
          transform: translate(4px, 6px);
          z-index: -1;
          user-select: none;
          animation: nf-glitch 5s infinite;
        }

        @keyframes nf-glitch {
          0%, 90%, 100% { clip-path: none; transform: translate(4px, 6px); }
          91%            { clip-path: inset(20% 0 60% 0); transform: translate(8px, 6px); }
          93%            { clip-path: inset(60% 0 10% 0); transform: translate(-4px, 6px); }
          95%            { clip-path: none; transform: translate(4px, 6px); }
        }

        .nf-divider {
          width: 1px;
          height: 48px;
          background: linear-gradient(to bottom, transparent, var(--roxo-principal), transparent);
          margin: 0.75rem 0 1.25rem;
          opacity: 0;
          animation: nf-reveal 0.8s ease 0.55s forwards;
        }

        .nf-title {
          font-size: var(--heading-40-size);
          font-weight: var(--heading-40-weight);
          line-height: var(--heading-40-line);
          color: var(--azul-principal);
          margin: 0 0 0.5rem;
          opacity: 0;
          animation: nf-reveal 0.8s ease 0.65s forwards;
        }

        .nf-subtitle {
          font-size: var(--body-16-medium-size);
          font-weight: var(--body-16-medium-weight);
          line-height: var(--body-16-medium-line);
          color: var(--neutro-500);
          margin: 0 0 2.5rem;
          opacity: 0;
          animation: nf-reveal 0.8s ease 0.75s forwards;
        }

        .nf-btn {
          position: relative;
          padding: 0.85rem 2.25rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-family: var(--font-family), sans-serif;
          font-size: var(--body-16-semi-size);
          font-weight: var(--body-16-semi-weight);
          color: var(--neutro-000);
          background: var(--gradiente-azul-escuro);
          box-shadow: 0 0 0 1px rgba(55,1,153,0.2), 0 8px 24px rgba(55,1,153,0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          overflow: hidden;
          opacity: 0;
          animation: nf-reveal 0.8s ease 0.9s forwards;
        }

        .nf-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
        }

        .nf-btn-shine {
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }

        .nf-btn:hover .nf-btn-shine { left: 150%; }
        .nf-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(55,1,153,0.4), 0 12px 32px rgba(55,1,153,0.4);
          filter: brightness(1.1);
        }
        .nf-btn:active { transform: translateY(0); filter: brightness(0.95); }

        .nf-btn-text { position: relative; z-index: 1; }

        .nf-corner {
          position: fixed;
          font-size: 0.6rem;
          font-weight: 500;
          color: var(--azul-principal);
          opacity: 0;
          letter-spacing: 0.15em;
          animation: nf-reveal 1s ease 1.1s forwards;
        }
        .nf-corner.tl { top: 1.5rem; left: 1.5rem; }
        .nf-corner.tr { top: 1.5rem; right: 1.5rem; text-align: right; }

        @media (max-width: 480px) {
          .nf-title { font-size: var(--heading-32-size); }
          .nf-corner { display: none; }
          .nf-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="nf-root">
        <div className="nf-bg-lines" />

        <span className="nf-corner tl">erro / 404</span>
        <span className="nf-corner tr">página não encontrada</span>

        <div className="nf-content">
          <div className="nf-badge">Erro do sistema</div>

          <div className="nf-number-wrap">
            <div className="nf-number">404</div>
            <div className="nf-number-shadow">404</div>
          </div>

          <div className="nf-divider" />

          <h1 className="nf-title">Página não encontrada</h1>
          <p className="nf-subtitle">O destino que você procura não existe neste universo</p>

          <button className="nf-btn" onClick={() => window.history.back()}>
            <div className="nf-btn-shine" />
            <span className="nf-btn-text">Voltar</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default NotFound;