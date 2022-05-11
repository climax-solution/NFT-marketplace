const style = `
.wrapper-404 {
    min-height: 100vh;
    @media screen and (max-height: 500px) {
        min-height: 500px;
    }
}
.not-found-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
}
`;
export default style;