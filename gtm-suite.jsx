import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const API_BASE = "https://gtm2-production.up.railway.app/api";

const DEMO_MODE = false; // Set false when Flask server is running

const SIGNALS_META = {
  product_launch:   { label: "Product Launch",       icon: "🚀", weight: 9,  color: "#FF6B35" },
  accelerator:      { label: "Accelerator",           icon: "⚡", weight: 10, color: "#A855F7" },
  pre_seed:         { label: "Pre-Seed Raise",        icon: "💰", weight: 8,  color: "#22C55E" },
  unpaid_hiring:    { label: "Hiring Unpaid Roles",   icon: "📢", weight: 10, color: "#EF4444" },
  competition:      { label: "Startup Competition",   icon: "🏆", weight: 7,  color: "#F59E0B" },
  new_market:       { label: "Market Expansion",      icon: "🌍", weight: 6,  color: "#06B6D4" },
  mvp_build:        { label: "MVP Building",          icon: "🔧", weight: 8,  color: "#8B5CF6" },
  cofounder_search: { label: "Co-founder Search",     icon: "🤝", weight: 9,  color: "#EC4899" },
};

const STAGE_META = {
  hot:       { label: "Hot",       color: "#EF4444", bg: "#EF444418" },
  warm:      { label: "Warm",      color: "#F59E0B", bg: "#F59E0B18" },
  watch:     { label: "Watch",     color: "#06B6D4", bg: "#06B6D418" },
  contacted: { label: "Contacted", color: "#22C55E", bg: "#22C55E18" },
  replied:   { label: "Replied",   color: "#A855F7", bg: "#A855F718" },
  closed:    { label: "Closed",    color: "#6B7280", bg: "#6B728018" },
};

const DEMO_PROSPECTS = [
  { id: "demo001", name: "Amara Osei", title: "Founder & CEO", company: "HealthTrack AI", sector: "HealthTech", location: "London, UK", bio: "Ex-NHS clinician building AI-powered chronic disease management. Techstars London '24.", source: "ProductHunt", source_url: "https://producthunt.com", linkedin: "linkedin.com/in/amara-osei", twitter: "@amara_builds", github: "github.com/amara-osei", website: "healthtrack.ai", email_patterns: ["amara@healthtrack.ai", "founder@healthtrack.ai"], signals: ["accelerator", "unpaid_hiring", "mvp_build"], signal_details: { accelerator: "Accepted into Techstars London 2024 cohort — announced 3 days ago", unpaid_hiring: "Posted 4 equity-only roles: React Dev, ML Engineer, UX Designer, BD Lead", mvp_build: "GitHub surge — 47 commits in last 2 weeks, new repo 'healthtrack-v2'" }, signal_score: 28, stage: "hot", funding_stage: "Pre-seed", team_size: "2", tech_stack: ["React", "Python", "OpenAI", "AWS"], discovered_at: "2024-03-04T09:00:00", notes: "" },
  { id: "demo002", name: "Marcus Delacroix", title: "Co-founder", company: "BuilderFlow", sector: "PropTech", location: "Berlin, Germany", bio: "Serial builder. 2x exits. Now digitising construction project management for SMEs across Europe.", source: "HackerNews", source_url: "https://news.ycombinator.com", linkedin: "linkedin.com/in/marcus-delacroix", twitter: "@mdelacroix_dev", github: "github.com/marcusd", website: "builderflow.io", email_patterns: ["marcus@builderflow.io", "hello@builderflow.io"], signals: ["product_launch", "pre_seed", "competition"], signal_details: { product_launch: "ProductHunt launch scheduled — 847 waitlist signups on 'coming soon' page", pre_seed: "AngelList: '£250k pre-seed round open' — posted 6 days ago", competition: "Finalist at EUvsVirus Hackathon 2024" }, signal_score: 24, stage: "warm", funding_stage: "Pre-seed (raising)", team_size: "3", tech_stack: ["Next.js", "Node.js", "PostgreSQL", "Stripe"], discovered_at: "2024-03-01T14:00:00", notes: "" },
  { id: "demo003", name: "Priya Sharma", title: "Founder", company: "EduVerse", sector: "EdTech", location: "Bangalore, India", bio: "Ex-Google PM building immersive VR learning for K-12. 10k users in India, now expanding globally.", source: "IndieHackers", source_url: "https://indiehackers.com", linkedin: "linkedin.com/in/priya-sharma-eduverse", twitter: "@priyabuilds", github: "", website: "eduverse.io", email_patterns: ["priya@eduverse.io", "founder@eduverse.io"], signals: ["unpaid_hiring", "cofounder_search", "new_market"], signal_details: { unpaid_hiring: "3 equity-only roles on AngelList: CTO, Lead Dev, Growth Hacker (0.5-2% equity)", cofounder_search: "Posted in 5 founder communities seeking technical co-founder — last 48 hours", new_market: "Tweeted about 'UK market validation trip next month'" }, signal_score: 25, stage: "hot", funding_stage: "Bootstrapped", team_size: "1", tech_stack: ["Flutter", "Firebase", "Python"], discovered_at: "2024-03-05T07:30:00", notes: "" },
  { id: "demo004", name: "Thomas Eriksen", title: "Founder & CTO", company: "CarbonLedger", sector: "CleanTech", location: "Stockholm, Sweden", bio: "Climate tech founder. Ex-Klarna engineer. Building blockchain-based carbon tracking for SMEs.", source: "GitHub", source_url: "https://github.com/carbon-ledger", linkedin: "linkedin.com/in/thomas-eriksen-cto", twitter: "@teriksen_builds", github: "github.com/teriksen", website: "carbonledger.io", email_patterns: ["thomas@carbonledger.io", "t.eriksen@carbonledger.io"], signals: ["accelerator", "pre_seed", "competition", "unpaid_hiring"], signal_details: { accelerator: "Joined Y Combinator W24 batch — announced on Twitter 4 days ago", pre_seed: "YC deal closed + $500k from climate angels", competition: "Won Nordic Startup Awards 2024, Sustainability Category", unpaid_hiring: "Seeking volunteer data engineers for carbon footprint tooling" }, signal_score: 37, stage: "hot", funding_stage: "Seed", team_size: "4", tech_stack: ["Go", "React", "PostgreSQL", "AWS", "Anthropic"], discovered_at: "2024-03-02T11:00:00", notes: "" },
  { id: "demo005", name: "Fatima Al-Hassan", title: "CEO & Founder", company: "RemoteOps", sector: "Future of Work", location: "Dubai, UAE", bio: "Building async ops tooling for distributed remote teams. 200 paying customers. Expanding to Europe.", source: "Dev.to", source_url: "https://dev.to", linkedin: "linkedin.com/in/fatima-al-hassan", twitter: "@fatima_builds", github: "", website: "remoteops.io", email_patterns: ["fatima@remoteops.io", "hello@remoteops.io"], signals: ["new_market", "product_launch", "cofounder_search"], signal_details: { new_market: "Expanding from MENA to UK/EU — job posts mention 'Europe expansion team'", product_launch: "v2.0 launched on ProductHunt — #3 Product of the Day", cofounder_search: "Looking for UK-based commercial co-founder per LinkedIn post 2 days ago" }, signal_score: 21, stage: "warm", funding_stage: "Bootstrapped", team_size: "5", tech_stack: ["Vue.js", "Node.js", "MongoDB", "Stripe"], discovered_at: "2024-02-28T16:00:00", notes: "" },
  { id: "demo006", name: "Jake Thornton", title: "Founder", company: "LegalMind AI", sector: "LegalTech", location: "Manchester, UK", bio: "Trainee solicitor by day, LegalTech founder by night. Building AI contract review for SMEs.", source: "Reddit", source_url: "https://reddit.com/r/startups", linkedin: "linkedin.com/in/jake-thornton-legal", twitter: "@jakethornton", github: "github.com/jakethornton", website: "", email_patterns: ["jake@legalmindai.com", "founder@legalmindai.com"], signals: ["mvp_build", "unpaid_hiring"], signal_details: { mvp_build: "Actively building — 3 LinkedIn posts this week showing product screenshots", unpaid_hiring: "Hired 1 unpaid intern via university partnership, seeking more" }, signal_score: 18, stage: "watch", funding_stage: "Idea Stage", team_size: "1", tech_stack: ["Python", "FastAPI", "OpenAI", "React"], discovered_at: "2024-02-25T09:00:00", notes: "" },
  { id: "demo007", name: "Sofia Chen", title: "Solo Founder", company: "NutriSync", sector: "HealthTech", location: "San Francisco, USA", bio: "Ex-Stanford researcher. Building personalized nutrition AI. 500 beta users, looking to grow team.", source: "ProductHunt", source_url: "https://producthunt.com", linkedin: "linkedin.com/in/sofia-chen-nutri", twitter: "@sofiabuilds", github: "github.com/sofiac", website: "nutrisync.app", email_patterns: ["sofia@nutrisync.app", "hello@nutrisync.app"], signals: ["mvp_build", "cofounder_search", "pre_seed"], signal_details: { mvp_build: "Show HN post: 'NutriSync - AI that learns what works for your body' — 234 upvotes", cofounder_search: "Post on YC Co-founder Matching seeking technical + business co-founder", pre_seed: "Mentioned 'starting to talk to angels' in Twitter thread" }, signal_score: 23, stage: "warm", funding_stage: "Pre-seed", team_size: "1", tech_stack: ["Python", "FastAPI", "React Native", "OpenAI", "Supabase"], discovered_at: "2024-03-05T13:00:00", notes: "" },
];

const ANALYTICS_DATA = [
  { date: "Feb 1", prospects: 4, hot: 1, contacted: 0 },
  { date: "Feb 8", prospects: 11, hot: 3, contacted: 1 },
  { date: "Feb 15", prospects: 19, hot: 5, contacted: 3 },
  { date: "Feb 22", prospects: 28, hot: 8, contacted: 5 },
  { date: "Mar 1", prospects: 41, hot: 12, contacted: 9 },
  { date: "Mar 6", prospects: 53, hot: 15, contacted: 14 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function scoreBar(score) {
  const max = 40, pct = Math.min((score / max) * 100, 100);
  return { pct, color: pct > 70 ? "#00FF88" : pct > 45 ? "#F59E0B" : "#06B6D4" };
}

function timeAgo(iso) {
  if (!iso) return "Unknown";
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const AVATAR_COLORS = ["#00FF88", "#A855F7", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#22C55E", "#FF6B35"];
function avatarColor(name) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function GTMSuite() {
  const [tab, setTab] = useState("dashboard");
  const [prospects, setProspects] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState([]);
  const [outreach, setOutreach] = useState({});
  const [generating, setGenerating] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState({ stage: "all", source: "all", search: "" });
  const [dbView, setDbView] = useState("all");
  const [loading, setLoading] = useState(true);

  // ─── STORAGE ──────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("gtm-prospects");
        if (r) setProspects(JSON.parse(r.value));
        else setProspects(DEMO_PROSPECTS);
        const s = await window.storage.get("gtm-saved-ids");
        if (s) setSavedIds(new Set(JSON.parse(s.value)));
        const o = await window.storage.get("gtm-outreach");
        if (o) setOutreach(JSON.parse(o.value));
      } catch { setProspects(DEMO_PROSPECTS); }
      setLoading(false);
    })();
  }, []);

  const persistProspects = async (ps) => {
    setProspects(ps);
    try { await window.storage.set("gtm-prospects", JSON.stringify(ps)); } catch {}
  };
  const persistSaved = async (ids) => {
    setSavedIds(ids);
    try { await window.storage.set("gtm-saved-ids", JSON.stringify([...ids])); } catch {}
  };
  const persistOutreach = async (o) => {
    setOutreach(o);
    try { await window.storage.set("gtm-outreach", JSON.stringify(o)); } catch {}
  };

  // ─── TOAST ────────────────────────────────────────────────────────────────

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ─── SCAN ──────────────────────────────────────────────────────────────────

  const runScan = async () => {
    setScanning(true);
    setScanProgress(0);
    setScanLog([]);
    setTab("scanner");

    const sources = [
      "HackerNews","GitHub","Dev.to","Reddit","ProductHunt",
      "BetaList","IndieHackers","Fazier","StartupBase",
      "MicroLaunch","DevHunt","Peerlist","TheresAnAIForThat",
    ];

    if (!DEMO_MODE) {
      try {
        const res = await fetch(`${API_BASE}/scan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ min_score: 5 }) });
        if (res.ok) {
          // Poll for completion
          const poll = setInterval(async () => {
            const s = await fetch(`${API_BASE}/scan/status`).then(r => r.json());
            setScanProgress(s.progress);
            if (!s.running) {
              clearInterval(poll);
              const data = await fetch(`${API_BASE}/prospects`).then(r => r.json());
              await persistProspects(data.prospects);
              setScanning(false);
              showToast(`Scan complete — ${data.count} prospects found`);
            }
          }, 1500);
        }
      } catch { setScanning(false); }
      return;
    }

    // Demo mode: simulate scan with staged log entries
    let prog = 0;
    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      prog = Math.round(((i + 1) / sources.length) * 100);
      setScanProgress(prog);
      setScanLog(prev => [...prev, { src, found: Math.floor(Math.random() * 8) + 2, time: new Date().toLocaleTimeString() }]);
      await new Promise(r => setTimeout(r, 600));
    }

    // "Discover" new prospects (shuffle demo data + add timestamps)
    const freshProspects = DEMO_PROSPECTS.map(p => ({ ...p, discovered_at: new Date().toISOString() }));
    await persistProspects(freshProspects);
    setScanning(false);
    showToast(`✓ Scan complete — ${freshProspects.length} prospects found across ${sources.length} sources`);
  };

  // ─── OUTREACH GENERATION ──────────────────────────────────────────────────

  const generateOutreach = async (p) => {
    setGenerating(p.id);
    const signalList = p.signals.map(sid => {
      const meta = SIGNALS_META[sid];
      const detail = p.signal_details?.[sid] || "";
      return `• ${meta?.label}: ${detail}`;
    }).join("\n");

    const prompt = `You are a GTM expert for SkilledUp Life — a platform connecting tech startup founders building teams WITHOUT salary budgets to skilled professionals who contribute for equity, portfolio, or mission alignment.

Write a short, highly personalised LinkedIn connection request / first message (under 120 words) to ${p.name}, ${p.title} at ${p.company} (${p.sector}, ${p.location}).

BUYING SIGNALS DETECTED FOR THIS FOUNDER:
${signalList}

About them: ${p.bio}
Tech stack: ${p.tech_stack?.join(", ") || "Not detected"}

STRICT RULES:
- Reference at least 2 specific signals naturally — genuine research, not surveillance
- Open with a concrete observation about THEIR situation — never "I noticed your profile" or "Hope this finds you well"
- Position SkilledUp Life as their talent solution — don't explain the platform at length
- Tone: peer-to-peer, warm, direct — not salesy
- End with ONE soft specific question or CTA
- Start the message with their first name only, no "Hi" or "Hey" preamble
- Under 120 words absolutely`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "Error generating.";
      const newOutreach = { ...outreach, [p.id]: { text, generated_at: new Date().toISOString(), signals_used: p.signals } };
      await persistOutreach(newOutreach);
    } catch {
      const newOutreach = { ...outreach, [p.id]: { text: "Connection error. Please try again.", generated_at: new Date().toISOString(), signals_used: [] } };
      await persistOutreach(newOutreach);
    }
    setGenerating(null);
  };

  // ─── AI INTELLIGENCE BRIEF ────────────────────────────────────────────────

  const generateIntelBrief = async (p) => {
    setGenerating(`brief-${p.id}`);
    const prompt = `You are a GTM intelligence analyst for SkilledUp Life. Analyse this founder and provide a structured intelligence brief.

Founder: ${p.name}, ${p.title} at ${p.company}
Sector: ${p.sector} | Location: ${p.location}
Bio: ${p.bio}
Signals: ${p.signals.join(", ")}
Signal details: ${JSON.stringify(p.signal_details)}
Tech stack: ${p.tech_stack?.join(", ")}
Funding stage: ${p.funding_stage}
Team size: ${p.team_size}

Respond in JSON only (no markdown, no explanation):
{
  "buying_intent": "HIGH/MEDIUM/LOW",
  "intent_reasoning": "2 sentences why",
  "best_angle": "The single most compelling reason SkilledUp Life helps them right now",
  "timing": "Why NOW is the right moment to reach out (1 sentence)",
  "risk": "One potential objection or risk to address",
  "suggested_roles": ["3 specific roles they likely need based on their tech stack and stage"],
  "conversation_opener": "One killer opening line specific to their situation",
  "competitor_awareness": "Any competing platforms they might use (or 'None detected')"
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = data.content?.map(c => c.text || "").join("") || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const newOutreach = { ...outreach, [`brief-${p.id}`]: parsed };
      await persistOutreach(newOutreach);
    } catch (e) {
      console.error(e);
    }
    setGenerating(null);
  };

  // ─── PROSPECT MUTATIONS ───────────────────────────────────────────────────

  const updateStage = async (id, stage) => {
    const updated = prospects.map(p => p.id === id ? { ...p, stage } : p);
    await persistProspects(updated);
    if (selected?.id === id) setSelected(prev => ({ ...prev, stage }));
    showToast(`Stage → ${STAGE_META[stage].label}`);
  };
  const updateNotes = async (id, notes) => {
    const updated = prospects.map(p => p.id === id ? { ...p, notes } : p);
    await persistProspects(updated);
  };
  const saveToDatabase = async (id) => {
    const newSaved = new Set([...savedIds, id]);
    await persistSaved(newSaved);
    showToast("✓ Saved to your leads database");
  };
  const removeFromDatabase = async (id) => {
    const newSaved = new Set([...savedIds].filter(x => x !== id));
    await persistSaved(newSaved);
    showToast("Removed from database");
  };

  // ─── COMPUTED ─────────────────────────────────────────────────────────────

  const filteredProspects = prospects.filter(p => {
    if (filter.stage !== "all" && p.stage !== filter.stage) return false;
    if (filter.source !== "all" && p.source !== filter.source) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      return [p.name, p.company, p.sector, p.location, p.bio].some(f => f?.toLowerCase().includes(q));
    }
    return true;
  });

  const dbProspects = prospects.filter(p => {
    if (dbView === "saved") return savedIds.has(p.id);
    if (dbView === "hot") return p.stage === "hot";
    if (dbView === "contacted") return p.stage === "contacted" || p.stage === "replied";
    return true;
  });

  const sources = [...new Set(prospects.map(p => p.source))].filter(Boolean);

  const stats = {
    total: prospects.length,
    hot: prospects.filter(p => p.stage === "hot").length,
    warm: prospects.filter(p => p.stage === "warm").length,
    saved: savedIds.size,
    contacted: prospects.filter(p => p.stage === "contacted" || p.stage === "replied").length,
    avgScore: prospects.length ? Math.round(prospects.reduce((s, p) => s + (p.signal_score || 0), 0) / prospects.length) : 0,
  };

  if (loading) return (
    <div style={{ background: "#05050E", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#00FF88", fontFamily: "Jost", fontSize: 14, letterSpacing: 3 }}>LOADING INTELLIGENCE ENGINE...</div>
    </div>
  );

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Jost', sans-serif; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E1E30; border-radius: 3px; }
        input:focus, textarea:focus, select:focus { outline: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideRight { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes scanLine { 0%{top:-4px} 100%{top:calc(100% + 4px)} }
        @keyframes toast { 0%{opacity:0;transform:translateY(8px)} 15%{opacity:1;transform:translateY(0)} 85%{opacity:1} 100%{opacity:0} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px #00FF8833} 50%{box-shadow:0 0 20px #00FF8866} }
        .row-hover:hover { background: #0D0D1C !important; }
        .btn { cursor:pointer; transition:all 0.14s ease; }
        .btn:hover { opacity:.82; transform:scale(.975); }
        .card-hover:hover { border-color: #1E1E3A !important; transform:translateY(-1px); }
        .card-hover { transition: all 0.18s ease; }
        a { color:inherit; text-decoration:none; }
      `}</style>

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={S.logoMark}>S↑</div>
          <div>
            <div style={S.logoTitle}>SkilledUp Life</div>
            <div style={S.logoSub}>GTM Intelligence Suite</div>
          </div>
        </div>

        <div style={S.sidebarNav}>
          {[
            { id: "dashboard", icon: "◈", label: "Command Centre" },
            { id: "scanner", icon: "⊕", label: "Signal Scanner" },
            { id: "database", icon: "◻", label: "Leads Database" },
            { id: "outreach", icon: "◉", label: "Outreach Studio" },
            { id: "analytics", icon: "◌", label: "Analytics" },
            { id: "alerts", icon: "◎", label: "Alert Config" },
          ].map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ ...S.navItem, ...(tab === n.id ? S.navItemActive : {}) }} className="btn">
              <span style={S.navIcon}>{n.icon}</span>
              <span>{n.label}</span>
              {n.id === "database" && savedIds.size > 0 && (
                <span style={S.navBadge}>{savedIds.size}</span>
              )}
            </button>
          ))}
        </div>

        <div style={S.sidebarBottom}>
          <button onClick={runScan} disabled={scanning} style={{ ...S.scanBtn, animation: scanning ? "glow 2s infinite" : "none" }} className="btn">
            {scanning ? <><span style={{ animation: "pulse 1s infinite" }}>●</span> Scanning...</> : <><span>↻</span> Run Full Scan</>}
          </button>
          <div style={S.sidebarMeta}>
            Last scan: {prospects[0]?.discovered_at ? timeAgo(prospects[0].discovered_at) : "Never"}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        {/* TOPBAR */}
        <div style={S.topbar}>
          <div style={S.topbarTitle}>
            {{ dashboard: "Command Centre", scanner: "Signal Scanner", database: "Leads Database", outreach: "Outreach Studio", analytics: "Analytics", alerts: "Alert Configuration" }[tab]}
          </div>
          <div style={S.topbarRight}>
            {["total", "hot", "saved", "contacted"].map(k => (
              <div key={k} style={S.miniStat}>
                <span style={{ ...S.miniStatVal, color: k === "hot" ? "#EF4444" : k === "saved" ? "#00FF88" : "#A855F7" }}>{stats[k]}</span>
                <span style={S.miniStatLabel}>{k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>
          {tab === "dashboard" && <Dashboard prospects={prospects} stats={stats} savedIds={savedIds} onSelect={p => { setSelected(p); setTab("outreach"); }} onStageChange={updateStage} onSave={saveToDatabase} />}
          {tab === "scanner" && <Scanner scanning={scanning} progress={scanProgress} log={scanLog} prospects={filteredProspects} filter={filter} setFilter={setFilter} sources={sources} onSelect={p => { setSelected(p); }} onSave={saveToDatabase} savedIds={savedIds} onRun={runScan} />}
          {tab === "database" && <Database prospects={dbProspects} savedIds={savedIds} view={dbView} setView={setDbView} onSelect={p => { setSelected(p); setTab("outreach"); }} onStageChange={updateStage} onRemove={removeFromDatabase} onSave={saveToDatabase} />}
          {tab === "outreach" && <OutreachStudio prospects={prospects} selected={selected} setSelected={setSelected} outreach={outreach} generating={generating} onGenerate={generateOutreach} onBrief={generateIntelBrief} onOutreachEdit={(id, text) => persistOutreach({ ...outreach, [id]: { ...outreach[id], text } })} onStageChange={updateStage} onNoteChange={updateNotes} onSave={saveToDatabase} savedIds={savedIds} showToast={showToast} />}
          {tab === "analytics" && <Analytics prospects={prospects} data={ANALYTICS_DATA} />}
          {tab === "alerts" && <AlertConfig />}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ ...S.toast, background: toast.type === "error" ? "#EF4444" : "#00FF88", animation: "toast 3.2s ease forwards" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function Dashboard({ prospects, stats, savedIds, onSelect, onStageChange, onSave }) {
  const hot = prospects.filter(p => p.stage === "hot").slice(0, 4);
  const recent = [...prospects].sort((a, b) => new Date(b.discovered_at) - new Date(a.discovered_at)).slice(0, 5);
  const signalDist = Object.entries(SIGNALS_META).map(([id, meta]) => ({
    name: meta.label.replace("Hiring Unpaid Roles", "Unpaid Hiring").replace("Startup Competition", "Competition"),
    count: prospects.filter(p => p.signals?.includes(id)).length,
    color: meta.color,
  })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div style={S.dashGrid}>
      {/* STATS */}
      <div style={{ ...S.dashSection, gridColumn: "1/-1" }}>
        <div style={S.statsRow}>
          {[
            { label: "Total Prospects", val: stats.total, icon: "◈", color: "#A855F7" },
            { label: "Hot Signals", val: stats.hot, icon: "🔥", color: "#EF4444" },
            { label: "Warm Pipeline", val: stats.warm, icon: "♨", color: "#F59E0B" },
            { label: "Saved Leads", val: stats.saved, icon: "◻", color: "#00FF88" },
            { label: "Contacted", val: stats.contacted, icon: "◉", color: "#22C55E" },
            { label: "Avg Signal Score", val: stats.avgScore, icon: "⚡", color: "#06B6D4" },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ ...S.statVal, color: s.color }}>{s.val}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOT PROSPECTS */}
      <div style={S.dashSection}>
        <div style={S.sectionHead}>🔥 Hottest Prospects</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {hot.map(p => <MiniProspectCard key={p.id} p={p} onSelect={onSelect} onSave={onSave} saved={savedIds.has(p.id)} />)}
        </div>
      </div>

      {/* SIGNAL DISTRIBUTION */}
      <div style={S.dashSection}>
        <div style={S.sectionHead}>⚡ Signal Distribution</div>
        {signalDist.map(s => (
          <div key={s.name} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
              <span style={{ color: "#8888AA" }}>{s.name}</span>
              <span style={{ color: s.color, fontWeight: 600 }}>{s.count}</span>
            </div>
            <div style={{ height: 3, background: "#0F0F1C", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${(s.count / (prospects.length || 1)) * 100}%`, background: s.color, borderRadius: 2, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* RECENT DISCOVERIES */}
      <div style={{ ...S.dashSection, gridColumn: "1/-1" }}>
        <div style={S.sectionHead}>🕐 Recently Discovered</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
          {recent.map(p => <MiniProspectCard key={p.id} p={p} onSelect={onSelect} onSave={onSave} saved={savedIds.has(p.id)} />)}
        </div>
      </div>
    </div>
  );
}

function MiniProspectCard({ p, onSelect, onSave, saved }) {
  const { pct, color } = scoreBar(p.signal_score);
  const ac = avatarColor(p.name);
  const stage = STAGE_META[p.stage] || STAGE_META.watch;
  return (
    <div style={S.miniCard} className="card-hover">
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ ...S.avatarSm, background: ac + "22", color: ac }}>{initials(p.name)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: "#E8E8F8", fontSize: 13 }}>{p.name}</div>
          <div style={{ color: "#666", fontSize: 11 }}>{p.company} · {p.sector}</div>
        </div>
        <div style={{ ...S.stagePill, background: stage.bg, color: stage.color }}>{stage.label}</div>
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
        {p.signals?.slice(0, 3).map(sid => {
          const m = SIGNALS_META[sid];
          return m ? <span key={sid} style={S.sigChip}>{m.icon} {m.label}</span> : null;
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, height: 2, background: "#0F0F1C", borderRadius: 1 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 1 }} />
        </div>
        <span style={{ color, fontSize: 11, fontWeight: 700, minWidth: 24 }}>{p.signal_score}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => onSelect(p)} style={S.cardActionBtn} className="btn">View & Outreach →</button>
        {!saved && <button onClick={() => onSave(p.id)} style={{ ...S.cardActionBtn, background: "#00FF8814", borderColor: "#00FF8844", color: "#00FF88" }} className="btn">+ Save</button>}
      </div>
    </div>
  );
}

// ─── SCANNER ─────────────────────────────────────────────────────────────────

function Scanner({ scanning, progress, log, prospects, filter, setFilter, sources, onSelect, onSave, savedIds, onRun }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
      {/* SCAN CONTROL */}
      <div style={S.scanPanel}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#E8E8F8", marginBottom: 2 }}>Intelligence Scan</div>
            <div style={{ color: "#555", fontSize: 11 }}>Scrapes {sources.length || 13} sources simultaneously for buying signals</div>
          </div>
          <button onClick={onRun} disabled={scanning} style={{ ...S.bigScanBtn, animation: scanning ? "glow 2s infinite" : "none" }} className="btn">
            {scanning ? "⟳ Scanning..." : "↻ Run Full Scan"}
          </button>
        </div>

        {/* PROGRESS */}
        <div style={S.scanTrack}>
          <div style={{ ...S.scanFill, width: `${progress}%` }} />
          {scanning && <div style={S.scanGlow} />}
        </div>

        {/* SCAN LOG */}
        {log.length > 0 && (
          <div style={S.scanLog}>
            {log.map((entry, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", borderBottom: "1px solid #0A0A14", animation: "fadeUp 0.3s ease" }}>
                <span style={{ color: "#00FF88", fontSize: 10, fontWeight: 700, minWidth: 14 }}>✓</span>
                <span style={{ color: "#888", fontSize: 11, flex: 1 }}>{entry.src}</span>
                <span style={{ color: "#00FF88", fontSize: 11 }}>{entry.found} prospects</span>
                <span style={{ color: "#444", fontSize: 10 }}>{entry.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESULTS FILTERS */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Search name, company, sector..."
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          style={S.searchInput}
        />
        <select value={filter.stage} onChange={e => setFilter(f => ({ ...f, stage: e.target.value }))} style={S.select}>
          <option value="all">All Stages</option>
          {Object.entries(STAGE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filter.source} onChange={e => setFilter(f => ({ ...f, source: e.target.value }))} style={S.select}>
          <option value="all">All Sources</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ color: "#555", fontSize: 11, marginLeft: "auto" }}>{prospects.length} results</span>
      </div>

      {/* RESULTS TABLE */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={S.tableHead}>
              {["Founder", "Company", "Sector", "Signals", "Score", "Source", "Discovered", "Actions"].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prospects.map(p => {
              const { color } = scoreBar(p.signal_score);
              const ac = avatarColor(p.name);
              return (
                <tr key={p.id} style={S.tableRow} className="row-hover">
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ ...S.avatarXs, background: ac + "22", color: ac }}>{initials(p.name)}</div>
                      <div>
                        <div style={{ color: "#E8E8F8", fontWeight: 600, fontSize: 12 }}>{p.name}</div>
                        <div style={{ color: "#555", fontSize: 10 }}>{p.title}</div>
                      </div>
                    </div>
                  </td>
                  <td style={S.td}><span style={{ color: "#A0A0C0", fontSize: 12 }}>{p.company}</span></td>
                  <td style={S.td}><span style={S.sectorTag}>{p.sector}</span></td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {p.signals?.slice(0, 3).map(sid => {
                        const m = SIGNALS_META[sid];
                        return m ? <span key={sid} style={{ ...S.sigChip, fontSize: 9 }}>{m.icon}</span> : null;
                      })}
                    </div>
                  </td>
                  <td style={S.td}><span style={{ color, fontWeight: 700, fontSize: 13 }}>{p.signal_score}</span></td>
                  <td style={S.td}><span style={{ color: "#555", fontSize: 11 }}>{p.source}</span></td>
                  <td style={S.td}><span style={{ color: "#444", fontSize: 10 }}>{timeAgo(p.discovered_at)}</span></td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => onSelect(p)} style={S.tinyBtn} className="btn">View</button>
                      {!savedIds.has(p.id) && <button onClick={() => onSave(p.id)} style={{ ...S.tinyBtn, borderColor: "#00FF8844", color: "#00FF88" }} className="btn">Save</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── DATABASE ─────────────────────────────────────────────────────────────────

function Database({ prospects, savedIds, view, setView, onSelect, onStageChange, onRemove, onSave }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {[
          { id: "all", label: `All (${prospects.length})` },
          { id: "saved", label: `Saved (${savedIds.size})` },
          { id: "hot", label: "Hot Leads" },
          { id: "contacted", label: "Contacted" },
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{ ...S.viewTab, ...(view === v.id ? S.viewTabActive : {}) }} className="btn">
            {v.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", color: "#444", fontSize: 11 }}>
          {prospects.length} prospects
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12, overflowY: "auto" }}>
        {prospects.map(p => {
          const { color } = scoreBar(p.signal_score);
          const ac = avatarColor(p.name);
          const stage = STAGE_META[p.stage] || STAGE_META.watch;
          const isSaved = savedIds.has(p.id);
          return (
            <div key={p.id} style={S.dbCard} className="card-hover">
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ ...S.avatarSm, background: ac + "22", color: ac }}>{initials(p.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#E8E8F8", fontSize: 13 }}>{p.name}</div>
                  <div style={{ color: "#666", fontSize: 11 }}>{p.title} @ {p.company}</div>
                  <div style={{ color: "#444", fontSize: 10 }}>📍 {p.location}</div>
                </div>
                <div style={{ ...S.stagePill, background: stage.bg, color: stage.color }}>{stage.label}</div>
              </div>

              {/* Verified Channels */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Verified Channels</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {p.linkedin && <a href={`https://${p.linkedin}`} target="_blank" style={S.channelChip}>💼 LinkedIn</a>}
                  {p.twitter && <a href={`https://twitter.com/${p.twitter?.replace("@","")}`} target="_blank" style={S.channelChip}>𝕏 {p.twitter}</a>}
                  {p.github && <a href={`https://${p.github}`} target="_blank" style={S.channelChip}>⌨ GitHub</a>}
                  {p.website && <a href={`https://${p.website}`} target="_blank" style={S.channelChip}>🌐 Website</a>}
                  {p.email_patterns?.[0] && <span style={{ ...S.channelChip, cursor: "default" }}>✉ {p.email_patterns[0]}</span>}
                </div>
              </div>

              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                {p.signals?.slice(0, 3).map(sid => {
                  const m = SIGNALS_META[sid];
                  return m ? <span key={sid} style={S.sigChip}>{m.icon} {m.label}</span> : null;
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 2, background: "#0F0F1C", borderRadius: 1 }}>
                  <div style={{ height: "100%", width: `${scoreBar(p.signal_score).pct}%`, background: color, borderRadius: 1 }} />
                </div>
                <span style={{ color, fontSize: 11, fontWeight: 700 }}>{p.signal_score} pts</span>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => onSelect(p)} style={S.cardActionBtn} className="btn">✏ Outreach</button>
                {!isSaved
                  ? <button onClick={() => onSave(p.id)} style={{ ...S.cardActionBtn, borderColor: "#00FF8833", color: "#00FF88", background: "#00FF8810" }} className="btn">+ Database</button>
                  : <button onClick={() => onRemove(p.id)} style={{ ...S.cardActionBtn, borderColor: "#EF444433", color: "#EF4444", background: "#EF444410" }} className="btn">✕ Remove</button>
                }
                <select value={p.stage} onChange={e => onStageChange(p.id, e.target.value)} style={S.stageSelect}>
                  {Object.entries(STAGE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
          );
        })}
        {prospects.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "#333" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◻</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>No prospects here yet</div>
            <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>Run a scan or save prospects from the Scanner</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── OUTREACH STUDIO ─────────────────────────────────────────────────────────

function OutreachStudio({ prospects, selected, setSelected, outreach, generating, onGenerate, onBrief, onOutreachEdit, onStageChange, onNoteChange, onSave, savedIds, showToast }) {
  const [copied, setCopied] = useState(null);
  const msg = selected ? outreach[selected.id] : null;
  const brief = selected ? outreach[`brief-${selected.id}`] : null;

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    showToast("Copied to clipboard");
  };

  return (
    <div style={{ display: "flex", gap: 16, height: "100%", overflow: "hidden" }}>
      {/* PROSPECT LIST */}
      <div style={{ width: 280, flexShrink: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, textTransform: "uppercase", padding: "0 4px 8px", borderBottom: "1px solid #0F0F1C", marginBottom: 4 }}>
          Select Prospect
        </div>
        {prospects.map(p => {
          const ac = avatarColor(p.name);
          const hasMsg = !!outreach[p.id];
          const isActive = selected?.id === p.id;
          return (
            <div key={p.id} onClick={() => setSelected(p)} style={{ ...S.outreachListItem, ...(isActive ? S.outreachListItemActive : {}) }} className="card-hover">
              <div style={{ ...S.avatarXs, background: ac + "22", color: ac, flexShrink: 0 }}>{initials(p.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#E8E8F8", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ color: "#555", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.company}</div>
              </div>
              {hasMsg && <span style={{ color: "#00FF88", fontSize: 9 }}>✓</span>}
            </div>
          );
        })}
      </div>

      {/* DETAIL */}
      {selected ? (
        <div style={{ flex: 1, overflowY: "auto", animation: "slideRight 0.2s ease" }}>
          <ProspectDetail
            p={selected} msg={msg} brief={brief} generating={generating}
            onGenerate={onGenerate} onBrief={onBrief}
            onEdit={text => onOutreachEdit(selected.id, text)}
            onCopy={copy} copied={copied}
            onStageChange={onStageChange} onNoteChange={onNoteChange}
            onSave={onSave} saved={savedIds.has(selected.id)}
            outreach={outreach}
          />
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 48, opacity: 0.15 }}>◉</div>
          <div style={{ color: "#444", fontWeight: 600 }}>Select a prospect to generate outreach</div>
        </div>
      )}
    </div>
  );
}

function ProspectDetail({ p, msg, brief, generating, onGenerate, onBrief, onEdit, onCopy, copied, onStageChange, onNoteChange, onSave, saved, outreach }) {
  const ac = avatarColor(p.name);
  const { pct, color } = scoreBar(p.signal_score);
  const stage = STAGE_META[p.stage] || STAGE_META.watch;
  const [notesVal, setNotesVal] = useState(p.notes || "");
  const [seqExpanded, setSeqExpanded] = useState(false);
  const [generatingSeq, setGeneratingSeq] = useState(false);
  const [sequence, setSequence] = useState(outreach[`seq-${p.id}`] || null);

  useEffect(() => { setNotesVal(p.notes || ""); }, [p.id]);

  const generateSequence = async () => {
    setGeneratingSeq(true);
    const prompt = `Create a 3-touch outreach sequence for ${p.name} at ${p.company} (${p.sector}).
Their buying signals: ${p.signals.map(s => SIGNALS_META[s]?.label).join(", ")}
Bio: ${p.bio}

Return JSON only:
{
  "touch1": { "channel": "LinkedIn Connection", "timing": "Day 1", "subject": "", "message": "under 80 words, very personal opener based on their specific situation" },
  "touch2": { "channel": "LinkedIn Message", "timing": "Day 4", "subject": "", "message": "under 100 words, follow up referencing SkilledUp Life value prop" },
  "touch3": { "channel": "Email", "timing": "Day 10", "subject": "subject line here", "message": "under 120 words, final value-focused message with clear CTA" }
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = data.content?.map(c => c.text || "").join("") || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setSequence(parsed);
    } catch (e) { console.error(e); }
    setGeneratingSeq(false);
  };

  return (
    <div style={{ paddingRight: 4 }}>
      {/* HEADER */}
      <div style={S.detailHeader}>
        <div style={{ ...S.avatarLg, background: ac + "22", color: ac }}>{initials(p.name)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Jost", fontSize: 20, fontWeight: 700, color: "#F0F0FF" }}>{p.name}</div>
          <div style={{ color: "#777", fontSize: 12, marginBottom: 6 }}>{p.title} @ {p.company}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "#555" }}>
            <span>🌍 {p.location}</span>
            <span>💼 {p.sector}</span>
            <span>🏗 {p.funding_stage}</span>
            <span>👤 {p.team_size} {p.team_size === "1" ? "person" : "people"}</span>
          </div>
        </div>
        <div>
          <div style={{ ...S.scoreCircle, borderColor: color }}>
            <span style={{ color, fontSize: 20, fontWeight: 800 }}>{p.signal_score}</span>
            <span style={{ color: "#444", fontSize: 9 }}>SCORE</span>
          </div>
        </div>
      </div>

      <div style={S.detailBio}>{p.bio}</div>

      {/* VERIFIED CHANNELS */}
      <div style={{ marginBottom: 20 }}>
        <div style={S.label}>VERIFIED CONTACT CHANNELS</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {p.linkedin && <a href={`https://${p.linkedin}`} target="_blank" style={S.channelBtn}>💼 LinkedIn Profile</a>}
          {p.twitter && <a href={`https://twitter.com/${p.twitter?.replace("@","")}`} target="_blank" style={S.channelBtn}>𝕏 {p.twitter}</a>}
          {p.github && <a href={`https://${p.github}`} target="_blank" style={S.channelBtn}>⌨ GitHub</a>}
          {p.website && <a href={`https://${p.website}`} target="_blank" style={S.channelBtn}>🌐 {p.website}</a>}
          {p.email_patterns?.map((e, i) => <button key={i} onClick={() => onCopy(e, `email-${i}`)} style={{ ...S.channelBtn, cursor: "pointer" }} className="btn">{copied === `email-${i}` ? "✓ Copied" : `✉ ${e}`}</button>)}
        </div>
      </div>

      {/* TECH STACK */}
      {p.tech_stack?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={S.label}>TECH STACK DETECTED</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {p.tech_stack.map(t => <span key={t} style={S.techChip}>{t}</span>)}
          </div>
        </div>
      )}

      {/* STAGE */}
      <div style={{ marginBottom: 20 }}>
        <div style={S.label}>PIPELINE STAGE</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(STAGE_META).map(([k, v]) => (
            <button key={k} onClick={() => onStageChange(p.id, k)}
              style={{ ...S.stageBtn, background: p.stage === k ? v.bg : "transparent", borderColor: p.stage === k ? v.color : "#1A1A2A", color: p.stage === k ? v.color : "#555" }}
              className="btn">
              {v.label}
            </button>
          ))}
          {!saved && <button onClick={() => onSave(p.id)} style={{ ...S.stageBtn, borderColor: "#00FF8844", color: "#00FF88", marginLeft: "auto" }} className="btn">+ Save to DB</button>}
        </div>
      </div>

      {/* BUYING SIGNALS */}
      <div style={{ marginBottom: 20 }}>
        <div style={S.label}>BUYING SIGNALS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {p.signals?.map(sid => {
            const m = SIGNALS_META[sid];
            const detail = p.signal_details?.[sid];
            return m ? (
              <div key={sid} style={S.signalRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: detail ? 4 : 0 }}>
                  <span style={{ fontSize: 18 }}>{m.icon}</span>
                  <span style={{ color: "#E8E8F8", fontWeight: 600, flex: 1 }}>{m.label}</span>
                  <span style={{ ...S.weightBadge, color: m.color, borderColor: m.color + "44", background: m.color + "14" }}>+{m.weight} pts</span>
                </div>
                {detail && <div style={{ color: "#666", fontSize: 11, lineHeight: 1.5, paddingLeft: 26, fontStyle: "italic" }}>{detail}</div>}
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* AI INTEL BRIEF */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={S.label}>AI INTELLIGENCE BRIEF</div>
          <button onClick={() => onBrief(p)} disabled={generating === `brief-${p.id}`} style={S.aiBtn} className="btn">
            {generating === `brief-${p.id}` ? <span style={{ animation: "pulse 1s infinite" }}>⟳ Analysing...</span> : brief ? "↺ Refresh Brief" : "⚡ Generate Brief"}
          </button>
        </div>
        {brief && (
          <div style={S.briefPanel}>
            <div style={S.briefItem}>
              <span style={S.briefKey}>Buying Intent</span>
              <span style={{ color: brief.buying_intent === "HIGH" ? "#00FF88" : brief.buying_intent === "MEDIUM" ? "#F59E0B" : "#EF4444", fontWeight: 700 }}>{brief.buying_intent}</span>
            </div>
            <div style={S.briefItem}><span style={S.briefKey}>Reasoning</span><span style={S.briefVal}>{brief.intent_reasoning}</span></div>
            <div style={S.briefItem}><span style={S.briefKey}>Best Angle</span><span style={{ ...S.briefVal, color: "#00FF88" }}>{brief.best_angle}</span></div>
            <div style={S.briefItem}><span style={S.briefKey}>Timing</span><span style={S.briefVal}>{brief.timing}</span></div>
            <div style={S.briefItem}><span style={S.briefKey}>Risk</span><span style={{ ...S.briefVal, color: "#F59E0B" }}>{brief.risk}</span></div>
            <div style={S.briefItem}><span style={S.briefKey}>Opener</span><span style={{ ...S.briefVal, fontStyle: "italic", color: "#A855F7" }}>"{brief.conversation_opener}"</span></div>
            {brief.suggested_roles && (
              <div style={S.briefItem}><span style={S.briefKey}>Suggested Roles</span><span style={S.briefVal}>{brief.suggested_roles?.join(" · ")}</span></div>
            )}
          </div>
        )}
      </div>

      {/* OUTREACH MESSAGE */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={S.label}>PERSONALISED OUTREACH MESSAGE</div>
          <button onClick={() => onGenerate(p)} disabled={generating === p.id} style={S.generateBtn} className="btn">
            {generating === p.id ? <span style={{ animation: "pulse 1s infinite" }}>⟳ Generating...</span> : msg ? "↺ Regenerate" : "⚡ Generate"}
          </button>
        </div>
        {msg ? (
          <div style={S.outreachBox}>
            <textarea value={msg.text} onChange={e => onEdit(e.target.value)} style={S.outreachTA} rows={8} />
            <div style={S.outreachMeta}>
              <span style={{ color: "#444", fontSize: 10 }}>{msg.text?.split(" ").filter(Boolean).length || 0} words · Generated {timeAgo(msg.generated_at)}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => onCopy(msg.text, "msg")} style={S.copyBtn} className="btn">{copied === "msg" ? "✓ Copied!" : "⊕ Copy"}</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={S.outreachEmpty}>Click "Generate" to create a personalised message based on this founder's specific buying signals.</div>
        )}
      </div>

      {/* OUTREACH SEQUENCE */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={S.label}>3-TOUCH OUTREACH SEQUENCE</div>
          <button onClick={sequence ? () => setSeqExpanded(!seqExpanded) : generateSequence} disabled={generatingSeq} style={{ ...S.aiBtn, background: "#A855F714", borderColor: "#A855F744", color: "#A855F7" }} className="btn">
            {generatingSeq ? <span style={{ animation: "pulse 1s infinite" }}>⟳ Building...</span> : sequence ? (seqExpanded ? "Collapse" : "View Sequence") : "⚡ Build Sequence"}
          </button>
        </div>
        {sequence && seqExpanded && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["touch1", "touch2", "touch3"].map((key, i) => {
              const t = sequence[key];
              return t ? (
                <div key={key} style={S.seqCard}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                    <span style={{ ...S.seqNum, background: ["#06B6D4", "#A855F7", "#EF4444"][i] + "22", color: ["#06B6D4", "#A855F7", "#EF4444"][i] }}>{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "#E8E8F8", fontSize: 12 }}>{t.channel}</div>
                      <div style={{ color: "#555", fontSize: 10 }}>{t.timing}</div>
                    </div>
                    <button onClick={() => onCopy(t.message, `seq-${i}`)} style={{ ...S.copyBtn, marginLeft: "auto", fontSize: 9 }} className="btn">{copied === `seq-${i}` ? "✓" : "Copy"}</button>
                  </div>
                  {t.subject && <div style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>Subject: <span style={{ color: "#A0A0C0" }}>{t.subject}</span></div>}
                  <div style={{ color: "#888", fontSize: 11, lineHeight: 1.6 }}>{t.message}</div>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* NOTES */}
      <div style={{ marginBottom: 20 }}>
        <div style={S.label}>NOTES</div>
        <textarea
          value={notesVal}
          onChange={e => setNotesVal(e.target.value)}
          onBlur={() => onNoteChange(p.id, notesVal)}
          placeholder="Research notes, call notes, context..."
          style={S.notesTA} rows={3}
        />
      </div>
    </div>
  );
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

function Analytics({ prospects, data }) {
  const sectorData = Object.entries(
    prospects.reduce((acc, p) => { acc[p.sector] = (acc[p.sector] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const sourceData = Object.entries(
    prospects.reduce((acc, p) => { acc[p.source] = (acc[p.source] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name || "Unknown", value })).sort((a, b) => b.value - a.value);

  const COLORS = ["#00FF88", "#A855F7", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* GROWTH CHART */}
      <div style={S.chartCard}>
        <div style={S.sectionHead}>📈 Prospect Discovery Trend</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fill: "#444", fontSize: 10, fontFamily: "Jost" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#444", fontSize: 10, fontFamily: "Jost" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0D0D1C", border: "1px solid #1A1A2A", borderRadius: 6, fontFamily: "Jost", fontSize: 11 }} />
            <Line type="monotone" dataKey="prospects" stroke="#A855F7" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="hot" stroke="#EF4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="contacted" stroke="#00FF88" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center" }}>
          {[["#A855F7", "Total Prospects"], ["#EF4444", "Hot Signals"], ["#00FF88", "Contacted"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#555" }}>
              <div style={{ width: 16, height: 2, background: c, borderRadius: 1 }} />{l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* SECTOR */}
        <div style={S.chartCard}>
          <div style={S.sectionHead}>🏭 Sectors</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sectorData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#444", fontSize: 9, fontFamily: "Jost" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#888", fontSize: 10, fontFamily: "Jost" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ background: "#0D0D1C", border: "1px solid #1A1A2A", borderRadius: 6, fontFamily: "Jost", fontSize: 11 }} />
              <Bar dataKey="value" fill="#A855F7" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SOURCE */}
        <div style={S.chartCard}>
          <div style={S.sectionHead}>🔍 Discovery Sources</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9} fill="#A855F7">
                {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0D0D1C", border: "1px solid #1A1A2A", borderRadius: 6, fontFamily: "Jost", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SIGNAL CONVERSION */}
      <div style={S.chartCard}>
        <div style={S.sectionHead}>⚡ Signal Frequency Analysis</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={Object.entries(SIGNALS_META).map(([id, m]) => ({ name: m.label.slice(0, 12), count: prospects.filter(p => p.signals?.includes(id)).length, color: m.color }))}>
            <XAxis dataKey="name" tick={{ fill: "#444", fontSize: 9, fontFamily: "Jost" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#444", fontSize: 9, fontFamily: "Jost" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0D0D1C", border: "1px solid #1A1A2A", borderRadius: 6, fontFamily: "Jost", fontSize: 11 }} />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {Object.entries(SIGNALS_META).map(([id, m], i) => <Cell key={i} fill={m.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── ALERTS ──────────────────────────────────────────────────────────────────

function AlertConfig() {
  const [alerts, setAlerts] = useState([
    { id: 1, name: "High-Score UK Founders", active: true, signals: ["accelerator", "unpaid_hiring"], location: "UK", minScore: 20, channel: "Email" },
    { id: 2, name: "YC Batch Alerts", active: true, signals: ["accelerator"], keyword: "y combinator", minScore: 10, channel: "Webhook" },
    { id: 3, name: "Equity-Only Hiring", active: false, signals: ["unpaid_hiring"], minScore: 8, channel: "Email" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#E8E8F8" }}>Signal Alerts</div>
          <div style={{ color: "#555", fontSize: 11 }}>Get notified when prospects matching your criteria are discovered</div>
        </div>
        <button style={S.generateBtn} className="btn">+ New Alert</button>
      </div>

      {alerts.map(alert => (
        <div key={alert.id} style={{ ...S.alertCard, opacity: alert.active ? 1 : 0.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, color: "#E8E8F8", fontSize: 14 }}>{alert.name}</div>
              <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>Channel: {alert.channel} · Min score: {alert.minScore}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: alert.active ? "#00FF88" : "#555", fontWeight: 600 }}>{alert.active ? "● ACTIVE" : "○ PAUSED"}</span>
              <button onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: !a.active } : a))}
                style={{ ...S.tinyBtn, borderColor: alert.active ? "#EF444433" : "#00FF8833", color: alert.active ? "#EF4444" : "#00FF88" }}
                className="btn">{alert.active ? "Pause" : "Activate"}</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {alert.signals.map(sid => {
              const m = SIGNALS_META[sid];
              return m ? <span key={sid} style={S.sigChip}>{m.icon} {m.label}</span> : null;
            })}
            {alert.location && <span style={{ ...S.sigChip, borderColor: "#06B6D444", color: "#06B6D4" }}>📍 {alert.location}</span>}
            {alert.keyword && <span style={{ ...S.sigChip, borderColor: "#A855F744", color: "#A855F7" }}>🔑 "{alert.keyword}"</span>}
          </div>
        </div>
      ))}

      <div style={S.alertCard}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ color: "#444", fontSize: 12, marginBottom: 8 }}>Connect an email or webhook to receive real-time alerts when new prospects are discovered.</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button style={{ ...S.tinyBtn, padding: "8px 16px" }} className="btn">✉ Connect Email</button>
            <button style={{ ...S.tinyBtn, padding: "8px 16px", borderColor: "#A855F744", color: "#A855F7" }} className="btn">⚡ Connect Webhook</button>
            <button style={{ ...S.tinyBtn, padding: "8px 16px", borderColor: "#06B6D444", color: "#06B6D4" }} className="btn">💬 Slack Integration</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = {
  root: { fontFamily: "'Jost', sans-serif", display: "flex", background: "#05050E", minHeight: "100vh", color: "#9090B0", fontSize: 12 },
  sidebar: { width: 220, flexShrink: 0, background: "#07070F", borderRight: "1px solid #0F0F1C", display: "flex", flexDirection: "column", padding: "0 0 16px" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "18px 16px 16px", borderBottom: "1px solid #0F0F1C" },
  logoMark: { fontWeight: 800, fontSize: 18, color: "#00FF88", background: "#00FF8818", border: "1px solid #00FF8833", padding: "5px 10px", borderRadius: 6 },
  logoTitle: { fontWeight: 700, fontSize: 13, color: "#E8E8F8" },
  logoSub: { fontSize: 9, color: "#333", letterSpacing: 0.5 },
  sidebarNav: { flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 },
  navItem: { display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 7, background: "transparent", border: "none", color: "#444", fontSize: 12, fontFamily: "'Jost', sans-serif", fontWeight: 500, width: "100%", textAlign: "left", position: "relative" },
  navItemActive: { background: "#0D0D1C", color: "#E8E8F8" },
  navIcon: { fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 },
  navBadge: { marginLeft: "auto", background: "#00FF8818", color: "#00FF88", fontSize: 9, padding: "1px 6px", borderRadius: 8, border: "1px solid #00FF8833" },
  sidebarBottom: { padding: "12px 8px 0" },
  scanBtn: { width: "100%", background: "#00FF8814", border: "1px solid #00FF8833", color: "#00FF88", padding: "10px", borderRadius: 8, fontFamily: "'Jost', sans-serif", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  sidebarMeta: { textAlign: "center", fontSize: 9, color: "#333", marginTop: 8, letterSpacing: 0.5 },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #0F0F1C", background: "#07070F", flexShrink: 0 },
  topbarTitle: { fontWeight: 700, fontSize: 15, color: "#E8E8F8" },
  topbarRight: { display: "flex", gap: 20 },
  miniStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1 },
  miniStatVal: { fontWeight: 800, fontSize: 18, lineHeight: 1 },
  miniStatLabel: { fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: 1 },
  content: { flex: 1, overflowY: "auto", padding: 24 },
  dashGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  dashSection: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 12, padding: 16 },
  sectionHead: { fontWeight: 700, fontSize: 12, color: "#888", marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1 },
  statCard: { background: "#09090F", padding: "14px 16px", borderRadius: 0, textAlign: "center", border: "1px solid #0F0F1C" },
  statVal: { fontWeight: 800, fontSize: 24, lineHeight: 1, marginBottom: 4 },
  statLabel: { fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: 1 },
  miniCard: { background: "#09090F", border: "1px solid #0F0F1C", borderRadius: 10, padding: 14 },
  avatarSm: { width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 },
  avatarXs: { width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 10, flexShrink: 0 },
  avatarLg: { width: 52, height: 52, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, flexShrink: 0 },
  stagePill: { padding: "3px 8px", borderRadius: 20, fontSize: 9, fontWeight: 600, whiteSpace: "nowrap", letterSpacing: 0.5 },
  sigChip: { background: "#0D0D1C", border: "1px solid #151524", borderRadius: 4, padding: "3px 7px", fontSize: 10, color: "#666" },
  techChip: { background: "#0A0A18", border: "1px solid #1A1A2A", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#7777AA" },
  sectorTag: { background: "#A855F714", border: "1px solid #A855F733", borderRadius: 4, padding: "2px 7px", fontSize: 10, color: "#A855F7" },
  cardActionBtn: { background: "#0D0D1C", border: "1px solid #1A1A2A", borderRadius: 5, padding: "5px 10px", color: "#888", fontSize: 10, fontFamily: "'Jost', sans-serif", cursor: "pointer" },
  scanPanel: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 12, padding: 16 },
  bigScanBtn: { background: "linear-gradient(135deg, #00FF88, #00CC66)", border: "none", borderRadius: 8, padding: "10px 20px", color: "#000", fontFamily: "'Jost', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  scanTrack: { height: 3, background: "#0A0A14", borderRadius: 2, overflow: "hidden", position: "relative", marginBottom: 4 },
  scanFill: { height: "100%", background: "linear-gradient(90deg, #00FF88, #A855F7)", borderRadius: 2, transition: "width 0.4s ease" },
  scanGlow: { position: "absolute", top: 0, bottom: 0, width: 30, background: "linear-gradient(90deg, transparent, #00FF8888, transparent)", animation: "scanLine 1.5s linear infinite" },
  scanLog: { background: "#04040A", borderRadius: 6, padding: "8px 12px", marginTop: 10, maxHeight: 180, overflowY: "auto" },
  searchInput: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 7, padding: "8px 12px", color: "#E8E8F8", fontSize: 12, fontFamily: "'Jost', sans-serif", minWidth: 260 },
  select: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 7, padding: "8px 10px", color: "#888", fontSize: 11, fontFamily: "'Jost', sans-serif" },
  tableWrap: { flex: 1, overflowY: "auto", background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 12 },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { background: "#04040A", position: "sticky", top: 0 },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, whiteSpace: "nowrap" },
  tableRow: { borderBottom: "1px solid #09091A", transition: "background 0.1s" },
  td: { padding: "10px 14px", verticalAlign: "middle" },
  tinyBtn: { background: "transparent", border: "1px solid #1A1A2A", borderRadius: 4, padding: "4px 9px", color: "#666", fontSize: 10, cursor: "pointer", fontFamily: "'Jost', sans-serif" },
  viewTab: { background: "transparent", border: "1px solid #0F0F1C", borderRadius: 7, padding: "7px 14px", color: "#555", fontSize: 11, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 500 },
  viewTabActive: { background: "#0D0D1C", borderColor: "#1A1A2A", color: "#E8E8F8" },
  dbCard: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 12, padding: 14 },
  channelChip: { background: "#0A0A18", border: "1px solid #1A1A2A", borderRadius: 5, padding: "4px 9px", fontSize: 10, color: "#7777AA", cursor: "pointer", display: "inline-block" },
  channelBtn: { background: "#0A0A18", border: "1px solid #1A1A2A", borderRadius: 5, padding: "6px 12px", fontSize: 11, color: "#8888BB", cursor: "pointer", fontFamily: "'Jost', sans-serif", display: "inline-block" },
  stageSelect: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 5, padding: "4px 8px", color: "#888", fontSize: 10, fontFamily: "'Jost', sans-serif", cursor: "pointer" },
  outreachListItem: { display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 8, cursor: "pointer", border: "1px solid transparent" },
  outreachListItemActive: { background: "#0D0D1C", borderColor: "#1A1A2A" },
  detailHeader: { display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" },
  detailBio: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#777", lineHeight: 1.6, marginBottom: 16 },
  label: { fontSize: 9, color: "#444", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 },
  scoreCircle: { width: 60, height: 60, borderRadius: "50%", border: "2px solid", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  stageBtn: { border: "1px solid", borderRadius: 6, padding: "5px 11px", fontSize: 11, fontFamily: "'Jost', sans-serif", cursor: "pointer", fontWeight: 500 },
  signalRow: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 8, padding: "10px 12px" },
  weightBadge: { border: "1px solid", borderRadius: 4, padding: "2px 7px", fontSize: 9, fontFamily: "'Jost', sans-serif", fontWeight: 600 },
  aiBtn: { background: "#06B6D414", border: "1px solid #06B6D444", color: "#06B6D4", padding: "6px 14px", borderRadius: 7, fontSize: 11, fontFamily: "'Jost', sans-serif", cursor: "pointer", fontWeight: 600 },
  generateBtn: { background: "linear-gradient(135deg, #00FF88, #00BBFF)", border: "none", borderRadius: 7, padding: "8px 16px", color: "#000", fontFamily: "'Jost', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" },
  briefPanel: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 },
  briefItem: { display: "flex", gap: 10, alignItems: "flex-start", paddingBottom: 8, borderBottom: "1px solid #09091A" },
  briefKey: { fontSize: 10, color: "#444", minWidth: 100, flexShrink: 0, paddingTop: 1, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  briefVal: { fontSize: 11, color: "#888", lineHeight: 1.5 },
  outreachBox: { background: "#07070F", border: "1px solid #1A1A2A", borderRadius: 10, overflow: "hidden" },
  outreachTA: { width: "100%", background: "transparent", border: "none", padding: "14px 16px", color: "#C0C0D8", fontSize: 12, lineHeight: 1.7, fontFamily: "'Jost', sans-serif", resize: "vertical" },
  outreachMeta: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderTop: "1px solid #0F0F1C", background: "#04040A" },
  copyBtn: { background: "#00FF8814", border: "1px solid #00FF8833", color: "#00FF88", padding: "5px 12px", borderRadius: 5, fontSize: 10, fontFamily: "'Jost', sans-serif", cursor: "pointer" },
  outreachEmpty: { background: "#07070F", border: "1px dashed #1A1A2A", borderRadius: 10, padding: 18, color: "#444", fontSize: 11, textAlign: "center", lineHeight: 1.6 },
  seqCard: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 8, padding: "12px 14px" },
  seqNum: { width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, flexShrink: 0 },
  notesTA: { width: "100%", background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 8, padding: "10px 14px", color: "#777", fontSize: 11, lineHeight: 1.6, fontFamily: "'Jost', sans-serif", resize: "vertical" },
  chartCard: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 12, padding: 16 },
  alertCard: { background: "#07070F", border: "1px solid #0F0F1C", borderRadius: 12, padding: 16 },
  toast: { position: "fixed", bottom: 24, right: 24, padding: "10px 20px", borderRadius: 8, color: "#000", fontFamily: "'Jost', sans-serif", fontWeight: 700, fontSize: 12, zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" },
};
