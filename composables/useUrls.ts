export const useUrls = () => {
    const config = useRuntimeConfig();
    const apiBaseUrl = config.public.apiBase ;

    return {
        apiBaseUrl
    }
    
}