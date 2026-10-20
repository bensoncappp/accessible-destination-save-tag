import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { DestinationsBrowser } from '@/features/destinations/components/DestinationsBrowser'

export const metadata: Metadata = {
  title: 'Destinations',
}

// Server Component: renders the static header, then hands over to the
// client component that reads Firestore live in the browser.
export default function DestinationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Destinations"
        description="Find places that match your accessibility needs."
      />
      <DestinationsBrowser />
    </div>
  )
}
