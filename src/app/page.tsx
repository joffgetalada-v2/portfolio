import { ClassicPortfolio } from "@/components/classic/ClassicPortfolio";
import { Experience } from "@/components/Experience";
import { JsonLd } from "@/components/seo/JsonLd";

export default function Home() {
  return (
    <>
      <JsonLd />
      <Experience />
      <ClassicPortfolio />
    </>
  );
}
