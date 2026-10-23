import PageShell from '../components/PageShell';
import SkillBarChart from '../components/SkillBarChart';

export default function TopSkillsPage() {
  return (
    <PageShell title="Top Skills">
      {({ data, sel }) => <SkillBarChart J={data.J} sel={sel} />}
    </PageShell>
  );
}