import { getAllPois } from "@/lib/poi";
import MapPageClient from "@/components/MapPageClient";

export default function Home() {
  const pois = getAllPois();
  return <MapPageClient pois={pois} />;
}
