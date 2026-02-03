import { redirect } from 'next/navigation';

/**
 * Redirect to unified Add page with EV selected.
 * Admin chooses Gas or EV there; form and fill-from-link are tailored to type.
 */
export default function NewMotorPage() {
  redirect('/admin/add?type=ev');
}
