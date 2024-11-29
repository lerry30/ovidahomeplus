import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';

const Breadcrumbs = ({tabNames=[], tabLinks=[], localStorageName=''}) => {
    const [tabsStatus, setTabsStatus] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const countCurrentActiveTabs = () => {
        const currentStatus = JSON.parse(localStorage.getItem(localStorageName) || '[]');
        let noOfActives = 0;
        for(const status of currentStatus) {
            if(status) noOfActives++;
        }
        return noOfActives;
    }

    const saveBreadcrumbsStatus = () => {
        const status = Array(tabNames?.length).fill(false);
        const pathname = location?.pathname;
        const noOfActives = countCurrentActiveTabs();

        if(status.length > 0) {
            let tabIndex = 0;
            for(let i = 0; i < tabLinks.length; i++) {
                const link = tabLinks[i];
                if(String(link).trim()===String(pathname).trim()) {
                    tabIndex = i;
                    break;
                }
            }

            if(tabIndex+1 < noOfActives) tabIndex = noOfActives-1;
            for(let i = 0; i <= tabIndex; i++) {
                status[i] = true;
            }

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
                            className={`
                                flex items-center justify-center
                                text-[10px] sm:text-[14px] md:text-[16px]
                                ${isEnabled?'text-gray-500':''}
                            `}
                            disabled={isEnabled}
                            onClick={() => navigate(tabLinks[index])}
                        >
                            <span className="text-nowrap">{name}</span>
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