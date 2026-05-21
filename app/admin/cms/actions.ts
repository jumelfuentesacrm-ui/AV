'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

const DEFAULTS = [
  {
    section_key: 'hero',
    label: 'Hero',
    order_index: 0,
    visible: true,
    content: {
      top_bar: 'Archivo Vivo · Est. MMXXVI · San Juan, PR',
    },
  },
  {
    section_key: 'manifesto',
    label: 'Manifiesto',
    order_index: 1,
    visible: true,
    content: {
      heading: 'Donde el artista se vuelve memoria.',
      lede: 'Archivo Vivo no es un museo. Es un archivo que respira, hecho de cintas, telas y máquinas.',
      body1: 'Documentamos en imagen a quienes han moldeado la cultura de la isla, vestimos a quien quiera llevar un retazo de esa memoria en el pecho, y colocamos el archivo en los lugares donde la gente realmente vive — el mall, el lobby, la terminal.',
      body2: 'Tres capítulos. Una misma idea: lo que se archiva no muere — sigue vivo en el cuerpo de quien lo lleva.',
    },
  },
  {
    section_key: 'episodios',
    label: 'Episodios',
    order_index: 2,
    visible: true,
    content: {
      chapter_body: 'Retratos en imagen y voz. Cada estación, un artista grande de la isla cuenta su historia — la versión completa vive aquí, la versión corta vive en redes.',
      featured_title: 'Lo que la palma nunca olvidó.',
      featured_desc: 'Un retrato íntimo del narrador que tatuó el español caribeño en la memoria de tres generaciones. Caminamos su barrio, escuchamos su silencio, y descubrimos por qué su voz no le pertenece solamente a él.',
    },
  },
  {
    section_key: 'indumentaria',
    label: 'Indumentaria',
    order_index: 3,
    visible: true,
    content: {
      chapter_body: 'Camisas, T-shirts de vestir y piezas pensadas para reuniones, citas y la vida diaria de quien se viste con intención. Cada pieza lleva el bolsillo en tela AV.',
      statement_title: 'Ropa que carga memoria.',
      statement_lede: 'Cada pieza documenta. Cada costura es un argumento.',
      statement_body: 'Diseñamos para quienes se visten con intención. Camisas de vestir, T-shirts de autor y piezas de temporada — todas con el bolsillo de identificación AV bordado en tela propia.',
    },
  },
  {
    section_key: 'maquinas',
    label: 'Máquinas',
    order_index: 4,
    visible: true,
    content: {
      chapter_body: 'Una red de vending culturales en los puntos donde la isla circula — malls, lobbies, terminales. Snack, agua, refresco. Y el archivo viviendo en silencio al lado.',
      copy_title: 'El archivo también vive en el mall.',
      copy_body: 'La pantalla integrada reproduce los episodios del archivo en bucle, junto al inventario habitual de una vending. La idea: que mientras esperas tu agua, conozcas a alguien que cambió la cultura de la isla.',
    },
  },
  {
    section_key: 'subscribe',
    label: 'Suscripción',
    order_index: 5,
    visible: true,
    content: {
      heading: 'Mantente cerca del archivo.',
      body: 'Un correo cada estación: el próximo episodio, drops nuevos de indumentaria, y dónde encontrar la siguiente máquina. Sin ruido — la frecuencia del archivo.',
    },
  },
]

export async function initializeSections() {
  const supabase = createServiceClient()
  const { count } = await supabase.from('page_sections').select('*', { count: 'exact', head: true })
  if ((count ?? 0) > 0) return
  await supabase.from('page_sections').insert(DEFAULTS)
  revalidatePath('/admin/cms')
  revalidatePath('/')
}

export async function updateSection(id: string, label: string, content: Record<string, string>) {
  const supabase = createServiceClient()
  await supabase.from('page_sections').update({ label, content }).eq('id', id)
}

export async function publishPage() {
  revalidatePath('/')
}
