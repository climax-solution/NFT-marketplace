import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
    .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }
`;

export default function Loading() {
    return (
        <>
            <GlobalStyles/>
            <div>
                <div className="cssLoader17"></div>
            </div>
        </>
    )
}