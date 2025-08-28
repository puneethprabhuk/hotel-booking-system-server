export interface RegisterReq {
    firstName: string;
    lastName: string;
    contactNumber: string;
    email: string;
    password: string;
};

export interface LoginReq {
    identifier: string;
    password: string;
}

export interface ProfilePicUpdateReq {
    id: string;
    profilePicUrl: string;
}

export type GetUserQuery = {
    id: number;
    contactNumber: string;
    email: string;
    role: string;
};
