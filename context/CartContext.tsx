'use client'

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import type { CartItem, Product, ProductVariant } from '@/types'

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; variant: ProductVariant | null; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string; variantId?: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; variantId?: string; quantity: number }
  | { type: 'CLEAR_CART' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIdx = state.items.findIndex(
        (i) =>
          i.product.id === action.product.id &&
          (i.variant?.id ?? null) === (action.variant?.id ?? null)
      )
      if (existingIdx >= 0) {
        const updatedItems = [...state.items]
        updatedItems[existingIdx] = {
          ...updatedItems[existingIdx],
          quantity: updatedItems[existingIdx].quantity + action.quantity,
        }
        return { items: updatedItems }
      }
      return {
        items: [
          ...state.items,
          { product: action.product, variant: action.variant, quantity: action.quantity },
        ],
      }
    }
    case 'REMOVE_ITEM': {
      return {
        items: state.items.filter(
          (i) =>
            !(
              i.product.id === action.productId &&
              (i.variant?.id ?? undefined) === action.variantId
            )
        ),
      }
    }
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter(
            (i) =>
              !(
                i.product.id === action.productId &&
                (i.variant?.id ?? undefined) === action.variantId
              )
          ),
        }
      }
      return {
        items: state.items.map((i) =>
          i.product.id === action.productId &&
          (i.variant?.id ?? undefined) === action.variantId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      }
    }
    case 'CLEAR_CART':
      return { items: [] }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (product: Product, variant: ProductVariant | null, quantity?: number) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, variantId?: string, quantity?: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const addItem = useCallback(
    (product: Product, variant: ProductVariant | null, quantity = 1) => {
      dispatch({ type: 'ADD_ITEM', product, variant, quantity })
    },
    []
  )

  const removeItem = useCallback((productId: string, variantId?: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId, variantId })
  }, [])

  const updateQuantity = useCallback(
    (productId: string, variantId?: string, quantity = 0) => {
      dispatch({ type: 'UPDATE_QUANTITY', productId, variantId, quantity })
    },
    []
  )

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{ items: state.items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
