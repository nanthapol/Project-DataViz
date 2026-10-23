import PageShell from '../components/PageShell';
import DataNotes from '../components/DataNotes';

export default function AboutData() {
  return (
    <PageShell title="About this data" picker={false}>
      {({ data }) => <DataNotes M={data.M} />}
    </PageShell>
  );
}