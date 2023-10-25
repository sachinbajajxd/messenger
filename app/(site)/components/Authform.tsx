'use client'
import {useState, useCallback, useEffect} from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import Input from '@/app/components/inputs/Input';
import Button from '@/app/components/Button';
import AuthSocialButton from './AuthSocialButton';
import {BsGithub, BsGoogle} from 'react-icons/bs';
import {toast} from 'react-hot-toast';
import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Credentials from 'next-auth/providers/credentials';

type Variant = 'LOGIN' | 'REGISTER';

const Authform = () => {

    const session = useSession();
    const router = useRouter();
    const [variant, setVariant] = useState<Variant>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(session?.status==='authenticated'){
            console.log('Authenticated');
            router.push('/users');
        }
        
    }, [session?.status, router]);

    const toggleVariant = useCallback(() => {
        if(variant==='LOGIN'){
            setVariant('REGISTER');
        }else{
            setVariant('LOGIN');
        }
    }, [variant]);

    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true);

        if(variant==='REGISTER'){
            axios.post('/api/register', data)
            .then(() => {
                toast.success('Registered successfully')
                signIn('credentials', data);
            })
            .catch(() => toast.error('User already exists'))
            .finally(() => setIsLoading(false));
        }

        if(variant==='LOGIN'){
            signIn('credentials', { 
            ...data, 
            redirect: false
            })
            .then((callback) =>{
                if(callback?.error){
                    toast.error('Invalid credentials');
                }

                if(callback?.ok && !callback?.error){
                    router.push('/users');
                    toast.success('Logged In');
                }
            })
            .finally(() => setIsLoading(false));
        }
    }

    const socialAction = (action: string) => {
        setIsLoading(true);

        signIn(action, {
            redirect: false
        })
        .then((callback) => {
            if(callback?.error){
                toast.error('Invalid credentials');
            }

            if(callback?.ok && !callback?.error){
                toast.success('Logged In');
            }
        }).finally(() => setIsLoading(false));
    }

  return (
    <>
        <h2
          className="
            mt-6
            text-center
            text-3xl
            font-bold
            tracking-light
            text-gray-900
          "
         >
          {variant==='LOGIN' ? 'Sign in to your account' : 'Create an account'}
        </h2>
        <div
        className="
            mt-8
            sm:mx-auto
            sm:w-full
            sm:max-w-md
        "
        >
            <div
                className="
                    bg-white
                    px-4
                    py-4
                    shadow
                    sm:rounded-lg
                    sm:px-10
                "
            >
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {variant === 'REGISTER' && (
                        <Input
                        disabled={isLoading}
                        register={register}
                        errors={errors}
                        required
                        id="name" 
                        label="Name"
                        />
                    )}

                    <Input 
                        disabled={isLoading}
                        register={register}
                        errors={errors}
                        required
                        id="email" 
                        label="Email address" 
                        type="email"
                    />
                    <Input 
                        disabled={isLoading}
                        register={register}
                        errors={errors}
                        required
                        id="password" 
                        label="Password" 
                        type="password"
                    />
                    <div>
                        <Button disabled={isLoading} fullWidth type="submit">
                            {variant === 'LOGIN' ? 'Sign in' : 'Register'}
                        </Button>
                    </div>
                </form>

                <div className='mt-6'>
                    <div className='relative'>
                        <div className='
                            absolute
                            inset-0
                            flex
                            items-center
                        '>
                            <div className='w-full border-t border-gray-300' />
                        </div>

                        <div className='relative flex justify-center text-sm'>
                                <span className='bg-white px-2 text-gray-500'>
                                    Or continue with
                                </span>
                        </div>
                    </div>

                    <div className='mt-6 flex gap-2'>
                        <AuthSocialButton icon={BsGithub} onClick={() => socialAction('github')} />
                        <AuthSocialButton icon={BsGoogle} onClick={() => socialAction('google')} />
                    </div>
                </div>

                <div className='flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500'>
                    <div>
                        {variant==='LOGIN' ? 'New to Messenger? ' : 'Already have an account?'}
                    </div>
                    <div 
                        onClick={toggleVariant} 
                        className="underline cursor-pointer"
                    >
                        {variant === 'LOGIN' ? 'Create an account' : 'Login'}
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default Authform