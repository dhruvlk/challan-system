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
  COMPANIES: '/companies',
  PARTIES: '/parties',
  PRODUCTS: '/products',
  CHALLANS: '/challans',
  REPORTS: '/reports',
  SETTINGS: '/settings'
}

export const STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  DELIVERED: 'delivered'
}
