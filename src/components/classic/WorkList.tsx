import { CATEGORIES, projectsIn } from "@/content/projects";
import { CategoryTabs, type CategoryPanel } from "./CategoryTabs";
import { ProjectCard } from "./ProjectCard";
import { StoreDirectory } from "./StoreDirectory";

// Card numbers run across categories in page order.
const numbers = new Map(CATEGORIES.flatMap((c) => projectsIn(c.id)).map((p, i) => [p.id, i + 1]));

export function WorkList() {
  const panels: CategoryPanel[] = CATEGORIES.map((c) => ({ ...c, projects: projectsIn(c.id) }))
    // Shopify always shows, it also holds the store list.
    .filter((c) => c.projects.length > 0 || c.id === "shopify")
    .map((c) => ({
      id: c.id,
      label: c.label,
      short: c.short,
      count: c.projects.length,
      content: (
        <>
          {c.projects.length > 0 && (
            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:gap-x-10">
              {c.projects.map((p) => (
                <ProjectCard key={p.id} project={p} n={numbers.get(p.id) ?? 0} />
              ))}
            </div>
          )}
          {c.id === "shopify" && <StoreDirectory />}
        </>
      ),
    }));

  return <CategoryTabs label="Work by platform" panels={panels} />;
}
