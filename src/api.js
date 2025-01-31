window.callEnhancerAPI = async (prompt) => {
    return new Promise((resolve, reject) => {
        window.postMessage({ type: 'ENHANCE_PROMPT', prompt }, '*');

        const messageHandler = (event) => {
            if (event.data.type === 'ENHANCE_PROMPT_RESPONSE') {
                window.removeEventListener('message', messageHandler);
                resolve(event.data.data);
            } else if (event.data.type === 'ENHANCE_PROMPT_ERROR') {
                window.removeEventListener('message', messageHandler);
                reject(new Error(event.data.error));
            }
        };

        window.addEventListener('message', messageHandler);
    });
};