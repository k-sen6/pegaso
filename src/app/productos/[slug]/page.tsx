import { PRODUCTOS } from "@/lib/mock";
import FichaClient from "./page-client";

export function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ slug: p.slug }));
}

export default async function FichaProducto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FichaClient slug={slug} />;
}
