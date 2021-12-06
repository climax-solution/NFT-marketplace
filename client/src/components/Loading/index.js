import { AtomSpinner } from "react-epic-spinners";
import "./style.css";

export default function Loading() {
    return (
        <div className="loading-container">
            <AtomSpinner
                color="white"
                size="125"
                className="loader"
            />
        </div>
    )
}