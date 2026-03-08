
// ── User solution ──
var longestPalindrome = function(s) {
    if (s.length < 2) return s;

    let start = 0;
    let end = 0;

    function expand(left, right) {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            left--;
            right++;
        }
        return right - left - 1; 
    }

    for (let i = 0; i < s.length; i++) {

        let len1 = expand(i, i);     
        let len2 = expand(i, i + 1); 

        let len = Math.max(len1, len2);

        if (len > end - start) {
            start = i - Math.floor((len - 1) / 2);
            end = i + Math.floor(len / 2);
        }
    }

    return s.substring(start, end + 1);
};

// ── Harness ──
(function() {
  try {
    const rawInput = "s = \"babad\"";

    // Parse "key = value, key2 = value2, ..." into an object
    const args = {};
    // Split on top-level commas (not inside brackets)
    let depth = 0, cur = '', parts = [];
    for (let i = 0; i < rawInput.length; i++) {
      const c = rawInput[i];
      if (c === '[' || c === '(' || c === '{') depth++;
      else if (c === ']' || c === ')' || c === '}') depth--;
      if (c === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    if (cur.trim()) parts.push(cur.trim());

    const positional = [];
    parts.forEach(part => {
      const eqIdx = part.indexOf('=');
      if (eqIdx !== -1) {
        const key = part.slice(0, eqIdx).trim();
        const val = part.slice(eqIdx + 1).trim();
        try { args[key] = JSON.parse(val); } catch { args[key] = val.replace(/^"|"$/g,''); }
        positional.push(args[key]);
      } else {
        try { positional.push(JSON.parse(part)); } catch { positional.push(part); }
      }
    });

    // Try to find and call the user's function
    // Look for: var X = function(, function X(, const X = (
    const fnMatch = "var longestPalindrome = function(s) {\n    if (s.length < 2) return s;\n\n    let start = 0;\n    let end = 0;\n\n    function expand(left, right) {\n        while (left >= 0 && right < s.length && s[left] === s[right]) {\n            left--;\n            right++;\n        }\n        return right - left - 1; \n    }\n\n    for (let i = 0; i < s.length; i++) {\n\n        let len1 = expand(i, i);     \n        let len2 = expand(i, i + 1); \n\n        let len = Math.max(len1, len2);\n\n        if (len > end - start) {\n            start = i - Math.floor((len - 1) / 2);\n            end = i + Math.floor(len / 2);\n        }\n    }\n\n    return s.substring(start, end + 1);\n};".match(/(?:var|const|let)\s+(\w+)\s*=\s*function|function\s+(\w+)\s*\(/);
    let result;
    if (fnMatch) {
      const fnName = fnMatch[1] || fnMatch[2];
      if (typeof eval(fnName) === 'function') {
        result = eval(fnName)(...positional);
      }
    }

    if (result === undefined) {
      // Try calling via Solution class
      const sol = new Solution();
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(sol)).filter(m => m !== 'constructor');
      if (methods.length > 0) result = sol[methods[0]](...positional);
    }

    console.log(JSON.stringify(result));
  } catch (err) {
    console.error('Runtime Error:', err.message);
    process.exit(1);
  }
})();
