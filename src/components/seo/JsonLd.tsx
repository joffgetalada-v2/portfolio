import { profile } from "@/content/profile";
import { site } from "@/content/site";

// schema.org Person. "<" is escaped so the JSON can't close the script tag.
export function JsonLd() {
  const sameAs = [profile.links.linkedin, profile.links.github, profile.links.upwork].filter(Boolean);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: "Joffrey Getalada",
    jobTitle: profile.role,
    description: profile.summary,
    email: profile.email,
    url: site.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cebu",
      addressCountry: "PH",
    },
    sameAs,
    knowsAbout: Array.from(new Set(profile.skills.flatMap((g) => g.items))),
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Cebu",
    },
    knowsLanguage: profile.languages.map((l) => l.split(" (")[0]),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
    />
  );
}
