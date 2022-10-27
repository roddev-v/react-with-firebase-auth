import React from 'react';
import {initializeApp} from 'firebase/app';
import withFirebaseAuth, {
  WrappedComponentProps,
} from 'react-with-firebase-auth';
import firebaseConfig from './firebaseConfig';
import UserForm from './UserForm';
import { GoogleAuthProvider, OAuthProvider, getAuth } from 'firebase/auth';
import { Props } from './Props';
const firebaseApp = initializeApp(firebaseConfig);

const FormWrapper: React.FC<Props> = ({ children }) => (
  <>
    <div style={{ marginLeft: '1.34em' }}>{children}</div>
    <hr />
  </>
);

const Loading = () => (
  <div
    style={{
      position: 'fixed',
      display: 'flex',
      top: 0,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '2.68em',
      background: 'green',
      color: 'white',
    }}>
    Loading..
  </div>
);

const App: React.FC<WrappedComponentProps> = ({
  user,
  error,
  loading,
  setError,
  signOut,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithGoogle,
  signInWithGithub,
  signInWithApple,
  createUserWithEmailAndPassword,
}) => (
  <React.Fragment>
    {loading && <Loading />}

    <FormWrapper>
      <h1>react-with-firebase-auth</h1>
      <h3>a very simple demo showing it in action</h3>
      <h3>see user data and errors in the end of this page</h3>
    </FormWrapper>

    <FormWrapper>
      <h1>create user</h1>
      <UserForm onSubmit={createUserWithEmailAndPassword} />
    </FormWrapper>

    <FormWrapper>
      <h1>sign in</h1>
      <UserForm onSubmit={signInWithEmailAndPassword} />
    </FormWrapper>

    <FormWrapper>
      <h1>sign in with google</h1>
      <button onClick={signInWithGoogle}>sign in with google</button>
    </FormWrapper>

    <FormWrapper>
      <h1>sign in with apple</h1>
      <button onClick={signInWithApple}>sign in with apple</button>
    </FormWrapper>

    <FormWrapper>
      <h1>sign in with github</h1>
      <h3>(no provider setup, good to see error message)</h3>
      <button onClick={signInWithGithub}>sign in with github</button>
    </FormWrapper>

    <FormWrapper>
      <h1>sign in anonymously</h1>
      <h3>(failing due to permissions, good to see error message)</h3>
      <button onClick={signInAnonymously}>sign in anonymously</button>
    </FormWrapper>

    <FormWrapper>
      <h1>sign out</h1>
      <button onClick={signOut}>sign out</button>
    </FormWrapper>

    <FormWrapper>
      <h1>clear error</h1>
      <button onClick={() => setError(null)}>clear error</button>
    </FormWrapper>

    <FormWrapper>
      <h1>user data</h1>
      <textarea
        style={{ width: 350, height: 200 }}
        value={JSON.stringify(user, null, 2)}
      />
    </FormWrapper>

    <FormWrapper>
      <h1>error data</h1>
      <textarea style={{ width: 350, height: 200 }} value={error} />
    </FormWrapper>
  </React.Fragment>
);

const firebaseAppAuth = getAuth(firebaseApp);

const providers = {
  googleProvider: new GoogleAuthProvider(),
  appleProvider: new OAuthProvider('apple.com'),
};

export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(App);
