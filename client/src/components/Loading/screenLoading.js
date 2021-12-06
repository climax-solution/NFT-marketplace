import React from "react";
import { DualRing } from "react-awesome-spinners";
import "./style.css";

export default function ScreenLoading() {
    return (
        <div className="loading-container">
            <DualRing
                size="64"
                color="#00BFFF"
                sizeUnit="px"
                className="loader"
            />
        </div>
    )
}