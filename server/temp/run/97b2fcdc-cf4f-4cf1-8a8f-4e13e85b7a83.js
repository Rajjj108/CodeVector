
// ── User solution ──
function searchInsert(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      return mid; // Target found
    } 
    else if (nums[mid] < target) {
      left = mid + 1; // Move right
    } 
    else {
      right = mid - 1; // Move left
    }
  }

  // Target not found → insert position
  return left;
}

// ── Harness ──
(function() {
  try {
    const rawInput = "nums = [1,3,5,6], target = 5";

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
    const fnMatch = "function searchInsert(nums, target) {\n  let left = 0;\n  let right = nums.length - 1;\n\n  while (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n\n    if (nums[mid] === target) {\n      return mid; // Target found\n    } \n    else if (nums[mid] < target) {\n      left = mid + 1; // Move right\n    } \n    else {\n      right = mid - 1; // Move left\n    }\n  }\n\n  // Target not found → insert position\n  return left;\n}".match(/(?:var|const|let)\s+(\w+)\s*=\s*function|function\s+(\w+)\s*\(/);
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
