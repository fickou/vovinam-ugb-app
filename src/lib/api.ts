const API_BASE = 'http://localhost/vovinam/api';

async function request(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
}

export const api = {
    get: (path: string) => request(path, { method: 'GET' }),
    post: (path: string, body: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path: string, body: any) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (path: string) => request(path, { method: 'DELETE' }),
};
