// Which skill pages carry a "Try it" demo. Kept out of SkillDemo.tsx so the
// server page can read it without importing from a client module.
const DEMO_SLUGS: readonly string[] = ["ai-features-in-product"];

export const hasSkillDemo = (slug: string): boolean => DEMO_SLUGS.includes(slug);
