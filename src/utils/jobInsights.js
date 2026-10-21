import { getSkills } from './Utils';

// สรุปผลของตัวกรอง: จำนวนประกาศ และจำนวนทักษะที่แสดง/ทั้งหมด
export function summarize(J, L, sel, level, minS) {
  let postings = 0;
  const all = new Set(), shown = new Set();
  sel.forEach(j => {
    const g = getSkills(J, L, j, level);
    postings += g.n;
    g.s.forEach(x => {
      all.add(x.skill);
      if (x.share >= minS - 1e-9) shown.add(x.skill);
    });
  });
  return { postings, total: all.size, shown: shown.size };
}

// Top skills: นับประกาศที่ระบุทักษะ รวมทุกตำแหน่งที่เลือก
// แสดงเฉพาะทักษะที่ผ่านเกณฑ์ min share อย่างน้อย 1 ตำแหน่ง (ชุดเดียวกับที่ขึ้นในกราฟ)
export function topSkills(J, L, sel, level, minS, limit = 8) {
  const count = new Map(), pass = new Set();
  let total = 0;
  sel.forEach(j => {
    const g = getSkills(J, L, j, level);
    total += g.n;
    g.s.forEach(x => {
      count.set(x.skill, (count.get(x.skill) || 0) + x.count);
      if (x.share >= minS - 1e-9) pass.add(x.skill);
    });
  });
  const rows = [...count]
    .filter(([s]) => pass.has(s))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
  return { total, rows };
}

// คู่ทักษะที่พบร่วมกันบ่อยสุด (ใช้ข้อมูลทุก Level, เฉพาะคู่ที่ >=10% ของประกาศในตำแหน่งนั้น)
export function topPairs(W, J, sel, limit = 3) {
  const m = new Map();
  let total = 0;
  sel.forEach(j => {
    total += J[j].postings;
    const seen = new Set();
    (W[j] || []).forEach(r => {
      const key = [r.if, r.then].sort().join(' + ');
      if (seen.has(key)) return;          // กฎมี 2 ทิศทาง นับครั้งเดียว
      seen.add(key);
      const c = Math.round(r.support * J[j].postings);
      const cur = m.get(key) || { pair: key, count: 0 };
      cur.count += c;
      m.set(key, cur);
    });
  });
  const rows = [...m.values()]
    .sort((a, b) => b.count - a.count || a.pair.localeCompare(b.pair))
    .slice(0, limit);
  return { total, rows };
}

// เทียบทักษะของสองตำแหน่ง (ทุก Level)
export function compare(J, a, b) {
  const A = Object.fromEntries(J[a].skills.map(x => [x.skill, x]));
  const B = Object.fromEntries(J[b].skills.map(x => [x.skill, x]));
  const both = [], onlyA = [], onlyB = [];
  Object.keys(A).forEach(s => {
    if (B[s]) both.push({ skill: s, a: A[s], b: B[s], gap: A[s].share - B[s].share });
    else onlyA.push(A[s]);
  });
  Object.keys(B).forEach(s => { if (!A[s]) onlyB.push(B[s]); });
  const union = new Set([...Object.keys(A), ...Object.keys(B)]).size;
  return {
    nA: J[a].postings, nB: J[b].postings,
    both: both.sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap)),
    onlyA: onlyA.sort((x, y) => y.share - x.share),
    onlyB: onlyB.sort((x, y) => y.share - x.share),
    jaccard: both.length / union,
  };
}