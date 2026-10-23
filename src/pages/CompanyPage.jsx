import PageShell from '../components/PageShell';
import CompanyCheck from '../components/CompanyCheck';

export default function CompanyPage() {
  return (
    <PageShell title="Company Check">
      {({ data, sel }) => <CompanyCheck C={data.C} sel={sel} />}
    </PageShell>
  );
}