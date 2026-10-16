import { lazy, Suspense, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { categories, services, steps, ticker, works, type Category, type Work } from "./data";
import { Motif } from "./Motif";

const MechScene = lazy(() => import("./MechScene").then((mod) => ({ default: mod.MechScene })));

const NAV = [
  { href: "#works", id: "works", label: "作品" },
  { href: "#services", id: "services", label: "服务" },
  { href: "#mechanism", id: "mechanism", label: "机构" },
  { href: "#process", id: "process", label: "流程" },
  { href: "#studio", id: "studio", label: "工房" },
  { href: "#contact", id: "contact", label: "联络" },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    const nodes = NAV.map((item) => document.getElementById(item.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setCurrent(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0.1, 0.3, 0.6] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="nav">
      <a className="logo" href="#top">
        <span>游标工房</span>
        <small>VERNIER ATELIER</small>
      </a>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "关闭" : "菜单"}
      </button>
      <nav id="site-nav" className={open ? "open" : ""}>
        {NAV.map((item) => (
          <a
            key={item.id}
            href={item.href}
            aria-current={current === item.id ? "true" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">
          <i />
          精密模型 · 游戏模型 · 精密机械化
        </p>
        <h1>游标工房</h1>
        <p className="lede">
          把公差做进三维资产里。展览和教学用的精密模型、游戏里的硬表面，以及按真实传动关系装配、真正能转的机构。
        </p>
        <div className="hero-actions">
          <a className="btn btn-mark" href="#works">
            查看目录
          </a>
          <a className="btn" href="#contact">
            写一份项目简报
          </a>
        </div>
        <dl className="hero-facts">
          <div>
            <dt>2016</dt>
            <dd>上海 / 深圳</dd>
          </div>
          <div>
            <dt>±0.05 mm</dt>
            <dd>数字模型标注</dd>
          </div>
          <div>
            <dt>6 人</dt>
            <dd>固定小组</dd>
          </div>
        </dl>
      </div>
      <Suspense fallback={<div className="viewport"><p className="viewport-fallback">正在装配剖视…</p></div>}>
        <MechScene />
      </Suspense>
    </section>
  );
}

function Marquee() {
  const items = [...ticker, ...ticker];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function Services() {
  return (
    <section className="section" id="services">
      <div className="section-head">
        <p className="index">02 / 服务</p>
        <h2>三件事，都从尺寸开始。</h2>
      </div>
      <div className="service-grid">
        {services.map((service) => (
          <article key={service.index} className="service">
            <header>
              <span>{service.index}</span>
              <small>{service.en}</small>
            </header>
            <h3>{service.title}</h3>
            <p>{service.body}</p>
            <ul>
              {service.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function Works() {
  const [category, setCategory] = useState<Category | "全部">("全部");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Work | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return works.filter((work) => {
      const categoryOk = category === "全部" || work.category === category;
      if (!q) return categoryOk;
      const hay = `${work.code} ${work.title} ${work.summary} ${work.client} ${work.category}`.toLowerCase();
      return categoryOk && hay.includes(q);
    });
  }, [category, query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) dialog.showModal();
    if (!active && dialog.open) dialog.close();
  }, [active]);

  function step(direction: 1 | -1) {
    if (!active) return;
    const index = visible.findIndex((work) => work.code === active.code);
    if (index < 0) return;
    const next = visible[(index + direction + visible.length) % visible.length];
    setActive(next);
  }

  return (
    <section className="section section-works" id="works">
      <div className="section-head">
        <p className="index">01 / 目录</p>
        <h2>八件近期模型。</h2>
        <p className="sub">
          游戏硬表面、教学剖视和可动机构放在同一份目录里。委托方按类型标注，不借用别人的商标。
        </p>
      </div>
      <div className="catalog-tools">
        <div className="chips" role="group" aria-label="按类型筛选">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? "chip on" : "chip"}
              aria-pressed={item === category}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="search">
          <span>检索</span>
          <input
            value={query}
            placeholder="甲胄、擒纵、载具"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      {visible.length === 0 ? (
        <p className="empty">目录里没有「{query.trim()}」。试试甲胄、叶片或擒纵。</p>
      ) : (
        <div className="work-grid">
          {visible.map((work) => (
            <article key={work.code} className="work-card">
              <button type="button" onClick={() => setActive(work)}>
                <Motif kind={work.motif} />
                <div className="work-meta">
                  <span className="stamp">{work.category}</span>
                  <h3>
                    <small>{work.code}</small>
                    {work.title}
                  </h3>
                  <p>{work.summary}</p>
                  <span className="more">
                    {work.year} · {work.client} · 查看
                  </span>
                </div>
              </button>
            </article>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="work-dialog"
        aria-labelledby={titleId}
        onClose={() => setActive(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setActive(null);
        }}
      >
        {active && (
          <div className="dialog-panel">
            <div className="dialog-art">
              <Motif kind={active.motif} />
            </div>
            <div className="dialog-copy">
              <p className="stamp">{active.category}</p>
              <h3 id={titleId}>
                <small>{active.code}</small>
                {active.title}
              </h3>
              <p className="dialog-kicker">
                {active.year} · {active.client}
              </p>
              <p>{active.detail}</p>
              <dl className="spec-table">
                {active.specs.map((spec) => (
                  <div key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="deliverables">
                {active.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="dialog-actions">
                <button type="button" onClick={() => step(-1)}>
                  上一件
                </button>
                <button type="button" onClick={() => step(1)}>
                  下一件
                </button>
                <button type="button" className="btn btn-mark" onClick={() => setActive(null)}>
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

function Mechanism() {
  const [hundredths, setHundredths] = useState(6);
  const gap = hundredths / 100;
  const note =
    gap <= 0.05
      ? "展示模型和教学装配用这档。配合面要对上，爆炸之后还能装回去。"
      : gap <= 0.12
        ? "游戏高模常用这档。近景不穿插，中景又不必卡死。"
        : "碰撞体和远景模块可以更松。省下来的是面数，不是结构。";

  return (
    <section className="band" id="mechanism">
      <div className="band-copy">
        <p className="index">03 / 机构</p>
        <h2>间隙是设计，不是误差。</h2>
        <p>
          精密机械化不是在外壳上刻几条线。齿轮要啮合，滑块要留在导轨里，关节转到头要有限位。下面这道间隙只代表数字模型里的配合，加工公差另外标注。
        </p>
        <label className="tolerance">
          <span>配合间隙 ±{gap.toFixed(2)} mm</span>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={hundredths}
            aria-valuetext={`正负 ${gap.toFixed(2)} 毫米`}
            onChange={(event) => setHundredths(Number(event.target.value))}
          />
        </label>
        <p className="note">{note}</p>
      </div>
      <div className="fit-stage" aria-hidden="true">
        <div className="fit-label">轴</div>
        <div className="fit">
          <div className="part part-a" />
          <div className="gap" style={{ width: `${8 + hundredths * 2.2}px` }}>
            <span>±{gap.toFixed(2)}</span>
          </div>
          <div className="part part-b" />
        </div>
        <div className="fit-label right">孔</div>
        <p className="fit-caption">示意配合，不是加工图。</p>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="section" id="process">
      <div className="section-head">
        <p className="index">04 / 流程</p>
        <h2>六步，中间可以停下来看尺寸。</h2>
      </div>
      <ol className="steps">
        {steps.map((step) => (
          <li key={step.index}>
            <span>{step.index}</span>
            <h3>{step.title}</h3>
            <small>{step.time}</small>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Studio() {
  return (
    <section className="section studio" id="studio">
      <div>
        <p className="index">05 / 工房</p>
        <h2>
          六个人，两座城市，
          <br />
          一张尺寸表。
        </h2>
        <blockquote>先把基准面摆正。好看的倒角救不了一对对不齐的孔。</blockquote>
        <p>
          游标工房做硬表面、机构和进引擎之前的整理。小组固定，不把模型拆给不认识的外包。上海看展陈和教学件，深圳看游戏资产和实时文件。
        </p>
      </div>
      <ul className="facts">
        <li>
          <strong>硬表面</strong>
          <span>机甲、载具、武器、舱体</span>
        </li>
        <li>
          <strong>机构</strong>
          <span>齿轮、液压、铰链、擒纵</span>
        </li>
        <li>
          <strong>技术美术</strong>
          <span>LOD、碰撞、贴图集、导出</span>
        </li>
        <li>
          <strong>不做的事</strong>
          <span>没有尺寸的「随便做个酷的」</span>
        </li>
      </ul>
    </section>
  );
}

type Brief = {
  id: string;
  name: string;
  org: string;
  email: string;
  kinds: string[];
  budget: string;
  schedule: string;
  message: string;
};

function Contact() {
  const [kinds, setKinds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brief, setBrief] = useState<Brief | null>(null);
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLTextAreaElement>(null);

  function toggleKind(kind: string) {
    setKinds((current) =>
      current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind],
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const org = String(form.get("org") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const budget = String(form.get("budget") ?? "");
    const schedule = String(form.get("schedule") ?? "");
    const message = String(form.get("message") ?? "").trim();
    const nextErrors: Record<string, string> = {};
    if (!name) nextErrors.name = "请留下称呼。";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "邮箱格式不对。";
    if (kinds.length === 0) nextErrors.kinds = "至少选一种模型。";
    if (message.length < 8) nextErrors.message = "用一两句话写清用途和比例。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const id = `VN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setCopied(false);
    setBrief({ id, name, org: org || "未填写", email, kinds, budget, schedule, message });
  }

  const receipt = brief
    ? [
        `游标工房项目简报 ${brief.id}`,
        `称呼：${brief.name}`,
        `机构：${brief.org}`,
        `邮箱：${brief.email}`,
        `类型：${brief.kinds.join("、")}`,
        `预算：${brief.budget}`,
        `周期：${brief.schedule}`,
        `说明：${brief.message}`,
      ].join("\n")
    : "";

  async function copyReceipt() {
    try {
      await navigator.clipboard.writeText(receipt);
      setCopied(true);
    } catch {
      receiptRef.current?.focus();
      receiptRef.current?.select();
      setCopied(false);
    }
  }

  return (
    <section className="section contact" id="contact">
      <div className="section-head">
        <p className="index">06 / 联络</p>
        <h2>先写清楚要转起来的是什么。</h2>
        <p className="sub">
          简报生成在这台浏览器里，不会自动发出。复制后寄到{" "}
          <a href="mailto:hello@vernier.studio">hello@vernier.studio</a>。
        </p>
      </div>
      {brief ? (
        <div className="receipt">
          <p className="stamp">已生成 {brief.id}</p>
          <textarea ref={receiptRef} readOnly value={receipt} rows={9} />
          <div className="dialog-actions">
            <button type="button" className="btn btn-mark" onClick={copyReceipt}>
              {copied ? "已复制" : "复制简报"}
            </button>
            <button type="button" className="btn" onClick={() => setBrief(null)}>
              再写一份
            </button>
          </div>
        </div>
      ) : (
        <form className="brief" onSubmit={onSubmit} noValidate>
          <label>
            称呼
            <input name="name" autoComplete="name" placeholder="怎么称呼" />
            {errors.name && <em role="alert">{errors.name}</em>}
          </label>
          <label>
            机构
            <input name="org" autoComplete="organization" placeholder="工作室、学校或团队" />
          </label>
          <label>
            邮箱
            <input name="email" type="email" autoComplete="email" placeholder="name@studio.com" />
            {errors.email && <em role="alert">{errors.email}</em>}
          </label>
          <fieldset>
            <legend>类型</legend>
            <div className="chips">
              {(["精密模型", "游戏模型", "精密机械化"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className={kinds.includes(kind) ? "chip on" : "chip"}
                  aria-pressed={kinds.includes(kind)}
                  onClick={() => toggleKind(kind)}
                >
                  {kind}
                </button>
              ))}
            </div>
            {errors.kinds && <em role="alert">{errors.kinds}</em>}
          </fieldset>
          <label>
            预算
            <select name="budget" defaultValue="待定">
              <option>5 万以内</option>
              <option>5–15 万</option>
              <option>15–40 万</option>
              <option>40 万以上</option>
              <option>待定</option>
            </select>
          </label>
          <label>
            周期
            <select name="schedule" defaultValue="按项目">
              <option>一个月内</option>
              <option>一季度</option>
              <option>按项目</option>
              <option>还在排期</option>
            </select>
          </label>
          <label className="wide">
            说明
            <textarea
              name="message"
              rows={5}
              maxLength={600}
              placeholder="用途、比例、要不要可动、准备进哪一个引擎。"
            />
            {errors.message && <em role="alert">{errors.message}</em>}
          </label>
          <div className="wide">
            <button type="submit" className="btn btn-mark">
              生成简报
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>游标工房</strong>
        <span>精密模型 · 游戏模型 · 精密机械化</span>
      </div>
      <div>
        <span>上海 / 深圳</span>
        <a href="mailto:hello@vernier.studio">hello@vernier.studio</a>
      </div>
      <p>数字模型里的尺寸按文件标注。加工公差、打印公差另行确认。</p>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <a className="skip" href="#works">
        跳到目录
      </a>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Works />
        <Services />
        <Mechanism />
        <Process />
        <Studio />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
