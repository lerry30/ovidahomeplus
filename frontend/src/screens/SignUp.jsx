import { Link } from 'react-router-dom';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { useState } from 'react';

import OvidaHomePlus from '../../public/ovida-front.jpg';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';

const SignUp = () => {
    const [data, setData] = useState({firstName: '', lastName: '', username: '', password: ''});
    const [errorData, setErrorData] = useState({firstName: '', lastName: '', username: '', password: '', default: ''});
    const [loading, setLoading] = useState(false);

    const signup = async (ev) => {
        ev.preventDefault();

        try {
            setLoading(true);
            console.log('signup');

            const {firstName, lastName, username, password} = data;

            if(!firstName) setErrorData(state => ({...state, firstName: 'First name is empty.'})); 
            if(!lastName) setErrorData(state => ({...state, lastName: 'Last name is empty.'})); 
            if(!username) setErrorData(state => ({...state, username: 'Username is empty.'})); 
            if(!password) setErrorData(state => ({...state, password: 'Password is empty.'})); 
            if(!firstName || !lastName || !username || !password) {
                throw new Error('Empty Fields');
            }

            const payload = {firstname: firstName, lastname: lastName, username, password};
            const response = await sendJSON(urls?.signup, payload);
            if(response) {
                console.log(response);
            }
        } catch(error) {
            console.log(error);
            setErrorData(state => ({...state, default: error?.message}));
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
                <form onSubmit={signup} className="flex justify-center items-center flex-col bg-white rounded-md py-10 px-6 lg:p-10">
                    <h1 className="font-bold text-3xl">Sign Up</h1>
                    <div className="flex flex-col py-1 px-4 gap-2">
                        <label htmlFor="first-name" className="font-semibold pl-1">First Name</label>
                        <input 
                            id="first-name"
                            value={data?.firstName}
                            onChange={prop => 
                                setData(state => ({...state, firstName: prop.target.value}))}
                            autoFocus={true} 
                            className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Username"
                        />
                        <ErrorField message={errorData?.firstName || ''} />
                    </div>
                    <div className="flex flex-col py-1 px-4 gap-2">
                        <label htmlFor="last-name" className="font-semibold pl-1">Last Name</label>
                        <input 
                            id="last-name"
                            value={data?.lastName}
                            onChange={prop => 
                                setData(state => ({...state, lastName: prop.target.value}))}
                            className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Password"
                        />
                        <ErrorField message={errorData?.lastName || ''} />
                    </div>
                    <div className="flex flex-col py-1 px-4 gap-2">
                        <label htmlFor="username" className="font-semibold pl-1">Username</label>
                        <input 
                            id="username"
                            value={data?.username}
                            onChange={prop => 
                                setData(state => ({...state, username: prop.target.value}))} 
                            autoFocus={true} 
                            className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Username"
                        />
                        <ErrorField message={errorData?.username || ''} />
                    </div>
                    <div className="flex flex-col py-1 px-4 gap-2">
                        <label htmlFor="password" className="font-semibold pl-1">Password</label>
                        <input 
                            type="password" 
                            id="password"
                            value={data?.password}
                            onChange={prop => 
                                setData(state => ({...state, password: prop.target.value}))}
                            className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" 
                            placeholder="Password"
                        />
                        <ErrorField message={errorData?.password || ''} />
                    </div>
                    <div className="px-4 py-2">
                        <button type="submit" className="w-[300px] flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-4 hover:bg-green-800">Sign In</button>
                    </div>
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