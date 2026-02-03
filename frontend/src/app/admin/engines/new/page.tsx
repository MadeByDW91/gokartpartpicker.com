import { redirect } from 'next/navigation';

/**
 * Redirect to unified Add page with Gas selected.
 * Admin chooses Gas or EV there; form and fill-from-link are tailored to type.
 */
export default function NewEnginePage() {
  redirect('/admin/add?type=gas');
}
