import { redirect } from 'next/navigation';

/**
 * Legacy route: /admin/parts/new redirects to unified Add Part flow (manual method).
 */
export default function NewPartPage() {
  redirect('/admin/parts/add?method=manual');
}
