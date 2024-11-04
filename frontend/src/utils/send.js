export const sendJSON = async (urlPath, payload, method="POST") => {
    const res = await fetch(urlPath, {
        credentials: 'include',
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    const resPayload = await res.json();
    if(!res?.ok) {
        const message = resPayload?.message || 'Failed to fetch';
        throw new Error(message, { cause: { status: res.status, payload: resPayload } });
    }

    return resPayload;
}

export const sendForm = async (urlPath, form, method="POST") => {
    const res = await fetch(urlPath, {
        credentials: 'include',
        method: method,
        body: form
    });

    const payload = await res.json();
    if(!res?.ok) {
        const message = payload?.message || 'Failed to fetch';
        throw new Error(message, { cause: { response: res, payload } });
    }
    
    return payload;
}

export const getData = async (urlPath) => {
    const res = await fetch(urlPath);

    const payload = await res.json();
    if(!res?.ok) {
        const message = payload?.message || 'No response';
        throw new Error(message, { cause: { response: res, payload } });
    }

    return payload;
}