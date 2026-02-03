import { redirect } from 'next/navigation';

/**
 * Legacy route: /admin/parts/import redirects to unified Add Part flow (Amazon method).
 */
export default function PartsImportPage() {
  redirect('/admin/parts/add?method=amazon');
}
