export default function BaseNote({ J, sel, basis }) {
  if (!sel.length) return null;
  const total = sel.reduce((a, j) => a + J[j].postings, 0);
  return (
    <div className="base-note">
      <b>Base:</b> {total.toLocaleString()} postings in {sel.length} title{sel.length > 1 ? 's' : ''}
      {' ('}{sel.map(j => `${j} ${J[j].postings.toLocaleString()}`).join(' · ')}{')'}
      {basis && <> · {basis}</>}
    </div>
  );
}