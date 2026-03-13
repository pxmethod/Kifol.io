import { notFound } from 'next/navigation';
import EndorseForm from './EndorseForm';

export default async function EndorsePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token || token.length < 10) {
    notFound();
  }

  return <EndorseForm token={token} />;
}
