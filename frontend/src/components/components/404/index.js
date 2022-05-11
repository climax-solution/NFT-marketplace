import { createGlobalStyle } from "styled-components";
import style from "./style.js";
const GlobalStyle = createGlobalStyle`${style}`;

const NotFound = () => {
    return (
        <>
            <GlobalStyle/>
            <div className="container wrapper-404 position-relative">
                <div className="not-found-container">
                    <h1 className="text-white text-center">404</h1>
                    <p className="text-center">Page not found</p>
                </div>
            </div>
        </>
    )
}

export default NotFound;