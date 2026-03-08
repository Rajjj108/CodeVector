
// ── User solution ──
function twoSum(nums, target) {
    const map = new Map();

    for (let i = 0; i < nums.length; i++) {
        let complement = target - nums[i];

        if (map.has(complement)) {
            return [map.get(complement), i];
        }

        map.set(nums[i], i);
    }
}

// ── Harness ──
(function() {
  try {
    const rawInput = "nums = [2,7,11,15], target = 9";

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
    const fnMatch = "function twoSum(nums, target) {\n    const map = new Map();\n\n    for (let i = 0; i < nums.length; i++) {\n        let complement = target - nums[i];\n\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n\n        map.set(nums[i], i);\n    }\n}".match(/(?:var|const|let)\s+(\w+)\s*=\s*function|function\s+(\w+)\s*\(/);
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
