import { useEffect, useState } from 'react';

export default function useJobData() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const get = name =>
      fetch(`/data/${name}.json`).then(r => {
        if (!r.ok) throw new Error(`${name}.json: HTTP ${r.status}`);
        return r.json().catch(() => { throw new Error(`${name}.json is missing from public/data`); });
      });
    Promise.all([get('job_skills'), get('meta'), get('stacks'), get('company_check')])
      .then(([J, M, S, C]) => setData({ J, M, S, C }))
      .catch(e => setErr(e.message));
  }, []);

  return { data, err };
}