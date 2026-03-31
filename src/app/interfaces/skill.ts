type proficiency = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Skill {
    name: string;
    type?: string;
    proficiency?: proficiency;
}
