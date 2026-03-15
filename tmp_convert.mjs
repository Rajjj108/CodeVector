import fs from 'fs';
import path from 'path';

const htmlString = `
<!-- Nav -->
<nav class="nav-bar" id="navbar">
  <a href="#" class="nav-logo">
    <span class="bracket">&lt;</span><span style="color:var(--green);">ᐅ</span><span class="bracket">&gt;</span>
    Code<span style="color:var(--green);">Vektor</span>
  </a>
  <div class="nav-links">
    <a href="#features" class="nav-link">Features</a>
    <a href="#problems" class="nav-link">Problems</a>
    <a href="#editor" class="nav-link">Editor</a>
    <a href="#community" class="nav-link">Community</a>
  </div>
  <div style="display:flex;gap:12px;align-items:center;">
    <a href="/login" class="mag-btn mag-btn-outline" data-mag>Sign In</a>
    <a href="/signup" class="mag-btn mag-btn-primary" data-mag>Start Free</a>
  </div>
</nav>

<!-- Scroll Container -->
<div id="scroll-container" data-scroll-container>

  <!-- ── HERO ── -->
  <section class="hero" id="hero">
    <div class="hero-eyebrow" data-scroll data-scroll-speed="1">
      DSA Interview Platform
    </div>

    <h1 class="hero-title" id="heroTitle">
      <span class="line">
        <span class="glitch-wrap">
          MASTER
          <span class="glitch-layer">MASTER</span>
          <span class="glitch-layer">MASTER</span>
        </span>
      </span>
      <span class="line"><span class="accent">DSA.</span></span>
      <span class="line"><span class="stroke">GET HIRED.</span></span>
    </h1>

    <p class="hero-sub reveal-up" id="heroSub" data-scroll data-scroll-speed="-0.5">
      2913 handpicked problems. Real-time code execution. Smart analytics. The complete system to crack your next tech interview.
    </p>

    <div class="hero-cta reveal-up" id="heroCta">
      <a href="/signup" class="mag-btn mag-btn-primary" data-mag style="padding:16px 40px;font-size:12px;">
        Start Solving Free →
      </a>
      <a href="#features" class="mag-btn mag-btn-outline" data-mag style="padding:16px 32px;font-size:12px;">
        Explore Features
      </a>
    </div>

    <!-- Floating stat pills -->
    <div id="heroPills" style="display:flex;gap:12px;margin-top:48px;flex-wrap:wrap;justify-content:center;">
      <div style="background:rgba(0,229,160,0.08);border:1px solid rgba(0,229,160,0.2);border-radius:50px;padding:8px 20px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.6);">
        ● 2913 PROBLEMS
      </div>
      <div style="background:rgba(123,92,247,0.08);border:1px solid rgba(123,92,247,0.2);border-radius:50px;padding:8px 20px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.6);">
        ● JS · PY · JAVA · C++
      </div>
      <div style="background:rgba(255,77,109,0.08);border:1px solid rgba(255,77,109,0.2);border-radius:50px;padding:8px 20px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.6);">
        ● 100K+ DEVELOPERS
      </div>
    </div>

    <div class="hero-scroll-hint">
      <span>Scroll</span>
      <div class="scroll-line"></div>
    </div>
  </section>

  <!-- ── MARQUEE ── -->
  <div class="marquee-wrap">
    <div class="marquee-track" id="marqueeTrack">
      <div class="marquee-item"><span class="marquee-dot"></span>Two Sum</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Longest Substring</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Binary Search</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Merge Sort</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Dynamic Programming</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Graph BFS/DFS</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Sliding Window</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Two Pointers</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Trie</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Segment Tree</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Backtracking</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Heap / Priority Queue</div>
      <!-- duplicate for seamless -->
      <div class="marquee-item"><span class="marquee-dot"></span>Two Sum</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Longest Substring</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Binary Search</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Merge Sort</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Dynamic Programming</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Graph BFS/DFS</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Sliding Window</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Two Pointers</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Trie</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Segment Tree</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Backtracking</div>
      <div class="marquee-item"><span class="marquee-dot"></span>Heap / Priority Queue</div>
    </div>
  </div>

  <!-- ── STATS ── -->
  <section class="section" id="stats">
    <div class="container">
      <div class="stats-bar">
        <div class="stat-item reveal-up">
          <span class="stat-num" data-count="2913">0</span>
          <span class="stat-label">Total Problems</span>
        </div>
        <div class="stat-item reveal-up" style="transition-delay:0.1s">
          <span class="stat-num" data-count="869">0</span>
          <span class="stat-label">Easy Problems</span>
        </div>
        <div class="stat-item reveal-up" style="transition-delay:0.2s">
          <span class="stat-num" data-count="1829">0</span>
          <span class="stat-label">Medium Problems</span>
        </div>
        <div class="stat-item reveal-up" style="transition-delay:0.3s">
          <span class="stat-num" data-count="100">0</span>
          <span class="stat-label" style="position:relative;">Active Users<span style="font-size:8px;color:var(--green);margin-left:4px;">K+</span></span>
        </div>
      </div>
    </div>
  </section>

  <!-- ── FEATURES ── -->
  <section class="section" id="features">
    <div class="container">
      <div class="section-label reveal-left">Platform Features</div>
      <h2 class="section-title reveal-left">Everything you need<br/><span style="color:var(--green);">to crack interviews.</span></h2>
      <p style="color:rgba(255,255,255,0.4);font-size:16px;font-weight:300;max-width:480px;line-height:1.8;margin-bottom:56px;" class="reveal-left">From beginner arrays to hard-level DP — a complete ecosystem built for serious developers.</p>

      <div class="features-grid">
        <div class="feature-card reveal-up">
          <span class="corner-num">01</span>
          <div class="icon-wrap">⚡</div>
          <h3>Live Code Execution</h3>
          <p>Write and run code directly in the browser. Supports JavaScript, Python, Java, and C++ with instant output and test case validation.</p>
        </div>
        <div class="feature-card reveal-up" style="--d:0.1s">
          <span class="corner-num">02</span>
          <div class="icon-wrap">📊</div>
          <h3>Smart Dashboard</h3>
          <p>Visual progress tracking with daily goals, streak counters, accuracy metrics, and a 90-day activity heatmap to keep you consistent.</p>
        </div>
        <div class="feature-card reveal-up" style="--d:0.2s">
          <span class="corner-num">03</span>
          <div class="icon-wrap">🎯</div>
          <h3>DSA Tracker</h3>
          <p>Browse all 2913 problems filtered by topic, difficulty, and completion status. Never lose your progress with persistent tracking.</p>
        </div>
        <div class="feature-card reveal-up" style="--d:0.1s">
          <span class="corner-num">04</span>
          <div class="icon-wrap">📓</div>
          <h3>Smart Notebooks</h3>
          <p>Attach personal notes to any submission. Review your accepted solutions with code snapshots and runtime analysis anytime.</p>
        </div>
        <div class="feature-card reveal-up" style="--d:0.2s">
          <span class="corner-num">05</span>
          <div class="icon-wrap">🗂️</div>
          <h3>Topic Focus Mode</h3>
          <p>Daily missions curated by topic. Arrays, graphs, DP — the system recommends problems based on your weakest areas.</p>
        </div>
        <div class="feature-card reveal-up" style="--d:0.3s">
          <span class="corner-num">06</span>
          <div class="icon-wrap" style="border-color:rgba(123,92,247,0.3);background:rgba(123,92,247,0.08);">✎</div>
          <h3>Whiteboard Mode</h3>
          <p>Sketch algorithms before writing code. Think visually with a built-in whiteboard canvas alongside the code editor.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ── DIFFICULTY BREAKDOWN ── -->
  <section class="section" id="problems">
    <div class="container">
      <div class="section-label reveal-left">Problem Library</div>
      <h2 class="section-title reveal-left">Built for every<br/><span style="color:var(--green);">skill level.</span></h2>
      <p style="color:rgba(255,255,255,0.4);font-size:16px;font-weight:300;max-width:480px;line-height:1.8;margin-bottom:56px;" class="reveal-left">Start with easy foundations, level up through mediums, conquer the hardest problems from top tech companies.</p>

      <div class="diff-cards">
        <div class="diff-card easy reveal-up">
          <div class="dot"></div>
          <div class="diff-label">Difficulty</div>
          <div class="diff-num" data-count="869">0</div>
          <div class="diff-total">Easy Problems</div>
          <div style="margin-top:20px;font-size:13px;color:rgba(255,255,255,0.35);font-weight:300;line-height:1.7;">Arrays, strings, hash maps — build your intuition with clean foundational problems.</div>
        </div>
        <div class="diff-card medium reveal-up" style="--d:0.15s">
          <div class="dot"></div>
          <div class="diff-label">Difficulty</div>
          <div class="diff-num" data-count="1829">0</div>
          <div class="diff-total">Medium Problems</div>
          <div style="margin-top:20px;font-size:13px;color:rgba(255,255,255,0.35);font-weight:300;line-height:1.7;">The interview sweet spot. Sliding window, binary search, graphs and dynamic programming.</div>
        </div>
        <div class="diff-card hard reveal-up" style="--d:0.3s">
          <div class="dot"></div>
          <div class="diff-label">Difficulty</div>
          <div class="diff-num" data-count="815">0</div>
          <div class="diff-total">Hard Problems</div>
          <div style="margin-top:20px;font-size:13px;color:rgba(255,255,255,0.35);font-weight:300;line-height:1.7;">Elite-level challenges to push past your limits. Segment trees, advanced DP, complex graphs.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── CODE EDITOR PREVIEW ── -->
  <section class="section" id="editor">
    <div class="container">
      <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:80px;align-items:center;">
        <div>
          <div class="section-label reveal-left">Code Editor</div>
          <h2 class="section-title reveal-left">Write. Run.<br/><span style="color:var(--green);">Submit.</span></h2>
          <p style="color:rgba(255,255,255,0.4);font-size:15px;font-weight:300;line-height:1.8;margin-bottom:36px;" class="reveal-left">A professional-grade editor with syntax highlighting, test case execution, and multi-language support. No setup required — just open and code.</p>
          <div style="display:flex;flex-direction:column;gap:14px;" class="reveal-left">
            <div style="display:flex;align-items:center;gap:14px;font-size:14px;color:rgba(255,255,255,0.5);">
              <span style="color:var(--green);font-family:'Space Mono',monospace;">✓</span> JavaScript, Python, Java, C++
            </div>
            <div style="display:flex;align-items:center;gap:14px;font-size:14px;color:rgba(255,255,255,0.5);">
              <span style="color:var(--green);font-family:'Space Mono',monospace;">✓</span> Instant test case validation
            </div>
            <div style="display:flex;align-items:center;gap:14px;font-size:14px;color:rgba(255,255,255,0.5);">
              <span style="color:var(--green);font-family:'Space Mono',monospace;">✓</span> Whiteboard + code side by side
            </div>
            <div style="display:flex;align-items:center;gap:14px;font-size:14px;color:rgba(255,255,255,0.5);">
              <span style="color:var(--green);font-family:'Space Mono',monospace;">✓</span> Auto-save submissions to Notes
            </div>
          </div>
        </div>
        <div class="reveal-right">
          <div class="code-window">
            <div class="code-titlebar">
              <div class="code-dot" style="background:#ff5f57;"></div>
              <div class="code-dot" style="background:#febc2e;"></div>
              <div class="code-dot" style="background:#28c840;"></div>
              <span style="margin-left:12px;font-family:'Space Mono',monospace;font-size:11px;color:rgba(255,255,255,0.3);">two-sum.js</span>
              <span style="margin-left:auto;font-family:'Space Mono',monospace;font-size:10px;color:rgba(0,229,160,0.6);letter-spacing:2px;">JAVASCRIPT</span>
            </div>
            <div class="code-body">
              <div><span class="ln">1</span><span class="cm">/** @param {number[]} nums @param {number} target */</span></div>
              <div><span class="ln">2</span><span class="kw">var</span> <span class="fn">twoSum</span> = <span class="kw">function</span>(nums, target) {</div>
              <div><span class="ln">3</span>  <span class="kw">const</span> map = <span class="kw">new</span> <span class="fn">Map</span>();</div>
              <div><span class="ln">4</span>  <span class="kw">for</span> (<span class="kw">let</span> i = <span class="num">0</span>; i &lt; nums.length; i++) {</div>
              <div><span class="ln">5</span>    <span class="kw">const</span> comp = target - nums[i];</div>
              <div><span class="ln">6</span>    <span class="kw">if</span> (map.<span class="fn">has</span>(comp)) {</div>
              <div><span class="ln">7</span>      <span class="kw">return</span> [map.<span class="fn">get</span>(comp), i];</div>
              <div><span class="ln">8</span>    }</div>
              <div><span class="ln">9</span>    map.<span class="fn">set</span>(nums[i], i);</div>
              <div><span class="ln">10</span>  }</div>
              <div><span class="ln">11</span>};</div>
              <div style="margin-top:16px;padding:14px 16px;background:rgba(0,229,160,0.06);border:1px solid rgba(0,229,160,0.15);border-radius:8px;">
                <div style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(0,229,160,0.7);margin-bottom:8px;">✓ ACCEPTED</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.4);">Runtime: <span style="color:var(--green);">72ms</span> &nbsp;|&nbsp; Memory: <span style="color:var(--green);">42.3MB</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── HORIZONTAL SCROLL STEPS ── -->
  <section class="section" id="steps">
    <div class="container" style="margin-bottom:48px;">
      <div class="section-label reveal-left">How It Works</div>
      <h2 class="section-title reveal-left">Your path from<br/><span style="color:var(--green);">zero to offer.</span></h2>
    </div>
    <div class="h-scroll-wrap" id="hScrollWrap">
      <div class="h-scroll-track" id="hScrollTrack">
        <div class="h-scroll-card">
          <div class="h-scroll-num">01</div>
          <div style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--green);margin-bottom:16px;">STEP ONE</div>
          <h3 style="font-family:'Orbitron',monospace;font-size:18px;font-weight:700;margin-bottom:14px;">Create Account</h3>
          <p style="font-size:14px;color:rgba(255,255,255,0.4);line-height:1.8;font-weight:300;">Sign up in seconds. Google OAuth or email. Your progress syncs instantly across all devices.</p>
        </div>
        <div class="h-scroll-card">
          <div class="h-scroll-num">02</div>
          <div style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--yellow);margin-bottom:16px;">STEP TWO</div>
          <h3 style="font-family:'Orbitron',monospace;font-size:18px;font-weight:700;margin-bottom:14px;">Pick Your Topic</h3>
          <p style="font-size:14px;color:rgba(255,255,255,0.4);line-height:1.8;font-weight:300;">Choose from 20+ topic categories. The daily mission system guides you intelligently through your weak spots.</p>
        </div>
        <div class="h-scroll-card">
          <div class="h-scroll-num">03</div>
          <div style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--purple);margin-bottom:16px;">STEP THREE</div>
          <h3 style="font-family:'Orbitron',monospace;font-size:18px;font-weight:700;margin-bottom:14px;">Code & Submit</h3>
          <p style="font-size:14px;color:rgba(255,255,255,0.4);line-height:1.8;font-weight:300;">Use the in-browser editor, run against all test cases, and submit with one click. No local setup ever needed.</p>
        </div>
        <div class="h-scroll-card">
          <div class="h-scroll-num">04</div>
          <div style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--green);margin-bottom:16px;">STEP FOUR</div>
          <h3 style="font-family:'Orbitron',monospace;font-size:18px;font-weight:700;margin-bottom:14px;">Note & Review</h3>
          <p style="font-size:14px;color:rgba(255,255,255,0.4);line-height:1.8;font-weight:300;">Attach notes to every solution. Your personal notebook becomes a revision-ready reference before any interview.</p>
        </div>
        <div class="h-scroll-card">
          <div class="h-scroll-num">05</div>
          <div style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--red);margin-bottom:16px;">STEP FIVE</div>
          <h3 style="font-family:'Orbitron',monospace;font-size:18px;font-weight:700;margin-bottom:14px;">Track & Improve</h3>
          <p style="font-size:14px;color:rgba(255,255,255,0.4);line-height:1.8;font-weight:300;">Monitor streaks, accuracy, and topic coverage on your dashboard. Set daily goals and smash them consistently.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ── TESTIMONIALS ── -->
  <section class="section" id="community">
    <div class="container">
      <div class="section-label reveal-left">Community</div>
      <h2 class="section-title reveal-left">Trusted by devs<br/><span style="color:var(--green);">who got hired.</span></h2>
      <p style="color:rgba(255,255,255,0.4);font-size:16px;font-weight:300;max-width:480px;line-height:1.8;margin-bottom:56px;" class="reveal-left">Real stories from engineers who used CodeVektor to land offers at top tech companies.</p>

      <div class="testimonial-grid">
        <div class="testimonial-card reveal-up" data-cursor-text="Read">
          <p class="t-quote">"The dashboard alone changed everything. Watching my streak grow kept me solving every single day. Got an offer from Google after 3 months."</p>
          <div class="t-author">
            <div class="t-avatar">AK</div>
            <div>
              <div class="t-name">Arjun Kumar</div>
              <div class="t-role">Software Engineer · Google</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card reveal-up" style="--d:0.1s" data-cursor-text="Read">
          <p class="t-quote">"The Whiteboard + Code editor combo is genius. I could sketch my approach first, then code it. Nailed every technical round at Meta."</p>
          <div class="t-author">
            <div class="t-avatar" style="background:linear-gradient(135deg,var(--yellow),var(--red));">PS</div>
            <div>
              <div class="t-name">Priya Sharma</div>
              <div class="t-role">Frontend Engineer · Meta</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card reveal-up" style="--d:0.2s" data-cursor-text="Read">
          <p class="t-quote">"CodeVektor's DSA tracker helped me identify exactly where I was weak. Focused on hard graph problems for 2 weeks and cracked Amazon."</p>
          <div class="t-author">
            <div class="t-avatar" style="background:linear-gradient(135deg,var(--purple),var(--green));">RN</div>
            <div>
              <div class="t-name">Rohit Nair</div>
              <div class="t-role">Backend Engineer · Amazon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── CTA BANNER ── -->
  <section style="padding:80px 0 120px;">
    <div class="container">
      <div class="cta-banner reveal-up">
        <div class="section-label" style="justify-content:center;margin-bottom:20px;">Get Started</div>
        <h2 style="font-family:'Orbitron',monospace;font-size:clamp(28px,4vw,52px);font-weight:900;margin-bottom:20px;line-height:1.1;">
          Your next offer<br/>starts <span style="color:var(--green);">today.</span>
        </h2>
        <p style="font-size:16px;color:rgba(255,255,255,0.4);font-weight:300;max-width:420px;margin:0 auto 40px;line-height:1.8;">
          Join 100,000+ developers mastering DSA on CodeVektor. Free forever on the core plan.
        </p>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
          <a href="/signup" class="mag-btn mag-btn-primary" data-mag style="padding:18px 48px;font-size:12px;border-radius:50px;">
            Create Free Account →
          </a>
          <a href="#problems" class="mag-btn mag-btn-outline" data-mag style="padding:18px 36px;font-size:12px;border-radius:50px;">
            Browse Problems
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ── FOOTER ── -->
  <footer class="footer">
    <div class="container">
      <div class="footer-inner">
        <div class="nav-logo" style="font-size:15px;">
          <span class="bracket">&lt;</span><span style="color:var(--green);">ᐅ</span><span class="bracket">&gt;</span>
          Code<span style="color:var(--green);">Vektor</span>
        </div>
        <div class="footer-copy">© 2025 CodeVektor. All rights reserved.</div>
        <div style="display:flex;gap:20px;">
          <a href="#" class="nav-link" style="font-size:10px;">Privacy</a>
          <a href="#" class="nav-link" style="font-size:10px;">Terms</a>
          <a href="#" class="nav-link" style="font-size:10px;">Contact</a>
        </div>
      </div>
    </div>
  </footer>

</div>
`;

// Helper regex replace to change style tags to style object
const convertStyles = (str) => {
  return str.replace(/style="([^"]*)"/g, (match, styles) => {
    const styleObj = styles.split(';').reduce((acc, style) => {
      const [key, value] = style.split(':').map((s) => s.trim());
      if (key && value) {
        const camelCaseKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        acc.push(`'${camelCaseKey}': '${value}'`);
      }
      return acc;
    }, []);
    return `style={{ ${styleObj.join(', ')} }}`;
  });
};

const jsxContent = convertStyles(htmlString).replace(/class=/g, "className=");

fs.writeFileSync(path.join('c:/Users/mayan/new', 'jsx_output.txt'), jsxContent);
