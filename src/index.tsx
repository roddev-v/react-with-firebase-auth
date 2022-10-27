import React from 'react';
import firebase, {
  Auth,
  ConfirmationResult,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  UserCredential,
} from 'firebase/auth';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  ApplicationVerifier,
} from 'firebase/auth';

import getErrorMessageForProvider from './getErrorMessageForProvider';

export type WrappedComponentProps = {
  signInWithEmailAndPassword: (email: string, password: string) => void;
  createUserWithEmailAndPassword: (email: string, password: string) => void;
  signInWithGoogle: () => void;
  signInWithFacebook: () => void;
  signInWithGithub: () => void;
  signInWithTwitter: () => void;
  signInWithApple: () => void;
  signInWithPhoneNumber: (
    phoneNumber: string,
    applicationVerifier: ApplicationVerifier
  ) => void;
  signInAnonymously: () => void;
  signOut: () => void;
  setError: (error: string | null) => void;
  user?: firebase.User | null;
  error?: string;
  loading: boolean;
};

export type PossibleProviders = keyof ProvidersMapper;

export type ProvidersMapper = {
  googleProvider?: GoogleAuthProvider;
  facebookProvider?: FacebookAuthProvider;
  twitterProvider?: TwitterAuthProvider;
  githubProvider?: GithubAuthProvider;
  appleProvider?: OAuthProvider;
};

export type HocParameters = {
  firebaseAppAuth: Auth;
  providers?: ProvidersMapper;
};

export type FirebaseAuthProviderState = {
  loading: boolean;
  user?: firebase.User | null;
  error?: string | null;
};

const withFirebaseAuth = ({
  firebaseAppAuth,
  providers = {},
}: HocParameters) => {
  return function createComponentWithAuth<P>(
    WrappedComponent: React.ComponentType<P & WrappedComponentProps>
  ) {
    return class FirebaseAuthProvider extends React.PureComponent<
      P,
      FirebaseAuthProviderState
    > {
      static displayName = `withFirebaseAuth(${
        WrappedComponent.displayName || WrappedComponent.name
      })`;

      state = {
        loading: false,
        user: undefined,
        error: undefined,
      };

      unsubscribeAuthStateListener: firebase.Unsubscribe | undefined;

      componentDidMount() {
        this.unsubscribeAuthStateListener = firebaseAppAuth.onAuthStateChanged(
          (user) => this.setState({ user })
        );
      }

      componentWillUnmount() {
        if (this.unsubscribeAuthStateListener) {
          this.unsubscribeAuthStateListener();
        }
      }

      setError = (error: string | null) => this.setState({ error });

      toggleLoading = () => {
        this.setState((currState) => ({ loading: !currState.loading }));
      };

      async tryTo<T>(operation: () => Promise<T>) {
        try {
          this.toggleLoading();
          return await operation();
        } catch (error: any) {
          this.setError(error.message);
          return error as Error;
        } finally {
          this.toggleLoading();
        }
      }

      tryToSignInWithProvider = (provider: PossibleProviders) =>
        this.tryTo<UserCredential>(() => {
          const providerInstance = providers[provider];

          if (!providerInstance) {
            throw new Error(getErrorMessageForProvider(provider));
          }

          return signInWithPopup(firebaseAppAuth, providerInstance);
        });

      signOut = () => {
        return this.tryTo<void>(() => signOut(firebaseAppAuth));
      };

      signInAnonymously = () => {
        return this.tryTo<UserCredential>(() =>
          signInAnonymously(firebaseAppAuth)
        );
      };

      signInWithGithub = () => this.tryToSignInWithProvider('githubProvider');

      signInWithTwitter = () => this.tryToSignInWithProvider('twitterProvider');

      signInWithGoogle = () => this.tryToSignInWithProvider('googleProvider');

      signInWithFacebook = () =>
        this.tryToSignInWithProvider('facebookProvider');

      signInWithApple = () => this.tryToSignInWithProvider('appleProvider');

      signInWithEmailAndPassword = (email: string, password: string) => {
        return this.tryTo<UserCredential>(() =>
          signInWithEmailAndPassword(firebaseAppAuth, email, password)
        );
      };

      signInWithPhoneNumber = (
        phoneNumber: string,
        applicationVerifier: ApplicationVerifier
      ) => {
        return this.tryTo<ConfirmationResult>(() =>
          signInWithPhoneNumber(
            firebaseAppAuth,
            phoneNumber,
            applicationVerifier
          )
        );
      };

      createUserWithEmailAndPassword = (email: string, password: string) => {
        return this.tryTo<UserCredential>(() =>
          createUserWithEmailAndPassword(firebaseAppAuth, email, password)
        );
      };

      sharedHandlers = {
        createUserWithEmailAndPassword: this.createUserWithEmailAndPassword,
        signInWithEmailAndPassword: this.signInWithEmailAndPassword,
        signInWithGithub: this.signInWithGithub,
        signInWithTwitter: this.signInWithTwitter,
        signInWithGoogle: this.signInWithGoogle,
        signInWithFacebook: this.signInWithFacebook,
        signInWithApple: this.signInWithApple,
        signInWithPhoneNumber: this.signInWithPhoneNumber,
        signInAnonymously: this.signInAnonymously,
        setError: this.setError,
        signOut: this.signOut,
      };

      render() {
        const props = {
          ...this.props,
          ...this.sharedHandlers,
          loading: this.state.loading,
          user: this.state.user,
          error: this.state.error,
        };

        return <WrappedComponent {...props} />;
      }
    };
  };
};

export default withFirebaseAuth;
