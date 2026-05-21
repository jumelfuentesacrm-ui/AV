export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: 'customer' | 'admin' | 'employee'
  points_balance: number
  created_at: string
}

export interface PointsLedgerEntry {
  id: string
  user_id: string
  amount: number
  description: string | null
  order_id: string | null
  created_at: string
}

export interface Film {
  id: string
  title: string
  slug: string
  artist_name: string | null
  description: string | null
  short_description: string | null
  poster_url: string | null
  video_url: string | null
  status: 'upcoming' | 'released' | 'in_production'
  release_date: string | null
  duration_minutes: number | null
  featured: boolean
  order_index: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category: 'shirt' | 'tshirt' | 'accessory' | 'other' | null
  price: number
  images: string[]
  featured: boolean
  active: boolean
  sku: string | null
  created_at: string
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string | null
  color: string | null
  stock: number
  sku: string | null
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  points_earned: number
  shipping_address: ShippingAddress | null
  stripe_payment_intent: string | null
  created_at: string
  items?: OrderItem[]
  profile?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  unit_price: number
  product?: Product
  variant?: ProductVariant
}

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
}

export interface MachineLocation {
  id: string
  mall_name: string
  address: string | null
  city: string | null
  photo_url: string | null
  hours: string | null
  active: boolean
  created_at: string
}

export interface CartItem {
  product: Product
  variant: ProductVariant | null
  quantity: number
}

export interface PageSection {
  id: string
  section_key: string
  label: string
  content: Record<string, unknown>
  order_index: number
  visible: boolean
  created_at: string
  updated_at: string
}

export interface Catalog {
  id: string
  name: string
  slug: string
  description: string | null
  visible: boolean
  display_order: number
  created_at: string
  products?: CatalogProduct[]
}

export interface CatalogProduct {
  id: string
  catalog_id: string
  product_id: string
  display_order: number
  product?: Product
}

export interface EmployeePermissions {
  id: string
  user_id: string
  can_edit_prices: boolean
  can_manage_orders: boolean
  can_manage_inventory: boolean
  can_view_analytics: boolean
  can_edit_site_content: boolean
  can_process_refunds: boolean
  updated_at: string
  profile?: Profile
}

export interface SiteSetting {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface NavLink {
  label: string
  href: string
}
