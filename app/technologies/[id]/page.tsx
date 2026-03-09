import { TechnologyDetailClient } from './TechnologyDetailClient'

export default async function TechnologyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TechnologyDetailClient id={id} />
}
