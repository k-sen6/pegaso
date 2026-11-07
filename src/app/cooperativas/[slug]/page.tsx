import { COOPERATIVAS } from "@/lib/mock";
import VendedorClient from "./page-client";

export function generateStaticParams() {
  return COOPERATIVAS.map((c) => ({ slug: c.slug }));
}

export default async function PaginaVendedor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <VendedorClient slug={slug} />;
}
