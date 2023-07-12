export type RestRequest = {
    uri: string
    verb: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: object
}

export function sharkRest<T>(request: RestRequest): Promise<T> {

    const getBody = () => request.verb !== 'GET' && 'body' in request ? JSON.stringify(request.body) : null;    

    const init: RequestInit = {
        method: request.verb,
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: getBody()
    }

    return fetch(request.uri, init)
        .then(res => res.json())
        .then(res => {
            if (!('result' in res)) {
                return Promise.resolve<T>(res);
            } else if (res.result === 'failure') {
                const message = 'message' in res
                    ? res.message
                    : 'There was an unknown error.'
                return Promise.reject<T>(message);  
            } else {
                const data = 'data' in res
                    ? res.data as T
                    : res as T
                return Promise.resolve<T>(data);
            }
        })
}