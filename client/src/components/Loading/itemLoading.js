import React from "react";
import { BookLoader } from "react-awesome-loaders";

import "./style.css";

export default function ItemLoading() {
    return (
        <div className="item-loading-container">
            <BookLoader
                background={"linear-gradient(135deg, #6066FA, #4645F6)"}
                desktopSize={"40px"}
                mobileSize={"40px"}
                textColor={"#4645F6"}
                className="loader"
            />
        </div>
    )
}