export const htmlWithTailwindTemplate = (html) => {
    return `
        <html>
            <head>
                <style>
                </style>
            </head>
            <body>
                <main class="p-8">
                    <header class="w-full flex items-center justify-center flex-col mb-6">
                        <h1 class="text-2xl font-bold">OVIDA HOME PLUS FURNISHING</h1>
                        <small>Maharlika Highway,H.Concepcion Sr., Cabanatuan City, Nueva Ecija</small>
                    </header>
                    <section>
                        ${html}
                    </section>
                </main>
            </body>
        </html>
    `;
}