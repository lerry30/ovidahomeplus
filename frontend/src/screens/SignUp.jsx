import { Link } from 'react-router-dom';

import OvidaHomePlus from '../../public/ovida-front.jpg';

const SignUp = () => {
    return (
        <main className="relative flex justify-center items-center lg:static lg:grid lg:grid-cols-2 min-h-screen">
            <section className="absolute lg:static">
                <img src={OvidaHomePlus} alt="Ovida Home Plus" className="w-full h-full min-h-screen object-cover"/>
            </section>
            <section className="absolute lg:static w-full min-h-screen flex flex-col justify-center items-center bg-neutral-300/25 backdrop-blur-sm">
                <form className="flex justify-center items-center flex-col bg-white rounded-md py-10 px-6 lg:p-10">
                    <h1 className="font-bold text-3xl">Sign Up</h1>
                    <div className="flex flex-col py-2 px-4 gap-2">
                        <label htmlFor="supplier-name" className="font-semibold pl-1">First Name</label>
                        <input id="supplier-name" autoFocus={true} className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" placeholder="Username"/>
                    </div>
                    <div className="flex flex-col py-2 px-4 gap-2">
                        <label htmlFor="supplier-name" className="font-semibold pl-1">Last Name</label>
                        <input id="supplier-name" className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" placeholder="Password"/>
                    </div>
                    <div className="flex flex-col py-2 px-4 gap-2">
                        <label htmlFor="supplier-name" className="font-semibold pl-1">Username</label>
                        <input id="supplier-name" autoFocus={true} className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" placeholder="Username"/>
                    </div>
                    <div className="flex flex-col py-2 px-4 gap-2">
                        <label htmlFor="supplier-name" className="font-semibold pl-1">Password</label>
                        <input type="password" id="supplier-name" className="w-[300px] outline-none border-2 border-neutral-400 rounded-full py-2 px-4" placeholder="Password"/>
                    </div>
                    <div className="px-4 py-2">
                        <button className="w-[300px] flex items-center justify-center leading-none bg-green-600 text-white font-bold rounded-full p-4 hover:bg-green-800">Sign In</button>
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