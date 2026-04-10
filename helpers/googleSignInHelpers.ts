import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId: '241245744544-nnneqsghllugnbkojmmv5tbg7grhpfnf.apps.googleusercontent.com',
    iosClientId: '241245744544-nnneqsghllugnbkojmmv5tbg7grhpfnf.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
});

export interface GoogleSignInResult {
    success: boolean;
    idToken?: string;
    accessToken?: string;
    refreshToken?: string | null;
    expiresAt?: number | null;

    error?: string;
    user?: {
        email: string;
        name: string;
        photo?: string;
    };
}

export const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        const userInfo = await GoogleSignin.signIn();

        const idToken = userInfo.data?.idToken;
        if (!idToken) {
            return {
                success: false,
                error: 'Nie udało się uzyskać ID token'
            };
        }

        const tokens = await GoogleSignin.getTokens();

        const serverAuthCode = userInfo.data?.serverAuthCode || null;

        const expiresAt = Date.now() + 3600 * 1000;

        return {
            success: true,
            idToken,
            accessToken: tokens.accessToken,
            refreshToken: serverAuthCode,
            expiresAt,

            user: {
                email: userInfo.data?.user.email || '',
                name: userInfo.data?.user.name || '',
                photo: userInfo.data?.user.photo || undefined,
            }
        };

    } catch (error: any) {
        console.error('Błąd logowania przez Google:', error);
        return {
            success: false,
            error: error.message || 'Nieznany błąd logowania'
        };
    }
};


export const signOutFromGoogle = async (): Promise<void> => {
    try {
        await GoogleSignin.signOut();
    } catch (error) {
        console.error('Błąd wylogowania z Google:', error);
    }
};