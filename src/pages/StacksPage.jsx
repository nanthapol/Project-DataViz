import PageShell from '../components/PageShell';
import SkillStacks from '../components/SkillStacks';

export default function StacksPage() {
  return (
    <PageShell title="Skill Stacks">
      {({ data, sel }) => <SkillStacks S={data.S} sel={sel} />}
    </PageShell>
  );
}