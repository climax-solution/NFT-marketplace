export const failedLoadImage = (e) => {
    e.target.src="/img/empty.jfif";
}

export const shorten = (addr, str = 4) => {
    return addr.slice(0, str) + '...' + addr.slice(-str);
}