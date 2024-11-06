import { Link, useNavigate } from 'react-router-dom';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { useState } from 'react';
//import { zUser } from '@/store/user';

import OvidaHomePlus from '../../public/ovida-front.jpg';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';

const SignUp = () => {
    const [data, setData] = useState({firstname: '', lastname: '', username: '', password: ''});
    const [errorData, setErrorData] = useState({firstname: '', lastname: '', username: '', password: '', default: ''});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const signup = async (ev) => {
        ev.preventDefault();

        try {
            setLoading(true);
            console.log('signup');

            const firstname = data?.firstname?.trim();
            const lastname = data?.lastname?.trim();
            const username = data?.username?.trim();
            const password = data?.password?.trim();

            if(!firstname) setErrorData(state => ({...state, firstname: 'First name is empty.'})); 
            if(!lastname) setErrorData(state => ({...state, lastname: 'Last name is empty.'})); 
            if(!username) setErrorData(state => ({...state, username: 'Username is empty.'})); 
            if(!password) setErrorData(state => ({...state, password: 'Password is empty.'})); 
            if(!firstname || !lastname || !username || !password) {
                throw new Error('Empty Fields');
            }

            const payload = {firstname, lastname, username, password};
            const response = await sendJSON(urls?.signup, payload);
            if(response) {
                //zUser.getState().save(response?.firstname, response?.lastname, response?.username);
                navigate('/admin');
                location.reload();
            }
        } catch(error) {
            console.log(error);
            setErrorData(state => ({...state, default: error?.message}));
            setData(state => ({...state, password: ''}))
        } finally {
            setLoading(false);
        }
    }

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <main className="relative flex justify-center items-center lg:static lg:grid lg:grid-cols-2 min-h-screen">
            <section className="absolute lg:static">
                <img src={OvidaHomePlus} alt="Ovida Home Plus" className="w-full h-full min-h-screen object-cover"/>
            </section>
            <section className="absolute lg:static w-full min-h-screen flex flex-col justify-center items-center bg-neutral-300/25 backdrop-blur-sm">
                <form onSubmit={signup} className="flex justify-center items-center flex-col bg-white rounded-lg py-10 px-6 lg:p-10">
                    <h1 className="font-bold text-3xl text-neutral-600">Sign Up</h1>
                    <div className="flex flex-col py-1 px-4 gap-2">
                        <label htmlFor="first-name" className="font-semibold pl-1">
                            First Name 
                            <span className="text-red-500">*</span>
                        </label>
                        <input 
                            id="first-name"
                            value={data?.firstname}
                            onChange={elem => 
                                setData(state => ({...state, firstname: elem.target.value}))}
                            autoFocus={true} 
                            className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Username"
                            required
                        />
                        <ErrorField message={errorData?.firstname || ''} />
                    </div>
                    <div className="flex flex-col py-1 px-4 gap-2">
                        <label htmlFor="last-name" className="font-semibold pl-1">
                            Last Name
                            <span className="text-red-500">*</span>
                        </label>
                        <input 
                            id="last-name"
                            value={data?.lastname}
                            onChange={elem => 
                                setData(state => ({...state, lastname: elem.target.value}))}
                            className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Password"
                            required
                        />
                        <ErrorField message={errorData?.lastname || ''} />
                    </div>
                    <div className="flex flex-col py-1 px-4 gap-2">
                        <label htmlFor="username" className="font-semibold pl-1">
                            Username
                            <span className="text-red-500">*</span>
                        </label>
                        <input 
                            id="username"
                            value={data?.username}
                            onChange={elem => 
                                setData(state => ({...state, username: elem.target.value}))} 
                            autoFocus={true} 
                            className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Username"
                            required
                        />
                        <ErrorField message={errorData?.username || ''} />
                    </div>
                    <div className="flex flex-col py-1 px-4 gap-2">
                        <label htmlFor="password" className="font-semibold pl-1">
                            Password
                            <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="password" 
                            id="password"
                            value={data?.password}
                            onChange={elem => 
                                setData(state => ({...state, password: elem.target.value}))}
                            className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Password"
                            required
                        />
                        <ErrorField message={errorData?.password || ''} />
                    </div>
                    <div className="px-4 py-2">
                        <button type="submit" className="w-[300px] flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-4 hover:bg-green-800">Sign In</button>
                    </div>
                    <ErrorField message={errorData?.default || ''} />
                    <small>
                        Already have an account?{' '}
                        <Link to="/signin" className="text-blue-800 font-bold">Sign In</Link>
                    </small>
                </form>
            </section>
        </main>
    )
}

export default SignUp;