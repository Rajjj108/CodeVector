import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const loadScript = (src) => new Promise((resolve, reject) => {
  if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
  const s = document.createElement('script');
  s.src = src; s.onload = resolve; s.onerror = reject;
  document.head.appendChild(s);
});

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/CustomEase.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js");
      setTimeout(initAll, 80);
    };
    init();
    return cleanup;
  }, []);

  const dots = Array.from({ length: 28 }).map((_, i) => ({
    left: `${(i * 37 + 11) % 100}%`,
    top:  `${(i * 53 + 7)  % 100}%`,
    animationDelay:    `${(i * 0.4) % 6}s`,
    animationDuration: `${6 + (i % 4) * 2}s`,
  }));

  return (
    <div className="cvl">
      <style>{CSS}</style>

      {/* ── LOGO INTRO OVERLAY ── */}
      <div id="cv-intro" className="cv-intro">
        <div className="cv-intro-bg" />
        <div id="cv-intro-logo" className="cv-intro-logo-wrap">
          <img src="/codevektor-logo.png" alt="CodeVektor" className="cv-intro-img" />
          <span className="cv-intro-text">CodeVektor</span>
        </div>
        <div className="cv-intro-hint" id="cv-intro-hint">
          <div className="cv-scroll-mouse"><div className="cv-scroll-wheel" /></div>
          <span>Scroll to enter</span>
        </div>
      </div>

      {/* Cursor */}
      <div id="cv-dot"  className="cv-dot"  />
      <div id="cv-ring" className="cv-ring" />

      {/* Background layers */}
      <div className="cv-bg-dots" aria-hidden="true">
        {dots.map((s, i) => <div key={i} className="cv-bg-dot" style={s} />)}
      </div>
      <div className="cv-grid-bg"  aria-hidden="true" />
      <div className="cv-noise"    aria-hidden="true" />
      <div className="cv-scanline" aria-hidden="true" />

      {/* NAV */}
      <nav className="cv-nav" id="cv-nav">
        <a href="/" className="cv-logo" id="cv-nav-logo">
          <img src="/codevektor-logo.png" alt="CodeVektor" className="cv-logo-img" />
          <span className="cv-logo-text">CodeVektor</span>
        </a>
        <div className="cv-nav-links" id="cv-nav-links">
          {['Features','Problems','Editor'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="cv-nl">{l}</a>
          ))}
        </div>
        <div id="cv-nav-actions" style={{display:'flex',gap:'10px',alignItems:'center'}}>
          <a href="/login"  className="cv-btn cv-btn-ghost" data-mag>Sign In</a>
          <a href="/signup" className="cv-btn cv-btn-primary" data-mag>
            Start Free <span className="cv-arrow">→</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="cv-hero" id="hero">
        <div className="cv-hero-glow" />
        <div className="cv-hero-inner">
          <div className="cv-eyebrow" id="cv-eyebrow">
            <span className="cv-eyebrow-dot" />
            DSA Interview Platform
            <span className="cv-eyebrow-line" />
          </div>
          <h1 className="cv-title" id="cv-title">
            <span className="cv-tline"><span className="cv-glitch">MASTER</span></span>
            <span className="cv-tline"><span className="cv-gr">DSA.</span></span>
            <span className="cv-tline"><span className="cv-sk">GET HIRED.</span></span>
          </h1>
          <p className="cv-hero-sub" id="cv-hero-sub">
            2913 handpicked problems. Real-time code execution.<br/>
            Smart analytics. The complete system to crack your next tech interview.
          </p>
          <div className="cv-hero-cta" id="cv-hero-cta">
            <a href="/signup" className="cv-btn cv-btn-primary cv-btn-lg" data-mag>
              Start Solving Free <span className="cv-arrow">→</span>
            </a>
            <a href="/login" className="cv-btn cv-btn-ghost cv-btn-lg" data-mag>
              Login
            </a>
            <a href="#features" className="cv-btn cv-btn-ghost cv-btn-lg" data-mag>
              Explore Platform
            </a>
          </div>
          <div className="cv-pills" id="cv-pills">
            <span className="cv-pill cv-pill-g">● 2913 PROBLEMS</span>
            <span className="cv-pill cv-pill-p">● JS · PY · JAVA · C++</span>
            <span className="cv-pill cv-pill-r">● 00K+ DEVELOPERS</span>
          </div>
        </div>

        {/* Floating code card */}
        <div className="cv-float-card" id="cv-float-card">
          <div className="cv-fc-head">
            <span className="cv-badge easy">EASY</span>
            <span className="cv-fc-title">Two Sum</span>
          </div>
          <pre className="cv-fc-code"><span className="kw">const</span> map = <span className="kw">new</span> <span className="fn">Map</span>();
<span className="kw">for</span> (<span className="kw">let</span> i=<span className="num">0</span>; i&lt;nums.length; i++) {"{"}
  <span className="kw">if</span>(map.<span className="fn">has</span>(target-nums[i]))
    <span className="kw">return</span> [map.<span className="fn">get</span>(target-nums[i]),i];
{"}"}</pre>
          <div className="cv-fc-ok"><span className="cv-gdot"/>✓ Accepted · 72ms</div>
        </div>

        <div className="cv-scroll-hint" id="cv-scroll-hint">
          <div className="cv-scroll-mouse"><div className="cv-scroll-wheel"/></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="cv-mq-wrap" aria-hidden="true">
        <div className="cv-mq-track">
          {['Two Sum','Longest Substring','Binary Search','Merge Sort','Dynamic Programming',
            'Graph BFS/DFS','Sliding Window','Two Pointers','Trie','Segment Tree','Backtracking','Heap',
            'Two Sum','Longest Substring','Binary Search','Merge Sort','Dynamic Programming',
            'Graph BFS/DFS','Sliding Window','Two Pointers','Trie','Segment Tree','Backtracking','Heap']
            .map((t,i) => <span key={i} className="cv-mq-item"><span className="cv-mq-dot"/>{t}</span>)}
        </div>
      </div>

      {/* STATS */}
      <section className="cv-sec" id="stats">
        <div className="cv-con">
          <div className="cv-stats-grid">
            {[[2913,'Total Problems',''],[869,'Easy Problems',''],[1829,'Medium Problems',''],[0,'Active Users','K']].map(([n,l,s],i) => (
              <div key={i} className="cv-stat cv-rev" data-delay={i*0.09}>
                <div className="cv-stat-num-row">
                  <span className="cv-stat-num" data-count={n}>0</span>
                  <span className="cv-stat-suf">{s}</span>
                </div>
                <span className="cv-stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="cv-sec" id="features">
        <div className="cv-con">
          <div className="cv-sl cv-revl">Platform Features</div>
          <h2 className="cv-sh cv-revl">Everything you need<br/><span className="cv-gr">to crack interviews.</span></h2>
          <p className="cv-sd cv-revl">From beginner arrays to hard-level DP — a complete ecosystem for serious developers.</p>
          <div className="cv-feat-grid">
            {[
              ['01','⚡','green','Live Code Execution','Write and run JS, Python, Java, C++ in the browser with instant output and test case validation.'],
              ['02','📊','purple','Smart Dashboard','Visual progress tracking with daily goals, streaks, accuracy, and a 90-day activity heatmap.'],
              ['03','🎯','yellow','DSA Tracker','Browse 2913 problems by topic, difficulty, and status. Never lose your progress again.'],
              ['04','📓','green','Smart Notebooks','Attach notes to any submission. Review solutions with code snapshots and runtime data.'],
              ['05','🗂️','red','Topic Focus Mode','Daily missions by topic. The system finds your weakest spots and targets them precisely.'],
              ['06','✎','purple','Whiteboard Mode','Sketch algorithms visually before coding. Think first, build second — side by side.'],
            ].map(([n,icon,c,title,desc],i) => (
              <div key={i} className={`cv-fc fc-${c} cv-rev`} data-delay={(i%3)*0.1}>
                <span className="cv-fc-n">{n}</span>
                <div className={`cv-fc-icon ic-${c}`}>{icon}</div>
                <h3 className="cv-fc-t">{title}</h3>
                <p className="cv-fc-d">{desc}</p>
                <span className="cv-fc-ar">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFICULTY */}
      <section className="cv-sec" id="problems">
        <div className="cv-con">
          <div className="cv-sl cv-revl">Problem Library</div>
          <h2 className="cv-sh cv-revl">Built for every<br/><span className="cv-gr">skill level.</span></h2>
          <p className="cv-sd cv-revl">Easy foundations → medium interview staples → hard elite challenges.</p>
          <div className="cv-diff-row">
            {[
              ['easy','EASY',869,30,'Arrays, strings, hash maps — build your intuition with foundational problems.'],
              ['medium','MEDIUM',1829,63,'The interview sweet spot. Sliding window, binary search, graphs, DP.'],
              ['hard','HARD',815,28,'Elite challenges — segment trees, advanced DP, complex graph traversals.'],
            ].map(([cls,label,n,pct,desc],i) => (
              <div key={i} className={`cv-dc dc-${cls} cv-rev`} data-delay={i*0.1}>
                <div className="cv-dc-glow"/>
                <div className="cv-dc-top">
                  <span className={`cv-badge ${cls}`}>{label}</span>
                  <span className="cv-dc-of">{n} / 2913</span>
                </div>
                <div className={`cv-dc-num cv-dc-${cls}`} data-count={n}>0</div>
                <div className="cv-dc-bar">
                  <div className="cv-dc-fill" style={{'--pct':`${pct}%`}}/>
                </div>
                <p className="cv-dc-desc">{desc}</p>
                <a href="/signup" className={`cv-dc-cta cta-${cls}`}>Start solving →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDITOR */}
      <section className="cv-sec" id="editor">
        <div className="cv-con">
          <div className="cv-editor-layout">
            <div>
              <div className="cv-sl cv-revl">Code Editor</div>
              <h2 className="cv-sh cv-revl">Write. Run.<br/><span className="cv-gr">Submit.</span></h2>
              <p className="cv-sd cv-revl">Professional-grade editor, multi-language support. No setup required — just open and code.</p>
              <ul className="cv-editor-list cv-revl">
                {['JavaScript, Python, Java, C++','Instant test case validation','Whiteboard + code side by side','Auto-save submissions to Notes'].map(f => (
                  <li key={f}><span className="cv-ck">✓</span>{f}</li>
                ))}
              </ul>
              <div className="cv-langs cv-revl">
                {['JS','PY','JAVA','C++'].map(l => <span key={l} className="cv-lc">{l}</span>)}
              </div>
            </div>
            <div className="cv-editor-right cv-revr" style={{position:'relative'}}>
              <div className="cv-code-win" data-cursor-text="View">
                <div className="cv-code-bar">
                  <span className="cv-mac" style={{background:'#ff5f57'}}/>
                  <span className="cv-mac" style={{background:'#febc2e'}}/>
                  <span className="cv-mac" style={{background:'#28c840'}}/>
                  <span className="cv-code-fn">two-sum.js</span>
                  <span className="cv-code-lang">JAVASCRIPT</span>
                </div>
                <div className="cv-code-body">
                  {[
                    [1,<><span className="cm">{"/** @param {number[]} nums */"}</span></>],
                    [2,<><span className="kw">var</span> <span className="fn">twoSum</span> = <span className="kw">function</span>(nums, target) {"{"}</>],
                    [3,<>  <span className="kw">const</span> map = <span className="kw">new</span> <span className="fn">Map</span>();</>],
                    [4,<>  <span className="kw">for</span> (<span className="kw">let</span> i=<span className="num">0</span>; i&lt;nums.length; i++) {"{"}</>],
                    [5,<>    <span className="kw">const</span> comp = target - nums[i];</>],
                    [6,<>    <span className="kw">if</span> (map.<span className="fn">has</span>(comp)) <span className="kw">return</span> [map.<span className="fn">get</span>(comp), i];</>],
                    [7,<>    map.<span className="fn">set</span>(nums[i], i);</>],
                    [8,<>  {"}"}</>],
                    [9,<>{"};"}  </>],
                  ].map(([ln, code]) => <div key={ln}><span className="ln">{ln}</span>{code}</div>)}
                </div>
                <div className="cv-code-result">
                  <span className="cv-ok">✓ Accepted</span>
                  <span className="cv-rm">Runtime: <b>72ms</b> · Memory: <b>42.3MB</b></span>
                </div>
              </div>
              <div className="cv-out-badge"><span className="cv-gdot"/> All 57 test cases passed</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="cv-sec cv-steps-sec" id="steps">
        <div className="cv-con">
          <div className="cv-sl cv-revl">How It Works</div>
          <h2 className="cv-sh cv-revl">Your path from<br/><span className="cv-gr">zero to offer.</span></h2>
        </div>
        <div id="cv-h-wrap">
          <div className="cv-h-track" id="cv-h-track">
            {[
              ['01','green','STEP ONE','Create Account','Sign up in seconds via Google OAuth or email. Progress syncs instantly across all devices.'],
              ['02','yellow','STEP TWO','Pick Your Topic','Choose from 20+ categories. The daily mission system targets your weakest spots.'],
              ['03','purple','STEP THREE','Code & Submit','In-browser editor with one-click submit. No local environment ever needed.'],
              ['04','green','STEP FOUR','Note & Review','Attach notes to every solution. Your notebook becomes your interview reference.'],
              ['05','red','STEP FIVE','Track & Improve','Monitor streaks, accuracy, and coverage. Build an unstoppable daily habit.'],
            ].map(([n,c,s,t,d],i) => (
              <div key={i} className={`cv-sc sc-${c}`}>
                <span className="cv-sc-bg">{n}</span>
                <span className={`cv-sc-step ss-${c}`}>{s}</span>
                <div className="cv-sc-line"><span className="cv-sc-dot"/></div>
                <h3 className="cv-sc-title">{t}</h3>
                <p className="cv-sc-desc">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cv-sec cv-cta-sec">
        <div className="cv-con">
          <div className="cv-cta-box cv-rev">
            <div className="cv-cta-glow"/>
            <div className="cv-cta-grid"/>
            <div className="cv-cta-inner">
              <div className="cv-sl" style={{justifyContent:'center',marginBottom:'14px'}}>Get Started Today</div>
              <h2 className="cv-cta-title">Your next offer starts <span className="cv-gr">today.</span></h2>
              <p className="cv-cta-desc">Join 100,000+ developers mastering DSA on CodeVektor.<br/>Free forever on the core plan.</p>
              <div className="cv-cta-btns">
                <a href="/signup" className="cv-btn cv-btn-primary cv-btn-lg" data-mag>
                  Create Free Account <span className="cv-arrow">→</span>
                </a>
                <a href="/login" className="cv-btn cv-btn-ghost cv-btn-lg" data-mag>
                  Login
                </a>
                <a href="#problems" className="cv-btn cv-btn-ghost cv-btn-lg" data-mag>Browse Problems</a>
              </div>
              <div className="cv-trust">
                <span>🔒 No credit card</span>
                <span className="cv-tsep">·</span>
                <span>Free forever</span>
                <span className="cv-tsep">·</span>
                <span>Instant access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="cv-footer">
        <div className="cv-con">
          <div className="cv-foot-top">
            <div>
              <a href="/" className="cv-logo" style={{marginBottom:'12px',display:'inline-flex'}}>
                <img src="/codevektor-logo.png" alt="CodeVektor" className="cv-logo-img"/>
                <span className="cv-logo-text">CodeVektor</span>
              </a>
              <p className="cv-foot-tag">Master DSA. Get Hired.</p>
            </div>
            <div className="cv-foot-cols">
              {[['Platform',['Dashboard','DSA Tracker','Code Editor','Notebooks']],
                ['Company',['About','Blog','Careers','Contact']],
                ['Legal',['Privacy','Terms','Cookies']]].map(([h,ls]) => (
                <div key={h} className="cv-foot-col">
                  <h4 className="cv-fch">{h}</h4>
                  {ls.map(l => <a key={l} href="#" className="cv-fl">{l}</a>)}
                </div>
              ))}
            </div>
          </div>
          <div className="cv-foot-bot">
            <span className="cv-fc-copy">© 2025 CodeVektor. All rights reserved.</span>
            <span className="cv-fc-copy">Built for engineers, by engineers.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ANIMATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initAll() {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("expo","0.16,1,0.3,1");

  initLogoIntro(); // runs first, gates everything else
}

/* ── LOGO INTRO ──
   Big centered logo on load → first scroll → flies to nav corner
   → rest of page animates in normally
*/
function initLogoIntro() {
  const intro       = document.getElementById('cv-intro');
  const introLogo   = document.getElementById('cv-intro-logo');
  const introHint   = document.getElementById('cv-intro-hint');
  const navLogo     = document.getElementById('cv-nav-logo');
  const navLinks    = document.getElementById('cv-nav-links');
  const navActions  = document.getElementById('cv-nav-actions');

  if (!intro || !introLogo || !navLogo) {
    // fallback — just init everything normally
    initPage();
    return;
  }

  // Hide nav items until intro finishes
  gsap.set([navLogo, navLinks, navActions], { opacity: 0 });

  // Lock scroll during intro
  document.body.style.overflow = 'hidden';

  // Hint pulse animation
  if (introHint) {
    gsap.fromTo(introHint,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.8 }
    );
    gsap.to(introHint, {
      y: -4, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.2
    });
  }

  // Subtle glow pulse on the big logo
  gsap.fromTo('#cv-intro-logo',
    { opacity: 0, scale: 0.88 },
    { opacity: 1, scale: 1, duration: 1, ease: 'expo', delay: 0.1 }
  );

  let triggered = false;

  function runIntroOut() {
    if (triggered) return;
    triggered = true;

    // Remove listeners
    window.removeEventListener('wheel',    runIntroOut);
    window.removeEventListener('touchstart', runIntroOut);
    window.removeEventListener('keydown',  runIntroOut);

    // Measure positions NOW (after layout is stable)
    const navR   = navLogo.getBoundingClientRect();
    const introR = introLogo.getBoundingClientRect();

    // Target: center of navLogo relative to center of introLogo
    const tx = (navR.left + navR.width  / 2) - (introR.left + introR.width  / 2);
    const ty = (navR.top  + navR.height / 2) - (introR.top  + introR.height / 2);

    // Scale: match the nav logo height
    const targetScale = navR.height / introR.height;

    const tl = gsap.timeline({
      onComplete() {
        document.body.style.overflow = '';
        intro.style.display = 'none';
        // Now run the rest of the page init
        initPage();
      }
    });

    // 1. Fade out hint
    tl.to(introHint, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0);

    // 2. Fly logo to nav corner
    tl.to(introLogo, {
      x: tx,
      y: ty,
      scale: targetScale,
      duration: 1.1,
      ease: 'expo.inOut',
      transformOrigin: 'center center',
    }, 0.1);

    // 3. Fade out the dark overlay (slightly before logo arrives)
    tl.to('.cv-intro-bg', {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.inOut',
    }, 0.55);

    // 4. Snap: hide intro logo, show real nav logo at same moment
    tl.add(() => {
      gsap.set(navLogo, { opacity: 1 });
    }, 1.1);

    // 5. Slide in nav links + actions
    tl.from(navLinks,   { opacity: 0, y: -8, duration: 0.45, ease: 'expo' }, 1.15);
    tl.from(navActions, { opacity: 0, y: -8, duration: 0.45, ease: 'expo' }, 1.22);
  }

  // Trigger on first scroll / touch / keypress
  window.addEventListener('wheel',     runIntroOut, { passive: true, once: true });
  window.addEventListener('touchstart',runIntroOut, { passive: true, once: true });
  window.addEventListener('keydown',   runIntroOut, { once: true });

  // Auto-fire after 5s so impatient users aren't stuck
  setTimeout(runIntroOut, 5000);
}

/* ── REST OF PAGE — called after intro completes ── */
function initPage() {
  initLenis();
  initCursor();
  initNav();
  initHero();
  initReveal();
  initCounters();
  initHorizontalScroll();
  initParallax();
  gsap.to('#cv-float-card',{rotateZ:1.5,duration:3.5,ease:'sine.inOut',yoyo:true,repeat:-1,delay:.5});
}

function initLenis() {
  const lenis = new Lenis({ duration:1.1, easing: t => Math.min(1,1.001-Math.pow(2,-10*t)) });
  window.__cvl = lenis;
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
}

function initCursor() {
  const dot  = document.getElementById('cv-dot');
  const ring = document.getElementById('cv-ring');
  if (!dot || !ring) return;

  let mx=0, my=0, rx=0, ry=0, running=false;

  const onMove = e => { mx=e.clientX; my=e.clientY; if (!running) raf(); };
  document.addEventListener('mousemove', onMove, { passive:true });
  window.__cvCleanCursor = () => document.removeEventListener('mousemove', onMove);

  function raf() {
    running = true;
    dot.style.transform  = `translate(${mx}px,${my}px)`;
    rx += (mx-rx)*0.1; ry += (my-ry)*0.1;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    if (Math.abs(mx-rx)>.2 || Math.abs(my-ry)>.2) requestAnimationFrame(raf);
    else running = false;
  }

  document.querySelectorAll('.cvl [data-mag]').forEach(btn => {
    btn.addEventListener('mouseenter', () => { ring.classList.add('ring-big'); dot.classList.add('dot-hide'); });
    btn.addEventListener('mousemove', e => {
      const r=btn.getBoundingClientRect();
      gsap.to(btn, { x:(e.clientX-r.left-r.width/2)*.38, y:(e.clientY-r.top-r.height/2)*.38, duration:.4, ease:'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      ring.classList.remove('ring-big'); dot.classList.remove('dot-hide');
      gsap.to(btn, { x:0, y:0, duration:.7, ease:'elastic.out(1,0.4)' });
    });
  });

  document.querySelectorAll('.cvl [data-cursor-text]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.dataset.label = el.dataset.cursorText;
      ring.classList.add('ring-label'); dot.classList.add('dot-hide');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('ring-label'); dot.classList.remove('dot-hide');
    });
  });
}

function initNav() {
  const nav = document.getElementById('cv-nav');
  if (!nav) return;
  const h = () => nav.classList.toggle('cv-nav-scrolled', window.scrollY > 50);
  window.addEventListener('scroll', h, { passive:true });
  window.__cvCleanNav = () => window.removeEventListener('scroll', h);
}

function initHero() {
  if (document.querySelector('.cvl .cv-ch')) return;
  document.querySelectorAll('.cvl .cv-tline').forEach((line) => {
    const inner = line.firstElementChild;
    if (!inner) return;
    const txt = inner.textContent;
    const isGlitch = inner.classList.contains('cv-glitch');
    inner.innerHTML = txt.split('').map(c =>
      c===' ' ? '<span style="display:inline-block;width:.25em"> </span>'
              : `<span class="cv-ch">${c}</span>`
    ).join('');
    if (isGlitch) {
      inner.insertAdjacentHTML('beforeend',
        `<span class="cv-ga" aria-hidden="true">${txt}</span><span class="cv-gb" aria-hidden="true">${txt}</span>`
      );
    }
  });

  gsap.timeline({ delay:0.1 })
    .from('.cvl .cv-ch',     { y:80, opacity:0, rotateX:-60, stagger:.02, duration:.85, ease:'expo' })
    .from('#cv-eyebrow',     { opacity:0, y:16, duration:.6, ease:'expo' }, .15)
    .from('#cv-hero-sub',    { opacity:0, y:26, duration:.7, ease:'expo' }, .5)
    .from('#cv-hero-cta',    { opacity:0, y:20, duration:.6, ease:'expo' }, .62)
    .from('#cv-pills > *',   { opacity:0, y:14, stagger:.08, duration:.5, ease:'expo' }, .72)
    .from('#cv-scroll-hint', { opacity:0, duration:.5 }, 1.05)
    .from('#cv-float-card',  { opacity:0, x:50, y:20, duration:1, ease:'expo' }, .35);
}

function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseFloat(e.target.dataset.delay || 0) * 1000;
      setTimeout(() => e.target.classList.add('cv-vis'), delay);
      io.unobserve(e.target);
    });
  }, { threshold:0.12, rootMargin:'0px 0px -50px 0px' });

  document.querySelectorAll('.cvl .cv-rev,.cvl .cv-revl,.cvl .cv-revr').forEach(el => io.observe(el));
  window.__cvIO = io;
}

function initCounters() {
  document.querySelectorAll('.cvl [data-count]').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start:'top 88%', once:true,
      onEnter() {
        const t = +el.dataset.count;
        gsap.to({v:0},{v:t,duration:2,ease:'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].v).toLocaleString(); }
        });
      }
    });
  });
}

function initHorizontalScroll() {
  const track = document.getElementById('cv-h-track');
  if (!track) return;
  gsap.to(track,{
    x: () => -(track.scrollWidth - window.innerWidth + 96),
    ease:'none',
    scrollTrigger:{
      trigger:'#cv-h-wrap', start:'top top',
      end: () => '+=' + (track.scrollWidth - window.innerWidth + 96),
      pin:true, scrub:1, anticipatePin:1,
    }
  });
}

function initParallax() {
  gsap.to('.cvl .cv-hero-glow',{y:60,ease:'none',
    scrollTrigger:{trigger:'.cv-hero',start:'top top',end:'bottom top',scrub:1.5}});
  gsap.to('.cvl .cv-code-win',{y:-20,ease:'none',
    scrollTrigger:{trigger:'#editor',start:'top bottom',end:'bottom top',scrub:2}});
}

function cleanup() {
  if (window.__cvl) { window.__cvl.destroy(); delete window.__cvl; }
  if (window.__cvIO) { window.__cvIO.disconnect(); delete window.__cvIO; }
  if (window.__cvCleanCursor) window.__cvCleanCursor();
  if (window.__cvCleanNav) window.__cvCleanNav();
  if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
  document.body.style.overflow = '';
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CSS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&family=Syne:wght@300;400;700;800&display=swap');

.cvl{--g:#00e5a0;--p:#7b5cf7;--r:#ff4d6d;--y:#ffc300;--bg:#030e10;--bdr:rgba(255,255,255,.07);--m:rgba(255,255,255,.4);--card:rgba(255,255,255,.03);background:var(--bg);color:#fff;cursor:none;min-height:100vh;font-family:'Syne',sans-serif;overflow-x:hidden}
.cvl *{box-sizing:border-box;margin:0;padding:0}

/* ── LOGO INTRO OVERLAY ── */
.cv-intro{position:fixed;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:0;pointer-events:all}
.cv-intro-bg{position:absolute;inset:0;background:var(--bg);z-index:0}

/* Grid pattern inside intro */
.cv-intro::before{content:'';position:absolute;inset:0;z-index:1;background-image:linear-gradient(rgba(0,229,160,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,.02) 1px,transparent 1px);background-size:64px 64px;pointer-events:none}

/* Radial glow behind logo */
.cv-intro::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:400px;background:radial-gradient(ellipse,rgba(0,229,160,.08) 0%,rgba(123,92,247,.05) 40%,transparent 70%);border-radius:50%;z-index:1;pointer-events:none;animation:introGlow 3s ease-in-out infinite}
@keyframes introGlow{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.12)}}

.cv-intro-logo-wrap{position:relative;z-index:2;display:flex;align-items:center;gap:18px;transform-origin:center center}
.cv-intro-img{width:72px;height:72px;border-radius:16px;object-fit:contain;filter:drop-shadow(0 0 20px rgba(0,229,160,.35))}
.cv-intro-text{font-family:'Orbitron',monospace;font-size:clamp(36px,6vw,68px);font-weight:900;letter-spacing:.02em;background:linear-gradient(120deg,#e6edf3 20%,var(--g) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap}

.cv-intro-hint{position:absolute;bottom:52px;left:50%;transform:translateX(-50%);z-index:2;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.3);text-transform:uppercase}

/* CURSOR */
#cv-dot{position:fixed;width:10px;height:10px;background:var(--g);border-radius:50%;pointer-events:none;z-index:99999;top:-5px;left:-5px;will-change:transform;transition:opacity .2s}
#cv-ring{position:fixed;width:40px;height:40px;border-radius:50%;border:1.5px solid rgba(0,229,160,.45);pointer-events:none;z-index:99998;top:-20px;left:-20px;will-change:transform;transition:width .25s,height .25s,border-color .25s,margin .25s}
#cv-ring.ring-big{width:58px;height:58px;top:-29px;left:-29px;border-color:rgba(0,229,160,.7)}
#cv-ring.ring-label{width:70px;height:70px;top:-35px;left:-35px;border-color:rgba(0,229,160,.3)}
#cv-ring.ring-label::after{content:attr(data-label);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--g);text-transform:uppercase}
.dot-hide{opacity:0}

/* BG */
.cv-bg-dots{position:fixed;inset:0;z-index:0;pointer-events:none}
.cv-bg-dot{position:absolute;width:2px;height:2px;background:var(--g);border-radius:50%;opacity:0;animation:dotF linear infinite;will-change:transform,opacity}
@keyframes dotF{0%{opacity:0;transform:translateY(0) scale(1)}15%{opacity:.3}85%{opacity:.1}100%{opacity:0;transform:translateY(-50px) scale(.4)}}
.cv-grid-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,229,160,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,.016) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse 70% 55% at 50% 30%,black,transparent)}
.cv-noise{position:fixed;inset:0;z-index:1;opacity:.028;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:140px}
.cv-scanline{position:fixed;inset:0;z-index:1;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.01) 2px,rgba(0,0,0,.01) 4px)}

/* NAV */
.cv-nav{position:fixed;top:0;left:0;right:0;z-index:999;height:66px;padding:0 48px;display:flex;align-items:center;justify-content:space-between;transition:background .35s,border-color .35s}
.cv-nav-scrolled{background:rgba(3,14,16,.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--bdr)}
.cv-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.cv-logo-img{width:30px;height:30px;border-radius:7px;object-fit:contain}
.cv-logo-text{font-family:'Orbitron',monospace;font-size:17px;font-weight:900;background:linear-gradient(120deg,#e6edf3 20%,var(--g) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.cv-nav-links{display:flex;gap:28px}
.cv-nl{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.45);text-decoration:none;position:relative;transition:color .2s}
.cv-nl::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:1px;background:var(--g);transition:width .3s}
.cv-nl:hover{color:#fff}.cv-nl:hover::after{width:100%}

/* BUTTONS */
.cv-btn{position:relative;display:inline-flex;align-items:center;gap:7px;padding:11px 22px;border-radius:50px;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;cursor:none;overflow:hidden;transition:transform .1s}
.cv-btn-lg{padding:15px 34px;font-size:12px}
.cv-btn-primary{background:var(--g);color:#000}
.cv-btn-ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.18)}
.cv-btn-ghost:hover{border-color:rgba(255,255,255,.35)}
.cv-btn::before{content:'';position:absolute;inset:0;background:rgba(255,255,255,.15);border-radius:inherit;opacity:0;transform:scale(.85);transition:opacity .3s,transform .3s}
.cv-btn:hover::before{opacity:1;transform:scale(1)}
.cv-arrow{transition:transform .3s}.cv-btn:hover .cv-arrow{transform:translateX(4px)}

/* HERO */
.cv-hero{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:128px 24px 80px;position:relative;text-align:center}
.cv-hero-glow{position:absolute;top:-8%;left:50%;transform:translateX(-50%);width:800px;height:560px;background:radial-gradient(ellipse,rgba(0,229,160,.065) 0%,rgba(123,92,247,.04) 40%,transparent 70%);pointer-events:none;border-radius:50%;will-change:transform}
.cv-hero-inner{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center}
.cv-eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--g);margin-bottom:32px;display:flex;align-items:center;gap:12px}
.cv-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--g);animation:ePulse 2s ease-in-out infinite}
@keyframes ePulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,229,160,.4)}50%{opacity:.5;box-shadow:0 0 0 6px rgba(0,229,160,0)}}
.cv-eyebrow-line{width:36px;height:1px;background:linear-gradient(90deg,rgba(0,229,160,.5),transparent)}
.cv-title{font-family:'Orbitron',monospace;font-size:clamp(48px,8vw,104px);font-weight:900;line-height:1;letter-spacing:-2px;perspective:800px}
.cv-tline{display:block;overflow:hidden}
.cv-ch{display:inline-block}
.cv-gr{color:var(--g)}
.cv-sk{-webkit-text-stroke:1.5px rgba(255,255,255,.28);color:transparent}
.cv-glitch{position:relative;display:inline-block}
.cv-ga,.cv-gb{position:absolute;inset:0;pointer-events:none;opacity:0;color:inherit;font-family:inherit;font-size:inherit;font-weight:inherit}
@keyframes ga{0%,100%{clip-path:inset(0 0 98% 0);transform:translate(-3px)}33%{clip-path:inset(30% 0 55% 0);transform:translate(3px)}66%{clip-path:inset(65% 0 15% 0);transform:translate(-2px)}}
@keyframes gb{0%,100%{clip-path:inset(94% 0 0 0);transform:translate(3px)}33%{clip-path:inset(15% 0 70% 0);transform:translate(-3px)}66%{clip-path:inset(50% 0 35% 0);transform:translate(2px)}}
.cv-glitch:hover .cv-ga{opacity:.7;animation:ga .3s steps(1) infinite;color:var(--p)}
.cv-glitch:hover .cv-gb{opacity:.7;animation:gb .3s steps(1) infinite;color:var(--r)}
.cv-hero-sub{font-size:clamp(14px,1.7vw,18px);font-weight:300;color:rgba(255,255,255,.45);max-width:520px;line-height:1.85;margin:28px auto 44px}
.cv-hero-cta{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.cv-pills{display:flex;gap:10px;margin-top:48px;flex-wrap:wrap;justify-content:center}
.cv-pill{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;padding:7px 18px;border-radius:50px;color:rgba(255,255,255,.55)}
.cv-pill-g{background:rgba(0,229,160,.07);border:1px solid rgba(0,229,160,.2)}
.cv-pill-p{background:rgba(123,92,247,.07);border:1px solid rgba(123,92,247,.2)}
.cv-pill-r{background:rgba(255,77,109,.07);border:1px solid rgba(255,77,109,.2)}
.cv-float-card{position:absolute;right:max(24px,5vw);top:50%;transform:translateY(-40%);background:rgba(7,20,22,.92);border:1px solid rgba(0,229,160,.18);border-radius:14px;padding:20px 22px;width:268px;z-index:3;animation:flt 3s ease-in-out infinite;will-change:transform}
@keyframes flt{0%,100%{transform:translateY(-40%)}50%{transform:translateY(-46%)}}
.cv-fc-head{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.cv-fc-title{font-family:'Orbitron',monospace;font-size:13px;font-weight:700}
.cv-fc-code{font-family:'Space Mono',monospace;font-size:11px;line-height:1.9;color:rgba(255,255,255,.6);border-left:2px solid rgba(0,229,160,.25);padding-left:12px;margin-bottom:14px;white-space:pre-wrap}
.cv-fc-ok{font-family:'Space Mono',monospace;font-size:10px;color:rgba(0,229,160,.8);display:flex;align-items:center;gap:7px}
.cv-gdot{width:6px;height:6px;border-radius:50%;background:var(--g);display:inline-block;flex-shrink:0}
.cv-badge{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;font-weight:700;padding:4px 12px;border-radius:4px}
.cv-badge.easy{background:rgba(0,229,160,.12);color:var(--g);border:1px solid rgba(0,229,160,.25)}
.cv-badge.medium{background:rgba(255,195,0,.12);color:var(--y);border:1px solid rgba(255,195,0,.25)}
.cv-badge.hard{background:rgba(255,77,109,.12);color:var(--r);border:1px solid rgba(255,77,109,.25)}
.cv-scroll-hint{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,.22);text-transform:uppercase}
.cv-scroll-mouse{width:20px;height:32px;border:1.5px solid rgba(255,255,255,.22);border-radius:10px;display:flex;justify-content:center;padding-top:5px}
.cv-scroll-wheel{width:3px;height:5px;background:var(--g);border-radius:2px;animation:whl 1.8s ease-in-out infinite}
@keyframes whl{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(10px)}}
.cv-mq-wrap{overflow:hidden;border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr);padding:16px 0;background:rgba(0,229,160,.018)}
.cv-mq-track{display:flex;animation:mq 28s linear infinite;will-change:transform}
.cv-mq-item{display:flex;align-items:center;gap:12px;padding:0 28px;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.24);white-space:nowrap;flex-shrink:0}
.cv-mq-dot{width:4px;height:4px;border-radius:50%;background:var(--g);opacity:.5}
@keyframes mq{to{transform:translateX(-50%)}}
.cv-sec{padding:108px 0}
.cv-con{max-width:1200px;margin:0 auto;padding:0 48px}
.cv-sl{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--g);margin-bottom:16px;display:flex;align-items:center;gap:10px}
.cv-sl::before{content:'';display:block;width:22px;height:1px;background:var(--g)}
.cv-sh{font-family:'Orbitron',monospace;font-size:clamp(26px,3.8vw,50px);font-weight:900;line-height:1.1;margin-bottom:18px}
.cv-sd{font-size:16px;font-weight:300;color:var(--m);line-height:1.85;max-width:500px;margin-bottom:52px}
.cv-rev{opacity:0;transform:translateY(38px);transition:opacity .65s ease,transform .65s ease}
.cv-revl{opacity:0;transform:translateX(-34px);transition:opacity .65s ease,transform .65s ease}
.cv-revr{opacity:0;transform:translateX(34px);transition:opacity .65s ease,transform .65s ease}
.cv-vis{opacity:1 !important;transform:none !important}
.cv-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--bdr);border:1px solid var(--bdr);border-radius:20px;overflow:hidden}
.cv-stat{background:var(--bg);padding:44px 28px;text-align:center;transition:background .3s;position:relative}
.cv-stat::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:2px;background:var(--g);transition:width .4s}
.cv-stat:hover{background:rgba(0,229,160,.025)}.cv-stat:hover::after{width:44%}
.cv-stat-num-row{display:flex;align-items:baseline;justify-content:center;gap:3px;margin-bottom:10px}
.cv-stat-num{font-family:'Orbitron',monospace;font-size:clamp(34px,4vw,56px);font-weight:900;color:var(--g);line-height:1}
.cv-stat-suf{font-family:'Orbitron',monospace;font-size:clamp(18px,2.5vw,28px);font-weight:900;color:var(--g)}
.cv-stat-label{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.28)}
.cv-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--bdr);border:1px solid var(--bdr);border-radius:20px;overflow:hidden}
.cv-fc{background:var(--bg);padding:42px 32px;position:relative;overflow:hidden;transition:background .35s}
.cv-fc::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .35s;pointer-events:none}
.fc-green::before{background:linear-gradient(135deg,rgba(0,229,160,.05),transparent 60%)}
.fc-purple::before{background:linear-gradient(135deg,rgba(123,92,247,.05),transparent 60%)}
.fc-yellow::before{background:linear-gradient(135deg,rgba(255,195,0,.05),transparent 60%)}
.fc-red::before{background:linear-gradient(135deg,rgba(255,77,109,.05),transparent 60%)}
.cv-fc:hover{background:rgba(255,255,255,.022)}.cv-fc:hover::before{opacity:1}
.cv-fc-n{position:absolute;top:18px;right:20px;font-family:'Space Mono',monospace;font-size:10px;color:rgba(255,255,255,.1);letter-spacing:2px}
.cv-fc-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:22px;transition:transform .3s}
.cv-fc:hover .cv-fc-icon{transform:scale(1.1) rotate(-3deg)}
.ic-green{background:rgba(0,229,160,.08);border:1px solid rgba(0,229,160,.2)}
.ic-purple{background:rgba(123,92,247,.08);border:1px solid rgba(123,92,247,.2)}
.ic-yellow{background:rgba(255,195,0,.08);border:1px solid rgba(255,195,0,.2)}
.ic-red{background:rgba(255,77,109,.08);border:1px solid rgba(255,77,109,.2)}
.cv-fc-t{font-family:'Orbitron',monospace;font-size:14px;font-weight:700;margin-bottom:12px}
.cv-fc-d{font-size:14px;line-height:1.85;color:rgba(255,255,255,.37);font-weight:300;margin-bottom:18px}
.cv-fc-ar{font-size:15px;color:rgba(255,255,255,.18);transition:color .3s,transform .3s;display:block}
.cv-fc:hover .cv-fc-ar{color:var(--g);transform:translateX(5px)}
.cv-diff-row{display:flex;gap:18px}
.cv-dc{flex:1;border-radius:16px;padding:32px 28px;border:1px solid;position:relative;overflow:hidden;transition:transform .4s cubic-bezier(.25,1,.5,1),box-shadow .4s}
.cv-dc:hover{transform:translateY(-8px)}
.dc-easy{border-color:rgba(0,229,160,.2);background:rgba(0,229,160,.03)}.dc-easy:hover{box-shadow:0 24px 64px rgba(0,229,160,.1)}
.dc-medium{border-color:rgba(255,195,0,.2);background:rgba(255,195,0,.03)}.dc-medium:hover{box-shadow:0 24px 64px rgba(255,195,0,.1)}
.dc-hard{border-color:rgba(255,77,109,.2);background:rgba(255,77,109,.03)}.dc-hard:hover{box-shadow:0 24px 64px rgba(255,77,109,.1)}
.cv-dc-glow{position:absolute;top:-50px;right:-50px;width:150px;height:150px;border-radius:50%;opacity:.05;pointer-events:none}
.dc-easy .cv-dc-glow{background:var(--g)}.dc-medium .cv-dc-glow{background:var(--y)}.dc-hard .cv-dc-glow{background:var(--r)}
.cv-dc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}
.cv-dc-of{font-family:'Space Mono',monospace;font-size:10px;color:rgba(255,255,255,.22)}
.cv-dc-num{font-family:'Orbitron',monospace;font-size:52px;font-weight:900;line-height:1;margin-bottom:4px}
.cv-dc-easy{color:var(--g)}.cv-dc-medium{color:var(--y)}.cv-dc-hard{color:var(--r)}
.cv-dc-bar{height:3px;background:rgba(255,255,255,.07);border-radius:2px;margin:14px 0 18px;overflow:hidden}
.cv-dc-fill{height:100%;border-radius:2px;width:0;transition:width 1s .2s cubic-bezier(.25,1,.5,1)}
.cv-dc:hover .cv-dc-fill{width:var(--pct)}
.dc-easy .cv-dc-fill{background:var(--g)}.dc-medium .cv-dc-fill{background:var(--y)}.dc-hard .cv-dc-fill{background:var(--r)}
.cv-dc-desc{font-size:13px;color:rgba(255,255,255,.34);font-weight:300;line-height:1.8;margin-bottom:22px}
.cv-dc-cta{font-family:'Space Mono',monospace;font-size:11px;text-decoration:none;letter-spacing:1px;transition:letter-spacing .3s}
.cv-dc-cta:hover{letter-spacing:2px}
.cta-easy{color:var(--g)}.cta-medium{color:var(--y)}.cta-hard{color:var(--r)}
.cv-editor-layout{display:grid;grid-template-columns:1fr 1.55fr;gap:72px;align-items:center}
.cv-editor-list{list-style:none;display:flex;flex-direction:column;gap:13px;margin-bottom:26px}
.cv-editor-list li{display:flex;align-items:center;gap:12px;font-size:14px;color:rgba(255,255,255,.5)}
.cv-ck{color:var(--g);font-family:'Space Mono',monospace;font-size:12px}
.cv-langs{display:flex;gap:8px;flex-wrap:wrap}
.cv-lc{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;padding:5px 13px;background:rgba(0,229,160,.07);border:1px solid rgba(0,229,160,.18);border-radius:6px;color:var(--g)}
.cv-code-win{background:#020b0d;border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;will-change:transform}
.cv-code-bar{background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.06);padding:13px 18px;display:flex;align-items:center;gap:8px}
.cv-mac{width:11px;height:11px;border-radius:50%;display:inline-block}
.cv-code-fn{margin-left:10px;font-family:'Space Mono',monospace;font-size:11px;color:rgba(255,255,255,.28)}
.cv-code-lang{margin-left:auto;font-family:'Space Mono',monospace;font-size:10px;color:rgba(0,229,160,.6);letter-spacing:2px}
.cv-code-body{padding:22px 24px;font-family:'Space Mono',monospace;font-size:12.5px;line-height:1.95;color:rgba(255,255,255,.68)}
.cv-code-body div{display:block}
.ln{color:rgba(255,255,255,.16);margin-right:18px;user-select:none}
.kw{color:#cc99ff}.fn{color:var(--g)}.cm{color:rgba(255,255,255,.26);font-style:italic}.num{color:#f97316}
.cv-code-result{margin:0 18px 18px;padding:12px 15px;background:rgba(0,229,160,.05);border:1px solid rgba(0,229,160,.14);border-radius:10px;display:flex;align-items:center;justify-content:space-between}
.cv-ok{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;color:var(--g)}
.cv-rm{font-size:12px;color:rgba(255,255,255,.38)}.cv-rm b{color:var(--g);font-weight:400}
.cv-out-badge{position:absolute;bottom:-14px;right:20px;background:rgba(0,229,160,.09);border:1px solid rgba(0,229,160,.22);border-radius:50px;padding:7px 15px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;color:var(--g);display:flex;align-items:center;gap:7px;white-space:nowrap}
.cv-steps-sec{overflow:hidden}
#cv-h-wrap{overflow:hidden}
.cv-h-track{display:flex;gap:18px;padding:24px 48px 56px;width:max-content}
.cv-sc{width:295px;flex-shrink:0;background:var(--card);border:1px solid var(--bdr);border-radius:16px;padding:32px 26px;position:relative;overflow:hidden;transition:border-color .3s,background .3s}
.cv-sc:hover{background:rgba(255,255,255,.04);border-color:rgba(0,229,160,.18)}
.cv-sc-bg{position:absolute;top:-10px;right:10px;font-family:'Orbitron',monospace;font-size:76px;font-weight:900;color:rgba(0,229,160,.04);line-height:1;pointer-events:none}
.cv-sc-step{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;display:block;margin-bottom:16px}
.ss-green{color:var(--g)}.ss-yellow{color:var(--y)}.ss-purple{color:var(--p)}.ss-red{color:var(--r)}
.cv-sc-line{display:flex;align-items:center;gap:8px;margin-bottom:14px}
.cv-sc-dot{width:7px;height:7px;border-radius:50%;background:var(--g);flex-shrink:0}
.cv-sc-line::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(0,229,160,.3),transparent)}
.cv-sc-title{font-family:'Orbitron',monospace;font-size:17px;font-weight:700;margin-bottom:12px}
.cv-sc-desc{font-size:13px;color:rgba(255,255,255,.37);line-height:1.85;font-weight:300}
.cv-cta-sec{padding:80px 0 120px}
.cv-cta-box{background:linear-gradient(135deg,rgba(0,229,160,.07),rgba(123,92,247,.07));border:1px solid rgba(0,229,160,.14);border-radius:24px;padding:88px 60px;text-align:center;position:relative;overflow:hidden}
.cv-cta-glow{position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:500px;height:300px;background:radial-gradient(ellipse,rgba(0,229,160,.09),transparent 70%);pointer-events:none;border-radius:50%}
.cv-cta-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,229,160,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,.018) 1px,transparent 1px);background-size:48px 48px;pointer-events:none}
.cv-cta-inner{position:relative;z-index:2}
.cv-cta-title{font-family:'Orbitron',monospace;font-size:clamp(26px,4.2vw,54px);font-weight:900;line-height:1.1;margin-bottom:16px}
.cv-cta-desc{font-size:16px;color:rgba(255,255,255,.4);font-weight:300;max-width:440px;margin:0 auto 40px;line-height:1.85}
.cv-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:24px}
.cv-trust{font-family:'Space Mono',monospace;font-size:10px;color:rgba(255,255,255,.22);letter-spacing:1.5px;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap}
.cv-tsep{opacity:.35}
.cv-footer{border-top:1px solid var(--bdr);padding:60px 0 36px}
.cv-foot-top{display:grid;grid-template-columns:1fr 2fr;gap:80px;margin-bottom:44px}
.cv-foot-tag{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;color:rgba(255,255,255,.28);margin-top:12px}
.cv-foot-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.cv-foot-col{display:flex;flex-direction:column;gap:11px}
.cv-fch{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:4px}
.cv-fl{font-size:14px;color:rgba(255,255,255,.3);text-decoration:none;font-weight:300;transition:color .2s}
.cv-fl:hover{color:#fff}
.cv-foot-bot{display:flex;align-items:center;justify-content:space-between;padding-top:24px;border-top:1px solid var(--bdr)}
.cv-fc-copy{font-family:'Space Mono',monospace;font-size:11px;color:rgba(255,255,255,.2)}
@media(max-width:1024px){.cv-editor-layout{grid-template-columns:1fr;gap:48px}.cv-float-card{display:none}}
@media(max-width:768px){
  .cv-feat-grid{grid-template-columns:1fr}
  .cv-stats-grid{grid-template-columns:repeat(2,1fr)}
  .cv-diff-row{flex-direction:column}
  .cv-nav-links{display:none}
  .cv-con{padding:0 20px}
  .cv-cta-box{padding:52px 24px}
  .cv-nav{padding:0 20px}
  .cv-foot-top{grid-template-columns:1fr;gap:40px}
  .cv-foot-bot{flex-direction:column;gap:8px;text-align:center}
  .cv-intro-text{font-size:clamp(28px,8vw,48px)}
  .cv-intro-img{width:52px;height:52px}
}
`;

export default Landing;