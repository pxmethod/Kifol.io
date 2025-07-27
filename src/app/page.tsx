import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-kifolio-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <EmptyState />
      </main>
    </div>
  );
}
