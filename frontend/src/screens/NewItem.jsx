import AppLogo from '@/components/AppLogo';

const NewItem = () => {
    return (
        <div className="w-full min-h-screen p-4">
            <header className="w-full h-[70px] flex items-center">
                <AppLogo />
                <h1 className="px-4">Add New Item</h1>
            </header>

        </div>
    )
}

export default NewItem;