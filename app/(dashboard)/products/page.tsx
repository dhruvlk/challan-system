import { ProductsView } from "@/components/products"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Products | Textile Challan Management",
  description: "Manage your products and inventory",
}

export default function ProductsPage() {
  return <ProductsView />
}
