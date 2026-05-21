import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import ScrollReveal from '@/components/home/ScrollReveal'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
      <ScrollReveal />
    </>
  )
}
