import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
    .not-found-container {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
    }
`;

const notfound = () => {
    return (
        <div className="not-found-container">
            <GlobalStyles/>
            <h1 className="text-white text-center">404</h1>
            <p className="text-center">Page not found</p>
        </div>
    )
}

export default notfound;