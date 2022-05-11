import { createGlobalStyle } from "styled-components";
import style from "./style.js";
const GlobalStyle = createGlobalStyle`${style}`;

export default function Empty() {
    return (
        <>
            <GlobalStyle/>
            <div className="empty-panel text-center">
                No items to display
            </div>
        </>
    )
}