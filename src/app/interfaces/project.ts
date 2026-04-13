export interface Project {
    id: number;
    name: string;
    description: string;
    projectUrl: string;
    imageUrl?: string | null;
    tag: string;
    displayOrder: number;
}
