export const getKey = (key: string): string => {
    const value = sessionStorage.getItem(key);
    if(value === null) return "";
    else return value;
}

export const setKey = (key: string, value: string) => {
    sessionStorage.setItem(key, value);
}

export const removeKey = (key: string) => {
    sessionStorage.removeItem(key);
}