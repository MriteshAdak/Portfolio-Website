export interface Experience {
    id: number;
    company: string;
    role: string;
    summary: string;
    startDate: string;
    endDate?: string | null;
    isCurrent: boolean;
    displayOrder: number;
}