import { CoreStage } from "@/components/core-stage";
import { PageEffects } from "@/components/page-effects";

const capabilities = [
  {
    index: "01",
    tag: "Контекст",
    title: "Общий контекст",
    copy: "Каждый агент знает ваш продукт, ограничения и текущее состояние работы. Без контекста даже лучшая модель гадает — с ним она решает.",
  },
  {
    index: "02",
    tag: "Инструменты",
    title: "Подключённые инструменты",
    copy: "Агент не советует, а действует: заводит задачи, правит код и работает с API тех систем, которыми команда уже пользуется.",
  },
  {
    index: "03",
    tag: "Проверки",
    title: "Встроенные проверки",
    copy: "Тесты, ревью и правила срабатывают до того, как результат уйдёт дальше. Каждый запуск наблюдаем — автономность без хаоса.",
  },
];

const workflow = [
  {
    title: "Подключите контекст",
    copy: "Документация, код, решения команды — в одном источнике правды.",
  },
  {
    title: "Запустите любую модель",
    copy: "Меняйте модели как двигатели. Обвязка остаётся вашей.",
  },
  {
    title: "Проверьте результат",
    copy: "Автоматические проверки до того, как изменения попадут в продукт.",
  },
];

const thesis = [
  { value: "1×", label: "собираете обвязку" },
  { value: "∞", label: "задач, которые она закрывает" },
  { value: "0", label: "привязки к одной модели" },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BrandLink() {
  return (
    <a className="brand" href="#top" aria-label="NEXUS — на главную">
      <span className="brand-mark" aria-hidden="true" />
      NEXUS
    </a>
  );
}

export default function Home() {
  return (
    <main id="top">
      <PageEffects />
      <div className="ambient" aria-hidden="true" />

      <header className="site-header">
        <div className="shell site-header-inner">
          <BrandLink />
          <nav className="site-nav" aria-label="Разделы">
            <a href="#capabilities">Почему это мета</a>
            <a href="#demo">Как это работает</a>
          </nav>
          <span className="system-status">
            <span aria-hidden="true" /> Ядро онлайн
          </span>
        </div>
      </header>

      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span>Агентный рантайм</span></p>
            <h1 id="hero-title">
              Одно ядро.<br />
              <span className="headline-accent">Все ваши AI&#8209;агенты.</span>
            </h1>
            <p className="hero-description">
              Модель — это только двигатель. Контекст, инструменты и&nbsp;проверки вокруг неё —
              ваш harness — превращают её в&nbsp;агента, который действительно делает работу.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#demo">
                Запустить демо <ArrowIcon />
              </a>
              <a className="ghost-button" href="#capabilities">
                Почему это мета
              </a>
            </div>
            <p className="hero-note">Любая модель · Для продуктовых команд</p>
          </div>

          <CoreStage />
        </div>
      </section>

      <section className="section shell" id="capabilities" aria-labelledby="capabilities-title">
        <div className="section-heading" data-reveal>
          <p className="eyebrow"><span>Почему это мета</span></p>
          <div>
            <h2 id="capabilities-title">
              Модели догоняют друг друга.<br />
              <span className="headline-muted">Выигрывает обвязка.</span>
            </h2>
            <p className="section-lead">
              Доступ к сильным моделям сегодня есть у всех. Преимущество создаёт то, что вы
              строите вокруг них: знание продукта, доступ к системам и дисциплина проверок.
              Это и есть harness — и он остаётся вашим, какую бы модель вы ни выбрали завтра.
            </p>
          </div>
        </div>

        <div className="capability-grid">
          {capabilities.map((capability, index) => (
            <article
              className="capability-card"
              key={capability.index}
              data-reveal
              data-spotlight
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <div className="card-topline">
                <span>{capability.index}</span>
                <span className="card-tag">
                  <span className="card-signal" aria-hidden="true" />
                  {capability.tag}
                </span>
              </div>
              <h3>{capability.title}</h3>
              <p>{capability.copy}</p>
            </article>
          ))}
        </div>

        <dl className="thesis" data-reveal>
          {thesis.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section shell workflow-section" id="demo" aria-labelledby="workflow-title">
        <div className="workflow-intro" data-reveal>
          <p className="eyebrow"><span>Как это работает</span></p>
          <h2 id="workflow-title">
            Один рантайм.<br />
            <span className="headline-muted">Понятный путь.</span>
          </h2>
          <p>
            Соберите собственную обвязку один раз — и масштабируйте её на все AI&#8209;задачи
            команды, не меняя привычных инструментов и моделей.
          </p>
        </div>
        <ol className="workflow-list">
          {workflow.map((step, index) => (
            <li key={step.title} data-reveal style={{ transitionDelay: `${index * 110}ms` }}>
              <span className="workflow-index">0{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.copy}</p>
              </div>
              <span className="workflow-line" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>

      <section className="final-section shell" aria-labelledby="final-title">
        <div className="final-panel" data-reveal>
          <p className="eyebrow"><span>Готово к запуску</span></p>
          <h2 id="final-title">
            Стройте свой harness,<br />
            <span className="headline-accent">пока другие ждут новую модель.</span>
          </h2>
          <p>
            Посмотрите, как NEXUS соединяет контекст, инструменты и проверки в&nbsp;одном
            сфокусированном рантайме.
          </p>
          <a className="primary-button" href="#top">
            Открыть NEXUS <ArrowIcon />
          </a>
          <div className="panel-orb" aria-hidden="true" />
          <div className="panel-grid" aria-hidden="true" />
        </div>
        <footer>
          <BrandLink />
          <span>Агентный рантайм для продуктовых команд</span>
          <span>© 2026 NEXUS</span>
        </footer>
      </section>
    </main>
  );
}
