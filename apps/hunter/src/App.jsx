import { useEffect, useMemo, useState } from "react";
import { ACCESS_CONFIG, ACCESS_ORDER } from "./data/access";
import { LANE_COLORS } from "./data/lanes";
import { PROGRAMS } from "./data/programs";
import { DEFAULT_PROFILE, DEFAULT_PROFILE_DOC, PROFILE_DOC_KEYS, PROFILE_FIELDS, PROFILE_SCHEMA, profileMatches } from "./data/profile";
import { STATUS_CONFIG } from "./data/statuses";
import { TAG_CONFIG, TAG_ORDER } from "./data/tags";
import { agentState } from "./lib/agent";
import { loadRemoteState, saveRemoteState } from "./lib/remoteState";
import { storage, STORAGE_VERSION } from "./lib/storage";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { MULTI_VENDORS, totalCashLikeT1, totalCountedT1, VENDOR_COUNT } from "./lib/stats";
import { MultiSelectDropdown } from "./components/MultiSelectDropdown";
import { SingleSelectDropdown } from "./components/SingleSelectDropdown";
import { ProgramCard } from "./components/ProgramCard";
import { GuidedView } from "./components/GuidedView";
import { ProofView } from "./components/ProofView";
import { Stat } from "./components/Stat";
import { AccentsModal } from "./components/AccentsModal";
import { applyAccents, clearLocalAccents, loadLocalAccents, mergeAccents, saveLocalAccents } from "./lib/accents";
import { DEFAULT_ACCENTS } from "./data/accentDefaults";

export default function App() {
  const [statuses, setStatuses]           = useState({});
  const [profile, setProfile]             = useState(DEFAULT_PROFILE);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileDoc, setProfileDoc]       = useState(DEFAULT_PROFILE_DOC);
  const [openProfileSections, setOpenProfileSections] = useState(() => new Set());
  const [onlyForMe, setOnlyForMe]         = useState(false);
  const [search, setSearch]               = useState("");
  const [laneFilters, setLaneFilters]     = useState(() => new Set());
  const [accessFilters, setAccessFilters] = useState(() => new Set());
  const [tagFilters, setTagFilters]       = useState(() => new Set());
  const [tierFilters, setTierFilters]     = useState(() => new Set());
  const [statusFilters, setStatusFilters] = useState(() => new Set());
  const [stateFilters, setStateFilters]   = useState(() => new Set());
  const [savedFlash, setSavedFlash]       = useState(false);
  const [sortBy, setSortBy]               = useState("valueNum");
  const [viewMode, setViewMode]           = useState("grid"); // "grid" | "by_vendor"
  const [loaded, setLoaded]               = useState(false);
  const [collapsedVendors, setCollapsedVendors] = useState(() => new Set());
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [remoteReady, setRemoteReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? "local" : "local-only");
  const [syncError, setSyncError] = useState("");

  const [accents, setAccents]             = useState(() => mergeAccents(null));
  const [accentsOpen, setAccentsOpen]     = useState(false);
  const [accentsSavedFlash, setAccentsSavedFlash] = useState(false);

  // Toggle a key in a Set-typed filter state
  const toggleInSet = (setter) => (key) => setter(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const clearSet = (setter) => () => setter(new Set());

  // Load local state first so unsigned-in use keeps working.
  useEffect(() => {
    (async () => {
      try {
        const s = await storage.get(STORAGE_VERSION + "-statuses");
        if (s) setStatuses(JSON.parse(s));
        const p = await storage.get(STORAGE_VERSION + "-profile");
        if (p) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(p) });

        const pd = await storage.get(STORAGE_VERSION + "-profileDoc");
        if (pd) setProfileDoc({ ...DEFAULT_PROFILE_DOC, ...JSON.parse(pd) });

        const localAccents = loadLocalAccents();
        if (localAccents) {
          const merged = mergeAccents(localAccents);
          setAccents(merged);
          applyAccents(merged);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  // Apply accents to :root whenever they change (live preview).
  useEffect(() => { applyAccents(accents); }, [accents]);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loaded || !authReady) return;
    if (!session?.user?.id) {
      setRemoteReady(false);
      setSyncStatus(isSupabaseConfigured ? "local" : "local-only");
      return;
    }

    let cancelled = false;
    const userId = session.user.id;
    setSyncStatus("loading");
    setSyncError("");

    (async () => {
      try {
        const remote = await loadRemoteState(userId);
        if (cancelled) return;

        if (remote) {
          setStatuses(remote.statuses || {});
          setProfile({ ...DEFAULT_PROFILE, ...(remote.profile || {}) });
          setProfileDoc({ ...DEFAULT_PROFILE_DOC, ...(remote.profile_doc || {}) });
          if (remote.accents && Object.keys(remote.accents).length) {
            const merged = mergeAccents(remote.accents);
            setAccents(merged);
            applyAccents(merged);
          }
        } else {
          await saveRemoteState(userId, { profile, profileDoc, statuses, accents });
        }

        if (!cancelled) {
          setRemoteReady(true);
          setSyncStatus("synced");
        }
      } catch (error) {
        if (!cancelled) {
          setRemoteReady(false);
          setSyncStatus("error");
          setSyncError(error.message || "Sync failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loaded, authReady, session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id || !remoteReady) return;

    const timeout = window.setTimeout(async () => {
      try {
        setSyncStatus("saving");
        setSyncError("");
        await saveRemoteState(session.user.id, { profile, profileDoc, statuses, accents });
        setSyncStatus("synced");
      } catch (error) {
        setSyncStatus("error");
        setSyncError(error.message || "Sync failed");
      }
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [profile, profileDoc, statuses, accents, remoteReady, session?.user?.id]);

  const signInWithProvider = async (provider) => {
    if (!supabase) return;
    setSyncError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setSyncStatus("error");
      setSyncError(error.message);
    }
  };

  const handleAccentsSave = async () => {
    saveLocalAccents(accents);
    if (session?.user?.id) {
      try {
        setSyncStatus("saving");
        setSyncError("");
        await saveRemoteState(session.user.id, { profile, profileDoc, statuses, accents });
        setSyncStatus("synced");
      } catch (error) {
        setSyncStatus("error");
        setSyncError(error.message || "Sync failed");
      }
    }
    setAccentsSavedFlash(true);
    window.setTimeout(() => setAccentsSavedFlash(false), 1800);
  };

  const handleAccentsResetAll = () => {
    const fresh = mergeAccents(null);
    setAccents(fresh);
    applyAccents(fresh);
    clearLocalAccents();
  };

  const handleManualSave = async () => {
    if (session?.user?.id) {
      try {
        setSyncStatus("saving");
        setSyncError("");
        await saveRemoteState(session.user.id, { profile, profileDoc, statuses });
        setSyncStatus("synced");
      } catch (error) {
        setSyncStatus("error");
        setSyncError(error.message || "Sync failed");
        return;
      }
    }
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };

  const signOut = async () => {
    if (!supabase) return;
    setSyncError("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSyncStatus("error");
      setSyncError(error.message);
    } else {
      setRemoteReady(false);
      setSyncStatus("local");
    }
  };

  const updateStatus = async (id, st) => {
    const next = { ...statuses, [id]: st };
    setStatuses(next);
    await storage.set(STORAGE_VERSION + "-statuses", JSON.stringify(next));
  };

  const updateProfile = async (key, val) => {
    const next = { ...profile, [key]: val };
    setProfile(next);
    await storage.set(STORAGE_VERSION + "-profile", JSON.stringify(next));
  };

  const updateProfileDoc = async (key, val) => {
    const next = { ...profileDoc, [key]: val };
    setProfileDoc(next);
    await storage.set(STORAGE_VERSION + "-profileDoc", JSON.stringify(next));
  };

  const toggleProfileSection = (key) => setOpenProfileSections(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  // Profile match lookup
  const profileMatchSet = useMemo(() =>
    new Set(PROGRAMS.filter(p => profileMatches(p, profile)).map(p => p.id))
  , [profile]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = PROGRAMS.filter(p => {
      if (onlyForMe && !profileMatchSet.has(p.id))                                       return false;
      if (laneFilters.size > 0    && !laneFilters.has(p.lane))                           return false;
      if (accessFilters.size > 0  && !p.access.some(a => accessFilters.has(a)))          return false;
      if (tagFilters.size > 0     && !p.tags.some(t => tagFilters.has(t)))               return false;
      if (tierFilters.size > 0   && !tierFilters.has(String(p.tier)))                   return false;
      const st = statuses[p.id] || "not_applied";
      if (statusFilters.size > 0 && !statusFilters.has(st))                              return false;
      if (stateFilters.size > 0  && !stateFilters.has(agentState(p).key))                return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) &&
            !p.description.toLowerCase().includes(q) &&
            !p.lane.toLowerCase().includes(q) &&
            !p.type.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sortBy === "valueNum") list.sort((a,b) => b.value.estimate - a.value.estimate);
    if (sortBy === "name")     list.sort((a,b) => a.name.localeCompare(b.name));
    if (sortBy === "lane")     list.sort((a,b) => a.lane.localeCompare(b.lane) || b.value.estimate - a.value.estimate);
    if (sortBy === "tier")     list.sort((a,b) => a.tier - b.tier || b.value.estimate - a.value.estimate);
    if (sortBy === "agent")    list.sort((a,b) => {
      const order = { submit:0, draft:1, research:2, stale:3 };
      return order[agentState(a).key] - order[agentState(b).key] || b.value.estimate - a.value.estimate;
    });
    if (sortBy === "match")    list.sort((a,b) => {
      const am = profileMatchSet.has(a.id) ? 0 : 1;
      const bm = profileMatchSet.has(b.id) ? 0 : 1;
      return am - bm || b.value.estimate - a.value.estimate;
    });
    return list;
  }, [search, laneFilters, accessFilters, tagFilters, tierFilters, statusFilters, stateFilters, sortBy, statuses, onlyForMe, profileMatchSet]);

  // Stats
  const stats = useMemo(() => {
    const counts = { submit:0, draft:0, research:0, stale:0 };
    PROGRAMS.forEach(p => counts[agentState(p).key]++);
    return {
      submit: counts.submit, draft: counts.draft, research: counts.research,
      applied:  Object.values(statuses).filter(s => s === "applied").length,
      approved: Object.values(statuses).filter(s => s === "approved").length,
      interested: Object.values(statuses).filter(s => s === "agent_queued").length,
      forMe:    profileMatchSet.size,
    };
  }, [statuses, profileMatchSet]);

  const tagCounts    = useMemo(() => Object.fromEntries(TAG_ORDER.map(t => [t, PROGRAMS.filter(p => p.tags.includes(t)).length])), []);
  const accessCounts = useMemo(() => Object.fromEntries(ACCESS_ORDER.map(a => [a, PROGRAMS.filter(p => p.access.includes(a)).length])), []);

  const inp = {
    background:"var(--surface-2)", border:"1px solid var(--line)", color:"var(--text-dim)",
    borderRadius:3, padding:"5px 8px", fontSize:10,
    fontFamily:"monospace", outline:"none", appearance:"none", cursor:"pointer",
  };
  const signedInUser = session?.user;
  const syncLabel = signedInUser
    ? syncStatus === "saving" ? "saving"
      : syncStatus === "loading" ? "loading"
      : syncStatus === "error" ? "sync error"
      : "synced"
    : isSupabaseConfigured ? "local only" : "auth off";

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", fontFamily:"monospace" }}>
     <div className="shell">

      {/* HEADER */}
      <div style={{ padding:"22px 22px 0", borderBottom:"1px solid var(--line-soft)" }}>
        <div className="header-row">
          <div className="header-title-block">
            <div className="header-wordmark" style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.05em", color:"var(--text)" }}>
              BENEFIT HUNTER
            </div>
            <span className="header-counter" style={{ fontSize:9, color:"var(--text-dim3)", letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"monospace" }}>
              {filtered.length} / {PROGRAMS.length} <span style={{ color:"var(--line)" }}>benefits</span>
            </span>
          </div>

          {/* HEADER ACTION ROW */}
          <div className="header-actions">
            <button onClick={() => setOnlyForMe(o => !o)} title="Show only benefits matching your profile" style={{
              background: onlyForMe ? "color-mix(in oklch, var(--match) 14%, transparent)" : "transparent",
              border:"1px solid " + (onlyForMe ? "color-mix(in oklch, var(--match) 40%, transparent)" : "var(--line)"),
              color: onlyForMe ? "var(--match)" : "var(--text-dim)",
              borderRadius:3, padding:"5px 10px", cursor:"pointer", fontSize:10,
              fontFamily:"monospace", letterSpacing:"0.06em", textTransform:"uppercase", fontWeight:700,
              display:"inline-flex", alignItems:"center", gap:5, minHeight:28,
            }}>★<span className="btn-for-me-text">For Me</span></button>
            <button onClick={() => setViewMode(v => v === "guided" ? "grid" : "guided")} title="Guided plan: umbrella-first application order (T0 → T3)" style={{
              background: viewMode === "guided" ? "color-mix(in oklch, var(--ok) 14%, transparent)" : "transparent",
              border:"1px solid " + (viewMode === "guided" ? "color-mix(in oklch, var(--ok) 40%, transparent)" : "var(--line)"),
              color: viewMode === "guided" ? "var(--ok)" : "var(--text-dim)",
              borderRadius:3, padding:"5px 10px", cursor:"pointer", fontSize:10,
              fontFamily:"monospace", letterSpacing:"0.06em", textTransform:"uppercase", fontWeight:700,
              display:"inline-flex", alignItems:"center", gap:5, minHeight:28,
            }}>▸<span className="btn-for-me-text">Plan</span></button>
            <button onClick={() => setViewMode(v => v === "proof" ? "grid" : "proof")} title="Real dollars secured, by stack lane" style={{
              background: viewMode === "proof" ? "color-mix(in oklch, var(--gold) 14%, transparent)" : "transparent",
              border:"1px solid " + (viewMode === "proof" ? "color-mix(in oklch, var(--gold) 40%, transparent)" : "var(--line)"),
              color: viewMode === "proof" ? "var(--gold)" : "var(--text-dim)",
              borderRadius:3, padding:"5px 10px", cursor:"pointer", fontSize:10,
              fontFamily:"monospace", letterSpacing:"0.06em", textTransform:"uppercase", fontWeight:700,
              display:"inline-flex", alignItems:"center", gap:5, minHeight:28,
            }}>$<span className="btn-for-me-text">Proof</span></button>
            <button onClick={() => setViewMode(v => v === "by_vendor" ? "grid" : "by_vendor")}
              title={"View: " + (viewMode === "by_vendor" ? "By Vendor" : "Flat Grid") + " (click to toggle)"} style={{
              background: viewMode === "by_vendor" ? "color-mix(in oklch, var(--info) 14%, transparent)" : "transparent",
              border:"1px solid " + (viewMode === "by_vendor" ? "color-mix(in oklch, var(--info) 40%, transparent)" : "var(--line)"),
              color: viewMode === "by_vendor" ? "var(--info)" : "var(--text-dim)",
              borderRadius:3, padding:"5px 10px", cursor:"pointer", fontSize:12,
              fontFamily:"monospace", letterSpacing:"0.06em", textTransform:"uppercase", lineHeight:1,
              display:"inline-flex", alignItems:"center", justifyContent:"center", minHeight:28, minWidth:28,
            }}>{viewMode === "by_vendor" ? "▦" : "▤"}</button>
            <div style={{ position:"relative" }}>
              <button onClick={() => setProfileMenuOpen(o => !o)} title={signedInUser ? "Account" : "Profile"} style={{
                background: profileMenuOpen ? "var(--line-soft)" : "transparent",
                border:"1px solid " + (profileMenuOpen ? "var(--line)" : "var(--line)"),
                color:"var(--text)",
                borderRadius:3, padding:"5px 9px", cursor:"pointer",
                fontFamily:"monospace", minHeight:28, minWidth:28,
                display:"flex", alignItems:"center", justifyContent:"center", gap:4,
              }}>
                <span style={{ fontSize:13, color: signedInUser ? "var(--match)" : "var(--text-dim)", lineHeight:1 }}>◉</span>
                <span style={{ fontSize:7, color:"var(--text-dim2)" }}>{profileMenuOpen ? "▲" : "▼"}</span>
              </button>
              {profileMenuOpen && (
                <>
                  <div onClick={() => setProfileMenuOpen(false)} style={{
                    position:"fixed", inset:0, zIndex:40,
                  }} />
                  <div style={{
                    position:"absolute", top:"calc(100% + 4px)", right:0, zIndex:50,
                    background:"var(--surface-2)", border:"1px solid var(--line)", borderRadius:4,
                    minWidth:160, padding:4,
                    boxShadow:"0 8px 24px rgba(0,0,0,0.6)",
                  }}>
                    <button onClick={() => { setProfileMenuOpen(false); setProfileOpen(true); }} style={{
                      display:"block", width:"100%", textAlign:"left",
                      background:"transparent", border:"none", color:"var(--text)",
                      padding:"7px 10px", cursor:"pointer", fontSize:10,
                      fontFamily:"monospace", letterSpacing:"0.05em", borderRadius:3,
                    }} onMouseEnter={e => e.currentTarget.style.background = "var(--line-soft)"}
                       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      ⚙  Profile
                    </button>
                    <button onClick={() => { setProfileMenuOpen(false); setAccentsOpen(true); }} style={{
                      display:"block", width:"100%", textAlign:"left",
                      background:"transparent", border:"none", color:"var(--text)",
                      padding:"7px 10px", cursor:"pointer", fontSize:10,
                      fontFamily:"monospace", letterSpacing:"0.05em", borderRadius:3,
                    }} onMouseEnter={e => e.currentTarget.style.background = "var(--line-soft)"}
                       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      ◐  Colors
                    </button>
                    <div style={{
                      padding:"6px 10px", borderTop:"1px solid var(--line-soft)", marginTop:4,
                      fontSize:9, color:"var(--text-dim2)", lineHeight:1.5,
                    }}>
                      {signedInUser ? (
                        <>
                          <div style={{ display:"flex", alignItems:"center", marginBottom:2 }}>
                            <span style={{ color:"var(--match)" }}>Signed in</span>
                            <span
                              title={syncLabel + (syncError ? " · " + syncError : "")}
                              style={{
                                marginLeft:"auto",
                                width:6, height:6, borderRadius:"50%",
                                background:
                                  syncStatus === "error"   ? "var(--stop)" :
                                  syncStatus === "saving"  ? "var(--wait)" :
                                  syncStatus === "loading" ? "var(--wait)" :
                                  syncStatus === "synced"  ? "var(--match)" : "var(--text-dim3)",
                                flexShrink:0,
                              }}
                            />
                          </div>
                          <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:220 }}>
                            {signedInUser.email || signedInUser.user_metadata?.user_name || signedInUser.id}
                          </div>
                          {syncStatus === "error" && (
                            <div style={{ color:"var(--stop)", marginTop:4 }}>{syncError || "Sync error"}</div>
                          )}
                        </>
                      ) : (
                        <div>{isSupabaseConfigured ? "Optional cloud sync" : "Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable sign in."}</div>
                      )}
                    </div>
                    {signedInUser ? (
                      <button onClick={() => { setProfileMenuOpen(false); signOut(); }} style={{
                        display:"block", width:"100%", textAlign:"left",
                        background:"transparent", border:"none", color:"var(--stop)",
                        padding:"7px 10px", cursor:"pointer", fontSize:10,
                        fontFamily:"monospace", letterSpacing:"0.05em", borderRadius:3,
                      }} onMouseEnter={e => e.currentTarget.style.background = "var(--line-soft)"}
                         onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        ←  Sign out
                      </button>
                    ) : (
                      <>
                        <button disabled={!isSupabaseConfigured} onClick={() => signInWithProvider("github")} style={{
                          display:"block", width:"100%", textAlign:"left",
                          background:"transparent", border:"none", color:isSupabaseConfigured ? "var(--text)" : "var(--text-dim3)",
                          padding:"7px 10px", cursor:isSupabaseConfigured ? "pointer" : "not-allowed", fontSize:10,
                          fontFamily:"monospace", letterSpacing:"0.05em", borderRadius:3,
                        }} onMouseEnter={e => { if (isSupabaseConfigured) e.currentTarget.style.background = "var(--line-soft)"; }}
                           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          →  Sign in with GitHub
                        </button>
                        <button disabled={!isSupabaseConfigured} onClick={() => signInWithProvider("google")} style={{
                          display:"block", width:"100%", textAlign:"left",
                          background:"transparent", border:"none", color:isSupabaseConfigured ? "var(--text)" : "var(--text-dim3)",
                          padding:"7px 10px", cursor:isSupabaseConfigured ? "pointer" : "not-allowed", fontSize:10,
                          fontFamily:"monospace", letterSpacing:"0.05em", borderRadius:3,
                        }} onMouseEnter={e => { if (isSupabaseConfigured) e.currentTarget.style.background = "var(--line-soft)"; }}
                           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          →  Sign in with Google
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="header-subtext">
          <span className="header-subtext-line">Community licenses · Free credits</span>
          <span className="header-subtext-sep"> · </span>
          <span className="header-subtext-line">Startup programs · Worthy discounts</span>
        </div>

        {/* STATS */}
        <div className={"stats-strip" + (statsExpanded ? " expanded" : "")}>
          <Stat label="Total Value"   value={"$" + (Math.round(totalCountedT1/100000)/10).toFixed(1) + "m"} tone="gold"  />
          <Stat label="Quick Apply"   value={stats.submit}   tone="ok"    />
          <Stat label="Vendors"       value={VENDOR_COUNT}   tone="neutral" />
          <Stat label="For You"       value={stats.forMe}    tone="match" />
          <div className="stats-divider" />
          <button
            className="stats-toggle"
            onClick={() => setStatsExpanded(e => !e)}
            title={statsExpanded ? "Hide details" : "Show details"}
            style={{
              background:"transparent", border:"1px solid var(--line)", color:"var(--text-dim)",
              borderRadius:3, padding:"3px 8px", cursor:"pointer",
              fontFamily:"monospace", fontSize:14, lineHeight:1,
              alignItems:"center", justifyContent:"center",
              minWidth:28, minHeight:28,
              marginLeft:"auto",
            }}
          >{statsExpanded ? "−" : "+"}</button>
          <span className="stats-secondary-group">
            <Stat label="Cash Value"      value={"$" + (Math.round(totalCashLikeT1/100000)/10).toFixed(1) + "m"} tone="gold" />
            <Stat label="Quick Draft"     value={stats.draft}      tone="wait"  />
            <Stat label="Research"        value={stats.research}   tone="info"  />
            <Stat label="Interested"      value={stats.interested} tone="ok"    />
            <Stat label="Applied"         value={stats.applied}    tone="info"  />
            <Stat label="Approved"        value={stats.approved}   tone="match" />
          </span>
        </div>

      </div>

      {/* CONSOLIDATED STICKY FILTER ROW */}
      <div className="filter-row" style={{
        padding:"9px 22px", borderBottom:"1px solid var(--line-soft)",
        position:"sticky", top:0, background:"rgba(7,7,10,0.97)", zIndex:10,
        backdropFilter:"blur(8px)",
      }}>
        <MultiSelectDropdown
          label="Category"
          total={PROGRAMS.length}
          items={Object.keys(LANE_COLORS)}
          activeSet={laneFilters}
          onToggle={toggleInSet(setLaneFilters)}
          onClear={clearSet(setLaneFilters)}
          getLabel={k => k}
          getCount={k => PROGRAMS.filter(p => p.lane === k).length}
          getTone={k => LANE_COLORS[k].tone}
        />
        <MultiSelectDropdown
          label="Access"
          total={PROGRAMS.length}
          items={ACCESS_ORDER}
          activeSet={accessFilters}
          onToggle={toggleInSet(setAccessFilters)}
          onClear={clearSet(setAccessFilters)}
          getLabel={k => ACCESS_CONFIG[k].short}
          getCount={k => accessCounts[k]}
          getTone={() => null}
        />
        <MultiSelectDropdown
          label="Criteria"
          total={PROGRAMS.length}
          items={TAG_ORDER}
          activeSet={tagFilters}
          onToggle={toggleInSet(setTagFilters)}
          onClear={clearSet(setTagFilters)}
          getLabel={k => TAG_CONFIG[k].label}
          getCount={k => tagCounts[k]}
          getTone={k => TAG_CONFIG[k].tone}
        />
        <MultiSelectDropdown
          label="Tiers"
          total={PROGRAMS.length}
          items={["1","2"]}
          activeSet={tierFilters}
          onToggle={toggleInSet(setTierFilters)}
          onClear={clearSet(setTierFilters)}
          getLabel={k => k === "1" ? "T1 — Free" : "T2 — Discount"}
          getCount={k => PROGRAMS.filter(p => String(p.tier) === k).length}
          getTone={k => k === "1" ? "accent" : null}
        />
        <MultiSelectDropdown
          label="States"
          total={PROGRAMS.length}
          items={["submit","draft","research","stale"]}
          activeSet={stateFilters}
          onToggle={toggleInSet(setStateFilters)}
          onClear={clearSet(setStateFilters)}
          getLabel={k => ({ submit:"Quick Apply", draft:"Quick Draft", research:"Research Only", stale:"Verify First" }[k])}
          getCount={k => PROGRAMS.filter(p => agentState(p).key === k).length}
          getTone={k => ({ submit:"ok", draft:"wait", research:"info", stale:"wait" }[k])}
        />
        <MultiSelectDropdown
          label="Statuses"
          total={PROGRAMS.length}
          items={Object.keys(STATUS_CONFIG)}
          activeSet={statusFilters}
          onToggle={toggleInSet(setStatusFilters)}
          onClear={clearSet(setStatusFilters)}
          getLabel={k => STATUS_CONFIG[k].label}
          getCount={k => PROGRAMS.filter(p => (statuses[p.id] || "not_applied") === k).length}
          getTone={k => STATUS_CONFIG[k].tone === "neutral" ? null : STATUS_CONFIG[k].tone}
        />
        <input type="text" placeholder="Search benefits..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inp, cursor:"text", minHeight:28 }} />
        <SingleSelectDropdown
          label={({ valueNum:"Value", match:"For Me First", agent:"Fill-Ready First", lane:"Lane", tier:"Tier", name:"A–Z" }[sortBy])}
          value={sortBy}
          items={["valueNum","match","agent","lane","tier","name"]}
          onChange={setSortBy}
          getLabel={k => ({ valueNum:"Value", match:"For Me First", agent:"Fill-Ready First", lane:"Lane", tier:"Tier", name:"A–Z" }[k])}
        />
      </div>

      {/* GRID / VENDOR VIEW */}
      <div style={{ padding:"14px 22px 48px" }}>
        {!loaded ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--line)", fontSize:10 }}>Loading...</div>
        ) : viewMode === "proof" ? (
          <ProofView />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ color:"var(--text-dim2)", fontSize:11, marginBottom:14, fontFamily:"monospace", letterSpacing:"0.05em" }}>
              No benefits match the current filters.
            </div>
            <button onClick={() => {
              setTagFilters(new Set()); setAccessFilters(new Set()); setLaneFilters(new Set());
              setTierFilters(new Set()); setStatusFilters(new Set()); setStateFilters(new Set());
              setOnlyForMe(false); setSearch("");
            }} style={{
              background:"transparent", border:"1px solid var(--line)", color:"var(--text-dim)",
              padding:"6px 16px", borderRadius:3, cursor:"pointer", fontSize:10,
              fontFamily:"monospace", letterSpacing:"0.08em", textTransform:"uppercase",
            }}>× Clear All Filters</button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="card-grid">
            {filtered.map(p => (
              <ProgramCard
                key={p.id} program={p}
                status={statuses[p.id] || "not_applied"}
                onStatusChange={updateStatus}
                profileMatch={profileMatchSet.has(p.id)}
                onVendorClick={(v) => setSearch(v)}
                profileDoc={profileDoc}
              />
            ))}
          </div>
        ) : viewMode === "guided" ? (
          <GuidedView
            programs={filtered}
            statuses={statuses}
            onStatusChange={updateStatus}
            profileMatchSet={profileMatchSet}
            profileDoc={profileDoc}
            onVendorClick={(v) => setSearch(v)}
          />
        ) : (
          (() => {
            // Group filtered programs by vendor
            const groups = {};
            for (const p of filtered) {
              if (!groups[p.vendor]) groups[p.vendor] = { name: p.vendor, programs: [], cashLike: 0, counted: 0 };
              groups[p.vendor].programs.push(p);
              if (p.value.counted) groups[p.vendor].counted += p.value.estimate;
              if (p.value.counted && p.value.cashLike) groups[p.vendor].cashLike += p.value.estimate;
            }
            // Sort: multi-offer vendors first (by cashLike desc), then singles alphabetical
            const sortedVendors = Object.values(groups).sort((a, b) => {
              if (a.programs.length !== b.programs.length) {
                if (a.programs.length > 1 && b.programs.length === 1) return -1;
                if (b.programs.length > 1 && a.programs.length === 1) return 1;
              }
              if (a.programs.length > 1 && b.programs.length > 1) return b.cashLike - a.cashLike;
              return a.name.localeCompare(b.name);
            });

            const toggleVendor = (name) => {
              setCollapsedVendors(prev => {
                const next = new Set(prev);
                if (next.has(name)) next.delete(name); else next.add(name);
                return next;
              });
            };

            return (
              <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                {sortedVendors.map(v => {
                  const collapsed = collapsedVendors.has(v.name);
                  const isMulti = v.programs.length > 1;
                  return (
                    <div key={v.name}>
                      {/* Vendor header */}
                      <div
                        onClick={() => toggleVendor(v.name)}
                        style={{
                          display:"flex", alignItems:"center", gap:10,
                          padding:"8px 12px", marginBottom:8,
                          background: isMulti ? "rgba(79,163,232,0.06)" : "transparent",
                          border:"1px solid " + (isMulti ? "rgba(79,163,232,0.25)" : "var(--line-soft)"),
                          borderRadius:4, cursor:"pointer",
                          transition:"background 0.15s",
                        }}
                      >
                        <span style={{ fontSize:9, color:"var(--text-dim3)" }}>{collapsed ? "▶" : "▼"}</span>
                        <span style={{ fontSize:13, fontWeight:700, color: isMulti ? "var(--text)" : "var(--text)", letterSpacing:"-0.01em" }}>
                          {v.name}
                        </span>
                        <span style={{
                          fontSize:9, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
                          color: isMulti ? "var(--info)" : "var(--text-dim2)",
                          background: isMulti ? "rgba(79,163,232,0.1)" : "var(--line-soft)",
                          padding:"2px 6px", borderRadius:2,
                        }}>
                          {v.programs.length} {v.programs.length === 1 ? "offer" : "offers"}
                        </span>
                        <span style={{ marginLeft:"auto", display:"flex", gap:14, fontSize:10, fontFamily:"monospace" }}>
                          {v.cashLike > 0 && (
                            <span style={{ color:"var(--gold)" }}>
                              cash ${(v.cashLike/1000).toFixed(v.cashLike >= 10000 ? 0 : 1)}k
                            </span>
                          )}
                          <span style={{ color:"var(--text-dim2)" }}>
                            total ${(v.counted/1000).toFixed(v.counted >= 10000 ? 0 : 1)}k
                          </span>
                        </span>
                      </div>

                      {/* Vendor programs */}
                      {!collapsed && (
                        <div className="card-grid" style={{ paddingLeft: isMulti ? 12 : 0 }}>
                          {v.programs.map(p => (
                            <ProgramCard
                              key={p.id} program={p}
                              status={statuses[p.id] || "not_applied"}
                              onStatusChange={updateStatus}
                              profileMatch={profileMatchSet.has(p.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop:"1px solid var(--line-soft)", padding:"11px 22px",
        display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8,
        fontSize:8, color:"var(--line)", letterSpacing:"0.08em",
      }}>
        <span>BENEFIT HUNTER v5 // {PROGRAMS.length} BENEFITS // {VENDOR_COUNT} VENDORS</span>
        <span>cash-like ${(totalCashLikeT1/1000).toFixed(0)}k · counted ${(totalCountedT1/1000).toFixed(0)}k</span>
      </div>

     </div>{/* /.shell */}

      {/* SETTINGS MODAL */}
      {profileOpen && (
        <div onClick={() => setProfileOpen(false)} style={{
          position:"fixed", inset:0, zIndex:100,
          background:"rgba(0,0,0,0.65)", backdropFilter:"blur(3px)",
          display:"flex", alignItems:"flex-start", justifyContent:"center",
          padding:"40px 20px", overflowY:"auto",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"var(--surface-2)", border:"1px solid var(--line)", borderRadius:6,
            width:"100%", maxWidth:880, padding:"20px 22px",
            boxShadow:"0 16px 48px rgba(0,0,0,0.7)",
          }}>
            {/* Modal header */}
            <div style={{ display:"flex", alignItems:"center", marginBottom:14, paddingBottom:10, borderBottom:"1px solid var(--line-soft)" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", letterSpacing:"0.04em" }}>Profile</div>
                <div style={{ fontSize:9, color:"var(--text-dim2)", marginTop:2, letterSpacing:"0.04em" }}>
                  Profile match rules + canonical application data
                </div>
              </div>
              <button onClick={() => setProfileOpen(false)} style={{
                marginLeft:"auto", background:"transparent", border:"1px solid var(--line)",
                color:"var(--text-dim)", borderRadius:3, padding:"4px 10px", cursor:"pointer",
                fontSize:11, fontFamily:"monospace", lineHeight:1,
              }}>✕</button>
            </div>

            {/* Profile match checkboxes */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:9, color:"var(--text-dim2)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>
                Match Benefits To Me
              </div>
              <div style={{
                padding:"12px 14px",
                background:"var(--surface-2)", border:"1px solid var(--line-soft)", borderRadius:4,
                display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:8,
              }}>
                {PROFILE_FIELDS.map(f => (
                  <label key={f.key} style={{
                    display:"flex", alignItems:"center", gap:6, cursor:"pointer",
                    fontSize:10, color: profile[f.key] ? "var(--text)" : "var(--text-dim2)",
                  }}>
                    <input
                      type="checkbox"
                      checked={profile[f.key]}
                      onChange={e => updateProfile(f.key, e.target.checked)}
                      style={{ accentColor:"var(--ok)" }}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Application data sections */}
            <div>
              <div style={{
                fontSize:9, color:"var(--text-dim2)", letterSpacing:"0.1em", textTransform:"uppercase",
                marginBottom:8, display:"flex", alignItems:"baseline", gap:8,
              }}>
                Application Data
                <span style={{ color:"var(--text-dim3)", textTransform:"none", letterSpacing:0, fontSize:9 }}>
                  — canonical answer set agents pull from when drafting applications
                </span>
                <span style={{
                  marginLeft:"auto", color:"var(--text-dim2)", fontFamily:"monospace", letterSpacing:0, textTransform:"none",
                }}>
                  {PROFILE_DOC_KEYS.filter(k => profileDoc[k] && String(profileDoc[k]).trim()).length} / {PROFILE_DOC_KEYS.length} filled
                </span>
              </div>
              {Object.entries(PROFILE_SCHEMA).map(([sectionKey, section]) => {
                const sectionOpen = openProfileSections.has(sectionKey);
                const sectionFilled = section.fields.filter(f => profileDoc[f.key] && String(profileDoc[f.key]).trim()).length;
                const sectionTotal = section.fields.length;
                const ratioColor = sectionFilled === sectionTotal ? "var(--match)" : sectionFilled > 0 ? "var(--wait)" : "var(--text-dim2)";
                return (
                  <div key={sectionKey} style={{ marginBottom:6, border:"1px solid var(--line-soft)", borderRadius:3 }}>
                    <div onClick={() => toggleProfileSection(sectionKey)} style={{
                      padding:"7px 12px", cursor:"pointer",
                      display:"flex", alignItems:"center", gap:8,
                      background: sectionOpen ? "var(--surface-2)" : "transparent",
                      borderBottom: sectionOpen ? "1px solid var(--line-soft)" : "none",
                      borderRadius:"3px 3px 0 0",
                    }}>
                      <span style={{ fontSize:9, color:"var(--text-dim3)" }}>{sectionOpen ? "▼" : "▶"}</span>
                      <span style={{ fontSize:10, color: section.color, fontWeight:600, letterSpacing:"0.05em" }}>{section.title}</span>
                      <span style={{ fontSize:9, color: ratioColor, marginLeft:"auto", fontFamily:"monospace" }}>
                        {sectionFilled} / {sectionTotal}
                      </span>
                    </div>
                    {sectionOpen && (
                      <div style={{
                        padding:"10px 12px",
                        display:"grid",
                        gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",
                        gap:10,
                      }}>
                        {section.fields.map(field => {
                          const val = profileDoc[field.key] || "";
                          const sty = {
                            background:"var(--surface-2)", border:"1px solid var(--line)", color:"var(--text)",
                            padding:"5px 8px", borderRadius:2, fontSize:10,
                            fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box",
                          };
                          return (
                            <label key={field.key} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                              <span style={{ fontSize:9, color: val ? "var(--text-dim)" : "var(--text-dim2)", letterSpacing:"0.04em" }}>
                                {field.label}
                              </span>
                              {field.type === "textarea" ? (
                                <textarea
                                  value={val}
                                  onChange={e => updateProfileDoc(field.key, e.target.value)}
                                  placeholder={field.placeholder || ""}
                                  rows={3}
                                  style={{ ...sty, resize:"vertical", minHeight:50, fontFamily:"inherit" }}
                                />
                              ) : field.type === "select" ? (
                                <select
                                  value={val}
                                  onChange={e => updateProfileDoc(field.key, e.target.value)}
                                  style={sty}
                                >
                                  {field.options.map(o => <option key={o} value={o}>{o || "—"}</option>)}
                                </select>
                              ) : (
                                <input
                                  type={field.type}
                                  value={val}
                                  onChange={e => updateProfileDoc(field.key, e.target.value)}
                                  placeholder={field.placeholder || ""}
                                  style={sty}
                                />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal footer — manual save */}
            <div style={{
              marginTop:18, paddingTop:14, borderTop:"1px solid var(--line-soft)",
              display:"flex", alignItems:"center", gap:10, flexWrap:"wrap",
            }}>
              <button onClick={handleManualSave} style={{
                background:"var(--ok)", color:"#080807", border:"none",
                borderRadius:3, padding:"7px 18px", cursor:"pointer",
                fontSize:11, fontWeight:700, fontFamily:"monospace",
                letterSpacing:"0.1em", textTransform:"uppercase",
              }}>Save</button>
              {savedFlash && (
                <span style={{
                  fontSize:10, color:"var(--ok)", fontFamily:"monospace",
                  letterSpacing:"0.08em", textTransform:"uppercase",
                }}>✓ Saved</span>
              )}
              <span style={{
                marginLeft:"auto", fontSize:9, color:"var(--text-dim3)", fontFamily:"monospace",
                letterSpacing:"0.05em",
              }}>
                {signedInUser ? "Changes also save automatically" : "Saved locally on this device"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* COLORS MODAL */}
      <AccentsModal
        open={accentsOpen}
        accents={accents}
        onChange={setAccents}
        onClose={() => setAccentsOpen(false)}
        onSave={handleAccentsSave}
        onResetAll={handleAccentsResetAll}
        savedFlash={accentsSavedFlash}
      />
    </div>
  );
}
