import { useMemo } from 'react';
import { toNumber } from '@/utils/number';

const AnimateNumber = ({ number = 0, size=24 }) => {
    const displayNumber = useMemo(() => {
        const noOfArray = toNumber(number);
        const height = size * noOfArray;
        const fontSize = size - 8;

        return (
            <div className="flex flex-col font-bold" style={{ width: `${ size }px`, height: height, transform: `translateY(-${ height }px)`, transition: 'transform 0.8s ease-in-out 1s' }}>
                {
                    Array(noOfArray + 1).fill(0).map((_, index) => {
                        return (
                            <span key={index} style={{ width: `${ size }px`, height: `${ size }px`, textAlign: 'center', fontSize: `${ fontSize }px` }}>
                                { index }
                            </span>
                        );
                    })
                }
            </div>
        );
    }, [ number ]);

    return (
        <div className="relative overflow-hidden" style={{ width: `${ size }px`, height: `${ size }px` }}> 
            { displayNumber }
        </div>
    );
};

export default AnimateNumber;