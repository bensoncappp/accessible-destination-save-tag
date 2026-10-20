import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { ShortlistBrowser } from '@/features/destinations/components/ShortlistBrowser'

export const metadata: Metadata = {
  title: 'My Shortlist',
}

export default function ShortlistPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Shortlist"
        description="Your saved destinations. Add tags to group and filter them."
      />
      <ShortlistBrowser />
    </div>
  )
}
