import { useRef, useEffect } from 'react';

const Loading = ({ customStyle }) => {
    const canvasRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const width = canvas.width = 600;
        const height = canvas.height = 600;

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 40;
        const noOfObjects = 10;
        let slice = Math.PI * 2 / noOfObjects;
        let currentCount = 0;

        // I stored all coordinates for perfomance
        const numberCoord = [];

        for(let i = 1; i <= noOfObjects; i++) {
            const angle = slice * i;

            // numbers and dots coordinates
            const noX = centerX + Math.cos(angle) * radius;
            const noY = centerY + Math.sin(angle) * radius;

            numberCoord[i-1] = { x: noX, y: noY };
        }

        function drawSingleCircle(x, y, brightness) {
            context.fillStyle = `rgba(16, 185, 129, ${brightness})`;
            context.beginPath();
            context.arc(x, y, 10, 0, 2 * Math.PI);
            context.fill();
        }

        function drawCircles() {
            let brightness = 1;
            const blockOfBrightness = 1 / numberCoord.length;
            /**
             * I actually have problem on this since I can't render it
             * like if currentCount is 38 and the overall number of circles
             * is 60 then I want it to be like the 100% for the transparency 
             * of my circle. And the transparency should decrease.
             * 38 - 100%
             * 37 - 99%
             * 36 - 98%
             * 35 - 97%
             * ...
             * and from 60 continuesly decreace the transparency like if the
             * circle from zero 
             * 2 - 65%
             * 1 - 64%
             * 0 - 63%
             * 60 - 62%
             */
            for(let i = currentCount; i >= 0; i--) {
                const {x, y} = numberCoord[i];
                drawSingleCircle(x, y, brightness);
                brightness = brightness - blockOfBrightness;
            }

            for(let i = numberCoord.length-1; i > currentCount; i--) {
                const {x, y} = numberCoord[i];
                drawSingleCircle(x, y, brightness);
                brightness = brightness - blockOfBrightness;
            }
        }

        const intervalId = setInterval(() => {
            context.clearRect(0, 0, width, height);
            drawCircles();
            currentCount = (currentCount + 1) % numberCoord.length;
        }, 100);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={ `flex justify-center items-center fixed top-0 left-0 z-50 backdrop-blur-sm dark:bg-neutral-950/80 ${ customStyle }` }>
            <canvas ref={ canvasRef }></canvas>
        </div>
    );
}

export default Loading;