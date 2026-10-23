import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getSkills, pct } from '../utils/Utils';

const COLOR = { family: 'var(--fam)', job: 'var(--job)', skill: 'var(--sk)' };
const num = n => n.toLocaleString();

export default function NetworkGraph({ J, L, sel, level, minS }) {
  const wrap = useRef(null);
  const svgRef = useRef(null);
  const ttRef = useRef(null);
  const parts = useRef({});
  const focusRef = useRef(null);
  const [focus, setFocus] = useState(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const ro = new ResizeObserver(() => setWidth(wrap.current.clientWidth));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    parts.current = {};
    focusRef.current = null;
    setFocus(null);
    if (!sel.length) return;

    const W = wrap.current.clientWidth, H = wrap.current.clientHeight;
    const gs = Object.fromEntries(sel.map(j => [j, getSkills(J, L, j, level)]));
    const totalN = d3.sum(sel, j => gs[j].n);
    const nodes = [], links = [], idx = {};
    const add = n => { if (!idx[n.id]) { idx[n.id] = n; nodes.push(n); } return idx[n.id]; };

    const maxP = d3.max(sel, j => gs[j].n) || 1;
    const rj = d3.scaleSqrt([0, maxP], [14, 30]);

    sel.forEach(j => {
      const g = gs[j], f = J[j].family;
      add({ id: 'F' + f, t: 'family', label: f, r: 11 });
      add({ id: 'J' + j, t: 'job', label: j, r: rj(g.n), n: g.n, g, shown: 0 });
      links.push({ source: 'F' + f, target: 'J' + j, w: 0, t: 'f' });
      g.s.filter(x => x.share >= minS - 1e-9).forEach(x => {
        const s = add({ id: 'S' + x.skill, t: 'skill', label: x.skill, r: 5, uses: 0, by: [] });
        s.uses++;
        s.by.push([j, x.share, x.count, g.n]);
        idx['J' + j].shown++;
        links.push({ source: 'J' + j, target: 'S' + x.skill, w: x.share, t: 's', count: x.count, n: g.n, jl: j, sl: x.skill });
      });
    });
    nodes.forEach(n => {
      if (n.t === 'skill') n.r = 5 + 2.5 * n.uses;
      n.hw = n.label.length * (n.t === 'job' ? 7.8 : 4.2);
    });

    const tt = ttRef.current;
    const show = (e, h) => {
      const r = wrap.current.getBoundingClientRect();
      tt.innerHTML = h;
      tt.style.display = 'block';
      tt.style.left = Math.min(e.clientX - r.left + 14, r.width - 260) + 'px';
      tt.style.top = (e.clientY - r.top + 14) + 'px';
    };
    const hide = () => { tt.style.display = 'none'; };

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.2, 6])
      .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom).on('dblclick.zoom', null);
    const sLinks = links.filter(l => l.t === 's');

    // เส้น
    const lk = g.selectAll('line.ln').data(links).join('line').attr('class', 'ln')
      .attr('stroke', 'var(--mu)').attr('stroke-opacity', 0.4)
      .attr('stroke-width', d => d.t === 'f' ? 1 : 0.8 + d.w * 3.5)
      .attr('stroke-dasharray', d => d.t === 'f' ? '4 3' : null);

    // พื้นที่ hover ของเส้น
    const hit = g.selectAll('line.hit').data(sLinks).join('line').attr('class', 'hit')
      .attr('stroke', 'transparent').attr('stroke-width', 12)
      .on('mousemove', (e, d) => show(e,
        `<b>${d.jl} &rarr; ${d.sl}</b><br>${num(d.count)} of ${num(d.n)} postings (${pct(d.w)})`))
      .on('mouseleave', hide);

    // โหนด
    const nd = g.selectAll('g.n').data(nodes).join('g').attr('class', 'n').style('cursor', 'pointer');
    nd.append('circle').attr('r', d => d.r).attr('fill', d => COLOR[d.t])
      .attr('stroke', d => d.t === 'skill' && d.uses > 1 ? 'var(--sh)' : 'var(--card)')
      .attr('stroke-width', d => d.t === 'skill' && d.uses > 1 ? 3 : 2);
    nd.append('text')
      .attr('class', d => d.t === 'job' ? 'jobt' : 'skt')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.t === 'job' ? d.r + 24 : d.r + 17)
      .text(d => (d.t === 'family' ? '' : d.label));

    // ป้ายตัวเลขบนเส้น
    const el = g.selectAll('text.elbl').data(sLinks).join('text').attr('class', 'elbl')
      .attr('text-anchor', 'middle').style('opacity', 0).text(d => pct(d.w));

    // ---------- ไฮไลต์ ----------
    const apply = id => {
      if (!id || !idx[id]) {
        nd.classed('dim', false);
        lk.classed('dim', false).classed('hi', false);
        el.style('opacity', 0);
        return;
      }
      const near = new Set([id]);
      links.forEach(l => {
        if (l.source.id === id) near.add(l.target.id);
        if (l.target.id === id) near.add(l.source.id);
      });
      const on = l => l.source.id === id || l.target.id === id;
      nd.classed('dim', d => !near.has(d.id));
      lk.classed('dim', l => !on(l)).classed('hi', on);
      el.style('opacity', l => on(l) ? 1 : 0);
    };

    // ---------- tooltip + โต้ตอบ ----------
    nd.on('mouseenter', (e, d) => apply(d.id))
      .on('mouseleave', () => { apply(focusRef.current); hide(); })
      .on('click', (e, d) => { e.stopPropagation(); setFocus(f => (f === d.id ? null : d.id)); })
      .on('mousemove', (e, d) => {
        let h = `<b>${d.label}</b><br>`;
        if (d.t === 'skill') {
          const sum = d3.sum(d.by, x => x[2]);
          h += d.by.map(([j, s, c, n]) => `${j}: ${num(c)} / ${num(n)} (${pct(s)})`).join('<br>');
          if (d.by.length > 1) h += `<br><b>All selected: ${num(sum)} / ${num(totalN)} (${pct(sum / totalN)})</b>`;
        } else if (d.t === 'job') {
          h += `${num(d.n)} postings<br>Skills shown: ${d.shown} of ${d.g.s.length}<br>`;
          h += [...d.g.s].sort((a, b) => b.count - a.count).slice(0, 3)
            .map(x => `${x.skill}: ${num(x.count)} (${pct(x.share)})`).join('<br>');
        } else {
          h += `${sel.filter(j => J[j].family === d.label).length} selected title(s)`;
        }
        show(e, h);
      });
    svg.on('click', () => setFocus(null));

    // ---------- force simulation ----------
    const k = Math.min(1.5, Math.max(1, W / 800));
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id)
        .distance(d => (d.t === 'f' ? 90 : 110 - d.w * 25) * k).strength(0.5))
      .force('charge', d3.forceManyBody().strength(d => (d.t === 'job' ? -700 : -260) * k))
      .force('c', d3.forceCenter(W / 2, H / 2))
      .force('col', d3.forceCollide(d => d.t === 'job' ? d.r + 40 : d.r + 16))
      .force('x', d3.forceX(W / 2).strength(0.04))
      .force('y', d3.forceY(H / 2).strength(0.06))
      .on('tick', () => {
        const pos = s => s.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        pos(lk); pos(hit);
        el.attr('x', d => (d.source.x + d.target.x) / 2).attr('y', d => (d.source.y + d.target.y) / 2 - 3);
        nd.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    nd.call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    parts.current = {
      apply,
      reset: () => svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity),
    };
    return () => sim.stop();
  }, [J, L, sel, level, minS, width]);

  // คลิกเพื่อปักไฮไลต์
  useEffect(() => {
    focusRef.current = focus;
    if (parts.current.apply) parts.current.apply(focus);
  }, [focus]);

  return (
    <div id="cv" ref={wrap}>
      <svg ref={svgRef} />
      <div id="tt" ref={ttRef} />
      <button className="reset-view" onClick={() => parts.current.reset?.()}>Reset view</button>
      {!sel.length && <div className="empty">Select up to 5 job titles to see their skills.</div>}
    </div>
  );
}