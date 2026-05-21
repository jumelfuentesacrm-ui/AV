export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import StarburstLogo from '@/components/ui/StarburstLogo'
import type { MachineLocation } from '@/types'

export const revalidate = 300

async function getMachines(): Promise<MachineLocation[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('machine_locations')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true })
  return (data as MachineLocation[]) ?? []
}

export default async function MachinesPage() {
  const machines = await getMachines()

  return (
    <>
      {/* Header */}
      <div className="bg-dark pt-32 pb-20 px-6">
        <div className="max-w-screen-xl mx-auto">
          <p className="font-body text-xs text-gold/70 tracking-widest uppercase mb-3">División III</p>
          <h1 className="font-display font-extrabold text-cream tracking-wider uppercase"
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.95 }}>
            Máquinas
          </h1>
          <p className="font-body text-cream/40 text-base mt-4 max-w-lg leading-relaxed">
            Encuéntranos en los principales centros comerciales de Puerto Rico. Archivo Vivo, disponible donde estés.
          </p>
        </div>
      </div>

      <div className="bg-cream min-h-[60vh]">
        <div className="max-w-screen-xl mx-auto px-6 py-16">

          {machines.length === 0 ? (
            <div className="text-center py-32">
              <StarburstLogo size={60} color="#C9A870" className="mx-auto mb-6 opacity-30" />
              <p className="font-display font-bold text-2xl tracking-wider uppercase text-charcoal/40">
                Ubicaciones próximamente
              </p>
              <p className="font-body text-charcoal/30 mt-2 text-sm">
                Estamos expandiéndonos por toda la isla.
              </p>
            </div>
          ) : (
            <>
              <p className="font-body text-xs text-charcoal/30 tracking-widest uppercase mb-10">
                {machines.length} {machines.length === 1 ? 'ubicación activa' : 'ubicaciones activas'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.map((machine) => (
                  <MachineCard key={machine.id} machine={machine} />
                ))}
              </div>
            </>
          )}

          {/* Info section */}
          <div className="mt-24 border-t border-charcoal/10 pt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StarburstLogo size={20} color="#C9A870" />
                  <h3 className="font-display font-bold text-lg tracking-wider uppercase">¿Qué Vendemos?</h3>
                </div>
                <p className="font-body text-sm text-charcoal/60 leading-relaxed">
                  Nuestras máquinas ofrecen una selección curada de ropa Archivo Vivo, accesorios exclusivos y ediciones limitadas.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StarburstLogo size={20} color="#C9A870" />
                  <h3 className="font-display font-bold text-lg tracking-wider uppercase">Pagos</h3>
                </div>
                <p className="font-body text-sm text-charcoal/60 leading-relaxed">
                  Aceptamos tarjetas de crédito, débito y pagos sin contacto. Algunas ubicaciones también aceptan efectivo.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StarburstLogo size={20} color="#C9A870" />
                  <h3 className="font-display font-bold text-lg tracking-wider uppercase">Puntos</h3>
                </div>
                <p className="font-body text-sm text-charcoal/60 leading-relaxed">
                  Las compras en máquinas acumulan puntos en tu cuenta Archivo Vivo. Registra tu compra en la app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function MachineCard({ machine }: { machine: MachineLocation }) {
  return (
    <div className="group border border-charcoal/10 overflow-hidden hover:border-gold/40 transition-colors duration-300">
      {/* Photo */}
      <div className="relative aspect-video bg-charcoal/10 overflow-hidden">
        {machine.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={machine.photo_url}
            alt={machine.mall_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-charcoal/5">
            <StarburstLogo size={36} color="#C9A870" className="opacity-30" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="font-display font-bold text-xl tracking-wider uppercase mb-1">
          {machine.mall_name}
        </h3>
        {machine.city && (
          <p className="font-body text-xs text-gold tracking-widest uppercase mb-3">{machine.city}</p>
        )}
        {machine.address && (
          <p className="font-body text-sm text-charcoal/60 mb-3 leading-relaxed">{machine.address}</p>
        )}
        {machine.hours && (
          <div className="flex items-center gap-2 pt-3 border-t border-charcoal/10">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-charcoal/30">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-body text-xs text-charcoal/40 tracking-wider">{machine.hours}</span>
          </div>
        )}
      </div>
    </div>
  )
}
