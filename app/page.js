"use client";

import { useMemo, useState } from "react";

const phaseMeta = {
  all: { label: "Semua", icon: "✦" },
  foundation: { label: "Foundation", icon: "01" },
  modeling: { label: "Modeling", icon: "02" },
  optimization: { label: "Optimization", icon: "03" },
  impact: { label: "Impact", icon: "04" },
};

const weeks = [
  {
    week: 1,
    phase: "foundation",
    title: "Predictive Analytics — The Big Picture",
    material: "Pengantar predictive analytics dan alur pemodelan",
    type: "Interactive lecture",
    handsOn: "Problem framing, target vs feature, workflow walkthrough",
    assessment: "Kuis",
    resources: ["Slides", "Mini case", "Quiz"],
    focus: "Business → Data → Model → Decision",
  },
  {
    week: 2,
    phase: "foundation",
    title: "From Messy Data to ML-Ready",
    material: "Data preparation dan feature engineering untuk prediksi",
    type: "Hands-on lab",
    handsOn: "Cleaning, missing values, encoding, feature engineering, leakage prevention",
    assessment: "Tugas",
    resources: ["Slides", "Notebook", "Dataset", "Task brief"],
    focus: "Clean data. Better signal.",
  },
  {
    week: 3,
    phase: "modeling",
    title: "Regression: Predict a Number",
    material: "Model regresi untuk prediksi nilai kontinu",
    type: "Praktikum",
    handsOn: "House-price regression, residual, MAE, RMSE, R²",
    assessment: null,
    resources: ["Slides", "Notebook", "Dataset"],
    focus: "Predict values, measure error.",
  },
  {
    week: 4,
    phase: "modeling",
    title: "Classification: Predict a Category",
    material: "Model klasifikasi untuk prediksi kategori",
    type: "Praktikum",
    handsOn: "Customer churn, probability, threshold, confusion matrix",
    assessment: null,
    resources: ["Slides", "Notebook", "Dataset"],
    focus: "From probability to decision.",
  },
  {
    week: 5,
    phase: "modeling",
    title: "Trees & Ensembles",
    material: "Model tree-based dan ensemble — Random Forest & Boosting",
    type: "Hands-on lab",
    handsOn: "Decision Tree vs Random Forest vs Gradient Boosting",
    assessment: "Tugas",
    resources: ["Slides", "Notebook", "Dataset", "Task brief"],
    focus: "Many trees, stronger decisions.",
  },
  {
    week: 6,
    phase: "modeling",
    title: "Forecast What Comes Next",
    material: "Time series forecasting untuk prediksi",
    type: "Hands-on lab",
    handsOn: "Naive, moving average, exponential smoothing, time-aware validation",
    assessment: "Tugas Kelompok",
    resources: ["Slides", "Notebook", "Dataset", "Group task"],
    focus: "Past patterns → future planning.",
  },
  {
    week: 7,
    phase: "modeling",
    title: "Find the Features That Matter",
    material: "Feature importance dan seleksi fitur",
    type: "Hands-on lab",
    handsOn: "Filter, RFE, model-based & permutation importance",
    assessment: "Tugas",
    resources: ["Slides", "Notebook", "Dataset", "Task brief"],
    focus: "Less noise. More signal.",
  },
  {
    week: 8,
    phase: "modeling",
    title: "Midterm Checkpoint",
    material: "Ujian Tengah Semester",
    type: "Exam",
    handsOn: "Concept + analysis checkpoint",
    assessment: "UTS",
    resources: ["Exam guide"],
    focus: "Connect the first half.",
  },
  {
    week: 9,
    phase: "optimization",
    title: "Can We Trust This Model?",
    material: "Evaluasi model: metrik dan validasi",
    type: "Hands-on lab",
    handsOn: "Holdout, K-Fold CV, stability, generalization gap, threshold",
    assessment: "Tugas",
    resources: ["Slides", "Notebook", "Dataset", "Task brief"],
    focus: "Evaluate for the real world.",
  },
  {
    week: 10,
    phase: "optimization",
    title: "Tune, Don’t Guess",
    material: "Optimasi model: hyperparameter tuning",
    type: "Praktikum",
    handsOn: "Grid Search vs Random Search with cross-validation",
    assessment: null,
    resources: ["Slides", "Notebook", "Dataset"],
    focus: "Search smarter, validate honestly.",
  },
  {
    week: 11,
    phase: "optimization",
    title: "Choose the Right Model",
    material: "Perbandingan model: performa vs interpretabilitas",
    type: "Case study",
    handsOn: "Model leaderboard, stability, latency, interpretability, constraints",
    assessment: "Tugas",
    resources: ["Slides", "Notebook", "Dataset", "Task brief"],
    focus: "Best score ≠ best decision.",
  },
  {
    week: 12,
    phase: "impact",
    title: "Explain → Understand → Act",
    material: "Interpretasi hasil untuk actionable insight",
    type: "Lecture + lab",
    handsOn: "Global/local explanation, risk segmentation, action mapping",
    assessment: "Tugas",
    resources: ["Slides", "Notebook", "Dataset", "Task brief"],
    focus: "Prediction is useful only when it drives action.",
  },
  {
    week: 13,
    phase: "impact",
    title: "Tell the Story Behind the Model",
    material: "Komunikasi temuan dan implikasi bisnis",
    type: "Workshop",
    handsOn: "Executive story, KPI selection, visual hierarchy, recommendation",
    assessment: "Tugas",
    resources: ["Slides", "Notebook", "Dataset", "Task brief"],
    focus: "Make the insight impossible to miss.",
  },
  {
    week: 14,
    phase: "impact",
    title: "Design the Full Solution",
    material: "Perancangan solusi predictive analytics",
    type: "Project sprint",
    handsOn: "Data → pipeline → model → scoring → action → monitoring",
    assessment: "Tugas Kelompok",
    resources: ["Slides", "Notebook", "Dataset", "Group task"],
    focus: "Think beyond the notebook.",
  },
  {
    week: 15,
    phase: "impact",
    title: "Capstone Demo Day",
    material: "Presentasi proyek: solusi predictive analytics",
    type: "Presentation",
    handsOn: "Pitch, demo, defense, peer review",
    assessment: "Presentasi",
    resources: ["Presentation guide", "Peer review"],
    focus: "Defend the decision, not just the model.",
  },
  {
    week: 16,
    phase: "impact",
    title: "Final Checkpoint",
    material: "Ujian Akhir Semester",
    type: "Exam",
    handsOn: "Integrated case + semester synthesis",
    assessment: "UAS",
    resources: ["Exam guide"],
    focus: "From prediction to impact.",
  },
];

const assessmentWeeks = weeks.filter((item) => item.assessment);

const classDays = [
  { day: "Rabu", time: "15.30 — 18.00", note: "Sesi kelas + discussion + lab" },
  { day: "Kamis", time: "15.30 — 18.00", note: "Sesi kelas + discussion + lab" },
];

export default function Home() {
  const [phase, setPhase] = useState("all");
  const [query, setQuery] = useState("");

  const visibleWeeks = useMemo(() => {
    return weeks.filter((item) => {
      const matchesPhase = phase === "all" || item.phase === phase;
      const haystack = [
        item.title,
        item.material,
        item.type,
        item.handsOn,
        item.assessment || "",
        item.focus,
      ]
        .join(" ")
        .toLowerCase();
      return matchesPhase && haystack.includes(query.toLowerCase());
    });
  }, [phase, query]);

  return (
    <main>
      <section className="hero">
        <nav className="nav shell">
          <a className="brand" href="#top" aria-label="Predictive Analytics home">
            <span className="brandMark">C</span>
            <span>
              <strong>CAKRAWALA</strong>
              <small>Predictive Analytics · Course Hub</small>
            </span>
          </a>
          <div className="navLinks">
            <a href="#schedule">Schedule</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#assessment">Tasks</a>
            <a className="navCta" href="#materials">Explore course</a>
          </div>
        </nav>

        <div id="top" className="heroGrid shell">
          <div className="heroCopy">
            <div className="eyebrow">
              <span className="pulse" /> Semester 5 · 3 SKS · Data Science
            </div>
            <h1>
              Learn to predict.
              <span>Build to create impact.</span>
            </h1>
            <p className="heroLead">
              Satu semester untuk bergerak dari business question, raw data, dan
              predictive model sampai insight yang dapat dijelaskan, dipresentasikan,
              dan dipakai untuk mengambil keputusan.
            </p>
            <div className="heroActions">
              <a className="button primary" href="#schedule">Lihat class schedule</a>
              <a className="button secondary" href="#roadmap">Explore 16 minggu</a>
            </div>
            <div className="heroStats">
              <div><strong>16</strong><span>weekly sessions</span></div>
              <div><strong>11+</strong><span>hands-on moments</span></div>
              <div><strong>2×</strong><span>class days / week</span></div>
            </div>
          </div>

          <div className="heroVisual" aria-label="Course journey visualization">
            <div className="orb orbOne" />
            <div className="orb orbTwo" />
            <div className="visualCard mainCard">
              <div className="cardTop">
                <span>COURSE JOURNEY</span>
                <span className="livePill">● LIVE</span>
              </div>
              <div className="journey">
                <div className="journeyStep active"><b>01</b><span>Frame</span></div>
                <div className="journeyLine" />
                <div className="journeyStep"><b>02</b><span>Build</span></div>
                <div className="journeyLine" />
                <div className="journeyStep"><b>03</b><span>Validate</span></div>
                <div className="journeyLine" />
                <div className="journeyStep"><b>04</b><span>Impact</span></div>
              </div>
              <div className="miniChart">
                <div className="chartHeader">
                  <span>Signal quality</span>
                  <b>↗ semester growth</b>
                </div>
                <div className="bars">
                  {[26, 38, 44, 61, 57, 74, 84, 92].map((height, i) => (
                    <i key={i} style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
              <div className="quoteCard">
                “Good data + good reasoning + good communication.”
              </div>
            </div>
            <div className="floatingCard floatA">
              <span>MODEL</span><b>0.87</b><small>ROC-AUC</small>
            </div>
            <div className="floatingCard floatB">
              <span>IMPACT</span><b>+32%</b><small>decision value</small>
            </div>
          </div>
        </div>
      </section>

      <section id="schedule" className="section shell">
        <div className="sectionHead">
          <div>
            <span className="kicker">CLASS RHYTHM</span>
            <h2>Schedule yang cepat dibaca.</h2>
          </div>
          <p>
            Dua hari mengajar dengan jam yang konsisten. Setiap sesi dirancang sebagai
            kombinasi konsep, short discussion, live demo, dan hands-on.
          </p>
        </div>

        <div className="scheduleGrid">
          {classDays.map((item, index) => (
            <article className="dayCard" key={item.day}>
              <div className="dayIndex">0{index + 1}</div>
              <div>
                <span className="dayLabel">{item.day}</span>
                <h3>{item.time} <small>WIB</small></h3>
                <p>{item.note}</p>
              </div>
              <div className="duration">150<br /><small>menit</small></div>
            </article>
          ))}
          <article className="rhythmCard">
            <span className="dayLabel">FORMAT SESI</span>
            <div className="rhythmRows">
              <div><b>45'</b><span>Concept & examples</span></div>
              <div><b>20'</b><span>Live demo</span></div>
              <div><b>60'</b><span>Guided hands-on</span></div>
              <div><b>25'</b><span>Discuss & debrief</span></div>
            </div>
          </article>
        </div>
      </section>

      <section id="roadmap" className="section roadmapSection">
        <div className="shell">
          <div className="sectionHead">
            <div>
              <span className="kicker">SEMESTER ROADMAP</span>
              <h2>16 minggu. Satu journey yang utuh.</h2>
            </div>
            <p>
              Filter berdasarkan fase, cari topik, lalu buka kartu mingguan untuk melihat
              material, lab, dan assessment.
            </p>
          </div>

          <div className="toolbar">
            <div className="phaseTabs" role="tablist" aria-label="Filter course phase">
              {Object.entries(phaseMeta).map(([key, item]) => (
                <button
                  key={key}
                  className={phase === key ? "phaseTab active" : "phaseTab"}
                  onClick={() => setPhase(key)}
                  type="button"
                >
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
            <label className="searchBox">
              <span>⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari: forecasting, churn, tuning…"
                aria-label="Cari materi"
              />
            </label>
          </div>

          <div className="weekGrid" id="materials">
            {visibleWeeks.map((item) => (
              <details className={`weekCard ${item.assessment ? "hasAssessment" : ""}`} key={item.week}>
                <summary>
                  <div className="weekNum">
                    <span>WEEK</span>
                    <b>{String(item.week).padStart(2, "0")}</b>
                  </div>
                  <div className="weekSummary">
                    <div className="weekMeta">
                      <span className={`phasePill ${item.phase}`}>{phaseMeta[item.phase].label}</span>
                      <span className="typePill">{item.type}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.material}</p>
                  </div>
                  <div className="weekAction">
                    {item.assessment && <span className="assessmentPill">{item.assessment}</span>}
                    <span className="chevron">⌄</span>
                  </div>
                </summary>

                <div className="weekBody">
                  <div className="focusBox">
                    <span>WEEKLY FOCUS</span>
                    <b>{item.focus}</b>
                  </div>
                  <div>
                    <span className="detailLabel">Hands-on / class activity</span>
                    <p>{item.handsOn}</p>
                  </div>
                  <div>
                    <span className="detailLabel">Course pack</span>
                    <div className="resourceRow">
                      {item.resources.map((resource) => (
                        <span key={resource}>{resource}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>

          {visibleWeeks.length === 0 && (
            <div className="emptyState">Belum ada topik yang cocok dengan pencarian itu.</div>
          )}
        </div>
      </section>

      <section id="assessment" className="section shell">
        <div className="sectionHead">
          <div>
            <span className="kicker">ASSESSMENT TRACKER</span>
            <h2>Tahu apa yang dinilai, sebelum dikerjakan.</h2>
          </div>
          <p>
            Assessment dibuat menyebar sepanjang semester supaya progress terasa
            bertahap—bukan menumpuk di akhir.
          </p>
        </div>

        <div className="assessmentLayout">
          <div className="assessmentTimeline">
            {assessmentWeeks.map((item) => (
              <div className="assessmentItem" key={item.week}>
                <div className="assessmentWeek">{String(item.week).padStart(2, "0")}</div>
                <div>
                  <span>{item.assessment}</span>
                  <h4>{item.title}</h4>
                  <p>{item.material}</p>
                </div>
              </div>
            ))}
          </div>

          <aside className="assessmentAside">
            <span className="kicker">WHAT GOOD LOOKS LIKE</span>
            <h3>Bukan sekadar model yang “jalan”.</h3>
            <ul>
              <li><b>Reasoning</b><span>Kenapa pendekatan ini dipilih?</span></li>
              <li><b>Evidence</b><span>Apakah evaluasinya fair dan reproducible?</span></li>
              <li><b>Interpretation</b><span>Apa arti hasilnya untuk keputusan?</span></li>
              <li><b>Communication</b><span>Bisakah orang lain memahami dan memakai insight?</span></li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section darkSection">
        <div className="shell stackGrid">
          <div>
            <span className="kicker light">LEARNING STACK</span>
            <h2>Tools yang dipakai untuk belajar lewat praktik.</h2>
            <p className="darkLead">
              Fokus utama bukan mengejar banyak library, tetapi membangun workflow yang
              benar, dapat dijelaskan, dan dapat direproduksi.
            </p>
          </div>
          <div className="toolCloud">
            {["Python", "pandas", "scikit-learn", "XGBoost", "statsmodels", "Jupyter", "Matplotlib", "SHAP"].map((tool, i) => (
              <span key={tool} className={i % 3 === 0 ? "big" : ""}>{tool}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <div className="brand compact">
          <span className="brandMark">C</span>
          <span><strong>CAKRAWALA</strong><small>Predictive Analytics · 2026</small></span>
        </div>
        <p>Learn → Build → Explain → Create impact.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
