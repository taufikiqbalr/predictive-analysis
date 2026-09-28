"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./games.module.css";

const metricQuestions = [
  {
    prompt: "Retention team paling takut pelanggan yang benar-benar akan churn justru lolos dari radar model.",
    answer: "Recall",
    options: ["Accuracy", "Precision", "Recall", "ROC-AUC"],
    note: "Recall fokus pada berapa banyak kasus positif sebenarnya yang berhasil ditangkap.",
  },
  {
    prompt: "Fraud alert sangat mahal jika terlalu banyak transaksi normal ikut diblokir.",
    answer: "Precision",
    options: ["Recall", "Precision", "MAE", "R²"],
    note: "Precision penting saat false positive mahal dan prediksi positif harus benar-benar dapat dipercaya.",
  },
  {
    prompt: "Kelas tidak seimbang dan tim ingin satu metrik yang menyeimbangkan precision dan recall.",
    answer: "F1-score",
    options: ["F1-score", "Accuracy", "RMSE", "R²"],
    note: "F1-score adalah harmonic mean dari precision dan recall.",
  },
  {
    prompt: "Model memprediksi harga rumah. Tim bisnis ingin rata-rata besar error dalam satuan rupiah yang mudah dijelaskan.",
    answer: "MAE",
    options: ["ROC-AUC", "MAE", "Recall", "Accuracy"],
    note: "MAE berada pada satuan target dan relatif mudah diinterpretasikan.",
  },
  {
    prompt: "Pada prediksi demand, kesalahan besar harus mendapat penalti lebih berat daripada error kecil.",
    answer: "RMSE",
    options: ["Precision", "RMSE", "Accuracy", "Recall"],
    note: "RMSE mengkuadratkan error sebelum dirata-ratakan sehingga lebih sensitif terhadap error besar.",
  },
  {
    prompt: "Tim ingin menilai kemampuan classifier membedakan kelas positif dan negatif di berbagai threshold.",
    answer: "ROC-AUC",
    options: ["MAE", "R²", "ROC-AUC", "Accuracy"],
    note: "ROC-AUC mengukur kemampuan ranking/discrimination pada berbagai threshold.",
  },
];

const leakageFeatures = [
  { id: "tenure", label: "tenure", leak: false, detail: "Sudah tersedia saat prediction time." },
  { id: "monthly", label: "monthly_charge", leak: false, detail: "Informasi saat ini; dapat menjadi feature." },
  { id: "contract", label: "contract_type", leak: false, detail: "Diketahui sebelum prediksi churn dibuat." },
  { id: "support", label: "support_calls_last_30d", leak: false, detail: "Histori sebelum prediction point." },
  { id: "reason", label: "cancellation_reason_after_churn", leak: true, detail: "Baru diketahui setelah churn terjadi." },
  { id: "nextpay", label: "next_month_payment_status", leak: true, detail: "Informasi masa depan yang belum tersedia saat prediksi." },
];

const thresholdCases = [
  { score: 0.95, y: 1 }, { score: 0.90, y: 1 }, { score: 0.82, y: 1 },
  { score: 0.78, y: 0 }, { score: 0.72, y: 1 }, { score: 0.67, y: 0 },
  { score: 0.61, y: 1 }, { score: 0.55, y: 0 }, { score: 0.49, y: 1 },
  { score: 0.43, y: 0 }, { score: 0.35, y: 1 }, { score: 0.20, y: 0 },
];

const correctPipeline = [
  "Business Problem",
  "Train–Test Split",
  "Data Preparation",
  "Train Model",
  "Validation / Cross-Validation",
  "Final Test",
  "Deploy & Monitor",
];

const initialPipeline = [
  "Train Model",
  "Business Problem",
  "Final Test",
  "Data Preparation",
  "Deploy & Monitor",
  "Train–Test Split",
  "Validation / Cross-Validation",
];

const modelQuestions = [
  {
    prompt: "Prediksi harga rumah berdasarkan luas, lokasi, usia bangunan, dan fasilitas.",
    answer: "Regression",
    options: ["Regression", "Classification", "Time Series", "Clustering"],
  },
  {
    prompt: "Prediksi apakah seorang pelanggan akan churn: Yes atau No.",
    answer: "Classification",
    options: ["Regression", "Classification", "Time Series", "Clustering"],
  },
  {
    prompt: "Meramalkan total penjualan mingguan untuk 12 minggu berikutnya.",
    answer: "Time Series",
    options: ["Regression", "Classification", "Time Series", "Clustering"],
  },
  {
    prompt: "Mengelompokkan pelanggan menjadi segmen perilaku tanpa label yang sudah diketahui.",
    answer: "Clustering",
    options: ["Regression", "Classification", "Time Series", "Clustering"],
  },
  {
    prompt: "Memperkirakan nilai lifetime value pelanggan dalam rupiah.",
    answer: "Regression",
    options: ["Regression", "Classification", "Time Series", "Clustering"],
  },
];

const gameMeta = [
  { key: "metric", icon: "◎", title: "Metric Rush", desc: "Pilih metrik paling tepat untuk skenario bisnis.", xp: 120 },
  { key: "leakage", icon: "⌁", title: "Leakage Detective", desc: "Temukan feature yang bocor dari masa depan.", xp: 120 },
  { key: "threshold", icon: "◒", title: "Threshold Arena", desc: "Cari threshold dengan business cost terendah.", xp: 160 },
  { key: "pipeline", icon: "⇅", title: "Pipeline Sprint", desc: "Susun workflow predictive analytics dengan benar.", xp: 140 },
  { key: "model", icon: "◇", title: "Model Match", desc: "Cocokkan problem dengan jenis modeling yang tepat.", xp: 120 },
];

function pct(value) {
  return `${Math.round(value * 100)}%`;
}

function calcThreshold(threshold) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  thresholdCases.forEach(({ score, y }) => {
    const pred = score >= threshold ? 1 : 0;
    if (pred === 1 && y === 1) tp += 1;
    if (pred === 1 && y === 0) fp += 1;
    if (pred === 0 && y === 0) tn += 1;
    if (pred === 0 && y === 1) fn += 1;
  });
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const cost = fn * 5 + fp;
  return { tp, fp, tn, fn, precision, recall, cost };
}

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState("metric");
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState({});
  const [toast, setToast] = useState("");

  const [metricIndex, setMetricIndex] = useState(0);
  const [metricCorrect, setMetricCorrect] = useState(0);
  const [metricChoice, setMetricChoice] = useState(null);

  const [leakageSelected, setLeakageSelected] = useState([]);
  const [leakageChecked, setLeakageChecked] = useState(false);

  const [threshold, setThreshold] = useState(0.5);
  const thresholdResult = useMemo(() => calcThreshold(threshold), [threshold]);

  const [pipeline, setPipeline] = useState(initialPipeline);
  const [pipelineStatus, setPipelineStatus] = useState("");

  const [modelIndex, setModelIndex] = useState(0);
  const [modelCorrect, setModelCorrect] = useState(0);
  const [modelChoice, setModelChoice] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pa-game-progress") || "{}");
      setXp(saved.xp || 0);
      setCompleted(saved.completed || {});
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("pa-game-progress", JSON.stringify({ xp, completed }));
    } catch {}
  }, [xp, completed]);

  function reward(key) {
    if (completed[key]) return;
    const meta = gameMeta.find((g) => g.key === key);
    setXp((value) => value + meta.xp);
    setCompleted((value) => ({ ...value, [key]: true }));
    setToast(`+${meta.xp} XP · ${meta.title} cleared!`);
    setTimeout(() => setToast(""), 2200);
  }

  function answerMetric(choice) {
    if (metricChoice) return;
    setMetricChoice(choice);
    if (choice === metricQuestions[metricIndex].answer) {
      setMetricCorrect((n) => n + 1);
    }
  }

  function nextMetric() {
    if (metricIndex === metricQuestions.length - 1) {
      const finalScore = metricCorrect + (metricChoice === metricQuestions[metricIndex].answer ? 1 : 0);
      if (finalScore >= 4) reward("metric");
      setMetricIndex(0);
      setMetricCorrect(0);
      setMetricChoice(null);
      return;
    }
    setMetricIndex((n) => n + 1);
    setMetricChoice(null);
  }

  function checkLeakage() {
    setLeakageChecked(true);
    const selected = [...leakageSelected].sort().join(",");
    const target = leakageFeatures.filter((f) => f.leak).map((f) => f.id).sort().join(",");
    if (selected === target) reward("leakage");
  }

  function movePipeline(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= pipeline.length) return;
    const copy = [...pipeline];
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
    setPipeline(copy);
    setPipelineStatus("");
  }

  function checkPipeline() {
    const ok = pipeline.every((step, i) => step === correctPipeline[i]);
    setPipelineStatus(ok ? "Workflow rapi. Siap lanjut ke production mindset!" : "Belum pas. Cek kapan test set boleh disentuh.");
    if (ok) reward("pipeline");
  }

  function answerModel(choice) {
    if (modelChoice) return;
    setModelChoice(choice);
    if (choice === modelQuestions[modelIndex].answer) {
      setModelCorrect((n) => n + 1);
    }
  }

  function nextModel() {
    if (modelIndex === modelQuestions.length - 1) {
      const finalScore = modelCorrect + (modelChoice === modelQuestions[modelIndex].answer ? 1 : 0);
      if (finalScore >= 4) reward("model");
      setModelIndex(0);
      setModelCorrect(0);
      setModelChoice(null);
      return;
    }
    setModelIndex((n) => n + 1);
    setModelChoice(null);
  }

  const thresholdWin = thresholdResult.cost === 4;

  const level = xp < 200 ? "Explorer" : xp < 450 ? "Model Builder" : xp < 650 ? "Insight Hunter" : "Impact Maker";
  const completionCount = Object.keys(completed).length;

  return (
    <main className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <header className={styles.header}>
        <div className={styles.shell}>
          <nav className={styles.nav}>
            <Link href="/" className={styles.brand}>
              <span className={styles.brandMark}>C</span>
              <span><strong>CAKRAWALA</strong><small>Predictive Analytics Playground</small></span>
            </Link>
            <div className={styles.navRight}>
              <Link href="/">← Course Hub</Link>
              <a href="#games">Play now</a>
            </div>
          </nav>

          <div className={styles.hero}>
            <div>
              <span className={styles.kicker}>LEARN BY PLAYING</span>
              <h1>Predictive Analytics <em>Playground.</em></h1>
              <p>
                Lima mini-game untuk mengasah intuition tentang metric, leakage,
                threshold, workflow, dan problem framing—tanpa terasa seperti membaca slide lagi.
              </p>
              <div className={styles.heroBadges}>
                <span>⚡ 5 mini games</span>
                <span>🏆 XP & badges</span>
                <span>🧠 instant feedback</span>
              </div>
            </div>

            <aside className={styles.profileCard}>
              <div className={styles.levelIcon}>✦</div>
              <div>
                <span>YOUR LEVEL</span>
                <h2>{level}</h2>
                <p>{xp} XP · {completionCount}/5 games cleared</p>
              </div>
              <div className={styles.progressTrack}>
                <i style={{ width: `${Math.min(100, (xp / 660) * 100)}%` }} />
              </div>
            </aside>
          </div>
        </div>
      </header>

      <section id="games" className={styles.shell}>
        <div className={styles.gameNav}>
          {gameMeta.map((game) => (
            <button
              type="button"
              key={game.key}
              className={activeGame === game.key ? styles.gameTabActive : styles.gameTab}
              onClick={() => setActiveGame(game.key)}
            >
              <span>{game.icon}</span>
              <b>{game.title}</b>
              {completed[game.key] && <small>✓ cleared</small>}
            </button>
          ))}
        </div>

        <div className={styles.arena}>
          {activeGame === "metric" && (
            <section className={styles.gamePanel}>
              <GameHead number="01" title="Metric Rush" subtitle="Business scenario → metric yang paling tepat" xp="120 XP" />
              <div className={styles.roundLine}>
                <span>Round {metricIndex + 1}/{metricQuestions.length}</span>
                <span>{metricCorrect} correct</span>
              </div>
              <div className={styles.promptCard}>
                <span>SCENARIO</span>
                <h3>{metricQuestions[metricIndex].prompt}</h3>
              </div>
              <div className={styles.optionGrid}>
                {metricQuestions[metricIndex].options.map((option) => {
                  const answered = Boolean(metricChoice);
                  const isCorrect = option === metricQuestions[metricIndex].answer;
                  const isChosen = option === metricChoice;
                  let cls = styles.option;
                  if (answered && isCorrect) cls += " " + styles.correct;
                  else if (answered && isChosen) cls += " " + styles.wrong;
                  return (
                    <button key={option} type="button" className={cls} onClick={() => answerMetric(option)}>
                      {option}
                    </button>
                  );
                })}
              </div>
              {metricChoice && (
                <div className={styles.feedback}>
                  <b>{metricChoice === metricQuestions[metricIndex].answer ? "Nice. 🎯" : "Belum tepat."}</b>
                  <span>{metricQuestions[metricIndex].note}</span>
                  <button type="button" onClick={nextMetric}>
                    {metricIndex === metricQuestions.length - 1 ? "Finish run" : "Next scenario →"}
                  </button>
                </div>
              )}
            </section>
          )}

          {activeGame === "leakage" && (
            <section className={styles.gamePanel}>
              <GameHead number="02" title="Leakage Detective" subtitle="Tangkap feature yang datang dari masa depan" xp="120 XP" />
              <div className={styles.missionCard}>
                <span>MISSION</span>
                <h3>Kamu membangun model churn pada akhir bulan ini.</h3>
                <p>Pilih semua feature yang tidak seharusnya tersedia pada prediction time.</p>
              </div>
              <div className={styles.featureGrid}>
                {leakageFeatures.map((feature) => {
                  const selected = leakageSelected.includes(feature.id);
                  const reveal = leakageChecked;
                  let cls = styles.featureCard;
                  if (selected) cls += " " + styles.selected;
                  if (reveal && feature.leak) cls += " " + styles.leak;
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      className={cls}
                      onClick={() => {
                        if (leakageChecked) return;
                        setLeakageSelected((list) =>
                          list.includes(feature.id)
                            ? list.filter((id) => id !== feature.id)
                            : [...list, feature.id]
                        );
                      }}
                    >
                      <span>{selected ? "✓" : "○"}</span>
                      <b>{feature.label}</b>
                      {reveal && <small>{feature.detail}</small>}
                    </button>
                  );
                })}
              </div>
              <div className={styles.actionRow}>
                <button type="button" className={styles.primaryBtn} onClick={checkLeakage}>Check evidence</button>
                {leakageChecked && (
                  <button type="button" className={styles.ghostBtn} onClick={() => { setLeakageSelected([]); setLeakageChecked(false); }}>
                    Try again
                  </button>
                )}
              </div>
              {leakageChecked && (
                <div className={styles.feedback}>
                  <b>
                    {leakageSelected.length === 2 &&
                    leakageSelected.includes("reason") &&
                    leakageSelected.includes("nextpay")
                      ? "Case closed. 🔎"
                      : "Masih ada bukti yang salah dipilih."}
                  </b>
                  <span>Leakage terjadi ketika training memakai informasi yang belum tersedia saat prediksi sebenarnya dibuat.</span>
                </div>
              )}
            </section>
          )}

          {activeGame === "threshold" && (
            <section className={styles.gamePanel}>
              <GameHead number="03" title="Threshold Arena" subtitle="Balance false positive vs false negative" xp="160 XP" />
              <div className={styles.thresholdLayout}>
                <div className={styles.thresholdControl}>
                  <span className={styles.kicker}>MISSION</span>
                  <h3>Minimalkan business cost.</h3>
                  <p>False Negative = 5 poin biaya. False Positive = 1 poin biaya.</p>
                  <div className={styles.sliderValue}>{threshold.toFixed(2)}</div>
                  <input
                    className={styles.slider}
                    type="range"
                    min="0.20"
                    max="0.80"
                    step="0.05"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                  />
                  <div className={styles.sliderLabels}><span>More recall</span><span>More precision</span></div>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => {
                      if (thresholdWin) reward("threshold");
                      else setToast("Belum minimum. Coba turunkan/naikkan threshold.");
                    }}
                  >
                    Lock strategy
                  </button>
                </div>

                <div className={styles.metricBoard}>
                  <MetricBox label="Precision" value={pct(thresholdResult.precision)} />
                  <MetricBox label="Recall" value={pct(thresholdResult.recall)} />
                  <MetricBox label="False Positive" value={thresholdResult.fp} />
                  <MetricBox label="False Negative" value={thresholdResult.fn} danger={thresholdResult.fn > 0} />
                  <div className={styles.costBox}>
                    <span>BUSINESS COST</span>
                    <b>{thresholdResult.cost}</b>
                    <small>{thresholdWin ? "minimum found ✦" : "find a lower cost"}</small>
                  </div>
                </div>
              </div>
              <div className={styles.tipBox}>
                <b>Hint:</b> threshold bukan angka sakral 0.50. Ia adalah decision policy yang harus mengikuti biaya dan dampak.
              </div>
            </section>
          )}

          {activeGame === "pipeline" && (
            <section className={styles.gamePanel}>
              <GameHead number="04" title="Pipeline Sprint" subtitle="Susun urutan kerja yang menjaga evaluasi tetap jujur" xp="140 XP" />
              <div className={styles.pipelineIntro}>
                <span className={styles.kicker}>MOVE THE STEPS</span>
                <h3>Test set hanya boleh muncul setelah keputusan model selesai.</h3>
              </div>
              <div className={styles.pipelineList}>
                {pipeline.map((step, index) => (
                  <div className={styles.pipelineStep} key={step}>
                    <span className={styles.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
                    <b>{step}</b>
                    <div>
                      <button type="button" onClick={() => movePipeline(index, -1)} disabled={index === 0}>↑</button>
                      <button type="button" onClick={() => movePipeline(index, 1)} disabled={index === pipeline.length - 1}>↓</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.actionRow}>
                <button type="button" className={styles.primaryBtn} onClick={checkPipeline}>Check pipeline</button>
                <button type="button" className={styles.ghostBtn} onClick={() => { setPipeline(initialPipeline); setPipelineStatus(""); }}>Reset</button>
              </div>
              {pipelineStatus && <div className={styles.feedback}><b>{pipelineStatus}</b></div>}
            </section>
          )}

          {activeGame === "model" && (
            <section className={styles.gamePanel}>
              <GameHead number="05" title="Model Match" subtitle="Kenali bentuk target sebelum memilih pendekatan" xp="120 XP" />
              <div className={styles.roundLine}>
                <span>Case {modelIndex + 1}/{modelQuestions.length}</span>
                <span>{modelCorrect} correct</span>
              </div>
              <div className={styles.promptCard}>
                <span>PROBLEM</span>
                <h3>{modelQuestions[modelIndex].prompt}</h3>
              </div>
              <div className={styles.optionGrid}>
                {modelQuestions[modelIndex].options.map((option) => {
                  const answered = Boolean(modelChoice);
                  const isCorrect = option === modelQuestions[modelIndex].answer;
                  const isChosen = option === modelChoice;
                  let cls = styles.option;
                  if (answered && isCorrect) cls += " " + styles.correct;
                  else if (answered && isChosen) cls += " " + styles.wrong;
                  return (
                    <button key={option} type="button" className={cls} onClick={() => answerModel(option)}>
                      {option}
                    </button>
                  );
                })}
              </div>
              {modelChoice && (
                <div className={styles.feedback}>
                  <b>{modelChoice === modelQuestions[modelIndex].answer ? "Matched. ✦" : `Jawabannya: ${modelQuestions[modelIndex].answer}`}</b>
                  <span>Mulai dari bentuk target dan struktur data—baru kemudian pilih algoritma.</span>
                  <button type="button" onClick={nextModel}>
                    {modelIndex === modelQuestions.length - 1 ? "Finish run" : "Next case →"}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        <section className={styles.badgeSection}>
          <div>
            <span className={styles.kicker}>BADGE CABINET</span>
            <h2>Collect the concepts, not just the points.</h2>
            <p>Progress tersimpan di browser perangkat ini.</p>
          </div>
          <div className={styles.badgeGrid}>
            {gameMeta.map((game) => (
              <div key={game.key} className={completed[game.key] ? styles.badgeUnlocked : styles.badgeLocked}>
                <span>{game.icon}</span>
                <b>{game.title}</b>
                <small>{completed[game.key] ? `Unlocked · +${game.xp} XP` : "Locked"}</small>
              </div>
            ))}
          </div>
        </section>
      </section>

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <div>
            <b>Predictive Analytics Playground</b>
            <span>Learn → Play → Explain → Create impact.</span>
          </div>
          <Link href="/">Back to Course Hub →</Link>
        </div>
      </footer>
    </main>
  );
}

function GameHead({ number, title, subtitle, xp }) {
  return (
    <div className={styles.gameHead}>
      <div className={styles.gameNumber}>{number}</div>
      <div>
        <span className={styles.kicker}>MINI GAME</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className={styles.xpPill}>{xp}</div>
    </div>
  );
}

function MetricBox({ label, value, danger }) {
  return (
    <div className={danger ? `${styles.metricBox} ${styles.metricDanger}` : styles.metricBox}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
