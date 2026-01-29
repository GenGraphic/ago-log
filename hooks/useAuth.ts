import { auth, idGen } from "@/appwrite";
import { HookResponse } from "@/models/types";
import useAuthState from "@/store/useAuthState";
import { useCallback } from "react";

const useAuth = () => {
    const { setState } = useAuthState();

    const sendOtp = useCallback(async(email: string): Promise<HookResponse> => {
        try {
            const response = await auth.createEmailToken(
                idGen.unique(),
                email
            )
            return {
                success: true,
                message: 'succes',
                data: response.userId,
            }
        }catch(error: any){
            console.log('There was an error sendOtp: ', error);
            return {
                success: false,
                message: error.message,
                data: null,
            };
        };

    }, []);

    const validateOtp = useCallback(async(userID: string, secret: string): Promise<HookResponse> => {
        try {
            const response = await auth.createSession(
                userID,
                secret
            );

            setState(true);

            return {
                success: true,
                message: 'succes',
                data: response,
            }
        }catch(error: any){
            console.log('There was an error validateOtp: ', error);
            return {
                success: false,
                message: error.message,
                data: null,
            };
        };

    }, []);

    const signOut = useCallback(async(): Promise<HookResponse> => {
        try {
            const response = await auth.deleteSession( "current" );

            setState(true);

            return {
                success: true,
                message: 'succes',
                data: response,
            }
        }catch(error: any){
            console.log('There was an error signOut: ', error);
            return {
                success: false,
                message: error.message,
                data: null,
            };
        };

    }, []);

    const checkUserPresence = useCallback(async(): Promise<HookResponse> => {
        try{
            const response = await auth.get();

            setState(true);

            return {
                success: true,
                message: 'succes',
                data: response,
            };

        }catch(error: any){
            console.log('There was an error in checkUserPresence: ', error)
            return {
                success: false,
                message: error.message,
                data: null,
            };
        };
    }, [])

    return {
        sendOtp,
        validateOtp,
        signOut,
        checkUserPresence,
    };
};

export default useAuth;