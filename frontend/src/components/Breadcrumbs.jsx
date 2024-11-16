import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';

const Breadcrumbs = ({tabNames=[], tabLinks=[], localStorageName=''}) => {
    const [tabsStatus, setTabsStatus] = useState([]);

    const navigate = useNavigate();

    const saveBreadcrumbsStatus = () => {
        const status = Array(tabNames?.length).fill(false);
        if(status.length > 0) {
            status[0] = true; // first tab default to be true
            localStorage.setItem(localStorageName, JSON.stringify(status));
            setTabsStatus(status);
        }
    }

    useLayoutEffect(() => {
        saveBreadcrumbsStatus();
    }, []);

    return (
        <div className="w-full h-full p-1 flex">
            {
                tabNames?.map((name, index) => {
                    const isEnabled = !tabsStatus[index];
                    return (
                        <button
                            key={index}
                            className={`flex items-center justify-center ${isEnabled?'text-gray-500':''}`}
                            disabled={isEnabled}
                            onClick={() => navigate(tabLinks[index])}
                        >
                            <span>{name}</span>
                            {index-1!==tabNames.length && (
                                <ChevronRight color='#808080aa' size={18} />
                            )}
                        </button>
                    )
                })
            }
        </div>
    )
}

export default Breadcrumbs;