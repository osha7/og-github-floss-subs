import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUser } from '../components/UserContext';
import LoadingDots from '../components/ui/LoadingDots';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GitHub from '../components/icons/GitHub';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, signIn } = useUser();

  const handleSignin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    const { error } = await signIn({ email, password });
    if (error) {
      setMessage(error.message);
    }
    if (!password) {
      setMessage('Check your email for the magic link.');
    }
    setLoading(false);
  };

  const handleOAuthSignIn = async (provider) => {
    setLoading(true);
    const { error } = await signIn({ provider });
    if (error) {
      setMessage(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      router.replace('/account');
    }
  }, [user]);

  if (!user)
    return (
      <div className="w-80 flex flex-col justify-between p-3 max-w-lg m-auto mt-28 mb-44">
        <form onSubmit={handleSignin}>
       
          <div className="flex flex-col space-y-4">
            {message && (
              <div
                className={`text-${password ? 'pink' : 'green'} border border-${
                  password ? 'pink' : 'green'
                } p-3`}
              >
                {message}
              </div>
            )}
            <Input
              type="email"
              placeholder="Email"
              onChange={setEmail}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              onChange={setPassword}
            />
            <div className="pt-1 w-full flex flex-col">
              <Button variant="slim" type="submit" loading={loading}>
                {password.length ? 'Sign In' : 'Send Magic Link'}
              </Button>
            </div>

            <span className=" text-center text-sm">
              <span className="text-accents-7">Don't have an account?</span>
              {` `}
              <Link href="/signup">
                <a className="text-accent-9 font-bold hover:underline cursor-pointer">
                  Sign Up
                </a>
              </Link>
            </span>
          </div>
        </form>

        <div className="flex items-center my-6">
          <div
            className="border-t border-accents-2 flex-grow mr-3"
            aria-hidden="true"
          ></div>
          <div className="text-accents-4 italic">Or</div>
          <div
            className="border-t border-accents-2 flex-grow ml-3"
            aria-hidden="true"
          ></div>
        </div>
        

        <Button
          variant="slim"
          type="submit"
          disabled={loading}
          onClick={() => handleOAuthSignIn('github')}
        >
          <GitHub />
          <span className="ml-2">Continue with GitHub</span>
        </Button>
        <Button
        className="my-5"
          variant="slim"
          type="submit"
          disabled={loading}
          onClick={() => handleOAuthSignIn('google')}
        >
          <img className="w-6" src='/search.svg' />
          <span className="ml-2">Continue with Google</span>
        </Button>
      </div>
    );

  return (
    <div className="m-6">
      <LoadingDots />
    </div>
  );
};

export default SignIn;
