export const failedLoadImage = (e) => {
    const random = Math.floor(Math.random() * 17);
    e.target.src="/img/avatar/" + random + ".jpg";
}

export const shorten = (addr, str = 4) => {
    return addr.slice(0, str) + '...' + addr.slice(-str);
}