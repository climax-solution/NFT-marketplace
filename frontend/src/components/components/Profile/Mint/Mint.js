import { createGlobalStyle } from "styled-components"
import ToNew from "./ToOld";
import ToOld from "./ToNew";

const GlobalStyles = createGlobalStyle`
    .couple-column {
        grid-template-columns: auto auto;
        column-gap: 10px;
    }
`;


export default function Mint() {

    return (
        <>
            <GlobalStyles/>
            <div className="row justify-content-center">
                <ToNew/>
                <ToOld/>
            </div>
        </>
    )
}