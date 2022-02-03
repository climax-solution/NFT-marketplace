import { createGlobalStyle } from "styled-components"

const GlobalStyles = createGlobalStyle`
    .empty-panel {
        padding: 100px 0;
        border: 1px solid #333;
        border-radius: 3px;
    }
`;

export default function Empty() {
    return (
        <>
            <GlobalStyles/>
            <div className="empty-panel text-center m-4">
                No items to display
            </div>
        </>
    )
}