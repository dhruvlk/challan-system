export const BROKERS = [
  "Mahesh Broker",
  "Raj Trading",
  "Shree Agency",
  "Patel Brokers",
  "Om Enterprise"
]

export const PAYMENT_UNITS = ["Days", "Weeks", "Months"]

export const PAYMENT_MODES = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Cheque",
  "NEFT/RTGS",
  "Other",
] as const

export type PaymentMode = (typeof PAYMENT_MODES)[number]

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  COMPANIES: '/companies',
  PARTIES: '/parties',
  /** Disabled while FEATURES.productsModule is false */
  PRODUCTS: '/products',
  CHALLANS: '/challans',
  DELIVERY_CHALLANS: '/delivery-challans',
  REPORTS: '/reports',
  SETTINGS: '/settings'
}

export const STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  DELIVERED: 'delivered'
}
