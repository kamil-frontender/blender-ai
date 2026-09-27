import { AICoreCanvas } from "@/components/ai-core-canvas";

const capabilities = [
  {
    index: "01",
    title: "Shared context",
    copy: "Give every agent the same product knowledge, constraints and live working state.",
  },
  {
    index: "02",
    title: "Connected tools",
    copy: "Route the right actions to the systems your team already uses.",
  },
  {
    index: "03",
    title: "Built-in checks",
    copy: "Keep every run observable, reviewable and aligned before it moves forward.",
  },
];

const workflow = ["Connect context", "Run any model", "Verify the output"];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function Home() {
  return (
    <main id="top">
      <section className="hero shell" aria-labelledby="hero-title">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="NEXUS home">
            <span className="brand-mark" aria-hidden="true" />
            NEXUS
          </a>
          <span className="system-status">
            <span aria-hidden="true" /> Runtime online
          </span>
        </header>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span>Agentic runtime</span></p>
            <h1 id="hero-title">One core.<br />Every AI workflow.</h1>
            <p className="hero-description">
              Context, tools and checks around any model.
            </p>
            <a className="primary-button" href="#demo">
              Launch the demo <ArrowIcon />
            </a>
            <p className="hero-note">Model-agnostic · Built for product teams</p>
          </div>

          <div className="core-stage">
            <div className="stage-label stage-label-top" aria-hidden="true">
              <span>CORE / 001</span><span>ACTIVE</span>
            </div>
            <div className="canvas-wrap">
              <AICoreCanvas />
            </div>
            <div className="stage-label stage-label-bottom" aria-hidden="true">
              <span>CONTEXT</span><span>TOOLS</span><span>CHECKS</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell" id="capabilities" aria-labelledby="capabilities-title">
        <div className="section-heading">
          <p className="eyebrow"><span>Capabilities</span></p>
          <h2 id="capabilities-title">Everything agents need.<br />Nothing they don’t.</h2>
        </div>
        <div className="capability-grid">
          {capabilities.map((capability) => (
            <article className="capability-card" key={capability.index}>
              <div className="card-topline">
                <span>{capability.index}</span>
                <span className="card-signal" aria-hidden="true" />
              </div>
              <h3>{capability.title}</h3>
              <p>{capability.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell workflow-section" id="demo" aria-labelledby="workflow-title">
        <div className="workflow-intro">
          <p className="eyebrow"><span>Workflow</span></p>
          <h2 id="workflow-title">One runtime.<br />A clear path forward.</h2>
          <p>Bring structure to every AI task without replacing the tools or models your team trusts.</p>
        </div>
        <ol className="workflow-list">
          {workflow.map((step, index) => (
            <li key={step}>
              <span>0{index + 1}</span>
              <strong>{step}</strong>
              <span className="workflow-line" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>

      <section className="final-section shell" aria-labelledby="final-title">
        <div className="final-panel">
          <p className="eyebrow"><span>Ready to run</span></p>
          <h2 id="final-title">Put every AI workflow<br />on solid ground.</h2>
          <p>See how NEXUS connects context, tools and checks in one focused runtime.</p>
          <a className="primary-button" href="#top">
            Explore NEXUS <ArrowIcon />
          </a>
          <div className="panel-grid" aria-hidden="true" />
        </div>
        <footer>
          <a className="brand" href="#top" aria-label="NEXUS home">
            <span className="brand-mark" aria-hidden="true" />
            NEXUS
          </a>
          <span>Agentic runtime for product teams.</span>
          <span>© 2025 NEXUS</span>
        </footer>
      </section>
    </main>
  );
}
