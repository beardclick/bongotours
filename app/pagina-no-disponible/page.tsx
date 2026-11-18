import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function PaginaNoDisponible(): ReactNode {
  notFound();
}
