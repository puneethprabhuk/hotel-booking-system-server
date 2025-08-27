export type RegisterReq = {
    firstName: string;
    lastName: string;
    contactNumber: string;
    email: string;
    password: string;
    profilePicUrl: string;
};

export type GetUserQuery = {
    id: number;
    contactNumber: string;
    email: string;
    role: string;
};
