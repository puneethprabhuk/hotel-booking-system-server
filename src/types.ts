export interface RegisterReq {
    firstName: string;
    lastName: string;
    contactNumber: string;
    email: string;
    password: string;
    profilePicUrl: string;
};

export interface LoginReq {
    identifier: string;
    password: string;
}

export type GetUserQuery = {
    id: number;
    contactNumber: string;
    email: string;
    role: string;
};
