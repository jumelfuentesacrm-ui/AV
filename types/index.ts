export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: 'customer' | 'admin'
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
  created_at: string
  items?: OrderItem[]
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
