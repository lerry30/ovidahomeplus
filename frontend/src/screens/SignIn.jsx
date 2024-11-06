import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
//import { zUser } from '@/store/user';
import { Eye, EyeOff } from 'lucide-react';

import OvidaHomePlus from '../../public/ovida-front.jpg';
import Loading from '@/components/Loading';
import ErrorField from '@/components/ErrorField';

const SignIn = () => {
    const [data, setData] = useState({username: '', password: ''});
    const [errorData, setErrorData] = useState({username: '', password: '', default: ''});
    const [loading, setLoading] = useState(false);
    const [togglePasswordDisplay, setTogglePasswordDisplay] = useState(false);

    const navigate = useNavigate();

    const signin = async (ev) => {
        ev.preventDefault();

        try {
            setLoading(true);
            const username = data?.username?.trim();
            const password = data?.password?.trim();

            if(!username) setErrorData(state => ({...state, username: 'Username is empty.'}));
            if(!password) setErrorData(state => ({...state, password: 'Password is empty'}));
            if(!username || !password) {
                throw new Error('All fields should not be empty.');
            }

            const payload = {username, password};
            const response = await sendJSON(urls?.signin, payload);
            if(response) {
                //zUser.getState()?.save(response?.firstname, response?.lastname, response?.username);
                navigate('/admin');
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
                <form onSubmit={signin} className="flex justify-center items-center flex-col bg-white rounded-lg py-6 px-6 lg:px-10">
                    <h1 className="font-bold text-3xl text-neutral-600">Sign In</h1>
                    <div className="flex flex-col py-2 px-4 gap-2">
                        <label htmlFor="username" className="font-semibold pl-1">
                            Username
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="username"
                            value={data?.username}
                            onChange={elem => setData(state => ({...state, username: elem.target.value}))}
                            autoFocus={true} 
                            className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4 leading-3" 
                            placeholder="Username"
                            autoComplete="username"
                            required
                        />
                        <ErrorField message={errorData?.username || ''} />
                    </div>
                    <div className="flex flex-col py-2 px-4 gap-2">
                        <label htmlFor="password" className="font-semibold pl-1">
                            Password
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="w-[300px] flex border-2 border-neutral-400 rounded-full overflow-hidden">
                            <input 
                                type={togglePasswordDisplay ? 'text' : 'password'}
                                id="password"
                                value={data?.password}
                                onChange={elem => setData(state => ({...state, password: elem.target.value}))}
                                className="w-full h-full outline-none leading-3 px-4 py-2"
                                placeholder="Password"
                                autoComplete="current-password"
                                required
                            />
                            <button onClick={ev => {
                                ev.preventDefault();
                                setTogglePasswordDisplay(state => !state);
                            } } className="pr-4" tabIndex="-1">
                                { togglePasswordDisplay ? <Eye /> : <EyeOff /> }
                            </button>
                        </div>
                        <ErrorField message={errorData?.password || ''} />
                    </div>
                    <div className="px-4 py-2">
                        <button type="submit" className="w-[300px] flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-4 hover:bg-green-800">Sign In</button>
                    </div>
                    <ErrorField message={errorData?.default || ''} />
                    <small>
                        Don't have an account yet?{' '}
                        <Link to="/signup" className="text-blue-800 font-bold">Sign Up</Link>
                    </small>
                </form>
            </section>
        </main>
    )
}

export default SignIn;