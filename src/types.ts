export type UserModel = {
    emailAddress: string;
    companyInfo?: {
        name: string;
        numberOfUsers: number;
        numberOfProducts: number;
        percentage: number;
        logoUrl?: string;
    }
}