import { QuranApp } from "#app/components/quran/main.client.tsx";
import Loader from "#app/components/ui/loader";
import { ClientOnly } from "remix-utils/client-only";
export default function TermsOfServiceRoute() {
  return <ClientOnly fallback={<Loader />}>{() => <QuranApp />}</ClientOnly>;
}
