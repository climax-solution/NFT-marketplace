import { createGlobalStyle } from "styled-components"
import Switch from "react-switch";
import { useState } from "react";

import ToNew from "./ToOld";
import ToOld from "./ToNew";
import Single from "./Single";

const GlobalStyles = createGlobalStyle`
    .mint-group {
        display: grid;
        grid-auto-flow: column;
        grid-gap: 15px;
        justify-content: center;
        .old-panel, .new-panel {
            max-width: 500px;
            width: 100%;
        }
    }
    
    .couple-column {
        display: grid;
        grid-auto-columns: minmax(0, 1fr);
        grid-auto-flow: column;
        column-gap: 10px;
    }

    @media screen and (max-width: 1000px) {
        .mint-group {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .couple-column {
            display: block;
        }
    }
`;


export default function Mint() {

    const [isBulk, setIsBulk] = useState(true);
    
    return (
        <div id='zero5' className='onStep fadeIn mn-h-300px'>
            <GlobalStyles/>
            <div className="d-flex align-items-center justify-content-end">
                <span className={!isBulk ? "text-light text-bold" : ""}>Single Mint</span>
                <Switch
                    checked={isBulk}
                    onChange={() => setIsBulk(!isBulk)}
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    handleDiameter={30}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={20}
                    width={48}
                    className="react-switch mx-2"
                    id="material-switch"
                />
                <span className={isBulk ? "text-light text-bold" : ""}>Bulk Mint</span>
            </div>
            {
                isBulk ? 
                    <div className="mint-group container">
                        <ToNew/>
                        <ToOld/>
                    </div>
                : 
                <div className="mint-group container">
                    <Single/>
                </div>
            }
        </div>
    )
}