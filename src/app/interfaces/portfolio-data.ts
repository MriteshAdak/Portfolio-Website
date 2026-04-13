import { Contact } from './contact';
import { Experience } from './experience';
import { Project } from './project';
import { UserProfile } from './user-profile';

export interface PortfolioData {
    profile: UserProfile | null;
    contact: Contact | null;
    projects: Project[];
    experiences: Experience[];
}